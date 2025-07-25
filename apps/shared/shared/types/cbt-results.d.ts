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

export type StatsMetaData = { name: string, type: 'test' | 'subject' }
  | { name: string, type: 'section', subject: string }

export type StatusStatsWithName = StatusStats & StatsMetaData

export type ResultStats = {
  correct: StatsItem
  incorrect: StatsItem
  partial: StatsItem
  notAnswered: StatsItem
  bonus: StatsItem
  dropped: StatsItem
  notConsidered: StatsItem
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
    imgPanelDir: 'left' | 'right'
  }
}

export type ValidQuestionResultStatus = 'correct' | 'incorrect' | 'partial' | 'dropped' | 'bonus' | 'notAnswered'

export type QuestionResult = {
  marks: number
  status: ValidQuestionResultStatus | 'notConsidered'
  correctAnswer: QuestionAnswer
  accuracyNumerator: number
}

export type TestResultQuestionData = TestInterfaceQuestionData & {
  subject: string
  section: string
  oriQueId: number
  result: QuestionResult
}

export type TestResultSectionData = {
  [question: number | string]: TestResultQuestionData
}

export type TestResultSubjectData = {
  [section: string]: TestResultSectionData
}

export type TestResultData = {
  [subject: string]: TestResultSubjectData
}

export type TestResultOverview = {
  testName: string
  testStartTime: number // of Date.now()
  testEndTime: number // of Date.now()
  overview: {
    marksObtained?: number
    maxMarks?: number
    accuracy?: number // in %
    timeSpent?: number // seconds
    testDuration?: number // seconds
    questionsAttempted?: number
    totalQuestions?: number
  }
}

export type TestResultOverviewDB = TestResultOverview & {
  id: number // this will be the id of testOutputData as a binding link between both
}

export type TestResultOverviewsDBSortByOption = 'addedAscending'
  | 'addedDescending'
  | 'startTimeAscending'
  | 'startTimeDescending'
  | 'endTimeAscending'
  | 'endTimeDescending'

export type TestNotes = {
  [queId: string | number]: string
}

export type ScoreCardData = Required<Omit<TestResultOverview['overview'], 'accuracy' | 'testDuration'>> & {
  title: string
  marks: {
    correct: number
    partial: number
    incorrect: number
    bonus: number
    dropped: number
  }
  accuracy: {
    count: number
    denominator: number
  }
  testDuration?: number
}
