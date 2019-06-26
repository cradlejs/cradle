import * as PropertyTypes from './constants'
import {
  ConstrainablePropertyType,
  IConstrainablePropertyTypeOptions
} from './ConstrainablePropertyType'
import { PropertyType } from './PropertyType'

export interface IDecimalPropertyTypeOptions extends IConstrainablePropertyTypeOptions {
  Precision?: number
  Scale?: number
}

/**
 * A property type that represents a non-integer number.
 */
export class DecimalPropertyType extends ConstrainablePropertyType {
  public Precision?: number
  public Scale?: number

  constructor(options: IDecimalPropertyTypeOptions) {
    super(PropertyTypes.Decimal, options)

    this.Precision = options.Precision
    this.Scale = options.Scale
  }

  public equals(other: PropertyType): boolean {
    if (!super.equals(other)) {
      return false
    }
    if (other instanceof DecimalPropertyType) {
      return this.Precision === other.Precision && this.Scale === other.Scale
    }
    return false
  }
}
