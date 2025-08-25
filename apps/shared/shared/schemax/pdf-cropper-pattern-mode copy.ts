import * as z from 'zod/v3'
import regexpEscape from 'regexp.escape'
import toRegexRange from 'to-regex-range'
import regexParser from 'regex-parser'
import utilParsePdfPageNumbers from '#layers/shared/app/utils/utilParsePdfPageNumbers'
import { ANSWER_OPTIONS_COUNTERS } from '#layers/shared/shared/constants'

type QuestionDetailsForOverlay = Pick<
  PdfCroppedOverlayData,
  'type'
  | 'answerOptions'
  | 'marks'
  | 'answerOptionsCounterTypePrimary'
  | 'answerOptionsCounterTypeSecondary'
>

// const ANSWER_OPTIONS_COUNTERS = [
//   'upper-latin',
//   'lower-latin',
//   'upper-pqrs',
//   'lower-pqrs',
//   'decimal',
//   'upper-roman',
//   'lower-roman',
// ] as const

const pageRegex = /^(L\d*|\d+)$/
const pageRangeRegex = /^(L\d+|\d+) *- *(L\d*|\d+)$/

const questionRangeRegex = /^(?<start>\d+) {0,3}- {0,3}(?<end>\d+)$/

const absOrRelativeCoordinateRegex = /^\d+ ?%?$/

const questionPatternTextSchema = z.object({
  type: z.literal('text'),
  prefix: z.string(),
  suffix: z.string(),
  questionRange: z.string()
    .trim()
    .min(3)
    .regex(questionRangeRegex),
  relaxPaddedZeros: z.boolean(),
  isCaseSensitive: z.boolean(),
}).strict()

const textPatternSchema = z.object({
  type: z.literal('text'),
  value: z.string().trim(),
  isCaseSensitive: z.boolean(),
}).strict()

const regexPatternSchema = z.object({
  type: z.literal('regex'),
  value: z.string().trim(),
}).strict()

export const regexOrTextPatternSchema = z.union([regexPatternSchema, textPatternSchema])

const regexOrTextPatternTransformedSchema = regexOrTextPatternSchema
  .transform((obj) => {
    if (obj.type === 'regex') {
      const re = regexParser(obj.value)
      return re.global ? re : new RegExp(re.source, 'g' + re.flags)
    }
    else {
      const flags = obj.isCaseSensitive ? 'g' : 'gi'
      return new RegExp(regexpEscape(obj.value), flags)
    }
  })

const natQuestionTypeSchema = z.object({
  type: z.literal('nat'),
  marks: z.object({
    cm: z.number().nonnegative(),
    im: z.number().nonpositive(),
  }).strict(),
}).strict()

const mcqMsqMsmQuestionTypesSchema = natQuestionTypeSchema.extend({
  type: z.enum(['mcq', 'msm']),
  answerOptions: z.string().trim(),
  answerOptionsCounterType: z.object({
    primary: z.enum(ANSWER_OPTIONS_COUNTERS).optional(),
    secondary: z.enum(ANSWER_OPTIONS_COUNTERS).optional(),
  }).strict().optional(),
})

const msqQuestionTypeSchema = mcqMsqMsmQuestionTypesSchema.extend({
  type: z.literal('msq'),
  marks: mcqMsqMsmQuestionTypesSchema.shape.marks.extend({
    pm: z.number().nonnegative(),
  }),
})

export const questionDetailsSchema = z.union([
  natQuestionTypeSchema,
  mcqMsqMsmQuestionTypesSchema,
  msqQuestionTypeSchema,
])

const questionDetailsTransformedSchema = questionDetailsSchema
  .transform((details): QuestionDetailsForOverlay => {
    const marks: QuestionDetailsForOverlay['marks'] = {
      cm: details.marks.cm,
      pm: 'pm' in details.marks ? details.marks.pm : 1,
      im: details.marks.im,
    }
    let answerOptions = '4'
    if ('answerOptions' in details) {
      answerOptions = details.answerOptions
    }

    let answerOptionsCounterTypePrimary = 'default'
    let answerOptionsCounterTypeSecondary = 'default'
    if ('answerOptionsCounterType' in details) {
      answerOptionsCounterTypePrimary = details.answerOptionsCounterType?.primary || 'default'
      answerOptionsCounterTypeSecondary = details.answerOptionsCounterType?.secondary || 'default'
    }
    return {
      type: details.type,
      answerOptions,
      marks,
      answerOptionsCounterTypePrimary,
      answerOptionsCounterTypeSecondary,
    }
  })

