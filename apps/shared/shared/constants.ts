export const OVERALL = ' Overall'
export const TEST_OVERALL = 'Test Overall'

export const QUESTION_STATUS_LIST = ['answered', 'markedAnswered', 'notAnswered', 'marked', 'notVisited'] as const
export const RESULT_STATUS_LIST = ['correct', 'partial', 'incorrect', 'notAnswered', 'bonus', 'dropped'] as const
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
