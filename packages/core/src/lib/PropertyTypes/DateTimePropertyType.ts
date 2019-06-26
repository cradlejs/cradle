import * as PropertyTypes from './constants'
import {
  ConstrainablePropertyType,
  IConstrainablePropertyTypeOptions
} from './ConstrainablePropertyType'

/**
 * A property type that represents a date and time.
 */
export class DateTimePropertyType extends ConstrainablePropertyType {
  constructor(options: IConstrainablePropertyTypeOptions) {
    super(PropertyTypes.DateTime, options)
  }
}
