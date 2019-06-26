import { CradleModel } from '../CradleModel'
import * as PropertyTypes from './constants'
import { IPropertyTypeOptions, PropertyType } from './PropertyType'

export interface IReferenceModelTypeOptions extends IPropertyTypeOptions {
  ModelName: string
  LocalProperty: string
  ForeignProperty: string | undefined
}

/** A property type that represents a reference to another model */
export class ReferenceModelType extends PropertyType {
  public ModelName: string
  public LocalProperty: string
  public ForeignProperty: string
  public ModelType?: CradleModel

  constructor(options: IReferenceModelTypeOptions) {
    super(PropertyTypes.ReferenceModel, options)
    this.ModelName = options.ModelName

    this.LocalProperty = options.LocalProperty
    this.ForeignProperty = options.ForeignProperty || options.LocalProperty
  }
}
