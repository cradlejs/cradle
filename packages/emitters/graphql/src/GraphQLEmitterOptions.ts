import { FileEmitterOptionsArgs } from '@cradlejs/file-emitter'

export class GraphQLEmitterOptionsArgs extends FileEmitterOptionsArgs {
  noMutationDataObject?: boolean /* Emitted mutations should use a list of arguments instead of a single data object */
}
