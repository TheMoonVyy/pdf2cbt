import type { ClassValue } from 'clsx'

import type { QUESTION_TYPES_IN_WORDS } from '#layers/shared/shared/constants'

export type { ClassValue }

export type Numberish = string | number
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
  [rowNum: Numberish]: number[]
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

export type TestInstructionTypes = 'jee-main' | 'jee-adv' | 'comedk' | 'ugee'
export type SectionWiseInstructionTypes = 'auto' | 'mcq' | 'msq' | 'nat' | 'msm'

export interface TestInterfaceAndResultCommonJsonOutputData extends JsonOutput {
  testConfig: {
    testName: string
    testDurationInSeconds: number
    zipOriginalUrl?: string
    zipConvertedUrl?: string
    pdfFileHash: string
    testInstructions?: {
      type: TestInstructionTypes
    } | {
      type: 'custom'
      pages: { title: string, data: string }[]
      declaration: string
    }
    additionalData: {
      [subject: string ]: {
        sections: {
          [section: string]: {
            optionalQuestions: number
            instructions?: {
              type: SectionWiseInstructionTypes
            } | {
              type: 'custom'
              data: string
            }
          }
        }
      }
    }
  }
  testSummary: TestSummaryDataTableRow[]
  testLogs: TestLog[]
  testResultOverview: TestResultOverview
  testNotes?: TestNotes
}
export type CbtMakerInternalInstructionsData = {
  testInstructions: {
    type: TestInstructionTypes | 'custom' | 'default'
    pages: { title: string, data: string }[]
    declaration: string
    imgLinksFootNotes?: string
  }
  additionalData: {
    [subject: string ]: {
      sections: {
        [section: string]: {
          optionalQuestions: number
          instructions: {
            type: SectionWiseInstructionTypes | 'custom' | 'none'
            data: string
            parsedData: string
          }
        }
      }
    }
  }
}

export type CbtParsedTestInstructions = {
  pages: { title: string, data: string }[]
  declaration: string
}

export type CbtIntructionsDataForTemplate = CbtMakerInternalInstructionsData & {
  pdfCropperData: CropperOutputData
  testName: string
  testDuration: number
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
    'pdfFileHash' | 'zipOriginalUrl' | 'zipConvertedUrl' | 'testInstructions' | 'additionalData'
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

export type CbtInstructionsConfig = {
  pages: {
    title: string
    body: string
    footer: string
  }[]
}

export type CbtInstructionsParsedConfig = {
  pages: {
    title: string
    body: string
    parsedBody: string
    footer: string
  }[]
}

type QuestionTypeInCaps = keyof typeof QUESTION_TYPES_IN_WORDS
type QuestionTypeInWords = (typeof QUESTION_TYPES_IN_WORDS)[QuestionTypeInCaps]
type QMarks = {
  correct: number
  incorrect: number
  partial: number
  max: number
}

export type CbtInstructionsTemplateSectionData = {
  name: string
  slNum: number
  totalQuestions: number
  questionType: QuestionTypeInCaps
  questionTypeInWords: QuestionTypeInWords
  maxMarks: number
  questionMarks: QMarks
  optionalQuestions: number
}

export type CbtInstructionsTemplateSubjectData = {
  name: string
  slNum: number
  totalSections: number
  totalQuestions: number
  questionType?: QuestionTypeInCaps
  questionTypeInWords?: QuestionTypeInWords
  maxMarks: number
  questionMarks?: QMarks
  sections: CbtInstructionsTemplateSectionData[]
}

export type CbtInstructionsTemplateData = {
  testName: string
  testDuration: number
  testDurationInHours: number
  icons: ReturnType<typeof useCbtInterfaceIcons>['value']
  totalSubjects: number
  totalSections: number
  totalQuestions: number
  questionType?: QuestionTypeInCaps
  questionTypeInWords?: QuestionTypeInWords
  maxMarks: number
  questionMarks?: QMarks
  subjects: CbtInstructionsTemplateSubjectData[]
}
