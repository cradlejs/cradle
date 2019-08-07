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
  DecimalPropertyType,
  IntegerPropertyType
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
      const modelPath = super.getFilePathForModel(model)
      const parsed = parse(modelPath)
      const sourceFile = super.tsProject.createSourceFile(parsed.base)
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
        type: super.wrapMapType(model.Properties[propName], true)
      })
    })
    return properties
  }

  // more reference her https://dsherret.github.io/ts-morph/details/object-literal-expressions

  private buildInitializerBody(model: CradleModel): string {
    const initializeBodyParts: string[] = []

    const propertyNames = Object.keys(model.Properties)
    propertyNames.forEach((propName) => {
      const propType: PropertyType = model.Properties[propName]
      const sequelizeType = this.mapSequelizeType(propType)
      if (sequelizeType) {
        let defaultValue: string | undefined = undefined
        if (propType.DefaultValue !== undefined) {
          switch (propType.TypeName) {
            case PropertyTypes.DateTime: {
              if (propType.DefaultValue === 'DateTimeNow') {
                defaultValue = 'DataTypes.NOW'
              } else {
                defaultValue = propType.DefaultValue
              }
              break
            }
            case PropertyTypes.UniqueIdentifier: {
              defaultValue = 'DataTypes.UUIDV4'
              break
            }
            case PropertyTypes.String: {
              defaultValue = `'${propType.DefaultValue}'`
              break
            }
            default: {
              defaultValue = propType.DefaultValue
            }
          }
        }
        let autoIncrement = false
        if (propType.TypeName === PropertyTypes.Integer) {
          const intProp = propType as IntegerPropertyType
          autoIncrement = !!intProp.Autogenerate
        }
        initializeBodyParts.push(`${propName}: {
          type: ${sequelizeType},
          allowNull: ${propType.AllowNull},
          primaryKey: ${propType.IsPrimaryKey},
          defaultValue: ${defaultValue},
          autoIncrement: ${autoIncrement}
        }`)
      }
    })

    return `{
      ${initializeBodyParts.join(',')}
    },
      {
        sequelize: sequelize,
        tableName: '${model.Name}'
      }`
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
        return `DataTypes.UUID`
      }
      default: {
        return undefined
      }
    }
  }

  async getContentsForModel(model: CradleModel): Promise<string> {
    const modelPath = super.getFilePathForModel(model)
    const parsed = parse(modelPath)

    let sourceFile: SourceFile = super.tsProject.getSourceFileOrThrow(parsed.base)

    const properties = this.getModelProperties(model)
    //const sequelizeDefinition = this.getSequelizeDefinition(model)

    const modelClass = sourceFile.getClassOrThrow(model.Name)
    modelClass.addProperties(properties)

    const initializeMethod = modelClass.addMethod({
      isStatic: true,
      name: 'Initialize',
      scope: Scope.Public,
      parameters: [
        {
          name: 'sequelize',
          type: 'Sequelize'
        }
      ]
    })

    const initializerBody = this.buildInitializerBody(model)

    initializeMethod.addStatements(`${model.Name}.init(${initializerBody})`)

    if (super.outputType === 'oneFilePerModel') {
      sourceFile.fixMissingImports()
    }

    return sourceFile.print()
  }
  async mergeFileContents(modelFileContents: any[]): Promise<string> {
    return modelFileContents.map((fc) => fc.contents).join('\n\n')
  }
}
