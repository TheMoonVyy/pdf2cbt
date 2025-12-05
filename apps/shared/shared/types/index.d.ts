import type { ClassValue } from 'clsx'

export type { ClassValue }

export type QuestionType = 'mcq' | 'msq' | 'nat' | 'msm'

export type QuestionMarks = {
  cm: number // correct marks
  pm?: number // partial marks
  im: number // incorrect marks
  max?: number // max marks, in msm type max is just cm * no. of rows, in other types it is just cm
}

export type GenericSubjectsTree<T> = {
  [subject: string]: {
    [section: string]: {
      [question: number | string]: T
    }
  }
}

export type QuestionMsmAnswerType = {
  [rowNum: string | number]: number[]
}

export type QuestionAnswer = number | number[] | string | null | QuestionMsmAnswerType | 'BONUS' | 'DROPPED'

export type TestAnswerKeyData = GenericSubjectsTree<{
  type: QuestionType
  answerOptions?: string
  correctAnswer: QuestionAnswer
}>

export interface JsonOutput {
  appVersion: string
  generatedBy: 'pdfCropperPage' | 'answerKeyPage' | 'testInterfacePage' | 'testResultsPage'
}

export interface TestInterfaceAndResultCommonJsonOutputData extends JsonOutput {
  testConfig: {
    testName: string
    testDurationInSeconds: number
    zipOriginalUrl?: string
    zipConvertedUrl?: string
    pdfFileHash: string
    optionalQuestions?: { subject: string, section: string, count: number }[]
  }
  testSummary: TestSummaryDataTableRow[]
  testLogs: TestLog[]
  testResultOverview: TestResultOverview
  testNotes?: TestNotes
}

export interface TestInterfaceJsonOutput extends TestInterfaceAndResultCommonJsonOutputData {
  generatedBy: 'testInterfacePage'
  testData: TestInterfaceTestData
  testAnswerKey?: TestAnswerKeyData
}

export interface TestResultJsonOutput extends TestInterfaceAndResultCommonJsonOutputData {
  generatedBy: 'testResultsPage'
  testResultData: TestResultData
}

export type TestInterfaceOrResultJsonOutput = TestInterfaceJsonOutput | TestResultJsonOutput

export interface PdfCropperJsonOutput extends JsonOutput {
  generatedBy: 'pdfCropperPage'
  pdfCropperData: CropperOutputData
  testConfig: Pick<
    TestInterfaceJsonOutput['testConfig'],
    'pdfFileHash' | 'zipOriginalUrl' | 'zipConvertedUrl' | 'optionalQuestions'
  > & { zipUrl?: string }
}

export interface AnswerKeyJsonOutputBasedOnPdfCropper
  extends Omit<PdfCropperJsonOutput, 'generatedBy'> {
  generatedBy: 'answerKeyPage'
  testAnswerKey: TestAnswerKeyData
}

export interface AnswerKeyJsonOutputBasedOnTestInterface
  extends Omit<TestInterfaceJsonOutput, 'generatedBy'> {
  generatedBy: 'answerKeyPage'
  testAnswerKey: TestAnswerKeyData
}

export interface AnswerKeyJsonOutputBasedOnTestResult
  extends Omit<TestResultJsonOutput, 'generatedBy'> {
  generatedBy: 'answerKeyPage'
  testAnswerKey: TestAnswerKeyData
}

export type AnswerKeyJsonOutput = AnswerKeyJsonOutputBasedOnPdfCropper
  | AnswerKeyJsonOutputBasedOnTestInterface
  | AnswerKeyJsonOutputBasedOnTestResult
  | { generatedBy: 'answerKeyPage', testAnswerKey: TestAnswerKeyData, appVersion: string }

export type QuestionsImageUrls = {
  [queId: number | string]: string[]
}

export type AppSettings = {
  theme: 'blue' | 'slate' | 'neutral'
  notify: {
    releases: {
      indicator: boolean
      popup: boolean
    }
    dev: {
      indicator: boolean
      popup: boolean
    }
  }
  pages: {
    homePage: {
      size: number
    }
    pdfCropper: {
      size: number
    }
    testInterface: {
      size: number
    }
    testResults: {
      size: number
    }
    generateAnswerKey: {
      size: number
    }
  }
}

export type MakePropertyOptional<T extends object, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
