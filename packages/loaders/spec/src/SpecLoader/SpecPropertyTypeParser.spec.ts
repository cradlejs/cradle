import { expect } from 'chai'
import 'mocha'

import SpecProperty from './SpecProperty'
import ParseProperty from './SpecPropertyTypeParser'
import { PropertyTypes, IntegerAutogenerateOptions } from '@cradlejs/core'

describe('SpecPropertyTypeParser', () => {
  it('Should throw a SyntaxError if called without a value', () => {
    expect(() => {
      ParseProperty('')
    }).to.throw(SyntaxError)
  })

  it('Should throw a SyntaxError if called with invalid type name', () => {
    expect(() => {
      ParseProperty('garbage')
    }).to.throw(SyntaxError)
  })

  describe('Ref', () => {
    it('Should parse a ref', () => {
      expect(ParseProperty('ref Test("id", "id")')).to.deep.equal(
        new SpecProperty(PropertyTypes.ReferenceModel, {
          foreignProperty: 'id',
          localProperty: 'id',
          modelName: 'Test'
        })
      )
    })
    it('Should parse a ref array', () => {
      expect(ParseProperty('ref Test[]("id", "id")')).to.deep.equal(
        new SpecProperty(PropertyTypes.ReferenceModel, {
          foreignProperty: 'id',
          localProperty: 'id',
          modelName: 'Test',
          isArray: true
        })
      )
    })
    it('Should parse a nullable ref', () => {
      expect(ParseProperty('ref Test?("id", "id")')).to.deep.equal(
        new SpecProperty(PropertyTypes.ReferenceModel, {
          foreignProperty: 'id',
          localProperty: 'id',
          modelName: 'Test',
          nullable: true
        })
      )
    })
    it('Should parse a nullable ref array', () => {
      expect(ParseProperty('ref Test[]?("id", "id")')).to.deep.equal(
        new SpecProperty(PropertyTypes.ReferenceModel, {
          foreignProperty: 'id',
          localProperty: 'id',
          modelName: 'Test',
          nullable: true,
          isArray: true
        })
      )
    })
  })

  describe('Import', () => {
    it('Should parse an import', () => {
      expect(ParseProperty('import Test')).to.deep.equal(
        new SpecProperty(PropertyTypes.ImportModel, { modelName: 'Test' })
      )
    })
    it('Should parse a nullable import', () => {
      expect(ParseProperty('import Test?')).to.deep.equal(
        new SpecProperty(PropertyTypes.ImportModel, { modelName: 'Test', nullable: true })
      )
    })
    it('Should parse an import array', () => {
      expect(ParseProperty('import Test[]')).to.deep.equal(
        new SpecProperty(PropertyTypes.ImportModel, { modelName: 'Test', isArray: true })
      )
    })
    it('Should parse a nullable import array', () => {
      expect(ParseProperty('import Test[]?')).to.deep.equal(
        new SpecProperty(PropertyTypes.ImportModel, {
          modelName: 'Test',
          isArray: true,
          nullable: true
        })
      )
    })
  })

  describe('Integer', () => {
    it('Should parse a simple integer', () => {
      expect(ParseProperty('integer')).to.deep.equal(new SpecProperty('integer'))
    })
    it('Should parse a nullable integer', () => {
      expect(ParseProperty('integer?')).to.deep.equal(
        new SpecProperty('integer', { nullable: true })
      )
    })
    it('Should parse as an array', () => {
      expect(ParseProperty('integer[]')).to.deep.equal(
        new SpecProperty('integer', { isArray: true })
      )
    })
    it('Should parse as a nullable array', () => {
      expect(ParseProperty('integer[]?')).to.deep.equal(
        new SpecProperty('integer', { isArray: true, nullable: true })
      )
    })
    it('Should parse with a default value', () => {
      expect(ParseProperty('integer default(5)')).to.deep.equal(
        new SpecProperty('integer', { defaultValue: 5 })
      )
    })
    it('Should parse with a primary key', () => {
      expect(ParseProperty('integer primary')).to.deep.equal(
        new SpecProperty('integer', { primaryKey: true })
      )
    })
    it('Should parse with a min value', () => {
      expect(ParseProperty('integer min(0)')).to.deep.equal(
        new SpecProperty('integer', { minValue: 0 })
      )
    })
    it('Should parse with a max value', () => {
      expect(ParseProperty('integer max(0)')).to.deep.equal(
        new SpecProperty('integer', { maxValue: 0 })
      )
    })
    it('Should parse with a min and max value', () => {
      expect(ParseProperty('integer min(-100) max(0)')).to.deep.equal(
        new SpecProperty('integer', { maxValue: 0, minValue: -100 })
      )
    })
    it('Should parse with a list of allowed values', () => {
      expect(ParseProperty('integer allow(0, 1, 2, 3, 4)')).to.deep.equal(
        new SpecProperty('integer', { allowedValues: [0, 1, 2, 3, 4] })
      )
    })
    it('Should parse with autogenerate options', () => {
      expect(ParseProperty('integer auto(1,1)')).to.deep.equal(
        new SpecProperty('integer', { autogenerateOptions: new IntegerAutogenerateOptions(1, 1) })
      )
    })

    // Errors
    it('Should throw an error with invalid Auto options', () => {
      expect(() => {
        ParseProperty('integer auto(1)')
      }).to.throw(RangeError)
    })
    it('Should throw a TypeError with an invalid default value', () => {
      expect(() => {
        ParseProperty('integer default("123")')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty default value', () => {
      expect(() => {
        ParseProperty('integer default()')
      }).to.throw(SyntaxError)
    })
    it('Should throw a TypeError with an invalid min value', () => {
      expect(() => {
        ParseProperty('integer min("123")')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty min value', () => {
      expect(() => {
        ParseProperty('integer min()')
      }).to.throw(SyntaxError)
    })
    it('Should throw a TypeError with an invalid max value', () => {
      expect(() => {
        ParseProperty('integer max("123")')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty max value', () => {
      expect(() => {
        ParseProperty('integer max()')
      }).to.throw(SyntaxError)
    })
    it('Should throw a TypeError with an invalid allow value', () => {
      expect(() => {
        ParseProperty('integer allow(0, "1", 2)')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty allow value', () => {
      expect(() => {
        ParseProperty('integer allow()')
      }).to.throw(SyntaxError)
    })
  })

  describe('Boolean', () => {
    it('Should parse a simple boolean', () => {
      expect(ParseProperty('boolean')).to.deep.equal(new SpecProperty('boolean'))
    })
    it('Should parse a nullable boolean', () => {
      expect(ParseProperty('boolean?')).to.deep.equal(
        new SpecProperty('boolean', { nullable: true })
      )
    })
    it('Should parse as an array', () => {
      expect(ParseProperty('boolean[]')).to.deep.equal(
        new SpecProperty('boolean', { isArray: true })
      )
    })
    it('Should parse as a nullable array', () => {
      expect(ParseProperty('boolean[]?')).to.deep.equal(
        new SpecProperty('boolean', { isArray: true, nullable: true })
      )
    })
    it('Should parse with a default value', () => {
      expect(ParseProperty('boolean default(true)')).to.deep.equal(
        new SpecProperty('boolean', { defaultValue: true })
      )
    })
    it('Should parse with a delete flag', () => {
      expect(ParseProperty('boolean delete')).to.deep.equal(
        new SpecProperty('boolean', { deleteFlag: true })
      )
    })

    // Errors
    it('Should throw a TypeError with invalid default value', () => {
      expect(() => {
        ParseProperty('boolean default("bad")')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty default value', () => {
      expect(() => {
        ParseProperty('boolean default()')
      }).to.throw(SyntaxError)
    })
  })

  describe('Decimal', () => {
    it('Should parse a simple decimal', () => {
      expect(ParseProperty('decimal')).to.deep.equal(new SpecProperty('decimal'))
    })
    it('Should parse a nullable decimal', () => {
      expect(ParseProperty('decimal?')).to.deep.equal(
        new SpecProperty('decimal', { nullable: true })
      )
    })
    it('Should parse as an array', () => {
      expect(ParseProperty('decimal[]')).to.deep.equal(
        new SpecProperty('decimal', { isArray: true })
      )
    })
    it('Should parse as a nullable array', () => {
      expect(ParseProperty('decimal[]?')).to.deep.equal(
        new SpecProperty('decimal', { isArray: true, nullable: true })
      )
    })
    it('Should parse with a precision and scale', () => {
      expect(ParseProperty('decimal(12,2)')).to.deep.equal(
        new SpecProperty('decimal', { precision: 12, scale: 2 })
      )
    })
    it('Should parse with a nullable with precision and scale', () => {
      expect(ParseProperty('decimal(12,2)?')).to.deep.equal(
        new SpecProperty('decimal', { nullable: true, precision: 12, scale: 2 })
      )
    })
    it('Should parse an array with precision and scale', () => {
      expect(ParseProperty('decimal(12,2)[]')).to.deep.equal(
        new SpecProperty('decimal', { isArray: true, precision: 12, scale: 2 })
      )
    })
    it('Should parse a nullable array with precision and scale', () => {
      expect(ParseProperty('decimal(12,2)[]?')).to.deep.equal(
        new SpecProperty('decimal', { isArray: true, nullable: true, precision: 12, scale: 2 })
      )
    })
    it('Should parse with a default value', () => {
      expect(ParseProperty('decimal default(2.5)')).to.deep.equal(
        new SpecProperty('decimal', { defaultValue: 2.5 })
      )
    })
    it('Should parse with primary key', () => {
      expect(ParseProperty('decimal primary')).to.deep.equal(
        new SpecProperty('decimal', { primaryKey: true })
      )
    })
    it('Should parse with unique', () => {
      expect(ParseProperty('decimal unique')).to.deep.equal(
        new SpecProperty('decimal', { unique: true })
      )
    })
    it('Should parse with unique index name', () => {
      expect(ParseProperty('decimal unique("awesome")')).to.deep.equal(
        new SpecProperty('decimal', { unique: 'awesome' })
      )
    })
    it('Should parse with a max value', () => {
      expect(ParseProperty('decimal max(10.5)')).to.deep.equal(
        new SpecProperty('decimal', { maxValue: 10.5 })
      )
    })
    it('Should parse with a min value', () => {
      expect(ParseProperty('decimal min(-1.5)')).to.deep.equal(
        new SpecProperty('decimal', { minValue: -1.5 })
      )
    })
    it('Should parse with a min and max value', () => {
      expect(ParseProperty('decimal min(-10.5) max(10.5)')).to.deep.equal(
        new SpecProperty('decimal', { maxValue: 10.5, minValue: -10.5 })
      )
    })
    it('Should parse with allowed values', () => {
      expect(ParseProperty('decimal allow(0, 1.5, 2.5, 5)')).to.deep.equal(
        new SpecProperty('decimal', { allowedValues: [0, 1.5, 2.5, 5] })
      )
    })

    // Errors
    it('Should throw a TypeError with an invalid default value', () => {
      expect(() => {
        ParseProperty('decimal default("123.45")')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty default value', () => {
      expect(() => {
        ParseProperty('decimal default()')
      }).to.throw(SyntaxError)
    })
    it('Should throw a TypeError with an invalid min value', () => {
      expect(() => {
        ParseProperty('decimal min("123.45")')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty min value', () => {
      expect(() => {
        ParseProperty('decimal min()')
      }).to.throw(SyntaxError)
    })
    it('Should throw a TypeError with an invalid max value', () => {
      expect(() => {
        ParseProperty('decimal max("123.45")')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty max value', () => {
      expect(() => {
        ParseProperty('decimal max()')
      }).to.throw(SyntaxError)
    })
    it('Should throw a TypeError with an invalid allow value', () => {
      expect(() => {
        ParseProperty('decimal allow(0.25, "1.5", 2)')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty allow value', () => {
      expect(() => {
        ParseProperty('decimal allow()')
      }).to.throw(SyntaxError)
    })
  })

  describe('DateTime', () => {
    const validNowTokens = ['NOW', 'now', 'Now', 'nOw', 'noW']
    const validDates = [
      '2018-01-01',
      '2018/01/01',
      '2018-01-01T05:30',
      '2018-01-01 05:30',
      '2018-01-01T05:30Z',
      '2018-01-01 05:30Z',
      '2018-01-01T05:30:00',
      '2018-01-01 05:30:00',
      '2018-01-01T05:30:00.000',
      '2018-01-01 05:30:00.000',
      '2018-01-01T05:40:12.345Z',
      '2018-01-01 05:40:12.345Z',
      '2018-01-01T05:40:12.345-05:00',
      '2018-01-01 05:40:12.345-05:00',
      '2018-01-01T05:40:12.345+05:30',
      '2018-01-01 05:40:12.345+05:30',
      '2018-01-01T05:40:12.345-0500',
      '2018-01-01 05:40:12.345-0500',
      '2018-01-01T05:40:12.345+0530',
      '2018-01-01 05:40:12.345+0530',
      '20180101',
      '20180101T0545',
      '20180101T0545Z'
    ]
    const invalidDates = [
      '"2018-01-01"',
      '2018-13-28'
      // '2007-04-05T24:50',
    ]

    it('Should parse a simple datetime', () => {
      expect(ParseProperty('datetime')).to.deep.equal(new SpecProperty('datetime'))
    })
    it('Should parse a nullable datetime', () => {
      expect(ParseProperty('datetime?')).to.deep.equal(
        new SpecProperty('datetime', { nullable: true })
      )
    })
    it('Should parse an array of datetime', () => {
      expect(ParseProperty('datetime[]')).to.deep.equal(
        new SpecProperty('datetime', { isArray: true })
      )
    })
    it('Should parse a nullable array of datetime', () => {
      expect(ParseProperty('datetime[]?')).to.deep.equal(
        new SpecProperty('datetime', { isArray: true, nullable: true })
      )
    })
    it('Should parse with default of now', () => {
      validNowTokens.forEach((nowToken) => {
        expect(ParseProperty(`datetime default(${nowToken})`)).to.deep.equal(
          new SpecProperty('datetime', { defaultValue: 'DateTimeNow' }),
          `Test default value: ${nowToken}`
        )
      })
    })
    it('Should parse with default value', () => {
      validDates.forEach((testDate) => {
        expect(ParseProperty(`datetime default(${testDate})`)).to.deep.equal(
          new SpecProperty('datetime', { defaultValue: new Date(testDate) }),
          `Test default value: ${testDate}`
        )
      })
    })
    it('Should parse with max value', () => {
      validDates.forEach((testDate) => {
        expect(ParseProperty(`datetime max(${testDate})`)).to.deep.equal(
          new SpecProperty('datetime', { maxValue: new Date(testDate) }),
          `Test default value: ${testDate}`
        )
      })
    })
    it('Should parse with min value', () => {
      validDates.forEach((testDate) => {
        expect(ParseProperty(`datetime min(${testDate})`)).to.deep.equal(
          new SpecProperty('datetime', { minValue: new Date(testDate) }),
          `Test default value: ${testDate}`
        )
      })
    })
    it('Should parse with min and max value', () => {
      validDates.forEach((testDate) => {
        expect(ParseProperty(`datetime min(${testDate}) max(${testDate})`)).to.deep.equal(
          new SpecProperty('datetime', {
            maxValue: new Date(testDate),
            minValue: new Date(testDate)
          }),
          `Test default value: ${testDate}`
        )
      })
    })

    // Errors
    it('Should throw a TypeError with an invalid default value', () => {
      invalidDates.forEach((testDate) => {
        expect(() => {
          ParseProperty(`datetime default(${testDate})`)
        }).to.throw(TypeError)
      })
    })
    it('Should throw a SyntaxError with an empty default value', () => {
      expect(() => {
        ParseProperty('datetime default()')
      }).to.throw(SyntaxError)
    })
    it('Should throw a TypeError with an invalid min value', () => {
      expect(() => {
        ParseProperty('datetime min("123.45")')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty min value', () => {
      expect(() => {
        ParseProperty('datetime min()')
      }).to.throw(SyntaxError)
    })
    it('Should throw a TypeError with an invalid max value', () => {
      expect(() => {
        ParseProperty('datetime max("123.45")')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty max value', () => {
      expect(() => {
        ParseProperty('datetime max()')
      }).to.throw(SyntaxError)
    })
  })

  describe('String', () => {
    it('Should parse a simple string', () => {
      expect(ParseProperty('string')).to.deep.equal(new SpecProperty('string'))
    })
    it('Should parse a string with custom attribute', () => {
      expect(ParseProperty('string @format("email")')).to.deep.equal(
        new SpecProperty('string', { attributes: { format: 'email' } })
      )
    })
    it('Should parse a string with a custom attribute array', () => {
      expect(ParseProperty('string @formats("email", "url")')).to.deep.equal(
        new SpecProperty('string', { attributes: { formats: ['email', 'url'] } })
      )
    })
    it('It should parse a string with a custom attribute with no value', () => {
      expect(ParseProperty('string @email')).to.deep.equal(
        new SpecProperty('string', { attributes: { email: true } })
      )
    })
    it('Should parse a string with length', () => {
      expect(ParseProperty('string(100)')).to.deep.equal(
        new SpecProperty('string', { length: 100 })
      )
    })
    it('Should parse a nullable string', () => {
      expect(ParseProperty('string?')).to.deep.equal(new SpecProperty('string', { nullable: true }))
    })
    it('Should parse a string with length', () => {
      expect(ParseProperty('string(100)?')).to.deep.equal(
        new SpecProperty('string', { length: 100, nullable: true })
      )
    })
    it('Should parse with primary key', () => {
      expect(ParseProperty('string primary')).to.deep.equal(
        new SpecProperty('string', { primaryKey: true })
      )
    })
    it('Should parse with unique', () => {
      expect(ParseProperty('string unique')).to.deep.equal(
        new SpecProperty('string', { unique: true })
      )
    })
    it('Should parse with default value', () => {
      expect(ParseProperty('string default("Testing")')).to.deep.equal(
        new SpecProperty('string', { defaultValue: 'Testing' })
      )
      expect(ParseProperty('string default("")')).to.deep.equal(
        new SpecProperty('string', { defaultValue: '' })
      )
      expect(ParseProperty("string default('Testing')")).to.deep.equal(
        new SpecProperty('string', { defaultValue: 'Testing' })
      )
      expect(ParseProperty("string default('')")).to.deep.equal(
        new SpecProperty('string', { defaultValue: '' })
      )
    })
    it('Should parse allowed values', () => {
      expect(ParseProperty('string allow("Value 1", "Value 2", "Value 3")')).to.deep.equal(
        new SpecProperty('string', { allowedValues: ['Value 1', 'Value 2', 'Value 3'] })
      )
      expect(ParseProperty("string allow('Value 1', 'Value 2', 'Value 3')")).to.deep.equal(
        new SpecProperty('string', { allowedValues: ['Value 1', 'Value 2', 'Value 3'] })
      )
    })

    // Errors
    it('Should throw a TypeError with an invalid default value', () => {
      expect(() => {
        ParseProperty('string default(123.45)')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty default value', () => {
      expect(() => {
        ParseProperty('string default()')
      }).to.throw(SyntaxError)
    })
    it('Should throw a TypeError with an invalid allow value', () => {
      expect(() => {
        ParseProperty('string allow("Test 1", 1.5, "Test 2")')
      }).to.throw(TypeError)
    })
    it('Should throw a SyntaxError with an empty allow value', () => {
      expect(() => {
        ParseProperty('string allow()')
      }).to.throw(SyntaxError)
    })
  })

  describe('UniqueIdentifier', () => {
    it('Should parse a simple uniqueidentifier', () => {
      expect(ParseProperty('uniqueidentifier')).to.deep.equal(new SpecProperty('uniqueidentifier'))
    })
    it('Should parse a nullable uniqueidentifier', () => {
      expect(ParseProperty('uniqueidentifier?')).to.deep.equal(
        new SpecProperty('uniqueidentifier', { nullable: true })
      )
    })
    it('Should parse an array of uniqueidentifier', () => {
      expect(ParseProperty('uniqueidentifier[]')).to.deep.equal(
        new SpecProperty('uniqueidentifier', { isArray: true })
      )
    })
    it('Should parse a nullable array of uniqueidentifier', () => {
      expect(ParseProperty('uniqueidentifier[]?')).to.deep.equal(
        new SpecProperty('uniqueidentifier', { isArray: true, nullable: true })
      )
    })
    it('Should parse with primary key', () => {
      expect(ParseProperty('uniqueidentifier primary')).to.deep.equal(
        new SpecProperty('uniqueidentifier', { primaryKey: true })
      )
    })
    it('Should parse with unique', () => {
      expect(ParseProperty('uniqueidentifier unique')).to.deep.equal(
        new SpecProperty('uniqueidentifier', { unique: true })
      )
    })
  })
})