const AbsOrRelativeCoordinateSchema = z.string()
  .min(1, 'This is required')
  .trim()
  .refine(coord => !coord.trim() || absOrRelativeCoordinateRegex.test(coord), {
    message: 'Coordinate must be number or in percentage (i.e n%)\ne.g. "297" or "50%"',
  })

export const searchAreaSchema = z.object({
  l: AbsOrRelativeCoordinateSchema,
  r: AbsOrRelativeCoordinateSchema,
  t: AbsOrRelativeCoordinateSchema,
  b: AbsOrRelativeCoordinateSchema,
}).strict().superRefine((coords, ctx) => {
  const parseCoord = (c: string) => c.endsWith('%')
    ? { unit: '%', value: parseFloat(c) }
    : { unit: 'pt', value: parseFloat(c) }

  if (absOrRelativeCoordinateRegex.test(coords.l) && absOrRelativeCoordinateRegex.test(coords.r)) {
    const left = parseCoord(coords.l)
    const right = parseCoord(coords.r)
    if (left.unit === right.unit && left.value >= right.value) {
      ctx.addIssue({
        path: ['r'],
        code: 'custom',
        message: 'Right coordinate must be greater than left coordinate.',
      })
    }
  }

  if (absOrRelativeCoordinateRegex.test(coords.t) && absOrRelativeCoordinateRegex.test(coords.b)) {
    const top = parseCoord(coords.t)
    const bottom = parseCoord(coords.b)

    if (top.unit === bottom.unit && top.value >= bottom.value) {
      ctx.addIssue({
        path: ['b'],
        code: 'custom',
        message: 'Bottom coordinate must be greater than top coordinate.',
      })
    }
  }
})

export type SearchArea = z.input<typeof searchAreaSchema>

const searchAreaTransformedSchema = searchAreaSchema.transform(coords => ({
  raw: coords,
  parsed: { l: 0, r: 0, t: 0, b: 0 },
}))

let totalPages = 0

export const pagesSchema = z.string()
  .min(1, 'Pages must contain at least one page')
  .trim()
  .refine(
    (pages) => {
      const pagesParts = pages.toUpperCase().split(',').map(s => s.trim())
      return pagesParts
        .every(p => pageRangeRegex.test(p) || pageRegex.test(p))
    },
    { message: 'Pages is not in valid format' },
  )

const pagesTransformedSchema = pagesSchema
  .transform(str => utilParsePdfPageNumbers(str, totalPages))

const mergeQuestionsSchema = z.object({
  byPages: z.boolean(),
  byColumns: z.boolean(),
  onlyMergeIfContainsAny: z.object({
    line: z.boolean(),
    image: z.boolean(),
    vector: z.boolean(),
  }).strict(),
}).strict().optional()

const mergeQuestionsTransformedSchema = mergeQuestionsSchema
  .transform((obj) => {
    return {
      byPages: obj?.byPages || false,
      byColumns: obj?.byColumns || false,
      onlyMergeIfContainsAny: {
        line: obj?.onlyMergeIfContainsAny?.line || false,
        image: obj?.onlyMergeIfContainsAny?.image || false,
        vector: obj?.onlyMergeIfContainsAny?.vector || false,
      },
    }
  })

const questionStartPatternSchema = z.union([regexPatternSchema, questionPatternTextSchema])
const questionStartPatternTransformedSchema = questionStartPatternSchema
  .transform((patternObj) => {
    if (patternObj.type === 'text') {
      const {
        prefix,
        suffix,
        questionRange,
        isCaseSensitive,
        relaxPaddedZeros,
      } = patternObj

      const escapedPrefix = regexpEscape(prefix)
      const escapedSuffix = regexpEscape(suffix)
      const [min, max] = questionRange.split('-').map(v => v.trim())
      const questionRangePattern = toRegexRange(
        min!, max,
        { relaxZeros: relaxPaddedZeros, capture: true },
      )

      const flags = isCaseSensitive ? 'g' : 'gi'
      const source = escapedPrefix + questionRangePattern + escapedSuffix
      return new RegExp(source, flags)
    }
    else {
      const re = regexParser(patternObj.value)
      return re.global ? re : new RegExp(re.source, 'g' + re.flags)
    }
  })

const cropWithinSchema = z.object({
  t: AbsOrRelativeCoordinateSchema,
  b: AbsOrRelativeCoordinateSchema,
}).strict()

