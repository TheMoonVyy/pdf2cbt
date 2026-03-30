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
  SECTION_INSTRUCTION_TYPES,
  // } from '#layers/shared/shared/constants'
} from '../../../shared/constants'

const patternTypeMeta = {
  title: 'Pattern type',
  description: 'The type of the pattern, either "text" or "regex".\n'
    + '"text" means the value will be treated as a plain text string.\n'
    + '"regex" means the value must be regex pattern for Javascript.',
}

const patternValueMeta = {
  title: 'The pattern to search for',
  description: 'The pattern to search for, either as a text string (when type is "text") '
    + 'or a regex expression (when type is "regex").',
}

const questionTypeMeta = {
  title: 'Question type',
  description: 'The type of the question.\n'
    + '"nat" means Numerical Answer Type question.\n'
    + '"mcq" means Multiple Choice Question with only one correct answer.\n'
    + '"msq" means Multiple Select Question with multiple correct answers.\n'
    + '"msm" means Multiple Select Matrix Question where 2 lists are provided '
    + 'and a option from List 1 can be mapped to one or more options in List 2 (many-to-many relation).',
}

const leftOrRightCoordinateMeta = {
  title: 'Coordinate',
  description: 'The coordinate value either as an absolute value in points (e.g. "297") or as a percentage relative to page width (e.g. "50%").',
}

const topOrBottomCoordinateMeta = {
  title: 'Coordinate',
  description: 'The coordinate value either as an absolute value in points (e.g. "210") or as a percentage relative to page height (e.g. "50%").',
}

const isCaseSensitive = z.boolean().meta({
  title: 'Is case sensitive?',
  description: 'If true, the search will be case sensitive. If false, it will be case insensitive.',
})

const questionPatternTextSchema = z.strictObject({
  type: z.literal('text').meta(patternTypeMeta),

  prefix: z.string().meta({
    title: 'Question prefix',
    description: 'The text that appears before the question number.\n'
      + 'This is optional and can be used to differentiate between question numbers '
      + 'and other numbers in the document.\n\n'
      + 'For example, if question numbers are in the format "Q.1", "Q.2", etc., '
      + 'then the prefix is "Q.".',
  }),

  questionRange: z.string()
    .trim()
    .min(3)
    .regex(questionRangeRegex)
    .meta({
      title: 'Question range',
      description: 'The format of the question number or range of question numbers.\n\n'
        + 'For example, "1-10" means question numbers from 1 to 10, '
        + '"1" means only question number 1, and "1,3,5-7" means question numbers 1, 3, and 5 to 7 (i.e. 1, 3, 5, 6, 7).',
    }),

  suffix: z.string().meta({
    title: 'Question suffix',
    description: 'The text that appears after the question number.\n'
      + 'This is optional and can be used to differentiate between question numbers '
      + 'and other numbers in the document.\n\n'
      + 'For example, if question numbers are in the format "1.", "2.", etc., '
      + 'then the suffix is ".".',
  }),

  isLeadingZeroesOptional: z.boolean().meta({
    title: 'Is leading zeroes optional?',
    description: 'If true, the search will match question numbers with or without leading zeroes.\n\n'
      + 'For example, if this is true then it will match "1", "01", "2", "02", ..., "10".',
  }),

  isCaseSensitive,
})

const regexPatternSchema = z.strictObject({
  type: z.literal('regex').meta(patternTypeMeta),
  value: z.string().trim().meta(patternValueMeta),
  isCaseSensitive,
})

const regexOrTextPatternSchema = z.strictObject({
  type: z.enum(['text', 'regex']).meta(patternTypeMeta),
  value: z.string().trim().meta(patternValueMeta),
  isCaseSensitive,
})

const natQuestionTypeSchema = z.strictObject({
  type: z.literal('nat').meta(questionTypeMeta),
  marks: z.strictObject({
    cm: z.number().nonnegative(),
    im: z.number().nonpositive(),
  }),
})

