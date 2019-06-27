import ts from 'typescript'
import {
  Project,
  BooleanLiteral,
  OptionalKind,
  PropertySignatureStructure,
  StructureKind,
  SourceFile,
  InterfaceDeclaration
} from 'ts-morph'

import {
  CradleModel,
  IConsole,
  PropertyType,
  PropertyTypes,
  ArrayPropertyType,
  ImportModelType,
  ReferenceModelType,
  CradleSchema,
  StringPropertyType
} from '@cradlejs/core'
import { parse } from 'path'
import { TypeScriptSequelizeEmitterOptions } from './TypeScriptSequelizeEmitterOptions'
import TypeScriptEmitter from '@cradlejs/typescript-emitter'

export class TypeScriptSequelizeEmitter extends TypeScriptEmitter {
  protected options: TypeScriptSequelizeEmitterOptions

  constructor(options: TypeScriptSequelizeEmitterOptions, output: string, _console: IConsole) {
    super(options, output, _console)
    this.options = options
  }

  async emitSchema(schema: CradleSchema) {
    if (this.outputType === 'oneFilePerModel') {
      schema.Models.forEach((model) => {
        const modelPath = this.getFilePathForModel(model)
        const parsed = parse(modelPath)
        const sourceFile = this.tsProject.createSourceFile(parsed.base)
        sourceFile.addInterface({ name: `I${model.Name}`, isExported: true })
      })
    }

    return super.emitSchema(schema)
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
      iFace = sourceFile.addInterface({ name: `I${model.Name}` })
    }

    const propNames = Object.keys(model.Properties)
    const properties: OptionalKind<PropertySignatureStructure>[] = []
    propNames.forEach((propName) => {
      const prop: PropertyType = model.Properties[propName]
      let leadingTrivia: string = ''

      properties.push({
        name: propName,
        leadingTrivia,
        type: this.wrapMapType(model.Properties[propName])
      })
    })

    iFace.addProperties(properties)

    if (this.outputType === 'oneFilePerModel') {
      sourceFile.fixMissingImports()
    }

    return sourceFile.print()
  }
  async mergeFileContents(modelFileContents: any[]): Promise<string> {
    return modelFileContents.map((fc) => fc.contents).join('\n\n')
  }
}
