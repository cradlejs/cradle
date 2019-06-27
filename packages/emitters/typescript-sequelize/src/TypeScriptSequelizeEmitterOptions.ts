import { FileEmitterOptionsArgs } from '@cradlejs/file-emitter'

export class TypeScriptSequelizeEmitterOptions extends FileEmitterOptionsArgs {
  typesPath!: string
  graphqlResolvers!: boolean
}
