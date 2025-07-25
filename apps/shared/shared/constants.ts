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

export const ANSWER_OPTIONS_COUNTER_TYPES = [
  { name: 'A, B, C, D...', value: 'upper-latin' },
  { name: 'a, b, c, d...', value: 'lower-latin' },
  { name: 'P, Q, R, S...', value: 'upper-pqrs' },
  { name: 'p, q, r, s...', value: 'lower-pqrs' },
  { name: '1, 2, 3, 4...', value: 'decimal' },
  { name: 'I, II, III, IV...', value: 'upper-roman' },
  { name: 'i, ii, iii, iv...', value: 'lower-roman' },
]

export const SUBJECTS = [
  'Physics', 'Chemistry', 'Mathematics',
  'Biology', 'English', 'Logical Reasoning', 'English & LR',
]

const counterTypesWithDefault = structuredClone(ANSWER_OPTIONS_COUNTER_TYPES)
counterTypesWithDefault.unshift({ name: 'Default', value: 'default' })

export const ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT = counterTypesWithDefault

export const RESULTS_QUESTION_PANEL_DRAWER_MIN_SIZE = 80
