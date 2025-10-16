import { createRule, type Maybe } from '@regle/core'
import {
  pageRegex,
  pageRangeRegex,
  absOrRelativeCoordinateRegex,
  answerOptionsMcqAndMsqRegex,
  answerOptionsMsmRegex,
} from '#layers/shared/shared/regexes'

export const pagesRule = createRule({
  validator(value: Maybe<string>) {
    if (typeof value === 'string' && value.trim()) {
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

export const columnDividersRule = createRule({
  validator(value: Maybe<string>) {
    if (typeof value === 'string' && value.trim()) {
      return value
        .split(',')
        .map(s => s.trim())
        .every(s => absOrRelativeCoordinateRegex.test(s))
    }
    return true
  },
  message: 'Column Dividers must be number or in percentage (i.e n%) '
    + 'separated with comma if more than one divider is present.\n'
    + 'e.g. "297" or "50%" or "33%, 66%"',
})

export const answerOptionsRule = createRule({
  validator(value: Maybe<string>, type: QuestionType) {
    if (typeof value === 'string' && value.trim()) {
      if (type === 'msm') {
        return answerOptionsMsmRegex.test(value.trim())
      }
      return answerOptionsMcqAndMsqRegex.test(value.trim())
    }
    return true
  },
  message: ({ $params }) => {
    if ($params[0] === 'msm') {
      return 'Answer options must be in the "mxn" format for MSM Q. type, '
        + 'where m is no. of rows and n is no. of columns (e.g. "4x6").\n\n'
        + 'For square matrix (m = n), just one of them can also be used (e.g. "4") ("4" = "4x4")'
    }
    return 'Answer options must be an integer which is >= 1 (e.g. "4").'
  },
})
