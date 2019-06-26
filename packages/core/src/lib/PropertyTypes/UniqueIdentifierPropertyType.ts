import * as PropertyTypes from './constants'
import { ISecurablePropertyTypeOptions, SecurablePropertyType } from './SecurablePropertyType'

export interface IUniqueIdentifierPropertyTypeOptions extends ISecurablePropertyTypeOptions {
  Autogenerate?: boolean
}

export class UniqueIdentifierPropertyType extends SecurablePropertyType {
  public Autogenerate: boolean
  constructor(
    options: IUniqueIdentifierPropertyTypeOptions = {
      AllowNull: false,
      IsPrimaryKey: false,
      Autogenerate: false,
      Unique: false
    }
  ) {
    super(PropertyTypes.UniqueIdentifier, options)
    this.Autogenerate = options.Autogenerate || false
  }
}