const cropWithinTransformedSchema = cropWithinSchema
  .transform((obj) => {
    return {
      raw: obj,
      parsed: { t: 0, b: 0 },
    }
  })

const cropExactlyToSchema = z.object({
  l: AbsOrRelativeCoordinateSchema.nullish(),
  r: AbsOrRelativeCoordinateSchema,
}).strict()

const cropExactlyToTransformedSchema = cropExactlyToSchema
  .transform((obj) => {
    return {
      raw: obj,
      parsed: { l: obj.l ? 0 : null, r: 0 },
    }
  })

const cropOffsetBySchema = z.object({
  l: z.number().optional(),
  r: z.number().optional(),
  t: z.number().optional(),
  b: z.number().optional(),
}).strict().optional()

const cropOffsetByTransformedSchema = cropOffsetBySchema
  .transform((obj) => {
    return {
      l: obj?.l || 0,
      r: obj?.r || 0,
      t: obj?.t || 0,
      b: obj?.b || 0,
    }
  })

const columnSchema = z.object({
  start: z.object({
    pattern: questionStartPatternSchema,
    searchIn: searchAreaSchema,
  }).strict(),
  end: z.object({
    pattern: regexOrTextPatternSchema,
    searchIn: searchAreaSchema,
  }).strict().optional(),
  crop: z.object({
    within: cropWithinSchema,
    exactlyTo: cropExactlyToSchema,
    offsetBy: cropOffsetBySchema,
  }).strict(),
}).strict()

const columnTransformedSchema = z.object({
  start: z.object({
    pattern: questionStartPatternTransformedSchema,
    searchIn: searchAreaTransformedSchema,
  }).strict(),
  end: z.object({
    pattern: regexOrTextPatternTransformedSchema,
    searchIn: searchAreaTransformedSchema,
  }).strict().optional(),
  crop: z.object({
    within: cropWithinTransformedSchema,
    exactlyTo: cropExactlyToTransformedSchema,
    offsetBy: cropOffsetByTransformedSchema,
  }).strict(),
}).strict()

export const patternModeFormQuestionsSchema = z.object({
  pages: pagesSchema,
  details: questionDetailsSchema,
  forBottomCoordinate: z.object({
    useBottomLine: z.boolean(),
    useBottomImage: z.boolean(),
    useBottomVector: z.boolean(),
  }).strict(),
  forTopCoordinateLookUp: z.object({
    by: z.number().positive(),
    chainBy: z.number().positive().optional(),
    for: z.array(z.union([
      z.literal('lines'),
      z.literal('vectors'),
      z.literal('images'),
    ]))
      .min(1, { message: 'At least one of lines, vectors, or images is required' })
      .max(3, { message: 'No more than three values allowed' })
      .refine(arr => new Set(arr).size === arr.length, {
        message: 'Duplicate entries are not allowed',
      }),
  }).strict().optional(),
  questionNum: z.object({
    whenDuplicate: z.enum(['ignore', 'replace', 'merge']),
    nextQNumMustBeOneNumGreater: z.boolean(),
  }).strict(),
  mergeQuestions: mergeQuestionsSchema,
  paragraphQuestionsCommonPart: z.object({
    pattern: regexOrTextPatternSchema,
    searchIn: searchAreaSchema,
  }).strict().optional(),
  numOfOptionalQuestions: z.number().min(1).optional(),
  columns: z.array(columnSchema).nonempty(),
}).strict()

const patternModeFormQuestionsTransformedSchema = patternModeFormQuestionsSchema.extend({
  pages: pagesTransformedSchema,

  details: questionDetailsTransformedSchema,

  forBottomCoordinate: z.object({
    useBottomLine: z.boolean(),
    useBottomImage: z.boolean(),
    useBottomVector: z.boolean(),
  }).strict(),

  mergeQuestions: mergeQuestionsTransformedSchema,

  paragraphQuestionsCommonPart: z.object({
    pattern: regexOrTextPatternTransformedSchema,
    searchIn: searchAreaTransformedSchema,
  }).strict().optional(),

  numOfOptionalQuestions: z.number().min(1).optional(),

  columns: z.array(columnTransformedSchema)
    .nonempty(),
}).strict()

const patternAndSearchInForSubjectAndSectionSchema = z.object({
  pattern: regexOrTextPatternTransformedSchema,
  searchIn: z.object({
    pages: pagesTransformedSchema,
    area: searchAreaTransformedSchema,
  }).strict(),
}).strict()

const sectionSchema = patternAndSearchInForSubjectAndSectionSchema.extend({
  name: z.string().trim().min(1),
  questions: patternModeFormQuestionsSchema,
})

