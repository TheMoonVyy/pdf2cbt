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
    size: number
    testTotalHeaderHeight: number
    sectionHeaderHeight: number
    sectionHeaderAndQuesPanelDividerHeight: number
    showQuestionType: boolean
    questionTypeFontSize: number
    showMarkingScheme: boolean
    markingSchemeFontSize: number
    showQuestionTimeSpent: boolean
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

export type TestSectionKey = string

export type PdfCropperCoords = {
  page: number
  x1: number
  y1: number
  x2: number
  y2: number
}

type QuestionMarks = {
  cm: number // correct marks
  pm?: number // partial marks
  im: number // incorrect marks
}

export type CropperQuestionData = {
  que: number
  type: QuestionType
  options?: number
  marks: QuestionMarks
  pdfData: PdfCropperCoords[]
}

export type CropperSectionsData = {
  [section: TestSectionKey]: {
    [question: string | number]: CropperQuestionData
  }
}

export type CropperOutputData = {
  [subject: string]: CropperSectionsData
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

export type PdfCroppedOverlayData = {
  id: string
  queId: string
  que: number
  subject: string
  section: string
  imgNum: number
  type: QuestionType
  options: number
  marks: Required<QuestionMarks>
  pdfData: {
    l: number // left
    r: number // right
    t: number // top
    b: number // bottom
    page: number // page number
  }
}

export type PdfCropperOverlaysPerQuestion = Map<string, number>

export type ActiveCroppedOverlay = {
  id: string
  imgNum: number
}

export type LogTestStateViaType = 'testStarted' | 'testResumed' | 'testFinished'

export type AnswerSavedViaType = 'save&next' | 'mfr'

export type CurrentQuestionViaType = LogTestStateViaType | AnswerSavedViaType
  | 'previous' | 'palette' | 'sectionBtn'

export type TestLogType = LogTestStateViaType | 'currentQuestion'
  | 'answerSaved' | 'currentAnswer' | 'answerCleared'

export interface TestLog {
  id: number
  timestamp: number
  testTime: number
  type: TestLogType
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

export type TestAnswerKeyQuestionData = 'DROPPED' | 'BONUS' | QuestionAnswer

export type QuestionResult = {
  marks: number
  status: 'correct' | 'incorrect' | 'partial' | 'dropped' | 'bonus' | 'notAnswered'
  correctAnswer: TestAnswerKeyQuestionData
}

export type TestOutputDataQuestion = Omit<TestQuestionData, 'section' | 'que'>
  & Pick<CropperQuestionData, 'marks' | 'pdfData'>

export type TestOutputDataSection = {
  [question: number | string]: TestOutputDataQuestion
}

export type TestOutputDataSubject = {
  [section: TestSectionKey]: TestOutputDataSection
}

export type TestOutputDataSubjects = {
  [subject: keyof CropperOutputData]: TestOutputDataSubject
}

export type TestAnswerKeySectionData = {
  [question: number | string]: TestAnswerKeyQuestionData
}

export type TestAnswerKeySubjectData = {
  [section: TestSectionKey]: TestAnswerKeySectionData
}

export type TestAnswerKeyData = {
  [subject: keyof CropperOutputData]: TestAnswerKeySubjectData
}

export type TestResultDataQuestion = TestOutputDataQuestion & {
  subject: keyof CropperOutputData
  section: TestSectionKey
  oriQueId: number
  result: QuestionResult
}

export type TestResultDataSection = {
  [question: number | string]: TestResultDataQuestion
}

export type TestResultDataSubject = {
  [section: TestSectionKey]: TestResultDataSection
}

export type TestResultData = {
  [subject: keyof CropperOutputData]: TestResultDataSubject
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

export type TestResultOverviewsDBSortByOption =
  | 'addedAscending'
  | 'addedDescending'
  | 'startTimeAscending'
  | 'startTimeDescending'
  | 'endTimeAscending'
  | 'endTimeDescending'

export type TestNotes = {
  [queId: string | number]: string
}

export interface TestOutputData {
  testConfig: {
    testName: string
    testDurationInSeconds: number
    zipOriginalUrl?: string
    zipConvertedUrl?: string
    pdfFileHash: string
  }
  testData: TestOutputDataSubjects
  testSummary: TestSummaryDataTableRow[]
  testLogs: TestLog[]
  testResultOverview: TestResultOverview
  testResultData?: TestResultData
  testAnswerKey?: TestAnswerKeyData
  testNotes?: TestNotes
}

export type TestResultsOutputData = Omit<TestOutputData, 'testData' | 'testAnswerKey'>
  & Required<Pick<TestOutputData, 'testResultData'>>

export type TestResultCommonOutput = TestResultsOutputData | TestOutputData

export type TestImageBlobs = {
  [section: TestSectionKey]: {
    [question: number | string]: Blob[]
  }
}

export interface TestState {
  pdfFile: Uint8Array | null
  testImageBlobs: TestImageBlobs | null
  pdfFileHash: string
  zipOriginalUrl: string
  zipConvertedUrl: string
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
}

export interface MiscSettings {
  username: string
  fontSize: number
  profileImg: string
  imgWidth: number
  imgHeight: number
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

export type UploadedTestData = {
  pdfBuffer: Uint8Array | null
  testImageBlobs: TestImageBlobs | null
  jsonData: Record<string, unknown> | null
}

export type QuestionsImageUrls = {
  [queId: number | string]: string[]
}

export type PdfCropperSettings = {
  general: {
    cropperMode: 'line' | 'box'
    scale: number
    splitterPanelSize: number
    pageBGColor: string
    cropSelectionGuideColor: string
    cropSelectionBgOpacity: number
    cropSelectedRegionColor: string
    cropSelectedRegionBgOpacity: number
    cropSelectionSkipColor: string
    qualityFactor: number
    selectionThrottleInterval: number
    minCropDimension: number
    moveOnKeyPressDistance: number
    blurCroppedRegion: boolean
    blurIntensity: number
    showQuestionDetailsOnOverlay: boolean
  }
}
