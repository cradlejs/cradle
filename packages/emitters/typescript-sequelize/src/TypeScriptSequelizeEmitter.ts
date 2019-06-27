import ts, { PropertyAssignment } from 'typescript'
import {
  OptionalKind,
  SourceFile,
  PropertyDeclarationStructure,
  Scope,
  ObjectLiteralElement,
  VariableStatementStructure,
  ObjectLiteralExpression
} from 'ts-morph'

import {
  CradleModel,
  IConsole,
  PropertyType,
  CradleSchema,
  PropertyTypes,
  StringPropertyType,
  DecimalPropertyType
} from '@cradlejs/core'
import { parse } from 'path'
import { TypeScriptSequelizeEmitterOptions } from './TypeScriptSequelizeEmitterOptions'
import TypeScriptEmitter from '@cradlejs/typescript-emitter'

export class TypeScriptSequelizeEmitter extends TypeScriptEmitter {
  public options: TypeScriptSequelizeEmitterOptions

  constructor(options: TypeScriptSequelizeEmitterOptions, output: string, _console: IConsole) {
    super(options, output, _console)
    this.options = options
  }

  protected prepareProject(schema: CradleSchema) {
    schema.Models.forEach((model) => {
      const modelPath = this.getFilePathForModel(model)
      const parsed = parse(modelPath)
      const sourceFile = this.tsProject.createSourceFile(parsed.base)
      sourceFile.addImportDeclarations([
        {
          namedImports: ['Sequelize', 'Model', 'DataTypes'],
          moduleSpecifier: 'sequelize'
        }
      ])
      sourceFile.addClass({ name: model.Name, extends: 'Model', isExported: true })
    })
  }

  private getModelProperties(model: CradleModel): OptionalKind<PropertyDeclarationStructure>[] {
    const propNames = Object.keys(model.Properties)
    const properties: OptionalKind<PropertyDeclarationStructure>[] = []

    propNames.forEach((propName) => {
      const prop: PropertyType = model.Properties[propName]
      let leadingTrivia: string = ''

      const hasExclamationToken = prop.TypeName !== PropertyTypes.ReferenceModel
      const hasQuestionToken = !hasExclamationToken

      properties.push({
        name: propName,
        hasExclamationToken,
        hasQuestionToken,
        isReadonly: true,
        scope: Scope.Public,
        leadingTrivia,
        type: this.wrapMapType(model.Properties[propName])
      })
    })
    return properties
  }

  // more reference her https://dsherret.github.io/ts-morph/details/object-literal-expressions

  private getSequelizeDefinition(model: CradleModel): PropertyAssignment[] {
    const propertyAssignments: PropertyAssignment[] = []

    const propertyNames = Object.keys(model.Properties)
    propertyNames.forEach((propName) => {
      const propType: PropertyType = model.Properties[propName]
      const sequelizeType = this.mapSequelizeType(propType)
      if (sequelizeType) {
        const prop: PropertyAssignment = { name: propName, initializer: sequelizeType }
        propertyAssignments.push({})
      }
    })

    return propertyAssignments
  }

  private mapSequelizeType(prop: PropertyType): string | undefined {
    switch (prop.TypeName) {
      case PropertyTypes.String: {
        const stringProp = prop as StringPropertyType
        if (stringProp.MaximumLength !== undefined) {
          return `DataTypes.STRING(${stringProp.MaximumLength})`
        } else {
          return `DataTypes.TEXT`
        }
      }
      case PropertyTypes.DateTime: {
        return `DataTypes.DATE`
      }
      case PropertyTypes.Integer: {
        return `DataTypes.INTEGER`
      }
      case PropertyTypes.Decimal: {
        const decimalProp = prop as DecimalPropertyType
        if (decimalProp.Scale !== undefined && decimalProp.Precision !== undefined) {
          return `DataTypes.DECIMAL(${decimalProp.Precision}, ${decimalProp.Precision})`
        } else {
          return `DataTypes.DECIMAL`
        }
      }
      case PropertyTypes.Boolean: {
        return `DataTypes.BOOLEAN`
      }
      case PropertyTypes.Binary: {
        return `DataTypes.BLOB`
      }
      case PropertyTypes.UniqueIdentifier: {
        return `DataTypes.UUIDV4`
      }
      default: {
        return undefined
      }
    }
  }

  async getContentsForModel(model: CradleModel): Promise<string> {
    const modelPath = this.getFilePathForModel(model)
    const parsed = parse(modelPath)

    let sourceFile: SourceFile = this.tsProject.getSourceFileOrThrow(parsed.base)

    const properties = this.getModelProperties(model)
    const sequelizeDefinition = this.getSequelizeDefinition(model)

    const modelClass = sourceFile.getClassOrThrow(model.Name)
    modelClass.addProperties(properties)

    if (this.outputType === 'oneFilePerModel') {
      sourceFile.fixMissingImports()
    }

    return sourceFile.print()
  }
  async mergeFileContents(modelFileContents: any[]): Promise<string> {
    return modelFileContents.map((fc) => fc.contents).join('\n\n')
  }
}
