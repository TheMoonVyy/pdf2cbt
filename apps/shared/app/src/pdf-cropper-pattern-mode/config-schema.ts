import { z } from 'zod'
import {
  pageRegex,
  pageRangeRegex,
  questionRangeRegex,
  absOrRelativeCoordinateRegex,
// } from '#layers/shared/shared/regexes'
} from '../../../shared/regexes'
import {
  ANSWER_OPTIONS_COUNTERS,
  PATTERN_MODE,
// } from '#layers/shared/shared/constants'
} from '../../../shared/constants'

const questionPatternTextSchema = z.strictObject({
  type: z.literal('text'),
  prefix: z.string(),
  questionRange: z.string()
    .trim()
    .min(3)
    .regex(questionRangeRegex),
  suffix: z.string(),
  isLeadingZeroesOptional: z.boolean(),
  isCaseSensitive: z.boolean(),
})

const regexPatternSchema = z.strictObject({
  type: z.literal('regex'),
  value: z.string().trim(),
  isCaseSensitive: z.boolean(),
})

const regexOrTextPatternSchema = z.strictObject({
  type: z.enum(['text', 'regex']),
  value: z.string().trim(),
  isCaseSensitive: z.boolean(),
})

const natQuestionTypeSchema = z.strictObject({
  type: z.literal('nat'),
  marks: z.strictObject({
    cm: z.number().nonnegative(),
    im: z.number().nonpositive(),
  }),
})

const mcqMsqMsmQuestionTypesSchema = natQuestionTypeSchema.extend({
  type: z.enum(['mcq', 'msm']),
  answerOptions: z.string().trim(),
  answerOptionsCounterType: z.strictObject({
    primary: z.enum(ANSWER_OPTIONS_COUNTERS).optional(),
    secondary: z.enum(ANSWER_OPTIONS_COUNTERS).optional(),
  }).optional(),
})

const msqQuestionTypeSchema = mcqMsqMsmQuestionTypesSchema.extend({
  type: z.literal('msq'),
  marks: mcqMsqMsmQuestionTypesSchema.shape.marks.extend({
    pm: z.number().nonnegative(),
  }),
})

export const questionDetailsSchema = z.discriminatedUnion('type', [
  natQuestionTypeSchema,
  mcqMsqMsmQuestionTypesSchema,
  msqQuestionTypeSchema,
])

const AbsOrRelativeCoordinateSchema = z.string()
  .min(1, 'This is required')
  .trim()
  .refine(coord => !coord.trim() || absOrRelativeCoordinateRegex.test(coord), {
    message: 'Coordinate must be number or in percentage (i.e n%)\ne.g. "297" or "50%"',
  })

