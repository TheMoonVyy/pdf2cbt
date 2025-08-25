export type PdfCropperCurrentMode = 'crop' | 'edit' | 'pattern'

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

export type PdfCropperCoords = {
  page: number
  x1: number
  y1: number
  x2: number
  y2: number
}

export type CropperQuestionData = {
  que: number
  type: QuestionType
  answerOptions?: string
  marks: QuestionMarks
  pdfData: PdfCropperCoords[]
  answerOptionsCounterType?: {
    primary?: string
    secondary?: string
  }
}

export type CropperSectionsData = GenericSubjectsTree<CropperQuestionData>[string]

export type CropperOutputData = {
  [subject: string]: CropperSectionsData
}

export type GenericCroppedOverlayCoords<T> = {
  l: T // left
  r: T // right
  t: T // top
  b: T // bottom
}

export type PdfCroppedOverlayCoords = GenericCroppedOverlayCoords<number>

export type PdfCroppedOverlayData = {
  id: string
  queId: string
  que: number
  subject: string
  section: string
  imgNum: number
  type: QuestionType
  answerOptions: string
  marks: Required<Omit<QuestionMarks, 'max'>>
  pdfData: PdfCroppedOverlayCoords & {
    page: number // page number, starting from 1
  }
  answerOptionsCounterTypePrimary: string
  answerOptionsCounterTypeSecondary: string
}

export type PdfCropperOverlaysPerQuestion = Map<string, number>

export type ActiveCroppedOverlay = {
  id: string
  imgNum: number
}

export type PageImgData = {
  [pageNum: number]: {
    width: number
    height: number
    url: string
    pageScale: number
  }
}

export type AbsOrRelativeOverlayCoords = GenericCroppedOverlayCoords<string>

export type PatternModePatternRegexType = {
  type: 'regex'
  value: string
}

export type PatternModePatternQuestionPatternTextType = {
  type: 'text'
  prefix: string
  questionRange: string
  suffix: string
  relaxPaddedZeros: boolean
  isCaseSensitive: boolean
}

export type PatternModePatternSimpleTextType = {
  type: 'text'
  value: string
  isCaseSensitive: boolean
}

export type PatternModeCommonConfig = {
  pattern: PatternModePatternRegexType | PatternModePatternSimpleTextType
  searchIn: {
    pages: string
    area: AbsOrRelativeOverlayCoords
  }
}

export type PatternModeQuestionsStartAndEndPatternType = PatternModePatternRegexType | PatternModePatternQuestionPatternTextType

export type PatternModeQuestionsDetails = Omit<CropperQuestionData, 'que' | 'pdfData'>

export type PatternModeQuestionsConfig = {
  questionsDetails: PatternModeQuestionsDetails
  questions: {
    pagesToSearchIn: string
    useLastLineOrImageForBottomCoordinate: boolean
    considerImageTopCoordinateForQuestionStart: boolean
    topCoordRangeTolookUpTextForQuestionStart: number
    nextQuestionMustBeOneQNumGreater: boolean
    duplicateQuestion: 'merge' | 'replace' | 'ignore'
    mergeQuestionsByPages: boolean
    mergeQuestionsByColumns: boolean
    ignoreMergingAreaNotContainingAnyTextOrImage: boolean
    paragraphQuestions?: {
      pattern: PatternModePatternRegexType | PatternModePatternSimpleTextType
      searchArea: AbsOrRelativeOverlayCoords
    }
    columns: {
      start: {
        pattern: PatternModeQuestionsStartAndEndPatternType
        searchArea: AbsOrRelativeOverlayCoords
      }
      end?: {
        pattern: PatternModeQuestionsStartAndEndPatternType
        searchArea: AbsOrRelativeOverlayCoords
      }
      cropTo: AbsOrRelativeOverlayCoords
      offsetBy: PdfCroppedOverlayCoords
    }[]
  }
}

type PatternModeSectionsConfig = {
  sections: {
    [section: string]: PatternModeCommonConfig & PatternModeQuestionsConfig & { optionalQuestions?: number }
  }
}

export type PatternModeSubjectsConfig = {
  [subject: string]: PatternModeCommonConfig
    & { columnDividers: string }
    & (PatternModeSectionsConfig | PatternModeQuestionsConfig)
}

export type OptionsForGetPdfTextDataMupdfWorkerFn = {
  ignoreElementsGoingOutsidePage: boolean
  lineYGroupingRange: number
}

export type PatternModeConfigJsonData = {
  pdfConfig: OptionsForGetPdfTextDataMupdfWorkerFn & {
    linesToIgnore?: string[]
  }
  subjects: PatternModeSubjectsConfig
}

type PatternModeParsedConfigCommonData = {
  name: string
  patternValue: RegExp
  searchIn: { area: AbsOrRelativeOverlayCoords } & { pages: Set<number> }
  searchArea: PdfCroppedOverlayCoords
}

export type PatternModeParsedQuestionsConfig = {
  questions: {
    details: Pick<
      PdfCroppedOverlayData,
      'type' | 'answerOptions' | 'marks' | 'answerOptionsCounterTypePrimary' | 'answerOptionsCounterTypeSecondary'
    >
    pages: Set<number>
    useLastLineOrImageForBottomCoordinate: boolean
    considerImageTopCoordinateForQuestionStart: boolean
    topCoordRangeTolookUpTextForQuestionStart: number
    nextQuestionMustBeOneQNumGreater: boolean
    duplicateQuestion: 'merge' | 'replace' | 'ignore'
    mergeQuestionsByPages: boolean
    mergeQuestionsByColumns: boolean
    ignoreMergingAreaNotContainingAnyTextOrImage: boolean
    paragraphQuestions?: {
      patternValue: RegExp
      searchInArea: AbsOrRelativeOverlayCoords
      searchArea: PdfCroppedOverlayCoords
    }
    columns: {
      start: {
        patternValue: RegExp
        searchInArea: AbsOrRelativeOverlayCoords
        searchArea: PdfCroppedOverlayCoords
      }
      end?: {
        patternValue: RegExp
        searchInArea: AbsOrRelativeOverlayCoords
        searchArea: PdfCroppedOverlayCoords
      }
      cropTo: AbsOrRelativeOverlayCoords
      parsedCropTo: {
        l: number | null
        r: number
        t: number
        b: number
      }
      offsetBy: PdfCroppedOverlayCoords
    }[]
  }
}

export type PatternModeParsedSectionsConfigData = {
  sections: {
    [section: string]: PatternModeParsedConfigCommonData & PatternModeParsedQuestionsConfig
  }
}

export type PatternModeParsedSubjectsConfigData = {
  [subject: string]: PatternModeParsedConfigCommonData
    & (PatternModeParsedSectionsConfigData | PatternModeParsedQuestionsConfig)
    & { columnDividers: string }
}

export type PatternModeParsedConfigData = {
  subjects: PatternModeParsedSubjectsConfigData
  pdfConfig: {
    linesToIgnore: string[]
  }
}

export type PageTextChar = {
  c: string
  l: number
  r: number
  t: number
  b: number
}

export type PageTextLineData = {
  text: string
  minY: number
  maxY: number
  chars: PageTextChar[]
  columns?: string[]
}

export type PagePatternModeData = {
  lines: PageTextLineData[]
  images: PdfCroppedOverlayCoords[]
  vectors: PdfCroppedOverlayCoords[]
}

export type PdfPagesPatternModeData = {
  [pageNum: string | number]: PagePatternModeData
}
