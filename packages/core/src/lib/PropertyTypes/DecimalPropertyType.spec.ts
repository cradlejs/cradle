import { expect } from 'chai'
import 'mocha'
import * as PropertyTypes from './constants'
import { DecimalPropertyType } from './DecimalPropertyType'
describe('DecimalPropertyType', () => {
  describe('constructor', () => {
    it('Should return a PropertyType with a type name of Decimal', () => {
      expect(new DecimalPropertyType({ Precision: 18, Scale: 2 }).TypeName).to.equal(
        PropertyTypes.Decimal
      )
    })
    it('Should correctly assign Precision and Scale', () => {
      expect(new DecimalPropertyType({ Precision: 18, Scale: 2 })).to.deep.include({
        Precision: 18,
        Scale: 2
      })
    })
  })
  describe('equals', () => {
    it('Should return true if Precision and Scale are equal', () => {
      expect(
        new DecimalPropertyType({ Precision: 18, Scale: 2 }).equals(
          new DecimalPropertyType({ Precision: 18, Scale: 2 })
        )
      ).to.equal(true)
    })
    it('Should return false if Precision is not equal', () => {
      expect(
        new DecimalPropertyType({ Precision: 18, Scale: 2 }).equals(
          new DecimalPropertyType({ Precision: 16, Scale: 2 })
        )
      ).to.equal(false)
    })
    it('Should return false if Scale is not equal', () => {
      expect(
        new DecimalPropertyType({ Precision: 18, Scale: 2 }).equals(
          new DecimalPropertyType({ Precision: 18, Scale: 4 })
        )
      ).to.equal(false)
    })
  })
})
