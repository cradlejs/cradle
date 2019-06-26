import * as PropertyTypes from './constants'
import { PropertyType } from './PropertyType'
import { ISecurablePropertyTypeOptions, SecurablePropertyType } from './SecurablePropertyType'

export interface IStringPropertyTypeOptions extends ISecurablePropertyTypeOptions {
  MaximumLength?: number
  AllowedValues?: string[]
}

/**
 * A property type that represents text data
 */
export class StringPropertyType extends SecurablePropertyType {
  public MaximumLength?: number
  public AllowedValues?: string[]

  constructor(options: IStringPropertyTypeOptions) {
    super(PropertyTypes.String, options)
    this.MaximumLength = options.MaximumLength
    this.AllowedValues = options.AllowedValues
  }

  public equals(other: PropertyType): boolean {
    if (!super.equals(other)) {
      return false
    }
    if (other instanceof StringPropertyType) {
      return other.MaximumLength === this.MaximumLength
    }
    if (
      other instanceof StringPropertyType &&
      this.AllowedValues !== null &&
      other.AllowedValues !== null
    ) {
      return this.arrayEquals(this.AllowedValues, other.AllowedValues)
    }
    return false
  }

  /**
   *  Source code for array equals from here: https://stackoverflow.com/a/16436975
   * @param a first array
   * @param b second array
   */
  private arrayEquals(a?: any[], b?: any[]): boolean {
    if (a === b) {
      return true
    }
    if (a == null || b == null) {
      return false
    }
    if (a.length !== b.length) {
      return false
    }

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.

    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
        return false
      }
    }
    return true
  }
}
