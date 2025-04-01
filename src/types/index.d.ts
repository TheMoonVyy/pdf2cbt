export type QuestionStatus = 'answered' | 'notAnswered' | 'notVisited' | 'marked' | 'markedAnswered'

export type QuesIcons = {
  [key in QuestionStatus]: {
    image: string
    textColor: string
    iconSize: number
    numberTextFontSize: number
    summaryIconSize: number
    summaryNumberTextFontSize: number
    summaryLabelFontSize: number
  }
}

export interface CbtUiSettings {
  mainLayout: {
    size: number
    testTotalHeaderHeight: number
    sectionHeaderHeight: number
    sectionHeaderScrollPadding: number
    sectionHeaderAndQuesPanelDividerHeight: number
    showQuestionType: boolean
    showMarkingScheme: boolean
  }

  themes: {
    base: {
      textColor: string
      bgColor: string
    }
    primary: {
      textColor: string
      bgColor: string
    }
    secondary: {
      textColor: string
      bgColor: string
    }
  }

  questionPanel: {
    answerOptionsFormat: {
      prefix: string
      suffix: string
      counterType: string
      fontSize: number
      zoomSize: number
      rowGap: number
    }
    questionImgMaxWidth: {
      maxWidthWhenQuestionPaletteOpened: number
      maxWidthWhenQuestionPaletteClosed: number
    }
  }

  questionPalette: {
    width: number
    sectionTextFontSize: number
    columnsGap: number
    rowsGap: number
    quesIcons: QuesIcons
  }
}

export type QuestionType = 'mcq' | 'msq' | 'nat'

export interface CurrentQuestionData {
  subjectName: string
  sectionName: string
  questionType: QuestionType
  totalOptions: number
  questionNum: number
  correctMarks: number
  partialMarks: number
  incorrectMarks: number
}

export type TestSectionKey = string | number

export interface CropperQuestionData {
  que: number
  type: QuestionType
  options?: number
  marks: {
    cm: number
    pm?: number
    im: number
  }
  pdfData: {
    page: number
    x1: number
    y1: number
    x2: number
    y2: number
  }[]
}

export type CropperSectionsData = {
  [section: TestSectionKey]: {
    [question: string | number]: CropperQuestionData
  }
}

export type CropperOutputData = {
  [subject: number | string]: CropperSectionsData
}

export type QuestionAnswer = number | number[] | string | null

export type TestQuestionData = Pick<CropperQuestionData, 'que' | 'type'> & {
  secQueId: number
  queId: number
  section: TestSectionKey
  status: QuestionStatus
  answer: QuestionAnswer
  timeSpent: number
  totalOptions?: number
}

export interface TestLog {
  id: number
  timestamp: number
  testTime: number
  type: TesLogType
  current: {
    queId: number
    section: TestSectionKey
    question: number
    answer: QuestionAnswer
    status: QuestionStatus
    timeSpent: number
  }
  actionDetails?: Record<string, unknown>
}

export type TestSectionData = {
  [question: string | number]: TestQuestionData
}

export type TestSectionsData = {
  [section: TestSectionKey]: TestSectionData
}

export type TestSectionListItem = {
  name: TestSectionKey
  subject: keyof CropperOutputData
}

export type TestSectionSummary = {
  [key in QuestionStatus]: number
}

export type TestSectionsSummary = Map<TestSectionKey, ComputedRef<TestSectionSummary>>

export type TestSummaryDataTableRow = TestSectionSummary & {
  section: TestSectionKey
  totalQuestions: number
}

export interface CurrentTestState {
  section: TestSectionKey
  question: number
  queId: number
  testName: string
  remainingSeconds: number | null
  testDuration: number
  currentQuestionStartTime: number
  testStatus: 'notStarted' | 'ongoing' | 'finished'
  currentAnswerBuffer: QuestionAnswer
  saveTestData: boolean | null
  questionsNumberingOrderType: 'original' | 'cumulative' | 'section-wise'
  sectionsPrevQuestion: {
    [section: TestSectionKey]: number
  }
}

export type TestSectionsImgUrls = {
  [section: TestSectionKey]: {
    [question: number | string]: string[]
  }
}

export interface TestOutputData {
  testConfig: {
    testName: string
    testDurationInSeconds: number
  }
  testData: {
    [subject: string]: {
      [section: TestSectionKey]: {
        [question: number | string]: {
          queId: number
          secQueId: number
          type: QuestionType
          status: QuestionStatus
          answer: QuestionAnswer
          timeSpent: number
          totalOptions?: number
          marks: {
            cm: number
            pm?: number
            im: number
          }
        }
      }
    }
  }
  testSummary: TestSummaryDataTableRow[]
  testLogs: TestLog[]
}

export interface TestState {
  pdfFile: null | Uint8Array
  isSectionsDataLoaded: boolean
  totalQuestions: number
  totalSections: number
  preparingTestCurrentQuestion: number
  currentProcess: 'initial' | 'preparing-data' | 'preparing-imgs' | 'test-is-ready' | 'test-started'
  continueLastTest: boolean | null
}

export interface CbtTestSettings {
  testName: string
  timeFormat: 'mmm:ss' | 'hh:mm:ss'
  durationInSeconds: number
  submitBtn: 'enabled' | 'disabled' | 'hidden'
  questionImgScale: number
  saveTestData: boolean
}

export interface MiscSettings {
  username: string
  fontSize: number
  profileImg: string
  imgWidth: number
  imgHeight: number
}
