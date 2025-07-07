export type PdfCropperCurrentMode = 'crop' | 'edit' | 'text-pattern'

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
  pdfData: {
    l: number // left
    r: number // right
    t: number // top
    b: number // bottom
    page: number // page number
  }
  answerOptionsCounterTypePrimary: string
  answerOptionsCounterTypeSecondary: string
}

export type PdfCropperOverlaysPerQuestion = Map<string, number>

export type ActiveCroppedOverlay = {
  id: string
  imgNum: number
}

// this is type as provided by mupdf's structuredText
export type StructuredTextLine = {
  wmode: 0 | 1 // 0=horizontal, 1=vertical
  bbox: {
    x: number
    y: number
    w: number
    h: number
  }
  font: {
    name: string
    family: 'serif' | 'sans-serif' | 'monospace'
    weight: 'normal' | 'bold'
    style: 'normal' | 'italic'
    size: number
  }
  x: number
  y: number
  text: string
}

// reduced version of structuredText which is needed
export type LineTextWithCoords = Omit<StructuredTextLine, 'font'>
export type PageColumnTextWithCoords = LineTextWithCoords[]

export type PdfTextWithCoords = {
  [pageNum: string | number]: {
    columns: PageColumnTextWithCoords[]
    width: number
    height: number
  }
}

export type PdfTextPatternModeConfig = {
  subject: string
  section: string
  questions: string
  questionsEnd: string
  minX: number
  maxX: number
}

export type PdfTextPatternModeState = {
  pdfTextWithCoords: PdfTextWithCoords | null
  isTextPatternMode: boolean
  config: PdfTextPatternModeConfig
}
