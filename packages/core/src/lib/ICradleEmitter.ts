import { CradleSchema } from './CradleSchema'

import { EmitterOptionsArgs } from './EmitterOptions'
import { IConsole } from './IConsole'

export interface ICradleEmitter {
  options: EmitterOptionsArgs
  output: string
  console: IConsole
  prepareEmitter?()
  emitSchema(schema: CradleSchema)
}
export type ICradleEmitterConstructable = new (options: EmitterOptionsArgs, output: string, console: IConsole) => ICradleEmitter
