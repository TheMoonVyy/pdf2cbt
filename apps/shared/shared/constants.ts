export const OVERALL = ' Overall'
export const TEST_OVERALL = 'Test Overall'

export const QUESTION_STATUS_LIST = ['answered', 'markedAnswered', 'notAnswered', 'marked', 'notVisited'] as const
export const RESULT_STATUS_LIST = ['correct', 'partial', 'incorrect', 'notAnswered', 'bonus', 'dropped', 'notConsidered'] as const
export const QUESTION_TYPES_LIST = ['mcq', 'msq', 'nat', 'msm'] as const

export const QUESTION_STATUS_LABELS = {
  answered: 'Answered',
  markedAnswered: 'MFR & Answered',
  notAnswered: 'Not Answered',
  marked: 'Marked for Review',
  notVisited: 'Not Visited',
}

export const QUESTION_STATUS_FULL_LABELS = {
  answered: 'Answered',
  markedAnswered: 'Answered & Marked for Review',
  notAnswered: 'Not Answered',
  marked: 'Marked for Review',
  notVisited: 'Not Visited',
}

export const RESULT_STATUS_LABELS = {
  correct: 'Correct',
  incorrect: 'Incorrect',
  partial: 'Partially Correct',
  notAnswered: 'Not Answered',
  bonus: 'Bonus',
  dropped: 'Dropped',
  notConsidered: 'Not Considered',
}

export const QUESTION_TYPES_LABELS = {
  mcq: 'MCQ',
  msq: 'MSQ',
  nat: 'NAT',
  msm: 'MSM',
}

export const QUESTION_TYPES_IN_WORDS = {
  mcq: 'Multiple Choice Question',
  msq: 'Multiple Select Question',
  nat: 'Numerial Answer Type',
  msm: 'Multiple Select Matrix',
} as const

export const MARKS_STATUS_LIST = ['positive', 'negative', 'bonus', 'dropped'] as const

export const FONT_SIZES = {
  small: 0.875,
  medium: 1,
  large: 1.125,
} as const

export const SEPARATOR = '__--__'

export const QUESTION_TYPES_OPTIONS = [
  { name: 'MCQ (Multiple Choice Question)', value: 'mcq' },
  { name: 'MSQ (Multiple Select Question)', value: 'msq' },
  { name: 'NAT (Numerial Answer Type)', value: 'nat' },
  { name: 'MSM (Multiple Select Matrix)', value: 'msm' },
]

export const ANSWER_OPTIONS_COUNTERS = [
  'upper-latin',
  'lower-latin',
  'upper-pqrs',
  'lower-pqrs',
  'decimal',
  'upper-roman',
  'lower-roman',
] as const

export type AnswerOptionsCounterTypes = typeof ANSWER_OPTIONS_COUNTERS[number]

export const ANSWER_OPTIONS_COUNTER_VALUES: Record<AnswerOptionsCounterTypes, string[]> = {
  'upper-latin': [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z',
  ],

  'lower-latin': [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z',
  ],

  'upper-pqrs': [
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  ],

  'lower-pqrs': [
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  ],

  'decimal': [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  ],

  'upper-roman': [
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
  ],

  'lower-roman': [
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
    'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx',
  ],
} as const

export const ANSWER_OPTIONS_COUNTER_TYPES = [
  { name: 'A, B, C, D...', value: ANSWER_OPTIONS_COUNTERS[0] },
  { name: 'a, b, c, d...', value: ANSWER_OPTIONS_COUNTERS[1] },
  { name: 'P, Q, R, S...', value: ANSWER_OPTIONS_COUNTERS[2] },
  { name: 'p, q, r, s...', value: ANSWER_OPTIONS_COUNTERS[3] },
  { name: '1, 2, 3, 4...', value: ANSWER_OPTIONS_COUNTERS[4] },
  { name: 'I, II, III, IV...', value: ANSWER_OPTIONS_COUNTERS[5] },
  { name: 'i, ii, iii, iv...', value: ANSWER_OPTIONS_COUNTERS[6] },
] as { name: string, value: string }[]

export const SUBJECTS = [
  'Physics', 'Chemistry', 'Mathematics',
  'Biology', 'English', 'Logical Reasoning', 'English & LR',
]

const counterTypesWithDefault = structuredClone(ANSWER_OPTIONS_COUNTER_TYPES)
counterTypesWithDefault.unshift({ name: 'Default', value: 'default' })

export const ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT = counterTypesWithDefault

export const RESULTS_QUESTION_PANEL_DRAWER_MIN_SIZE = 80

export const QUESTIONS_NUMBERING_ORDER_OPTIONS = [
  { name: 'Original', value: 'original' },
  { name: 'Cumulative', value: 'cumulative' },
  { name: 'Section-wise', value: 'section-wise' },
]

export const PATTERN_MODE = {
  pdfElems: ['text', 'image', 'vector'],
  obtainedQNum: ['replace', 'merge', 'ignore'],
  splitBy: ['pages', 'columns'],
} as const

export const AREA_BOUNDARY_NAMES = {
  l: 'Left',
  r: 'Right',
  t: 'Top',
  b: 'Bottom',
} as const

export const PAGE_NAMES_MAP = {
  'index': 'homePage',
  'test-maker': 'testMaker',
  'cbt-interface': 'testInterface',
  'cbt-results': 'testResults',
  'cbt-generate-answer-key': 'generateAnswerKey',
} as const

