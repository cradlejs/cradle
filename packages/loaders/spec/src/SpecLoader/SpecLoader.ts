// import ImportModelType, { IImportModelTypeOptions } from '../PropertyTypes/ImportModelType'
import { sync } from 'glob'
import SpecProperty from './SpecProperty'
import ParseProperty from './SpecPropertyTypeParser'
import {
  PropertyType,
  ImportModelType,
  CradleModel,
  ArrayPropertyType,
  BooleanPropertyType,
  DateTimePropertyType,
  DecimalPropertyType,
  IntegerPropertyType,
  StringPropertyType,
  UniqueIdentifierPropertyType,
  BinaryPropertyType,
  CradleLoaderBase,
  ICradleOperation,
  CradleSchema,
  IConstrainablePropertyTypeOptions,
  IDecimalPropertyTypeOptions,
  IIntegerPropertyTypeOptions,
  IImportModelTypeOptions,
  PropertyTypes,
  ReferenceModelType,
  LoaderOptions
} from '@cradlejs/core'
import { dirname, resolve, join } from 'path'
import { existsSync, readFileSync, statSync } from 'fs'

import { safeLoad } from 'js-yaml'
import { SpecLoaderOptions } from './SpecLoaderOptions'

export default class SpecLoader extends CradleLoaderBase<SpecLoaderOptions> {
  private specObject: object = {}

  constructor(options: LoaderOptions) {
    super(options)
  }

  public readModelOperationNames(modelName: string): Promise<string[]> {
    if (!this.specObject) {
      throw new Error(`No spec file loaded`)
    }
    if (!this.specObject[modelName]) {
      throw new Error(`The spec file does not contain a model named '${modelName}'`)
    }
    if (typeof this.specObject[modelName] === typeof '') {
      throw new Error(`The model definition must be an object`)
    } else {
      if (!this.specObject[modelName].operations) {
        return Promise.resolve([])
      } else {
        return Promise.resolve(Object.keys(this.specObject[modelName].operations))
      }
    }
  }

  public async readModelOperation(
    modelName: string,
    operationName: string
  ): Promise<ICradleOperation> {
    let returnType = this.specObject![modelName].operations[operationName].returns
    const description: string | undefined = this.specObject![modelName].operations[operationName]
      .description
    if (returnType) {
      returnType = await this.getPropertyTypeFromDefinition(returnType)
    }
    const _args: any = {}
    const argNames = Object.keys(this.specObject![modelName].operations[operationName].arguments)
    await Promise.all(
      argNames.map(async (argName) => {
        const argValue = this.specObject![modelName].operations[operationName].arguments[argName]
        if (argValue !== null && argValue !== '?') {
          _args[argName] = await this.getPropertyTypeFromDefinition(
            this.specObject![modelName].operations[operationName].arguments[argName]
          )
        } else {
          try {
            _args[argName] = await this.readModelPropertyType(modelName, argName)
            if (argValue === '?') {
              _args[argName].AllowNull = true
            }
          } catch (err) {
            err.message = `Error encountered when parsing ${modelName}.operations.arguments.${argName}.

          ${err.message}`
            throw err
          }
        }
      })
    )

    return {
      Arguments: _args,
      Returns: returnType,
      Description: description
    }
  }
  public async readModelPropertyType(
    modelName: string,
    propertyName: string
  ): Promise<PropertyType> {
    return await this.readPropertyDefinition(modelName, [propertyName]).catch((err) => {
      throw new Error(
        `Error: '${err.message}' encountered while parsing ${modelName}.${propertyName}`
      )
    })
  }

  public readModelNames(): Promise<string[]> {
    if (this.specObject) {
      const modelNames = Object.keys(this.specObject)
      return Promise.resolve(modelNames)
    } else {
      throw new Error('No spec file loaded')
    }
  }

  public readModelPropertyNames(modelName: string): Promise<string[]> {
    if (!this.specObject) {
      throw new Error(`No spec file loaded`)
    }
    if (!this.specObject[modelName]) {
      throw new Error(`The spec file does not contain a model named '${modelName}'`)
    }
    if (typeof this.specObject[modelName] === typeof '') {
      throw new Error(`The model definition must be an object`)
    } else {
      if (!this.specObject[modelName].properties) {
        throw new Error(`Model '${modelName}' does not define any properties`)
      } else {
        return Promise.resolve(Object.keys(this.specObject[modelName].properties))
      }
    }
  }

  private async loadModelsFromGlob(path: string) {
    this.specObject = {}
    const matchingFiles = sync(path, {})
    if (matchingFiles.length === 0) {
      throw new Error('No files matching glob pattern')
    } else {
      matchingFiles.forEach((fileName) => {
        const fileRoot = safeLoad(readFileSync(fileName, 'utf8'))

        const fileModels = Object.keys(fileRoot)
        const currentModels = Object.keys(this.specObject)

        fileModels.forEach((modelName) => {
          if (currentModels.includes(modelName)) {
            throw new Error('Duplicate model name: ' + modelName)
          }
        })

        Object.assign(this.specObject, fileRoot)
      })
    }
  }

