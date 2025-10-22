export type PdfCropperCurrentMode = 'crop' | 'edit'

export type CropperMode = {
  isBox: boolean
  isLine: boolean
  isPattern: boolean
}

export type PdfCropperSettings = {
  general: {
    cropperMode: 'line' | 'box' | 'pattern'
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
    allowResizingPanels: boolean
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

export type PatternModeFormStatus = Record<number | string, {
  isReady: boolean
  sections: Record<number | string, ComputedRef<boolean>>
}>

export type PatternModeBuiltInConfig = {
  name: string
  // key being subject name, values beings string[] for section names,
  // null if subject has no sections
  subjects: Record<string, null | string[]>
  id: number
  url: string
}

export type PatternModeUserConfig = Omit<PatternModeBuiltInConfig, 'url'>

export type PatternModeImportExportConfigData = Omit<PatternModeUserConfig, 'id'> & {
  configVersion?: number
  data: PatternModeConfigDB['data']
}
