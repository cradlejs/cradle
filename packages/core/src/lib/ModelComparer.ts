export class ModelComparer {
  private CaseSensitive: boolean
  public constructor(caseSensitive: boolean = true) {
    this.CaseSensitive = caseSensitive
  }

  public Compare(a: object, b: object) {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)

    const missingKeys = aKeys.filter((ak) => bKeys.indexOf(ak) === -1)
    const newKeys = bKeys.filter((bk) => aKeys.indexOf(bk) === -1)

    const sameKeys = aKeys.filter((ak) => missingKeys.indexOf(ak) === -1)
    const newValueKeys = sameKeys.filter((sk) => !this.equal(a[sk], b[sk]))
    return {
      additions: newKeys,
      deletions: missingKeys,
      modifications: newValueKeys.map((nvk) => ({ key: nvk, value: b[nvk] }))
    }
  }

  private equal(a: any, b: any) {
    if (a === b) {
      return true
    }

    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const arrA = Array.isArray(a)
      const arrB = Array.isArray(b)
      let i
      let length
      let key

      if (arrA && arrB) {
        length = a.length
        if (length !== b.length) {
          return false
        }
        for (i = length; i-- !== 0; ) {
          if (!this.equal(a[i], b[i])) {
            return false
          }
        }
        return true
      }

      if (arrA !== arrB) {
        return false
      }

      const dateA = a instanceof Date
      const dateB = b instanceof Date
      if (dateA !== dateB) {
        return false
      }
      if (dateA && dateB) {
        return a.getTime() === b.getTime()
      }

      const regexpA = a instanceof RegExp
      const regexpB = b instanceof RegExp
      if (regexpA !== regexpB) {
        return false
      }
      if (regexpA && regexpB) {
        return a.toString() === b.toString()
      }

      const keys = Object.keys(a)
      length = keys.length

      if (length !== Object.keys(b).length) {
        return false
      }

      for (i = length; i-- !== 0; ) {
        if (!Object.prototype.hasOwnProperty.call(b, keys[i])) {
          return false
        }
      }

      for (i = length; i-- !== 0; ) {
        key = keys[i]
        if (!this.equal(a[key], b[key])) {
          return false
        }
      }

      return true
    }

    return a !== a && b !== b
  }
}
