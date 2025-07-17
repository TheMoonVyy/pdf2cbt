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

export type TestAnswerKeyData = GenericSubjectsTree<QuestionAnswer>

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
  generatedBasedOn: 'pdfCropperPage'
  testAnswerKey: TestAnswerKeyData
}

export interface AnswerKeyJsonOutputBasedOnTestInterface
  extends Omit<TestInterfaceJsonOutput, 'generatedBy'> {
  generatedBy: 'answerKeyPage'
  generatedBasedOn: 'testInterfacePage'
  testAnswerKey: TestAnswerKeyData
}

export type AnswerKeyJsonOutput = AnswerKeyJsonOutputBasedOnPdfCropper
  | AnswerKeyJsonOutputBasedOnTestInterface

export type QuestionsImageUrls = {
  [queId: number | string]: string[]
}
