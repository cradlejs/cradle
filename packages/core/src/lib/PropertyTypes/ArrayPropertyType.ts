import * as PropertyTypes from './constants'
import { IPropertyTypeOptions, PropertyType } from './PropertyType'

export interface IArrayPropertyTypeOptions extends IPropertyTypeOptions {
  MemberType: PropertyType | string
}

/**
 * A PropertyType that represents an array of MemberTypes
 */
export class ArrayPropertyType extends PropertyType {
  public MemberType: PropertyType | string

  constructor(options: IArrayPropertyTypeOptions) {
    super(PropertyTypes.Array, options)
    this.MemberType = options.MemberType
  }
}
