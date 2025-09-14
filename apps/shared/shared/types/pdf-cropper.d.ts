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

export type PageImgData = {
  [pageNum: number]: {
    width: number
    height: number
    url: string
    pageScale: number
  }
}