export const searchAreaSchema = z.strictObject({
  l: AbsOrRelativeCoordinateSchema,
  r: AbsOrRelativeCoordinateSchema,
  t: AbsOrRelativeCoordinateSchema,
  b: AbsOrRelativeCoordinateSchema,
}).superRefine((coords, ctx) => {
  const parseCoord = (c: string) => c.endsWith('%')
    ? { isRelative: true, value: parseFloat(c) }
    : { isRelative: false, value: parseFloat(c) }

  if (absOrRelativeCoordinateRegex.test(coords.l) && absOrRelativeCoordinateRegex.test(coords.r)) {
    const left = parseCoord(coords.l)
    const right = parseCoord(coords.r)
    if (left.isRelative === right.isRelative && left.value >= right.value) {
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

    if (top.isRelative === bottom.isRelative && top.value >= bottom.value) {
      ctx.addIssue({
        path: ['b'],
        code: 'custom',
        message: 'Bottom coordinate must be greater than top coordinate.',
      })
    }
  }
})

export const pagesSchema = z.string()
  .min(1, 'Pages must contain at least one page number')
  .trim()
  .refine(
    (pages) => {
      const pagesParts = pages.toUpperCase().split(',').map(s => s.trim())
      return pagesParts
        .every(p => pageRangeRegex.test(p) || pageRegex.test(p))
    },
    { message: 'Pages is not in valid format' },
  )

const questionStartPatternSchema = z.discriminatedUnion('type', [
  regexPatternSchema,
  questionPatternTextSchema,
])

const offSetBySchema = z.strictObject({
  l: z.number().optional(),
  r: z.number().optional(),
  t: z.number().optional(),
  b: z.number().optional(),
}).optional()

const columnSchema = z.strictObject({
  start: z.strictObject({
    pattern: questionStartPatternSchema,
    searchIn: searchAreaSchema,
  }),

  end: z.strictObject({
    pattern: regexOrTextPatternSchema,
    searchIn: searchAreaSchema,
  }).optional(),

  crop: z.strictObject({
    within: z.strictObject({
      t: AbsOrRelativeCoordinateSchema,
      b: AbsOrRelativeCoordinateSchema,
    }),

    exactlyTo: z.strictObject({
      l: z.string()
        .trim()
        .refine(coord => !coord.trim() || absOrRelativeCoordinateRegex.test(coord), {
          message: 'Coordinate must be number or in percentage (i.e n%)\ne.g. "297" or "50%"',
        })
        .nullish(),
      r: AbsOrRelativeCoordinateSchema,
    }),

    offsetBy: offSetBySchema,
  }),

})

export const patternModeFormQuestionsSchema = z.strictObject({
  pages: pagesSchema,

  details: questionDetailsSchema,

  forBottomCoordinateUseBottom: z.array(z.enum(PATTERN_MODE.pdfElems)).optional(),

  forTopCoordinateLookUp: z.strictObject({
    by: z.number().positive(),
    chainBy: z.number().nonnegative().optional(),
    for: z.array(z.enum(PATTERN_MODE.pdfElems))
      .min(1, { message: 'At least one option is required' })
      .max(3, { message: 'No more than three values allowed' })
      .refine(arr => new Set(arr).size === arr.length, {
        message: 'Duplicate entries are not allowed',
      }),
  }).optional(),

  obtainedQuestionNum: z.strictObject({
    whenDuplicate: z.enum(PATTERN_MODE.obtainedQNum),
    nextQNumMustBeOneNumGreater: z.boolean(),
  }),

  mergeQuestions: z.strictObject({
    splitBy: z.array(z.enum(PATTERN_MODE.splitBy)),
    mergeOnlyIfContainsAny: z.array(z.enum(PATTERN_MODE.pdfElems)),
  }).optional(),

  paragraphQuestions: z.strictObject({
    start: z.strictObject({
      pattern: regexOrTextPatternSchema,
      searchIn: searchAreaSchema,
    }),
    end: z.strictObject({
      pattern: regexOrTextPatternSchema,
      searchIn: searchAreaSchema,
    }).optional(),
    crop: z.strictObject({
      exactlyTo: z.strictObject({
        l: z.string()
          .trim()
          .refine(coord => !coord.trim() || absOrRelativeCoordinateRegex.test(coord), {
            message: 'Coordinate must be number or in percentage (i.e n%)\ne.g. "297" or "50%"',
          })
          .nullish(),
        r: z.string()
          .trim()
          .refine(coord => !coord.trim() || absOrRelativeCoordinateRegex.test(coord), {
            message: 'Coordinate must be number or in percentage (i.e n%)\ne.g. "297" or "50%"',
          })
          .nullish(),
      }).nullish(),
      offsetBy: offSetBySchema,
    }),
  }).optional(),

  columns: z.array(columnSchema).nonempty(),

})

const patternAndSearchInForSubjectAndSectionSchema = z.strictObject({
  pattern: regexOrTextPatternSchema,
  searchIn: z.strictObject({
    pages: pagesSchema,
    area: searchAreaSchema,
  }),
})

const sectionSchema = patternAndSearchInForSubjectAndSectionSchema.extend({
  questions: patternModeFormQuestionsSchema,
  numOfOptionalQuestions: z.number().nonnegative().optional(),
})

const columnDividersSchema = z.string()
  .trim()
  .refine(
    (str) => {
      return !str || str.split(',')
        .map(s => s.trim())
        .every(strPart => absOrRelativeCoordinateRegex.test(strPart))
    },
    {
      message: 'Divider coordinate must be number '
        + 'or in percentage (i.e n%) relative to page width, '
        + 'each separated by commas.\n\n'
        + 'e.g. "297" or "50%" or "33%, 66%"',
    },
  )
  .optional()

export const subjectWithSectionsSchema = z.strictObject({
  start: patternAndSearchInForSubjectAndSectionSchema,
  end: patternAndSearchInForSubjectAndSectionSchema.optional(),
  columnDividers: columnDividersSchema,
  sections: z.record(z.string().min(1), sectionSchema),
})

export const subjectWithoutSectionsSchema = z.strictObject({
  start: patternAndSearchInForSubjectAndSectionSchema,
  end: patternAndSearchInForSubjectAndSectionSchema.optional(),
  columnDividers: columnDividersSchema,
  questions: patternModeFormQuestionsSchema,
})

const subjectSchema = z.union([
  subjectWithSectionsSchema,
  subjectWithoutSectionsSchema,
])

const settingsSchema = z.strictObject({
  yCoordinateGroupingRangeForLine: z.number().nonnegative(),
  ignoreElementsGoingOutsidePage: z.boolean(),
  calculateCharacterBoundariesPrecisely: z.boolean().optional(),
  linesToIgnore: z.array(regexOrTextPatternSchema).optional(),
})

export const patternModeConfigSchema = z.strictObject({
  settings: settingsSchema,
  subjects: z.record(z.string().min(1), subjectSchema),
})

const _patternModeJsonSchema = z.object({
  patternModeConfig: patternModeConfigSchema,
})

export type SearchArea = z.input<typeof searchAreaSchema>
export type OffsetBy = z.input<typeof offSetBySchema>
export type PatternModeJsonData = z.infer<typeof _patternModeJsonSchema>
export type PatternModeConfigJson = z.infer<typeof patternModeConfigSchema>
export type PatternModeSubjectConfigJson = PatternModeConfigJson['subjects'][number]

export type PatternModeSectionConfigJson = z.infer<typeof sectionSchema>
export type PatternModeQuestionsConfigJson = PatternModeSectionConfigJson['questions']
export type PatternModeQuestionsColumnConfigJson = PatternModeQuestionsConfigJson['columns'][number]

console.log(JSON.stringify(z.toJSONSchema(_patternModeJsonSchema, { io: 'input', reused: 'ref' }), null, 2))
