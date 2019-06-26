import { CradleSchema } from './CradleSchema'
import { EmitterOptionsArgs } from './EmitterOptions'
import { IConsole } from './IConsole'
import { ICradleEmitter } from './ICradleEmitter'

export abstract class CradleEmitterBase implements ICradleEmitter {
  public options: EmitterOptionsArgs
  public output: string
  public console: IConsole
  constructor(options: EmitterOptionsArgs, output: string, _console: IConsole) {
    this.options = options
    this.output = output
    this.console = _console || console
  }
  public emitSchema(schema: CradleSchema) {
    throw new Error('Method not implemented.')
  }
}
