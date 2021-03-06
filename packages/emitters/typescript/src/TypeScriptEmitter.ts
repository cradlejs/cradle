import ts from 'typescript'
import {
  Project,
  OptionalKind,
  PropertySignatureStructure,
  SourceFile,
  InterfaceDeclaration
} from 'ts-morph'
import { FileEmitter, FileEmitterOptionsArgs } from '@cradlejs/file-emitter'
import {
  CradleModel,
  IConsole,
  PropertyType,
  PropertyTypes,
  ArrayPropertyType,
  ImportModelType,
  ReferenceModelType,
  CradleSchema,
  StringPropertyType,
  ICradleOperation
} from '@cradlejs/core'
import { parse } from 'path'
import { ModelFileContents } from '@cradlejs/file-emitter/dist/FileEmitter'
import _ from 'lodash'

export class TypeScriptEmitter extends FileEmitter {
  protected tsProject: Project

  constructor(options: FileEmitterOptionsArgs, output: string, _console: IConsole) {
    super(options, output, _console)
    this.tsProject = new Project({ useVirtualFileSystem: true })
    if (options.formatting === 'prettier') {
      const prettierConfig = options.prettierConfig || {}
      prettierConfig.parser = 'typescript'
      options.prettierConfig = prettierConfig
    }
    this.options = options
  }

  async emitSchema(schema: CradleSchema) {
    if (this.outputType === 'oneFilePerModel') {
      this.prepareProject(schema)
    }

    return super.emitSchema(schema)
  }

  protected prepareProject(schema: CradleSchema) {
    schema.Models.forEach((model) => {
      const modelPath = this.getFilePathForModel(model)
      const parsed = parse(modelPath)
      const sourceFile = this.tsProject.createSourceFile(parsed.base)
      sourceFile.addInterface({ name: `I${model.Name}`, isExported: true })
    })
  }

  async getContentsForModel(model: CradleModel): Promise<string> {
    const modelPath = this.getFilePathForModel(model)
    const parsed = parse(modelPath)

    let sourceFile: SourceFile
    let iFace: InterfaceDeclaration
    if (this.outputType === 'oneFilePerModel') {
      sourceFile = this.tsProject.getSourceFileOrThrow(parsed.base)
      iFace = sourceFile.getInterfaceOrThrow(`I${model.Name}`)
    } else {
      sourceFile = this.tsProject.createSourceFile(`${model.Name}.ts`)
      iFace = sourceFile.addInterface({ name: `I${model.Name}`, isExported: true })
    }

    const propNames = Object.keys(model.Properties)
    const properties: OptionalKind<PropertySignatureStructure>[] = []
    propNames.forEach((propName) => {
      const prop: PropertyType = model.Properties[propName]
      let leadingTrivia: string = ''

      properties.push({
        name: propName,
        leadingTrivia,
        type: this.wrapMapType(prop),
        hasQuestionToken: prop.AllowNull
      })
    })

    iFace.addProperties(properties)

    this.addOperationArgTypes(sourceFile, model)

    if (this.outputType === 'oneFilePerModel') {
      sourceFile.fixMissingImports()
    }

    return sourceFile.print()
  }

  async addOperationArgTypes(sourceFile: SourceFile, model: CradleModel) {
    if (model.Operations) {
      const opNames = Object.keys(model.Operations)
      opNames.forEach((opName) => {
        const op: ICradleOperation = model.Operations[opName]

        const argNames = Object.keys(op.Arguments)

        const properties: OptionalKind<PropertySignatureStructure>[] = []
        argNames.forEach((propName) => {
          const prop: PropertyType = op.Arguments[propName]
          let leadingTrivia: string = ''

          properties.push({
            name: propName,
            leadingTrivia,
            type: this.wrapMapType(prop),
            hasQuestionToken: prop.AllowNull
          })
        })

        sourceFile.addInterface({
          name: `${_.upperFirst(_.camelCase(opName))}OperationArgs`,
          properties,
          isExported: true
        })
      })
    }
  }

  async mergeFileContents(modelFileContents: ModelFileContents[]): Promise<string> {
    return modelFileContents.map((fc) => fc.contents).join('\n\n')
  }

  protected wrapMapType(propertyType: PropertyType, noInterface: boolean = false) {
    const actualType = this.mapType(propertyType, noInterface)
    if (propertyType.AllowNull) {
      return `${actualType} | null`
    } else {
      return actualType
    }
  }

  protected mapType(propertyType: PropertyType, noInterface: boolean = false): string {
    switch (propertyType.TypeName) {
      case PropertyTypes.Boolean: {
        return 'boolean'
      }
      case PropertyTypes.Binary: {
        return 'ArrayBuffer'
      }
      case PropertyTypes.DateTime: {
        return 'Date'
      }
      case PropertyTypes.Decimal:
      case PropertyTypes.Integer: {
        return 'number'
      }
      case PropertyTypes.UniqueIdentifier:
      case PropertyTypes.String: {
        const stringProperty = propertyType as StringPropertyType
        if (stringProperty.AllowedValues && stringProperty.AllowedValues.length > 0) {
          return stringProperty.AllowedValues.map((v) => `'${v}'`).join(' | ')
        }

        return 'string'
      }
      case PropertyTypes.Array: {
        const arrayType = propertyType as ArrayPropertyType
        if (typeof arrayType.MemberType === 'string') {
          return `${arrayType.MemberType}[]`
        } else {
          const baseType = this.mapType(arrayType.MemberType, noInterface)
          return `${baseType}[]`
        }
      }
      case PropertyTypes.ImportModel: {
        const importType = propertyType as ImportModelType
        return `${noInterface ? '' : 'I'}${importType.ModelName}`
      }
      case PropertyTypes.ReferenceModel: {
        const referenceType = propertyType as ReferenceModelType
        return `${noInterface ? '' : 'I'}${referenceType.ModelName}`
      }
      // case PropertyTypes.Object: {
      //   return 'object'
      // }
      default: {
        return 'any'
      }
    }
  }
}
