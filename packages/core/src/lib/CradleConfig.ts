import { EmitterDefinition } from './EmitterConfiguration'
import { ILoaderOptions } from './LoaderOptions'
import { EmitterOptionsArgs } from './EmitterOptions'

export type ICradleConfig = {
  loader: ILoaderOptions
  emitters: { [key: string]: EmitterDefinition }
  defaultOptions?: EmitterOptionsArgs
}

export class CradleConfig {
  public Loader: ILoaderOptions
  public Emitters: { [key: string]: EmitterDefinition }
  public defaultOptions?: EmitterOptionsArgs

  constructor(
    loader: ILoaderOptions,
    emitters: { [key: string]: EmitterDefinition },
    defaultOptions: EmitterOptionsArgs = {}
  ) {
    this.Loader = loader
    this.Emitters = emitters
    this.defaultOptions = defaultOptions
  }
}
