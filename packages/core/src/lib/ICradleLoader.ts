import { CradleSchema } from './CradleSchema'
import { IConsole } from './IConsole'
import { ICradleOperation } from './ICradleOperation'

import { LoaderOptions } from './LoaderOptions'
import { PropertyType } from './PropertyTypes/PropertyType'

export interface ICradleLoader {
  /**
   * Passes a loader the options so it can do any initialization it needs to
   */
  prepareLoader?: () => Promise<void>
  readModelNames: () => Promise<string[]>
  readModelOperationNames?: (modelName: string) => Promise<string[]>
  readModelOperation?: (modelName: string, operationName: string) => Promise<ICradleOperation>
  readModelPropertyNames: (modelName: string) => Promise<string[]>
  readModelPropertyType: (modelName: string, propertyName: string) => Promise<PropertyType>
  readModelMetadata: (modelName: string) => Promise<object>
  finalizeSchema: (schema: CradleSchema) => Promise<CradleSchema>
  loadSchema: () => Promise<CradleSchema>
}

export type ICradleLoaderConstructable = new (options: LoaderOptions) => ICradleLoader
