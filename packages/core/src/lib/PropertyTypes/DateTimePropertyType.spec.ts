import { expect } from 'chai'
import 'mocha'
import * as PropertyTypes from './constants'
import { DateTimePropertyType } from './DateTimePropertyType'

describe('DateTimePropertyType', () => {
  describe('constructor', () => {
    it('Should return a PropertyType with a type name of DateTime', () => {
      expect(new DateTimePropertyType({}).TypeName).to.equal(PropertyTypes.DateTime)
    })
  })
})