  public async prepareLoader(): Promise<void> {
    if (this.options.source && this.options.source.includes('**')) {
      //glob pattern
      this.loadModelsFromGlob(this.options.source)
    } else {
      if (!existsSync(this.options.source)) {
        throw new Error(`Source file does not exist: ${this.options.source}`)
      } else {
        const stat = statSync(this.options.source)

        if (stat.isFile()) {
          const dir = dirname(resolve(this.options.source))
          this.specObject = safeLoad(readFileSync(this.options.source, 'utf8'))

          // Handle split spec files
          // This will only allow spec file references from the master file
          // meaning you can't chain together references.  This also helps prevent
          // circular references
          const modelNames = await this.readModelNames()
          modelNames.map((mn) => {
            if (this.specObject && typeof this.specObject[mn] === typeof '') {
              const fileParts = this.specObject[mn].split('#')
              const filePath = join(dir, fileParts[0])
              const modelName = fileParts[1]

              const tempReq = safeLoad(readFileSync(filePath, 'utf8'))
              this.specObject[mn] = tempReq[modelName]
            }
          })
        } else {
          if (stat.isDirectory()) {
            const finalDir = join(this.options.source, '**/*.yml')
            this.loadModelsFromGlob(finalDir)
          }
        }
      }
    }
    if (!this.specObject) {
      throw new Error('Failed to load spec')
    }
  }

  public readModelMetadata(modelName: string): Promise<object> {
    return new Promise((resolve, reject) => {
      return resolve(this.specObject![modelName].meta)
    })
  }

  public finalizeSchema(schema: CradleSchema): Promise<CradleSchema> {
    schema.Models.forEach((model, k) => {
      const propertyNames = Object.keys(model.Properties)
      propertyNames.map((pn) => {
        const prop: PropertyType = model.Properties[pn]

        if (prop.TypeName === PropertyTypes.ImportModel) {
          const importProp = prop as ImportModelType
          schema.Models[k].Properties[pn].ModelType = schema.GetModel(importProp.ModelName)
        }
        if (prop.TypeName === PropertyTypes.ReferenceModel) {
          const refProp = prop as ReferenceModelType

          const targetModel: CradleModel | undefined = schema.GetModel(refProp.ModelName)

          if (!targetModel) {
            throw new Error(
              `Invalid reference ${pn} on ${model.Name}.  Foreign model ${refProp.ModelName} does not exist`
            )
          }
          if (!targetModel.Properties[refProp.ForeignProperty]) {
            throw new Error(
              `Invalid reference ${pn} on ${model.Name}. Foreign model ${refProp.ModelName} does not contain a property named ${refProp.ForeignProperty}`
            )
          }
          if (!model.Properties[refProp.LocalProperty]) {
            throw new Error(
              `Invalid reference ${pn} on ${model.Name}. ${model.Name} does not contain a property named ${refProp.ForeignProperty}`
            )
          }
          schema.Models[k].Properties[pn].ModelType = targetModel
          if (!refProp.IsPrimaryKey) {
            schema.Models[k].Properties[refProp.LocalProperty].ReferencedBy = refProp.ModelName
          }
        }
      })

      const operationNames = Object.keys(model.Operations)
      operationNames.map((opName) => {
        const op = model.Operations[opName]
        if (op.Returns.TypeName === PropertyTypes.ImportModel && op.Returns.ModelName) {
          schema.Models[k].Operations[opName].Returns.ModelType = this.getModelReference(
            schema,
            op.Returns
          )
        }
        if (
          op.Returns.TypeName === PropertyTypes.Array &&
          op.Returns.MemberType &&
          op.Returns.MemberType.TypeName === PropertyTypes.ImportModel &&
          op.Returns.MemberType.ModelName
        ) {
          schema.Models[k].Operations[opName].Returns.ModelType = this.getModelReference(
            schema,
            op.Returns.MemberType
          )
        }
      })
    })
    return Promise.resolve(schema)
  }
  public getModelReference(schema: CradleSchema, ref: ImportModelType): ImportModelType {
    const modelRef = schema.GetModel(ref.ModelName)
    if (modelRef) {
      return new ImportModelType({
        ModelName: ref.ModelName,
        AllowNull: ref.AllowNull,
        IsPrimaryKey: ref.IsPrimaryKey,
        DefaultValue: ref.DefaultValue
      })
    } else {
      throw new Error(`Invalid model reference: ${ref.ModelName}`)
    }
  }

  private propertiesToArray(
    propertyObject: object
  ): Array<{ propertyName: string; propertyType: PropertyType }> {
    const propNames = Object.keys(propertyObject)
    return propNames.map((pn) => ({ propertyName: pn, propertyType: propertyObject[pn] }))
  }

