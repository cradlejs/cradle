import { expect } from 'chai'
import 'mocha'
import * as PropertyTypes from './constants'
import { StringPropertyType } from './StringPropertyType'

describe('StringPropertyType', () => {
  describe('constructor', () => {
    it('Should return a PropertyType with a type name of String', () => {
      expect(new StringPropertyType({}).TypeName).to.equal(PropertyTypes.String)
    })
    it('Should correctly assign unique as false', () => {
      expect(
        new StringPropertyType({ Unique: false, AllowNull: false, IsPrimaryKey: false })
      ).to.deep.include({ Unique: false })
    })
    it('Should correctly assign unique as true', () => {
      expect(new StringPropertyType({ Unique: true })).to.deep.include({ Unique: true })
    })
  })
})