const mcqQuestionTypeSchema = z.strictObject({
  type: z.literal('mcq').meta(questionTypeMeta),

  answerOptions: z.string().trim().meta({
    title: 'Answer options',
    description: 'The number of answer options for the question.\n\n'
      + 'For example, "4" means there are 4 answer options for the question.',
  }),

  answerOptionsCounterType: z.strictObject({
    primary: z.enum(ANSWER_OPTIONS_COUNTERS).optional(),
    secondary: z.enum(ANSWER_OPTIONS_COUNTERS).optional(),
  })
    .optional()
    .meta({
      title: 'Answer options counter type',
      description: 'The type of the counter used for answer options.\n'
        + 'For MCQ/MSQ questions, only primary counter type is applicable.\n\n'
        + 'For example, "upper-latin" means answer options are labeled as A, B, C, D, etc.',
    }),

  marks: z.strictObject({
    cm: z.number().nonnegative().meta({
      title: 'Correct marks',
      description: 'The marks allocated when answer is correct.',
    }),
    im: z.number().nonpositive().meta({
      title: 'Incorrect marks',
      description: 'The marks allocated when answer is incorrect.',
    }),
  })
    .meta({
      title: 'Marks per question',
      description: 'The marks allocated for each question.',
    }),
})

const msmQuestionTypeSchema = z.strictObject({
  type: z.literal('msm').meta(questionTypeMeta),

  answerOptions: z.string().trim().meta({
    title: 'Answer options',
    description: 'For MSM questions, the format should be "rowxcolumn", '
      + 'where row is the number of options in List 1 and column is the number of options in List 2.\n\n'
      + 'For example, "4x5" means there are 4 options in List 1 and 5 options in List 2.',
  }),

  answerOptionsCounterType: z.strictObject({
    primary: z.enum(ANSWER_OPTIONS_COUNTERS).optional(),
    secondary: z.enum(ANSWER_OPTIONS_COUNTERS).optional(),
  }).optional(),

  marks: z.strictObject({
    cm: z.number().nonnegative().meta({
      title: 'Correct marks',
      description: 'The marks allocated per row when answer is correct (max marks per question / number of rows).',
    }),
    im: z.number().nonpositive().meta({
      title: 'Incorrect marks',
      description: 'The marks allocated when answer is incorrect.',
    }),
  })
    .meta({
      title: 'Marks per question',
      description: 'The marks allocated for each question.',
    }),
})

const msqQuestionTypeSchema = z.strictObject({
  type: z.literal('msq').meta(questionTypeMeta),

  answerOptions: z.string().trim().meta({
    title: 'Answer options',
    description: 'The number of answer options for the question.\n\n'
      + 'For example, "4" means there are 4 answer options for the question.',
  }),

  answerOptionsCounterType: z.strictObject({
    primary: z.enum(ANSWER_OPTIONS_COUNTERS).optional(),
    secondary: z.enum(ANSWER_OPTIONS_COUNTERS).optional(),
  })
    .optional()
    .meta({
      title: 'Answer options counter type',
      description: 'The type of the counter used for answer options.\n'
        + 'For MCQ/MSQ questions, only primary counter type is applicable.\n\n'
        + 'For example, "upper-latin" means answer options are labeled as A, B, C, D, etc.',
    }),

  marks: z.strictObject({
    cm: z.number().nonnegative().meta({
      title: 'Correct marks',
      description: 'The marks allocated when answer is correct.',
    }),
    im: z.number().nonpositive().meta({
      title: 'Incorrect marks',
      description: 'The marks allocated when answer is incorrect.',
    }),
    pm: z.number().nonnegative().meta({
      title: 'Partially correct marks',
      description: 'The marks allocated when answers are partially correct.\n'
        + 'Applicable only for MSQ questions and when user answers is a subset of correct answers.\n\n'
        + 'For example, "1" is used by JEE Advanced for awarding 1 mark '
        + 'for each partially correct option selected (when user answers is a subset of correct answers).',
    }),
  })
    .meta({
      title: 'Marks per question',
      description: 'The marks allocated for each question.',
    }),
})

