import { CradleModel } from '../CradleModel'
import { IPropertyTypeOptions, PropertyType } from './PropertyType'

import * as PropertyTypes from './constants'

export interface IImportModelTypeOptions extends IPropertyTypeOptions {
  ModelName: string
}

/**
 * A property type that represents an instance of a model
 */
export class ImportModelType extends PropertyType {
  public ModelName: string
  public ModelType?: CradleModel

  constructor(options: IImportModelTypeOptions) {
    super(PropertyTypes.ImportModel, options)
    this.ModelName = options.ModelName
  }
}
