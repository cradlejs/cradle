
import {
  OptionalKind,
  SourceFile,
  PropertyDeclarationStructure,
  Scope,

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

    if (this.outputType === 'oneFilePerModel') {
      throw new Error('typescript-sequelize emitter only supports single file output')
    }

    this.options = options

  }

  async emitSchema(schema: CradleSchema) {
    this.prepareProject(schema)
    super.emitSchema(schema)
  }

  protected prepareProject(schema: CradleSchema) {


    const sourceFile = this.tsProject.createSourceFile(this.output)
    sourceFile.addImportDeclarations([
      {
        namedImports: ['Sequelize', 'Model', 'DataTypes'],
        moduleSpecifier: 'sequelize'
      }
    ])
    schema.Models.forEach((model) => {
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
        type: this.wrapMapType(model.Properties[propName], true)
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

    const parsed = parse(this.output)

    let sourceFile: SourceFile | undefined = this.tsProject.getSourceFile(parsed.base)
    if (!sourceFile) {
      sourceFile = this.tsProject.createSourceFile(parsed.base)
    }

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
    return modelClass.print()
    // return sourceFile.print()
  }
  async mergeFileContents(modelFileContents: any[], models: CradleModel[]): Promise<string> {
    return `import {Sequelize, Model, DataTypes, Options} from 'sequelize'
    ${modelFileContents.map((fc) => fc.contents).join('\n\n')}

    export const initialize = (sequelize: Sequelize) => {

      ${models.map(m => (`${m.Name}.Initialize(sequelize)`)).join('\n')}

    }

    `

  }
}
