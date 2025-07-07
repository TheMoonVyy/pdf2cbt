import type { FONT_SIZES } from '#layers/shared/shared/constants'

export type StatsItem = {
  count: number
  avgTime: number
  totalTime: number
}

export type StatusStats = {
  answered: StatsItem
  notAnswered: StatsItem
  marked: StatsItem
  markedAnswered: StatsItem
  notVisited: StatsItem
  total: StatsItem
}

export type StatsMetaData =
  | { name: string, type: 'test' | 'subject' }
  | { name: string, type: 'section', subject: string }

export type StatusStatsWithName = StatusStats & StatsMetaData

export type ResultStats = {
  correct: StatsItem
  incorrect: StatsItem
  partial: StatsItem
  notAnswered: StatsItem
  bonus: StatsItem
  dropped: StatsItem
  total: StatsItem & { accuracy: string }
}

export type ResultStatsWithName = ResultStats & StatsMetaData

export type MarksStatsItem = {
  marks: number
  avgTime: number
  totalTime: number
}

export type MarksStats = {
  positive: MarksStatsItem
  negative: MarksStatsItem
  bonus: MarksStatsItem
  dropped: MarksStatsItem
  total: MarksStatsItem & { maxMarks: number }
}

export type MarksStatsWithName = MarksStats & StatsMetaData

export type AccuracyStats = {
  count: number
  total: number
  percent: number
}

export type Stats = {
  status: StatusStats
  result: ResultStats
  marks: MarksStats
  accuracy: AccuracyStats
}

export type TestStats = {
  [subject: string]: {
    [section: string]: Stats
  }
}

export type SubjectsOverallStats = {
  [subject: string]: Stats
}

export type TableNames = 'questions' | 'statusStats' | 'resultStats' | 'marksStats'

export type CbtResultsSettings = {
  tableFontSizes: {
    [k in TableNames]: {
      header: keyof (typeof FONT_SIZES)
      body: keyof (typeof FONT_SIZES)
    }
  }
  quePreview: {
    imgBgColor: string
    drawerWidth: number
  }
}