  private async getPropertyTypeFromDefinition(property: any): Promise<PropertyType> {
    if (typeof property === 'string') {
      let specProperty
      try {
        specProperty = ParseProperty(property)
      } catch (err) {
        const modelNames = await this.readModelNames()
        if (modelNames.find((x) => x === property)) {
          return new ImportModelType({ ModelName: property })
        } else {
          throw err
        }
      }
      if (specProperty) {
        const propertyType = this.createPropertyTypeFromSpecResult(specProperty)
        if (specProperty.IsArray) {
          return new ArrayPropertyType({ MemberType: propertyType })
        } else {
          return propertyType
        }
      } else {
        throw new Error(`Unable to parse property ${property}`)
      }
    } else {
      const isArray = property.isArray
      if (property.modelRef) {
        if (isArray) {
          return new ArrayPropertyType({
            MemberType: new ImportModelType({ ModelName: property.modelRef })
          })
        } else {
          return new ImportModelType({ ModelName: property.modelRef })
        }
      }
      throw new Error('Property Type not supported')
      // const subProperties = Object.keys(property.properties)

      // const members: Array<{ propertyName: string; propertyType: PropertyType }> = []
      // for (const subProp of subProperties) {
      //   if (!!subProp) {
      //     members.push({
      //       propertyName: subProp,
      //       propertyType: await this.getPropertyTypeFromDefinition(property.properties[subProp])
      //     })
      //   }
      // }

      // const memberMap = new Map<string, PropertyType>()
      // members.forEach((m) => memberMap.set(m.propertyName, m.propertyType))

      // const propertyType = new ObjectPropertyType({ Members: memberMap, AllowNull: true })
      // if (isArray) {
      //   return new ArrayPropertyType({ MemberType: propertyType })
      // } else {
      //   return propertyType
      // }
    }
  }

  private async readPropertyDefinition(
    modelName: string,
    propertyPath: string[]
  ): Promise<PropertyType> {
    if (this.specObject) {
      const model = this.specObject[modelName]

      let currentProperty = model.properties[propertyPath[0]]
      for (let i = 1; i < propertyPath.length; i++) {
        if (currentProperty.properties && currentProperty.properties[propertyPath[i]]) {
          currentProperty = currentProperty.properties[propertyPath[i]]
          break
        }
      }

      return await this.getPropertyTypeFromDefinition(currentProperty)
    } else {
      throw new Error(`No spec file loaded`)
    }
  }

  private createPropertyTypeFromSpecResult(spec: SpecProperty): PropertyType {
    const options: any = {
      AllowNull: spec.Nullable,
      Attributes: spec.Attributes,
      DefaultValue: spec.DefaultValue,
      Encrypted: spec.Encrypted,
      Hashed: spec.Hashed,
      IsPrimaryKey: spec.PrimaryKey,
      Unique: spec.Unique
    }
    switch (spec.PropertyType.toLocaleUpperCase()) {
      case PropertyTypes.Boolean.toLocaleUpperCase():
        return new BooleanPropertyType(options)
      case PropertyTypes.DateTime.toLocaleUpperCase():
        return new DateTimePropertyType(
          Object.assign(options, {
            MaximumValue: spec.MaxValue,
            MinimumValue: spec.MinValue
          } as IConstrainablePropertyTypeOptions)
        )
      case PropertyTypes.Decimal.toLocaleUpperCase():
        return new DecimalPropertyType(Object.assign(options, {
          MaximumValue: spec.MaxValue,
          MinimumValue: spec.MinValue,
          Prevision: spec.Precision,
          Scale: spec.Scale
        }) as IDecimalPropertyTypeOptions)
      case PropertyTypes.Integer.toLocaleUpperCase():
        return new IntegerPropertyType(Object.assign(options, {
          MaximumValue: spec.MaxValue,
          MinimumValue: spec.MinValue,
          Autogenerate: spec.AutogenerateOptions
        }) as IIntegerPropertyTypeOptions)
      case PropertyTypes.String.toLocaleUpperCase():
        return new StringPropertyType(
          Object.assign(options, { AllowedValues: spec.AllowedValues, MaximumLength: spec.Length })
        )
      case PropertyTypes.UniqueIdentifier.toLocaleUpperCase():
        return new UniqueIdentifierPropertyType(
          Object.assign(options, { Autogenerate: spec.AutogenerateOptions })
        )
      case PropertyTypes.Binary.toLocaleUpperCase():
        return new BinaryPropertyType(Object.assign(options, { MaximumLength: spec.Length }))
      case PropertyTypes.ReferenceModel.toLocaleUpperCase():
        return new ReferenceModelType(
          Object.assign(options, {
            ModelName: spec.ModelName,
            LocalProperty: spec.LocalProperty,
            ForeignProperty: spec.ForeignProperty
          })
        )
      case PropertyTypes.ImportModel.toLocaleUpperCase():
        return new ImportModelType(
          Object.assign(options, { ModelName: spec.ModelName! } as IImportModelTypeOptions)
        )
      default: {
        throw new Error(`Unexpected property type: ${spec.PropertyType}`)
      }
    }
  }
}
