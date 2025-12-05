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
  'pdf-cropper': 'pdfCropper',
  'cbt-interface': 'testInterface',
  'cbt-results': 'testResults',
  'cbt-generate-answer-key': 'generateAnswerKey',
} as const
