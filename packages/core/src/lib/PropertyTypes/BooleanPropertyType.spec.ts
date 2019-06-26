import { expect } from 'chai'
import 'mocha'
import { BooleanPropertyType } from './BooleanPropertyType'
import * as PropertyTypes from './constants'

describe('BooleanPropertyType', () => {
  describe('constructor', () => {
    it('Should return a PropertyType with a type name of Boolean', () => {
      expect(new BooleanPropertyType({ DefaultValue: false }).TypeName).to.equal(
        PropertyTypes.Boolean
      )
    })
  })
})
