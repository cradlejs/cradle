import { InvalidConsoleError } from './Errors/InvalidConsoleError'
import { IConsole, isConsole } from './IConsole'

export interface ILoaderOptions {
  module: string
  options: any
  console: IConsole
}

export class LoaderOptions implements ILoaderOptions {
  public module: string
  public options: any
  public console: IConsole

  constructor(_module: string, _options: any, _console: any) {
    if (!isConsole(_console)) {
      throw new InvalidConsoleError(_console)
    } else {
      this.module = _module
      this.options = _options
      this.console = _console
    }
  }
}