export const questionDetailsSchema = z.discriminatedUnion('type', [
  mcqQuestionTypeSchema,
  msqQuestionTypeSchema,
  natQuestionTypeSchema,
  msmQuestionTypeSchema,
]).meta({
  title: 'Question details',
  description: 'The details of the question type and '
    + 'its related properties such as marks allocated and number of answer options.',
})

const AbsOrRelativeCoordinateSchema = z.string()
  .min(1, 'This is required')
  .trim()
  .refine(coord => !coord.trim() || absOrRelativeCoordinateRegex.test(coord), {
    message: 'Coordinate must be number or in percentage (i.e n%)\ne.g. "297" or "50%"',
  })

export const searchAreaSchema = z.strictObject({
  l: AbsOrRelativeCoordinateSchema.meta({
    ...leftOrRightCoordinateMeta,
    title: 'Left coordinate',
  }),
  r: AbsOrRelativeCoordinateSchema.meta({
    ...leftOrRightCoordinateMeta,
    title: 'Right coordinate',
  }),
  t: AbsOrRelativeCoordinateSchema.meta({
    ...topOrBottomCoordinateMeta,
    title: 'Top coordinate',
  }),
  b: AbsOrRelativeCoordinateSchema.meta({
    ...topOrBottomCoordinateMeta,
    title: 'Bottom coordinate',
  }),
})
  .superRefine((coords, ctx) => {
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
  .meta({
    title: 'Search area coordinates',
    description: 'The area within the PDF page to search in.\n'
      + 'Use l = 0, r = 100%, t = 0, and b = 100% to search in the whole page.\n',
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
  .meta({
    title: 'Pages to Consider',
    description: 'The format should be a comma-separated list of page numbers and/or page ranges.\n'
      + 'For counting from the end of the document, '
      + 'use L or L1 to indicate Last Page, L2 for second last page, and so on.\n\n'
      + 'For example:\n'
      + '"1-L" or "1-L1" means all pages will be considered.\n'
      + '"1, 3, 5-7" means pages 1, 3, 5, 6, and 7 will be considered.',
  })

const questionStartPatternSchema = z.discriminatedUnion('type', [
  regexPatternSchema,
  questionPatternTextSchema,
]).meta({
  title: 'Question start pattern',
  description: 'The pattern to identify the start of a question.\n'
    + 'This is required and can be either a text pattern or a regex pattern.\n'
    + 'Typically, question number is the question start pattern.',
})

const offSetBySchema = z.strictObject({
  l: z.number().optional(),
  r: z.number().optional(),
  t: z.number().optional(),
  b: z.number().optional(),
}).optional().meta({
  title: 'Crop Coordinates to Offset By',
  description: 'The number of points to offset the crop coordinates by for each side.\n'
    + 'For Left and Right Coordinates, positive value means offsetting to the right and negative value means offsetting to the left relative to current position.\n'
    + 'For Top and Bottom Coordinates, positive value means offsetting downwards and negative value means offsetting upwards relative to current position.\n'
    + 'This is optional and can be used to fine-tune the crop area so that nothing important is cropped out and also to include/exclude thin elements that are close to the crop boundary.',
})

const columnSchema = z.strictObject({
  start: z.strictObject({
    pattern: questionStartPatternSchema,
    searchIn: searchAreaSchema,
  })
    .meta({
      title: 'Question Start for this column',
      description: 'The pattern to identify the start of a question for this column '
        + 'and the area to search for it in.',
    }),

  end: z.strictObject({
    pattern: regexOrTextPatternSchema,
    searchIn: searchAreaSchema,
  })
    .optional()
    .meta({
      title: 'Question End for this column (optional)',
      description: 'The pattern to identify the end of a question for this column '
        + 'and the area to search for it in.',
    }),

  crop: z.strictObject({
    within: z.strictObject({
      t: AbsOrRelativeCoordinateSchema,
      b: AbsOrRelativeCoordinateSchema,
    })
      .meta({
        title: 'Top/Bottom Coordinates to Crop within',
        description: 'This is to limit the crop areas to be within the specified top and bottom coordinates.\n'
          + 'Useful to exclude Headers and Footers.\n'
          + 'Use t = 0 and b = 100% to allow the whole height of the page for cropping.',
      }),

    exactlyTo: z.strictObject({
      l: z.string()
        .trim()
        .refine(coord => !coord.trim() || absOrRelativeCoordinateRegex.test(coord), {
          message: 'Coordinate must be number or in percentage (i.e n%)\ne.g. "297" or "50%"',
        })
        .nullish()
        .meta({
          title: 'Left coordinate to crop exactly to (optional)',
          description: 'This is to crop the question exactly to the specified left coordinate.\n'
            + 'If this is null or not specified, uses the leftmost boundary of the question start pattern\'s matched text as the left crop coordinate.',
        }),
      r: AbsOrRelativeCoordinateSchema.meta({
        title: 'Right coordinate to crop exactly to',
        description: 'This is to crop the question exactly to the specified right coordinate.\n'
          + 'This is required and is also important to limit the crop of the question area to its column only.\n'
          + 'For example for right coordinate, if there are two columns with column divided at 50%, then for column 1 this is around 50% and for column 2 this is around 100%.',
      }),
    }).meta({
      title: 'Left/Right Coordinates to Crop exactly to',
      description: 'This is to crop the question exactly to the specified left and right coordinates.\n'
        + 'If Left Coordinate is null, uses the leftmost boundary of the question start pattern\'s matched text as the left crop coordinate.\n'
        + 'For Right Coordinate, this is required and is also important to set the crop of the question area to limit it to its column only.\n'
        + 'For example for right coordinate if there are two columns with column divided at 50%, then for column 1 this is around 50% and for column 2 this is around 100%.',
    }),

    offsetBy: offSetBySchema,
  }),

})

export const patternModeFormQuestionsSchema = z.strictObject({
  pages: pagesSchema,

  details: questionDetailsSchema,

  forBottomCoordinateUseBottom: z.array(z.enum(PATTERN_MODE.pdfElems)).optional()
    .meta({
      title: 'For Bottom Coordinate Use bottom coordinates of given elements',
      description: 'Initially bottom coordinate of the crop area is determined by the topmost boundary of next question start pattern\'s matched text.\n'
        + 'These elements can be used to look up the bottom coordinate instead of using the next question.\n'
        + 'This option will use the bottom coordinate of the bottommost given element(s).\n'
        + 'Generally useful to specify all elements provided.',
    }),

  forTopCoordinateLookUp: z.strictObject({
    by: z.number().positive()
      .meta({
        title: 'The value to look up by',
        description: 'Say if y is the given value and Y is the initial coordinate.\n'
          + 'A area is formed between "Y" and "Y - y" and '
          + 'the elements that intersect with this area are looked up.\n'
          + 'If elements are found, uses the top coordinate of the topmost element '
          + 'as top coordinate for the question area.',
      }),

    chainBy: z.number().nonnegative().optional()
      .meta({
        title: 'The value to Chain the look up by (optional)',
        description: 'Once an element is found by the look up, '
          + 'more look ups can be chained by the given value.\n'
          + 'Will continue chaining the look up until specified elements are not found.',
      }),

    for: z.array(z.enum(PATTERN_MODE.pdfElems))
      .min(1, { message: 'At least one option is required' })
      .max(3, { message: 'No more than three values allowed' })
      .refine(arr => new Set(arr).size === arr.length, {
        message: 'Duplicate entries are not allowed',
      })
      .meta({
        title: 'The Elements to look up for',
        description: 'The elements to look up for to use as the top coordinate of the question area.\n',
      }),
  })
    .optional()
    .meta({
      title: 'For Top Coordinate Look Up for given elements by a given coordinate and chain by',
      description: 'This will look up for the top coordinate of the selected elements.\n'
        + 'Useful when the question start pattern is not very reliable for determining the top coordinate of the question area.\n'
        + 'For example when there are diagrams, math expressions that are above the question start pattern.\n'
        + 'Use with caution for document having watermarks or other decorations as these might be falsely detected as elements and affect the top coordinate detection.',
    }),

  obtainedQuestionNum: z.strictObject({
    whenDuplicate: z.enum(PATTERN_MODE.obtainedQNum)
      .meta({
        title: 'When duplicate question numbers are obtained',
        description: 'When there are duplicate question numbers obtained, this determines which one to use.\n'
          + '"replace" means use the new obtained question and replace the previous one.\n'
          + '"merge" means merge the new obtained question with the previous one.\n'
          + '"ignore" means ignore the new obtained question number.',
      }),

    nextQNumMustBeOneNumGreater: z.boolean()
      .meta({
        title: 'Next question number must be one number greater than previous question number?',
        description: 'When true, if the newly obtained question number is '
          + 'not exactly one number greater than the previous question number, then it will be ignored.\n'
          + 'This is useful when question numbers are expected to be in a sequence and '
          + 'this can be used to filter out falsely matched question numbers.',
      }),
  }),

  mergeQuestions: z.strictObject({
    splitBy: z.array(z.enum(PATTERN_MODE.splitBy))
      .meta({
        title: 'Merge questions split by',
        description: '"pages" means merge questions as they are split by pages.\n'
          + '"columns" means merge questions as they are split by columns.\n',
      }),
    mergeOnlyIfContainsAny: z.array(z.enum(PATTERN_MODE.pdfElems))
      .meta({
        title: 'Merge only if question contains any of the following elements',
        description: 'When merging questions split by pages or columns, '
          + 'only merge questions that contain any of the specified elements.\n'
          + 'This is useful to avoid merging regions that are empty.\n'
          + 'Use with caution for document having watermarks or other decorations '
          + 'as these might be falsely detected as elements and affect the merging of questions.',
      }),
  })
    .optional()
    .meta({
      title: 'Merge questions as they are split by pages or columns',
      description: 'Use this when questions are split into multiple parts across pages or columns.',
    }),

  paragraphQuestions: z.strictObject({
    start: z.strictObject({
      pattern: regexOrTextPatternSchema,
      searchIn: searchAreaSchema,
    })
      .meta({
        title: 'Start Pattern and Area to search in for Common part of question paragraph/table',
        description: 'The pattern to identify the start of common part of paragraph/table question '
          + 'and the area to search for it in.',
      }),
    end: z.strictObject({
      pattern: regexOrTextPatternSchema,
      searchIn: searchAreaSchema,
    }).optional()
      .meta({
        title: 'End Pattern and Area to search in for Common part of question paragraph/table (optional)',
        description: 'The pattern to identify the end of common part of paragraph/table question '
          + 'and the area to search for it in.\n'
          + 'If not specified, the common part is considered to have ended when question start is found.',
      }),
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
  })
    .optional()
    .meta({
      title: 'Paragraph/Table questions',
      description: 'This is to identify questions that have a common paragraph/table.\n',
    }),

  columns: z.array(columnSchema).nonempty()
    .meta({
      title: 'Columns',
      description: 'The number of columns must be one greater than '
        + 'number of column dividers speficied in the subject.',
    }),
})

const patternAndSearchInForSubjectAndSectionSchema = z.strictObject({
  pattern: regexOrTextPatternSchema,
  searchIn: z.strictObject({
    pages: pagesSchema,
    area: searchAreaSchema,
  }),
})

const sectionInstructions = z.strictObject({
  type: z.enum(Object.values(SECTION_INSTRUCTION_TYPES)),
})
  .optional()
  .meta({
    title: 'Section Instructions',
    description: 'The instructions for the section.\n'
      + 'This is optional and can be used to provide instructions for the section.',
  })

const sectionSchema = patternAndSearchInForSubjectAndSectionSchema.extend({
  instructions: sectionInstructions,
  numOfOptionalQuestions: z.number().nonnegative().optional()
    .meta({
      title: 'Number of optional questions in the section (optional)',
      description: 'The number of optional questions in the section.\n',
    }),
  questions: patternModeFormQuestionsSchema,
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
  .meta({
    title: 'Column dividers',
    description: 'The coordinates of the column dividers, each separated by commas.\n'
      + 'Each coordinate must be a number or in percentage (i.e n%) relative to page width.\n'
      + 'Number of columns will be number of dividers + 1.\n\n'
      + 'For examples:\n'
      + '"297" means there is one column divider at 297 points from the left of the page, dividing the page into 2 columns.\n'
      + '"50%" means there is one column divider at 50% of the page width from the left of the page, dividing the page into 2 columns.\n'
      + '"33%, 66%" means there are two column dividers, one at 33% and another at 66% of the page width from the left of the page, dividing the page into 3 columns.',
  })

export const subjectWithSectionsSchema = z.strictObject({
  start: patternAndSearchInForSubjectAndSectionSchema
    .meta({
      title: 'Start Pattern and Area to search in for Subject',
      description: 'The pattern to identify the start of the subject and the area to search for it in.',
    }),

  end: patternAndSearchInForSubjectAndSectionSchema.optional()
    .meta({
      title: 'End Pattern and Area to search in for Subject (optional)',
      description: 'The pattern to identify the end of the subject and the area to search for it in.\n'
        + 'If not specified, the subject is considered to have ended when next subject start pattern is found.',
    }),

  columnDividers: columnDividersSchema,
  sections: z.record(z.string().min(1), sectionSchema),
})

export const subjectWithoutSectionsSchema = z.strictObject({
  start: patternAndSearchInForSubjectAndSectionSchema
    .meta({
      title: 'Start Pattern and Area to search in for Subject',
      description: 'The pattern to identify the start of the subject and the area to search for it in.',
    }),

  end: patternAndSearchInForSubjectAndSectionSchema.optional()
    .meta({
      title: 'End Pattern and Area to search in for Subject (optional)',
      description: 'The pattern to identify the end of the subject and the area to search for it in.\n'
        + 'If not specified, the subject is considered to have ended when next subject start pattern is found.',
    }),
  columnDividers: columnDividersSchema,
  instructions: sectionInstructions,
  questions: patternModeFormQuestionsSchema,
})

const subjectSchema = z.union([
  subjectWithSectionsSchema,
  subjectWithoutSectionsSchema,
])

const settingsSchema = z.strictObject({
  yCoordinateGroupingRangeForLine: z.number().nonnegative()
    .meta({
      title: 'Y Coordinate Grouping Range for Line',
      description: 'The range in points to group text elements into lines based on their Y coordinates.\n'
        + 'Text elements that have Y coordinates within this range will be grouped into the same line.\n'
        + 'Use 8 if unsure, the right value is experimental and varies between PDFs.',
    }),
  ignoreElementsGoingOutsidePage: z.boolean()
    .meta({
      title: 'Ignore Elements that are Going Outside the Page?',
      description: 'When true, elements that are going outside the page boundaries will be ignored.\n'
        + 'This is useful to avoid including elements that are going outside the page '
        + 'which typically are not question related elements.',
    }),
  calculateCharacterBoundariesPrecisely: z.boolean().optional()
    .meta({
      title: 'Calculate Character Boundaries (bbox) Precisely?',
      description: 'When true, the boundaries (bbox) of each character will be calculated '
        + 'based on how it visually appears.\n'
        + 'Interally, this uses mupdfjs\'s "accurate-bbox" of StructuredText.\n'
        + 'When false, the boundaries that are reported by the font spec will be used.',
    }),
  linesToIgnore: z.array(regexOrTextPatternSchema).optional()
    .meta({
      title: 'Lines to ignore',
      description: 'The lines that should be ignored when the given pattern is detected.\n'
        + 'Useful to ignore lines that are not important and '
        + 'might be falsely detected as part of the question area.\n\n'
        + 'For example, if there are headers, footers, watermarks, etc '
        + 'in the document and they are getting in the way of the question area, '
        + 'these can be ignored by providing patterns to detect them.',
    }),
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
