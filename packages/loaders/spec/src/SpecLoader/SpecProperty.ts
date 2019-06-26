import {IntegerAutogenerateOptions} from '@cradlejs/core'

export interface ISpecPropertyOptions {
  allowedValues?: any
  autogenerateOptions?: any
  defaultValue?: any
  deleteFlag?: boolean
  isArray?: boolean
  length?: any
  maxValue?: any
  minValue?: any
  nullable?: boolean
  precision?: number
  primaryKey?: boolean
  scale?: number
  unique?: boolean | string
  modelName?: string
  localProperty?: string
  foreignProperty?: string
  encrypted?: boolean
  hashed?: boolean
  attributes?: { [key: string]: any }
}

export default class SpecProperty {
  public PropertyType: string
  public AutogenerateOptions?: IntegerAutogenerateOptions | boolean
  public Nullable: boolean
  public AllowedValues?: any[]
  public DefaultValue?: any
  public MinValue?: any
  public MaxValue?: any
  public PrimaryKey: boolean
  public Unique: boolean | string
  public DeleteFlag: boolean
  public Length?: number
  public IsArray: boolean
  public Precision?: number
  public Scale?: number
  public ModelName?: string
  public LocalProperty?: string
  public ForeignProperty?: string
  public Attributes?: { [key: string]: any }
  public Encrypted?: boolean
  public Hashed?: boolean

  constructor(propertyType: string, options: ISpecPropertyOptions = {}) {
    this.PropertyType = propertyType
    this.Nullable = options.nullable || false
    this.AllowedValues = options.allowedValues
    this.DefaultValue = options.defaultValue
    this.MinValue = options.minValue
    this.MaxValue = options.maxValue
    this.PrimaryKey = options.primaryKey || false
    this.Unique = options.unique || false
    this.DeleteFlag = options.deleteFlag || false
    this.Length = options.length
    this.IsArray = options.isArray || false
    this.Precision = options.precision
    this.Scale = options.scale
    this.ModelName = options.modelName
    this.LocalProperty = options.localProperty
    this.ForeignProperty = options.foreignProperty
    this.Attributes = options.attributes
    this.Encrypted = options.encrypted || false
    this.Hashed = options.hashed || false
    if (Array.isArray(options.autogenerateOptions)) {
      if (options.autogenerateOptions.length !== 2) {
        throw new RangeError(
          `Expected 2 elements in autogenerate options, received ${
            options.autogenerateOptions
          }`
        )
      } else {
        this.AutogenerateOptions = new IntegerAutogenerateOptions(
          options.autogenerateOptions[0],
          options.autogenerateOptions[1]
        )
      }
    } else {
      this.AutogenerateOptions = options.autogenerateOptions
    }
  }
}
