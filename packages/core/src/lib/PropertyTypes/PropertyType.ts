import _ from 'lodash'

import * as PropertyTypes from './constants'
import IPropertyType from './IPropertyType'

export interface IPropertyTypeOptions {
  /**
   * Allow null values.
   * Default value: **False**
   */
  AllowNull?: boolean
  /**
   * Set primary key flag
   * Default value: **False**
   */
  IsPrimaryKey?: boolean
  /**
   * Specify a default value for the property
   * Default value: **Undefined**
   */
  DefaultValue?: any
  /**
   * Set unique flag on the property
   * This can be a boolean or a string specifying a unique group
   * Default value: **False**
   */
  Unique?: boolean | string
  /**
   * Custom attributes for the property
   * Default value: **Undefined**
   */
  Attributes?: { [key: string]: any }
}

/** The abstract base property type */
export abstract class PropertyType implements IPropertyType {
  public TypeName: string
  public IsPrimaryKey!: boolean
  public AllowNull!: boolean
  public DefaultValue?: any
  public Unique!: boolean | string
  public Attributes?: { [key: string]: any }
  public ReferencedBy?: string

  constructor(typeName: string, options: IPropertyTypeOptions) {
    if (!(typeName in PropertyTypes)) {
      throw new TypeError(`${typeName} is not a valid property type`)
    } else {
      this.TypeName = typeName
      const {
        IsPrimaryKey = false,
        AllowNull = false,
        DefaultValue,
        Unique = false,
        Attributes
      } = options
      Object.assign(this, { IsPrimaryKey, AllowNull, DefaultValue, Unique, Attributes })
    }
  }

  public toString(): string {
    return this.TypeName
  }

  public equals(other: PropertyType): boolean {
    return (
      this.TypeName === other.TypeName &&
      this.IsPrimaryKey === other.IsPrimaryKey &&
      this.AllowNull === other.AllowNull &&
      this.DefaultValue === other.DefaultValue &&
      this.Unique === other.Unique &&
      this.Attributes === other.Attributes
    )
  }
}
