import * as PropertyTypes from './constants'
import {
  ConstrainablePropertyType,
  IConstrainablePropertyTypeOptions
} from './ConstrainablePropertyType'

export class IntegerAutogenerateOptions {
  public Seed: number
  public Increment: number
  constructor(seed: number = 1, increment: number = 1) {
    this.Seed = seed
    this.Increment = increment
  }
}

export interface IIntegerPropertyTypeOptions extends IConstrainablePropertyTypeOptions {
  Autogenerate?: IntegerAutogenerateOptions
}

/**
 * A property type that represents a whole number
 */
export class IntegerPropertyType extends ConstrainablePropertyType {
  public Autogenerate?: IntegerAutogenerateOptions
  // tslint:disable-next-line:max-line-length
  constructor(options: IIntegerPropertyTypeOptions) {
    super(PropertyTypes.Integer, options)
    if (options.Autogenerate instanceof IntegerAutogenerateOptions) {
      this.Autogenerate = options.Autogenerate
    } else {
      if (options.Autogenerate !== undefined) {
        throw new TypeError(
          `Expected auto options to be of type IntegerAutogenerateOptions, got ${options.Autogenerate}`
        )
      }
    }
  }
}