export const MAIN_NAV_BAR_HEIGHT = {
  cssVar: '--main-nav-bar-height',
  val: '3.5rem',
} as const

export const MIME_TYPE = {
  pdf: 'application/pdf',
  json: 'application/json',
  zip: 'application/zip',
} as const

export const CROPPED_OVERLAY_RESIZE_DIRECTIONS = [
  'top-left', 'top', 'top-right',
  'right', 'bottom-right', 'bottom',
  'bottom-left', 'left',
] as const

export type CroppedOverlayResizeDirection = (typeof CROPPED_OVERLAY_RESIZE_DIRECTIONS)[number]

export const SECTION_INSTRUCTION_TYPES = {
  NONE: 'none',

  // common
  GEN: 'general',
  MATCH: 'matching-lists',
  PARA: 'paragraph',
  TABLE: 'table',

  // numeric
  NUM_GEN: 'numeric/general',
  NUM_POS: 'numeric/positive',
  NUM_NONNEG: 'numeric/non-negative',

  NUM_PARA_GEN: 'numeric/paragraph/general',
  NUM_PARA_POS: 'numeric/paragraph/positive',
  NUM_PARA_NONNEG: 'numeric/paragraph/non-negative',

  // integer
  INT_GEN: 'integer/general',
  INT_POS: 'integer/positive',
  INT_NONNEG: 'integer/non-negative',
  INT_SD: 'integer/single-digit',

  INT_PARA_GEN: 'integer/paragraph/general',
  INT_PARA_POS: 'integer/paragraph/positive',
  INT_PARA_NONNEG: 'integer/paragraph/non-negative',
  INT_PARA_SD: 'integer/paragraph/single-digit',
} as const

export const SECTION_INSTRUCTIONS_MENU_MAP = {
  mcq: [
    {
      name: 'None',
      value: SECTION_INSTRUCTION_TYPES.NONE,
    },
    {
      name: 'General',
      value: SECTION_INSTRUCTION_TYPES.GEN,
    },
    {
      name: 'Matching Lists',
      value: SECTION_INSTRUCTION_TYPES.MATCH,
    },
    {
      name: 'Paragraph',
      value: SECTION_INSTRUCTION_TYPES.PARA,
    },
    {
      name: 'Table',
      value: SECTION_INSTRUCTION_TYPES.TABLE,
    },
  ],

  msq: [
    {
      name: 'None',
      value: SECTION_INSTRUCTION_TYPES.NONE,
    },
    {
      name: 'General',
      value: SECTION_INSTRUCTION_TYPES.GEN,
    },
    {
      name: 'Matching Lists',
      value: SECTION_INSTRUCTION_TYPES.MATCH,
    },
    {
      name: 'Paragraph',
      value: SECTION_INSTRUCTION_TYPES.PARA,
    },
    {
      name: 'Table',
      value: SECTION_INSTRUCTION_TYPES.TABLE,
    },
  ],

  msm: [
    {
      name: 'None',
      value: SECTION_INSTRUCTION_TYPES.NONE,
    },
    {
      name: 'General',
      value: SECTION_INSTRUCTION_TYPES.GEN,
    },
  ],

  nat: [
    {
      name: 'None',
      value: SECTION_INSTRUCTION_TYPES.NONE,
    },
    {
      name: 'Numeric',
      groupItems: [
        {
          name: 'General',
          value: SECTION_INSTRUCTION_TYPES.NUM_GEN,
        },
        {
          name: 'Positive',
          value: SECTION_INSTRUCTION_TYPES.NUM_POS,
        },
        {
          name: 'Non-Negative',
          value: SECTION_INSTRUCTION_TYPES.NUM_NONNEG,
        },
        {
          name: 'Paragraph',
          groupItems: [
            {
              name: 'General',
              value: SECTION_INSTRUCTION_TYPES.NUM_PARA_GEN,
            },
            {
              name: 'Positive',
              value: SECTION_INSTRUCTION_TYPES.NUM_PARA_POS,
            },
            {
              name: 'Non-Negative',
              value: SECTION_INSTRUCTION_TYPES.NUM_PARA_NONNEG,
            },
          ],
        },
      ],
    },
    {
      name: 'Integer',
      groupItems: [
        {
          name: 'General',
          value: SECTION_INSTRUCTION_TYPES.INT_GEN,
        },
        {
          name: 'Positive',
          value: SECTION_INSTRUCTION_TYPES.INT_POS,
        },
        {
          name: 'Non-Negative',
          value: SECTION_INSTRUCTION_TYPES.INT_NONNEG,
        },
        {
          name: 'Single Digit',
          value: SECTION_INSTRUCTION_TYPES.INT_SD,
        },
        {
          name: 'Paragraph',
          groupItems: [
            {
              name: 'General',
              value: SECTION_INSTRUCTION_TYPES.INT_PARA_GEN,
            },
            {
              name: 'Positive',
              value: SECTION_INSTRUCTION_TYPES.INT_PARA_POS,
            },
            {
              name: 'Non-Negative',
              value: SECTION_INSTRUCTION_TYPES.INT_PARA_NONNEG,
            },
            {
              name: 'Single Digit',
              value: SECTION_INSTRUCTION_TYPES.INT_PARA_SD,
            },
          ],
        },
      ],
    },
  ],
} as const

type InstTypesMap = typeof SECTION_INSTRUCTION_TYPES

export type SectionInstructionTypes = InstTypesMap[keyof InstTypesMap]
