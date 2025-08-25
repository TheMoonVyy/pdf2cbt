import { createRule, type Maybe } from '@regle/core'

export const pageRegex = /^(?:(?:L[1-9]\d*)|L|\d+)$/
export const pageRangeRegex = /^(?:(?:L[1-9]\d*)|L|\d+)\s*-\s*(?:(?:L[1-9]\d*)|L|\d+)$/

export const questionRangeRegex = /^(?<start>\d+)\s{0,3}-\s{0,3}(?<end>\d+)$/

export const absOrRelativeCoordinateRegex = /^\d+(?:\.\d+)?\s?%?$/

export const pagesRule = createRule({
  validator(value: Maybe<string>) {
    if (typeof value === 'string') {
      console.log(value)
      return value
        .toUpperCase()
        .split(',')
        .map(part => part.trim())
        .every(pagePart => pageRegex.test(pagePart) || pageRangeRegex.test(pagePart))
    }
    return true
  },
  message: 'Pages is not in valid format',
})

export const absOrRelativeCoordRule = createRule({
  validator(value: Maybe<string>) {
    if (typeof value === 'string' && value.trim()) {
      return absOrRelativeCoordinateRegex.test(value.trim())
    }
    return true
  },
  message: 'Coordinate must be number or in percentage (i.e n%).\n'
    + 'e.g. "297" or "50%"',
})