const sectionTransformedSchema = sectionSchema.extend({
  questions: patternModeFormQuestionsTransformedSchema,
})

const columnDividersSchema = z.string()
  .trim()
  .refine(str => str.split(',')
    .map(s => s.trim())
    .every(strPart => absOrRelativeCoordinateRegex.test(strPart)),
  {
    message: 'Divider coordinate must be number or in percentage (i.e n%), '
      + 'each separated by commas each (e.g. "297" or "50%" or "33%, 66%" etc)',
  })
  .optional()

const columnDividersTransformedSchema = columnDividersSchema
  .transform((str) => {
    const raw = (str || '').split(',').map(s => s.trim())
    return {
      raw,
      parsed: [] as number[],
    }
  })

export const subjectWithSectionsSchema = z.object({
  name: z.string().trim().min(1),
  start: patternAndSearchInForSubjectAndSectionSchema,
  end: patternAndSearchInForSubjectAndSectionSchema.optional(),
  columnDividers: columnDividersTransformedSchema,
  sections: z.array(sectionSchema),
}).strict()

export const subjectWithoutSectionsSchema = z.object({
  name: z.string().trim().min(1),
  start: patternAndSearchInForSubjectAndSectionSchema,
  end: patternAndSearchInForSubjectAndSectionSchema.optional(),
  columnDividers: columnDividersTransformedSchema,
  questions: patternModeFormQuestionsTransformedSchema,
}).strict()

// export const subjectWithSectionsSchema = z.object({
//   name: z.string().trim().min(1),
//   start: patternAndSearchInForSubjectAndSectionSchema,
//   end: patternAndSearchInForSubjectAndSectionSchema.optional(),
//   columnDividers: columnDividersTransformedSchema,
//   sections: z.array(sectionSchema),
// }).strict()

// export const subjectWithoutSectionsSchema = z.object({
//   name: z.string().trim().min(1),
//   start: patternAndSearchInForSubjectAndSectionSchema,
//   end: patternAndSearchInForSubjectAndSectionSchema.optional(),
//   columnDividers: columnDividersTransformedSchema,
//   questions: patternModeFormQuestionsTransformedSchema,
// }).strict()

const subjectSchema = z.union([
  subjectWithSectionsSchema,
  subjectWithoutSectionsSchema,
])

export const patternModeConfigSchema = z.object({
  settings: z.object({
    yCoordinateGroupingRangeForLine: z.number().nonnegative(),
    ignoreElementsGoingOutsidePage: z.boolean(),
    linesToIgnore: z.array(regexOrTextPatternSchema)
      .nonempty()
      .optional(),
  }).strict(),
  subjects: z.array(z.union([
    subjectWithSectionsSchema.omit({ sections: true }).extend({
      questions: patternModeFormQuestionsSchema,
    }),
    subjectWithSectionsSchema.extend({
      sections: z.array(sectionSchema.extend({
        questions: patternModeFormQuestionsSchema,
      })),
    }),
  ])),
})

const patternModeConfigTransformedSchema = z.object({
  settings: z.object({
    yCoordinateGroupingRangeForLine: z.number().nonnegative(),
    ignoreElementsGoingOutsidePage: z.boolean(),
    linesToIgnore: z.array(regexOrTextPatternTransformedSchema)
      .nonempty()
      .optional(),
  }).strict(),
  subjects: z.array(subjectSchema)
    .transform((subjectsArray) => {
      return subjectsArray.map(
        (subjectConfig): z.output<typeof subjectWithSectionsSchema> => {
          if ('questions' in subjectConfig) {
            const subjectConf = subjectConfig as MakePropertyOptional<typeof subjectConfig, 'questions'>
            const questions = subjectConf.questions!
            delete subjectConf.questions
            return {
              ...subjectConf,
              name: subjectConf.name,
              sections: [{
                name: subjectConf.name,
                ...subjectConf.start,
                questions,
              }],
            }
          }
          return subjectConfig
        })
    }),
})

export function getPatternModeConfigSchema(pdfTotalPages: number) {
  totalPages = pdfTotalPages
  return patternModeConfigTransformedSchema
}

export type PatternModeConfigJson = z.input<typeof patternModeConfigSchema>
export type PatternModeParsedConfig = z.output<typeof patternModeConfigTransformedSchema>
// console.log(JSON.stringify(z.toJSONSchema(patternModeConfigSchema, { io: 'input', reused: 'ref', target: 'draft-4' }), null, 2))
