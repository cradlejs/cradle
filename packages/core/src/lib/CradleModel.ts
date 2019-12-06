import { ICradleOperation } from './ICradleOperation'

import { PropertyType } from './PropertyTypes/PropertyType'

/**
 * The Cradle Model is a collection of Properties, Operations, and Metadata
 */
export class CradleModel {
  public Name: string
  public Meta: { [key: string]: any }
  public Properties: Map<string, PropertyType>
  public Operations: Map<string, ICradleOperation>

  constructor(
    modelName: string,
    properties: Map<string, PropertyType>,
    meta: object,
    operations: Map<string, ICradleOperation>
  ) {
    this.Name = modelName
    this.Meta = meta
    this.Properties = properties

    this.Operations = operations
  }
}
