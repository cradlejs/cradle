import * as PropertyTypes from './constants'
import { PropertyType } from './PropertyType'
import { ISecurablePropertyTypeOptions, SecurablePropertyType } from './SecurablePropertyType'

export interface IBinaryPropertyTypeOptions extends ISecurablePropertyTypeOptions {
  MaximumLength?: number
}

/**
 * A property type that represents binary data such as a buffer or byte array
 */
export class BinaryPropertyType extends SecurablePropertyType {
  public MaximumLength?: number

  constructor(options: IBinaryPropertyTypeOptions) {
    super(PropertyTypes.Binary, options)
    this.MaximumLength = options.MaximumLength
  }

  public equals(other: PropertyType): boolean {
    if (!super.equals(other)) {
      return false
    }
    if (other instanceof BinaryPropertyType) {
      return other.MaximumLength === this.MaximumLength
    }
    return false
  }
}
