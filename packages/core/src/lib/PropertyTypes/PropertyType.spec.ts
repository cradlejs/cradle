import { expect } from 'chai'
import 'mocha'

import * as PropertyTypes from './constants'
import { PropertyType } from './PropertyType'

class MockPropertyType extends PropertyType {
  constructor(
    typeName: string,
    allowNull: boolean = false,
    isPrimaryKey: boolean = false,
    defaultValue?: any,
    unique: boolean | string = false
  ) {
    super(typeName, {
      AllowNull: allowNull,
      IsPrimaryKey: isPrimaryKey,
      DefaultValue: defaultValue,
      Unique: unique
    })
  }
}

describe('PropertyType', () => {
  describe('constructor', () => {
    it('Should throw a TypeError if an unknown property type name is used', () => {
      /* tslint:disable-next-line no-unused-expression */
      expect(() => {
        const temp = new MockPropertyType('Unknown')
      }).to.throw(TypeError)
    })
  })
  describe('Equals', () => {
    it('Should not return true when type names are not equal', () => {
      expect(
        new MockPropertyType(PropertyTypes.DateTime).equals(
          new MockPropertyType(PropertyTypes.String)
        )
      ).to.equal(false)
    })
    it('Should not return true when allowNull is not equal', () => {
      expect(
        new MockPropertyType(PropertyTypes.DateTime, false).equals(
          new MockPropertyType(PropertyTypes.DateTime, true)
        )
      )
    })
    it('Should not return true when isPrimaryKey is not equal', () => {
      expect(
        new MockPropertyType(PropertyTypes.DateTime, false, false).equals(
          new MockPropertyType(PropertyTypes.DateTime, false, true)
        )
      )
    })
    it('Should not return true when defaultValue is not equal', () => {
      expect(
        new MockPropertyType(PropertyTypes.DateTime, false, false, false).equals(
          new MockPropertyType(PropertyTypes.DateTime, false, false, true)
        )
      )
    })
    it('Should not return true when unique is not equal', () => {
      expect(
        new MockPropertyType(PropertyTypes.DateTime, false, false, null, false).equals(
          new MockPropertyType(PropertyTypes.DateTime, false, false, null, true)
        )
      )
    })
  })
})
