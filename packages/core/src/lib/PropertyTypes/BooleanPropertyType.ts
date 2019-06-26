import * as PropertyTypes from './constants'
import { IPropertyTypeOptions, PropertyType } from './PropertyType'

export interface IBooleanPropertyTypeOptions extends IPropertyTypeOptions {
  DefaultValue: boolean | number | undefined
}

/**
 * A property type that represents true or false values
 */
export class BooleanPropertyType extends PropertyType {
  constructor(options: IBooleanPropertyTypeOptions) {
    super(PropertyTypes.Boolean, options)
  }
}
