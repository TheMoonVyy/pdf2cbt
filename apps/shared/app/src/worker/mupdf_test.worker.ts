import { expose as comlinkExpose } from 'comlink'
import type * as Mupdf from 'mupdf'

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

type LinesGroupedByY = Record<string | number, PageTextChar[]>

export class MuPdfProcessor {
  private mupdf: typeof Mupdf | null = null
  private doc: Mupdf.Document | null = null

  async loadMuPdf(scriptUrls: string[]) {
    if (!this.mupdf) {
      for (let i = 0; i < scriptUrls.length; i++) {
        try {
          this.mupdf = await import(/* @vite-ignore */ scriptUrls[i]!)
          break
        }
        catch (err) {
          console.error(`Error importing mupdf from url No. ${i + 1}:`, err)
        }
      }
    }
  }

  async loadPdf(
    pdfFile: Uint8Array | ArrayBuffer,
    scriptUrls: string[],
    getPageCount: boolean = false,
  ) {
    await this.loadMuPdf(scriptUrls)
    if (!this.mupdf) throw new Error('mupdf not loaded')

    this.doc = this.mupdf.Document.openDocument(pdfFile, 'application/pdf')

    if (getPageCount)
      return this.doc?.countPages()
  }

  async getPdfTextData(pageNums: number[], options: OptionsForGetPdfTextDataMupdfWorkerFn) {
    if (!this.doc || !this.mupdf) throw new Error('PDF not loaded')

    const {
      ignoreElementsGoingOutsidePage,
      lineYGroupingRange,
    } = options

    const getCoordsFromQuad = (quad: Mupdf.Quad, w: number, h: number) => {
      const l = quad[0]
      const t = quad[1]
      const r = quad[6]
      const b = quad[7]

      if (ignoreElementsGoingOutsidePage
        && (l < 0 || t < 0 || r > w || b > h)
      ) return null

      return {
        l: Math.floor(l * 100) / 100,
        t: Math.floor(t * 100) / 100,
        r: Math.floor(r * 100) / 100,
        b: Math.floor(b * 100) / 100,
      }
    }

    const getCoordsFromRect = (rect: Mupdf.Rect, w: number, h: number) => {
      if (!this.mupdf!.Rect.isValid(rect)) return null

      const [l, t, r, b] = rect

      if (ignoreElementsGoingOutsidePage
        && (l < 0 || t < 0 || r > w || b > h)
      ) return null

      return {
        // floor/ceil to 2 decimal places
        l: Math.floor(l * 100) / 100,
        t: Math.floor(t * 100) / 100,
        r: Math.ceil(r * 100) / 100,
        b: Math.ceil(b * 100) / 100,
      }
    }

    const lineYGroupingRangeValues: number[] = [0]
    for (const num of utilRange(lineYGroupingRange)) {
      if (num > 0) {
        lineYGroupingRangeValues.push(-num, num)
      }
    }

    const pdfTextData: PdfPagesPatternModeDataternModeData = {}
    for (const pageNum of pageNums) {
      const page = this.doc.loadPage(pageNum - 1)
      const [pageMinX, pageMinY, pageMaxX, pageMaxY] = page.getBounds()
      const pageWidth = pageMaxX - pageMinX
      const pageHeight = pageMaxY - pageMinY

      const pageChars: PageTextChar[] = []
      const pageImagesAreaCoords: PdfPagesPatternModeData[number]['images'] = []
      const pageVectors: { type: string, coords: PdfPagesPatternModeData[number]['images'][number] }[] = []

      page.destroy()

      // path.getBounds() can accept null for strokeState but it is not typed as such in mupdf Path type
      // hence using "as unknown as StrokeState" as workaround
      const deviceImpl: Mupdf.Device = {
        fillPath: (path, evenOdd, ctm, _cs, _color, alpha) => {
          if (alpha === 0) return
          const rect = path.getBounds(null as unknown as Mupdf.StrokeState, ctm)
          const coords = getCoordsFromRect(rect, pageWidth, pageHeight)
          if (coords)
            pageVectors.push({ type: 'fill', coords })
        },
        strokePath: (path, stroke, ctm, _cs, _color, alpha) => {
          if (alpha === 0) return
          const rect = path.getBounds(stroke, ctm)
          const coords = getCoordsFromRect(rect, pageWidth, pageHeight)
          if (coords)
            pageVectors.push({ type: 'stroke', coords })
        },
        clipPath: (path, _evenOdd, ctm) => {
          const rect = path.getBounds(null as unknown as Mupdf.StrokeState, ctm)
          const coords = getCoordsFromRect(rect, pageWidth, pageHeight)
          if (coords)
            pageVectors.push({ type: 'clip', coords })
        },
        clipStrokePath: (path, stroke, ctm) => {
          const rect = path.getBounds(stroke, ctm)
          const coords = getCoordsFromRect(rect, pageWidth, pageHeight)
          if (coords)
            pageVectors.push({ type: 'clipStroke', coords })
        },
        fillImage: (image, ctm, alpha) => {
          if (alpha === 0) return
          const bounds = getImageData(image, ctm)
          collected.push({ kind: 'fillImage', bounds, ctm })
        },
        fillImageMask: (image, ctm, _colorspace, _color, alpha) => {
          if (alpha === 0) return
          const bounds = getImageData(image, ctm)
          collected.push({ kind: 'fillImageMask', bounds, ctm })
        },
        clipImageMask: (image, ctm) => {
          const bounds = getImageData(image, ctm)
          collected.push({ kind: 'clipImageMask', bounds, ctm })
        },
      }

      const linesGroupedByY = pageChars.reduce(
        (acc, point) => {
          const yMidPoint = Math.round((point.t + point.b) / 2)

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
          pageTextLineData.push({
            text: lineChars.map(p => p.c).join(''),
            minY: Math.min(...lineChars.map(p => p.t)),
            maxY: Math.max(...lineChars.map(p => p.b)),
            chars: lineChars,
          })
        }
      }

      pageImagesAreaCoords.sort((a, b) => a.t - b.t)

      pdfTextData[pageNum] = {
        lines: pageTextLineData,
        images: pageImagesAreaCoords,
      }
    }

    return pdfTextData
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
    page.destroy()
    return pixmap
  }

  async getAllPagesDimensionsData(): Promise<PageImgData> {
    if (!this.doc)
      throw new Error('PDF not loaded')

    const totalPagesCount = this.doc.countPages()
    const pageImgData: PageImgData = {}

    for (let i = 0; i < totalPagesCount; i++) {
      const [ulx, uly, lrx, lry] = this.doc.loadPage(i).getBounds()
      pageImgData[i + 1] = {
        width: Math.abs(lrx - ulx),
        height: Math.abs(lry - uly),
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

    return new Blob([pixmap.asPNG()], { type: 'image/png' })
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

    return new Blob([croppedPNG], { type: 'image/png' })
  }

  close() {
    this.doc?.destroy()
    this.doc = null
    this.mupdf = null
    self.close()
  }
}

comlinkExpose(new MuPdfProcessor())
