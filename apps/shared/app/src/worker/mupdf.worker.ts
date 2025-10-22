import { expose as comlinkExpose } from 'comlink'
import type * as Mupdf from 'mupdf'
import utilRange from '#layers/shared/app/utils/utilRange'
import type {
  PatternModeParsedConfig,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/parsed-config-for-cropper'

type PdfData = {
  page: number
  x: number
  y: number
  w: number
  h: number
}

type PageNumKey = number | string

type ProcessedCropperData = {
  [page: PageNumKey]: {
    pdfData: PdfData
    section: string
    question: number | string
  }[]
}

const SCRIPT_URLS = [
  `https://cdn.jsdelivr.net/gh/TheMoonVyy/pdf2cbt@prod/apps/shared/public/assets/_mupdf/mupdf.min.js`,
  `/assets/_mupdf/mupdf.js`,
] as const

type LinesGroupedByY = Record<string | number, PageTextChar[]>

export class MuPdfProcessor {
  private mupdf: typeof Mupdf | null = null
  private doc: Mupdf.Document | null = null

  async loadMuPdf(preferLocalScript: boolean) {
    if (!this.mupdf) {
      const scriptUrls = preferLocalScript
        ? SCRIPT_URLS.toReversed()
        : SCRIPT_URLS

      for (let i = 0; i < scriptUrls.length; i++) {
        try {
          this.mupdf = await import(/* @vite-ignore */ scriptUrls[i]!)
          break
        }
        catch (err) {
          console.error(`Error importing mupdf from url no. ${i + 1}:`, err)
        }
      }
    }
  }

  async loadPdf(
    pdfFile: Uint8Array | ArrayBuffer,
    preferLocalScript: boolean,
    getPageCount: boolean = false,
  ) {
    await this.loadMuPdf(preferLocalScript)
    if (!this.mupdf) throw new Error('mupdf not loaded')

    this.doc?.destroy()
    this.doc = this.mupdf.Document.openDocument(pdfFile, 'application/pdf')

    if (getPageCount)
      return this.doc?.countPages()
  }

  async getPdfPatternData(pageNums: number[], settings: PatternModeParsedConfig['settings']) {
    if (!this.doc || !this.mupdf) throw new Error('PDF not loaded')

    const {
      ignoreElementsGoingOutsidePage,
      yCoordinateGroupingRangeForLine,
      linesToIgnore,
    } = settings

    const getCoordsFromRect = (rect: Mupdf.Rect, w: number, h: number) => {
      if (!this.mupdf?.Rect.isValid(rect))
        return null

      const [l, t, r, b] = rect

      if (ignoreElementsGoingOutsidePage && (l < 0 || t < 0 || r > w || b > h))
        return null

      return {
        // upto to 2 decimal places
        l: Math.floor(l * 100) / 100,
        t: Math.floor(t * 100) / 100,
        r: Math.ceil(r * 100) / 100,
        b: Math.ceil(b * 100) / 100,
      }
    }

    const getCoordsFromQuad = (quad: Mupdf.Quad, w: number, h: number) => {
      const xs = [quad[0], quad[2], quad[4], quad[6]]
      const ys = [quad[1], quad[3], quad[5], quad[7]]

      const rect: Mupdf.Rect = [
        Math.min(...xs), // l
        Math.min(...ys), // t
        Math.max(...xs), // r
        Math.max(...ys), // b
      ]
      return getCoordsFromRect(rect, w, h)
    }

    const lineYGroupingRangeValues: number[] = [0]
    for (const num of utilRange(yCoordinateGroupingRangeForLine)) {
      if (num > 0) {
        lineYGroupingRangeValues.push(-num, num)
      }
    }

    const sTextBaseOptions = [
      'preserve-images',
      'vectors',
      'ignore-actualtext',
      'clip',
      'accurate-bbox',
    ]
    if (!settings.calculateCharacterBoundariesPrecisely)
      sTextBaseOptions.pop()

    const sTextBaseOptionsStr = sTextBaseOptions.join(',')

    const pdfPagesPatternModeData: PdfPagesPatternModeData = {}
    for (const pageNum of pageNums) {
      const page = this.doc.loadPage(pageNum - 1)
      const [pageMinX, pageMinY, pageMaxX, pageMaxY] = page.getBounds()
      const pageWidth = Math.abs(pageMaxX - pageMinX)
      const pageHeight = Math.abs(pageMaxY - pageMinY)

      const sTextOptionsStr = sTextBaseOptionsStr
        + `,clip-rect=${pageMinX}:${pageMinY}:${pageMaxX}:${pageMaxY}`

      const sText = page.toStructuredText(sTextOptionsStr)

      const pageChars: PageTextChar[] = []
      const pageImagesAreaCoords: PdfPagesPatternModeData[number]['images'] = []
      const pageVectorsAreaCoords: PdfPagesPatternModeData[number]['vectors'] = []

      sText.walk({
        onChar: (char, _origin, _font, _size, quad) => {
          const coords = getCoordsFromQuad(quad, pageWidth, pageHeight)
          if (coords)
            pageChars.push({ c: char, ...coords })
        },
        onImageBlock: (bbox) => {
          const coords = getCoordsFromRect(bbox, pageWidth, pageHeight)
          if (coords)
            pageImagesAreaCoords.push(coords)
        },
        onVector: (bbox) => {
          const coords = getCoordsFromRect(bbox, pageWidth, pageHeight)
          if (coords)
            pageVectorsAreaCoords.push(coords)
        },
      })
      page.destroy()

      const linesGroupedByY = pageChars.reduce(
        (acc, point) => {
          const yMidPoint = Math.round((point.t + point.b) / 2) // use y mid point for grouping

          for (const dy of lineYGroupingRangeValues) {
            const line = acc[yMidPoint + dy]
            if (line) {
              line.push(point)
              return acc
            }
          }

          acc[yMidPoint] = [point]
          return acc
        },
        {} as LinesGroupedByY,
      )

      const pageTextLineData: PageTextLineData[] = []
      for (const lineChars of Object.values(linesGroupedByY)) {
        if (lineChars.some(p => !!p.c.trim())) {
          lineChars.sort((a, b) => a.l - b.l)
          const lineText = lineChars.map(p => p.c).join('')
          if (linesToIgnore?.some((regex) => {
            regex.lastIndex = 0
            return regex.test(lineText)
          })) continue

          // don't use whitespace chars for minY and maxY calculations
          const charsWithoutWhitespace = lineChars.filter(p => !!p.c.trim())
          pageTextLineData.push({
            text: lineText,
            minY: Math.min(...charsWithoutWhitespace.map(p => p.t)),
            maxY: Math.max(...charsWithoutWhitespace.map(p => p.b)),
            chars: lineChars,
          })
        }
      }

      pageImagesAreaCoords.sort((a, b) => a.b - b.b)
      pageVectorsAreaCoords.sort((a, b) => a.b - b.b)

      pdfPagesPatternModeData[pageNum] = {
        lines: pageTextLineData,
        images: pageImagesAreaCoords,
        vectors: pageVectorsAreaCoords,
      }
    }

    return pdfPagesPatternModeData
  }

  private async getPagePixmap(
    pageNum: number,
    scale: number,
    transparent: boolean = false,
  ): Promise<Mupdf.Pixmap> {
    if (!this.doc || !this.mupdf) throw new Error('PDF not loaded')

    const page = this.doc.loadPage(pageNum - 1)
    const pixmap = page.toPixmap(
      this.mupdf.Matrix.scale(scale, scale),
      this.mupdf.ColorSpace.DeviceRGB,
      transparent,
      true,
    )
    return pixmap
  }

  async getAllPagesDimensionsData(): Promise<PageImgData> {
    if (!this.doc)
      throw new Error('PDF not loaded')

    const totalPagesCount = this.doc.countPages()
    const pageImgData: PageImgData = {}

    for (let i = 0; i < totalPagesCount; i++) {
      const page = this.doc.loadPage(i)
      const [pageMinX, pageMinY, pageMaxX, pageMaxY] = page.getBounds()
      pageImgData[i + 1] = {
        width: Math.abs(pageMaxX - pageMinX),
        height: Math.abs(pageMaxY - pageMinY),
        url: '',
        pageScale: 1,
      }
    }

    return pageImgData
  }

  async getPageImage(
    pageNum: number,
    scale: number,
    transparent: boolean = false,
  ): Promise<Blob> {
    if (!this.doc) throw new Error('PDF not loaded')

    const pixmap = await this.getPagePixmap(pageNum, scale, transparent)

    return new Blob([pixmap.asPNG() as Uint8Array<ArrayBuffer>], { type: 'image/png' })
  }

  async generateQuestionImages(
    processedCropperData: ProcessedCropperData,
    scale: number,
    transparent: boolean = false,
  ) {
    if (!this.doc) throw new Error('PDF not loaded')

    let progressCount = 0
    const imageBlobs: TestImageBlobs = {}

    for (const pageKey of Object.keys(processedCropperData)) {
      const pageNum = parseInt(pageKey)
      const pagePixmap = await this.getPagePixmap(pageNum, scale, transparent)

      const pageProcessedData = processedCropperData[pageKey]

      if (!pageProcessedData) continue

      for (const questionData of pageProcessedData) {
        const { pdfData, section, question } = questionData

        if (!imageBlobs[section]?.[question]) {
          progressCount++
          self.postMessage({ type: 'progress', value: progressCount })
        }
        const blob = await this.getCroppedImg(pagePixmap, pdfData)
        if (blob) {
          imageBlobs[section] ??= {}
          imageBlobs[section][question] ??= []

          imageBlobs[section][question].push(blob)
        }
      }
    }

    return imageBlobs
  }

  async generateAndPostQuestionImagesIndividually(
    queIds: Map<number, number>,
    questionsPdfData: { [queId: string | number]: PdfData[] },
    scale: number = 2,
    transparent: boolean = false,
  ) {
    const pagePixmaps: Record<number | string, Mupdf.Pixmap> = {}

    for (const queId of queIds.keys()) {
      const pdfData = questionsPdfData[queId]
      if (!pdfData) continue

      for (const pdfDataItem of pdfData) {
        const pageNum = pdfDataItem.page

        pagePixmaps[pageNum] ??= await this.getPagePixmap(Number(pageNum), scale, transparent)

        const imgBlob = await this.getCroppedImg(pagePixmaps[pageNum], pdfDataItem)
        self.postMessage(
          {
            type: 'question-image',
            queId,
            blob: imgBlob,
          },
        )
      }
    }
  }

  private async getCroppedImg(pagePixmap: Mupdf.Pixmap, pdfData: PdfData) {
    const { x, y, w, h } = pdfData

    const croppedPNG = pagePixmap.warp(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      w,
      h,
    ).asPNG()

    return new Blob([croppedPNG as Uint8Array<ArrayBuffer>], { type: 'image/png' })
  }

  close() {
    this.doc?.destroy()
    this.doc = null
    this.mupdf = null
    self.close()
  }
}

comlinkExpose(new MuPdfProcessor())
