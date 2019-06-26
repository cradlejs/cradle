import { expect } from 'chai'
import 'mocha'
const tempConsole = console

const packageInfo = require('../../package.json')

describe('Repository sanity checks', () => {
  it('Should have a Package.json with a publishConfig', () => {
    expect(!!packageInfo.publishConfig).to.equal(true)
  })
  it('Should have a Package.json with a publishConfig tag set', () => {
    expect(!!packageInfo.publishConfig.tag).to.equal(true)
  })
  it('Version numbers should match the correct publishConfig tag', () => {
    const parts = packageInfo.version.split('.')
    if (parts.length === 3) {
      expect(packageInfo.publishConfig.tag).to.equal('latest')
    } else {
      expect(packageInfo.publishConfig.tag).to.equal('next')
    }
  })
})
