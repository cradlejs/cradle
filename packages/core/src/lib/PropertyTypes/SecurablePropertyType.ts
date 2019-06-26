import { IPropertyTypeOptions, PropertyType } from './PropertyType'

export interface ISecurablePropertyTypeOptions extends IPropertyTypeOptions {
  Hashed?: boolean
  Encrypted?: boolean
}

/**
 * A property type that represents secure data
 */
export abstract class SecurablePropertyType extends PropertyType {
  public Hashed: boolean
  public Encrypted: boolean

  constructor(typeName: string, options: ISecurablePropertyTypeOptions) {
    super(typeName, options)
    this.Hashed = options.Hashed || false
    this.Encrypted = options.Encrypted || false
  }

  public equals(other: PropertyType): boolean {
    if (!super.equals(other)) {
      return false
    }
    if (other instanceof SecurablePropertyType) {
      return this.Encrypted === other.Encrypted && this.Hashed === other.Hashed
    }
    return false
  }
}
