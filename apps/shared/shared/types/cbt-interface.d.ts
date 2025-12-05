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

export type CbtUiSettings = {
  mainLayout: {
    testTotalHeaderHeight: number
    sectionHeaderHeight: number
    sectionHeaderAndQuesPanelDividerHeight: number
    showQuestionType: boolean
    showMarkingScheme: boolean
    showQuestionPaperBtn: boolean
    disableMouseWheel: boolean
    showQuestionTimeSpent: boolean
    showScrollToTopAndBottomBtns: boolean
    questionTypeFontSize: number
    markingSchemeFontSize: number
    questionTimeSpentFontSize: number
    questionNumFontSize: number
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
      mcqAndMsq: {
        prefix: string
        suffix: string
        counterType: string
        fontSize: number
        zoomSize: number
        rowGap: number
      }
      msm: {
        row: {
          prefix: string
          suffix: string
          counterType: string
          fontSize: number
          gap: number
        }
        col: {
          prefix: string
          suffix: string
          counterType: string
          fontSize: number
          gap: number
        }
        zoomSize: number
      }
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

export type LogTestStateViaType = 'testStarted' | 'testResumed' | 'testFinished'

export type AnswerSavedViaType = 'save&next' | 'mfr' | 'palette' | 'sectionBtn' | 'previous'

export type CurrentQuestionViaType = LogTestStateViaType | AnswerSavedViaType

export type TestLogType = LogTestStateViaType | 'currentQuestion'
  | 'answerSaved' | 'currentAnswer' | 'answerCleared'

export interface TestLog {
  id: number
  timestamp: number
  testTime: number
  type: TestLogType
  current: {
    queId: number
    section: string
    question: number
    answer: QuestionAnswer
    status: QuestionStatus
    timeSpent: number
  }
  actionDetails?: Record<string, unknown>
}

export type TestSessionQuestionData = Pick<
  CropperQuestionData, 'que' | 'type' | 'answerOptions'
> & {
  secQueId: number
  queId: number
  section: string
  status: QuestionStatus
  answer: QuestionAnswer
  timeSpent: number
}

export type TestSessionSectionData = {
  [question: string | number]: TestSessionQuestionData
}

export type TestSessionSubjectData = {
  [section: string]: TestSessionSectionData
}
export type TestSessionSectionsData = TestSessionSubjectData

export type TestSectionListItem = {
  name: string
  subject: string
  id: number
}

export type TestSectionSummary = {
  [key in QuestionStatus]: number
}

export type TestSectionsSummary = Map<string, ComputedRef<TestSectionSummary>>

export type TestSummaryDataTableRow = TestSectionSummary & {
  section: string
  totalQuestions: number
}

export interface CurrentTestState {
  section: string
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
    [section: string]: number
  }
}

export type TestSectionsImgUrls = {
  [section: string]: {
    [question: number | string]: string[]
  }
}

export type TestInterfaceQuestionData = Omit<TestSessionQuestionData, 'section' | 'que'>
  & Pick<CropperQuestionData, 'marks' | 'pdfData' | 'answerOptionsCounterType'>

export type TestInterfaceSectionData = {
  [question: number | string]: TestInterfaceQuestionData
}

export type TestInterfaceSubjectData = {
  [section: string]: TestInterfaceSectionData
}

export type TestInterfaceTestData = {
  [subject: string]: TestInterfaceSubjectData
}

export type TestImageBlobs = GenericSubjectsTree<Blob[]>[string]

export interface TestState {
  pdfFile: Uint8Array | null
  testImageBlobs: TestImageBlobs | null
  testConfig: TestInterfaceJsonOutput['testConfig']
  testAnswerKey: null | TestAnswerKeyData
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
  showPauseBtn: boolean
  questionImgScale: number
  saveTestData: boolean
  saveQuestionsLikeRealExams: boolean
}

export interface MiscSettings {
  username: string
  fontSize: number
  profileImg: string
  imgWidth: number
  imgHeight: number
}

export type UploadedTestData = {
  pdfBuffer: Uint8Array | null
  testImageBlobs: TestImageBlobs | null
  jsonData: AnswerKeyJsonOutputBasedOnPdfCropper | PdfCropperJsonOutput | null
}
