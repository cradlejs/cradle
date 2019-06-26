import { PropertyType } from './PropertyTypes/PropertyType'

export interface ICradleOperation {
  Description?: string
  Returns: PropertyType
  Arguments: Map<string, PropertyType>
}
