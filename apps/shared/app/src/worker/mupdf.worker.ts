import * as Comlink from 'comlink'
import type { Document, Pixmap } from 'mupdf'
import type { TestImageBlobs } from '#layers/shared/shared/types/cbt-interface'
import type {
  StructuredTextLine,
  PageColumnTextWithCoords,
  PdfTextWithCoords,
} from '#layers/shared/shared/types/pdf-cropper'

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

type StructuredTextBlock = {
  type: 'image' | 'text'
  bbox: {
    x: number
    y: number
    w: number
    h: number
  }
  lines: StructuredTextLine[]
}

type StructuredTextPage = {
  blocks: StructuredTextBlock[]
}

export class MuPdfProcessor {
  private mupdf: any = null /* eslint-disable-line @typescript-eslint/no-explicit-any */
  private doc: Document | null = null

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
    this.doc = this.mupdf.Document.openDocument(pdfFile, 'application/pdf')

    if (getPageCount) return this.doc?.countPages()
  }

  async getPdfTextWithCoords(
    pageNums: number[],
  ) {
    if (!this.doc || !this.mupdf) throw new Error('PDF not loaded')

    const pdfTextWithCoords: PdfTextWithCoords = {}

    const totalPages = this.doc.countPages()
    for (const pageNum of pageNums) {
      if (pageNum > totalPages) break

      const pageLines: PageColumnTextWithCoords = []

      const page = this.doc.loadPage(pageNum - 1)
      const [ulx, uly, lrx, lry] = page.getBounds()
      const width = Math.abs(lrx - ulx)
      const height = Math.abs(lry - uly)

      const options = 'preserve-whitespace,dehyphenate,ignore-actualtext'
      const structuredTextString = page.toStructuredText(options).asJSON()

      const pageStructuredText = JSON.parse(structuredTextString) as StructuredTextPage
      page.destroy()

      const blocks = pageStructuredText.blocks
      for (const block of blocks) {
        if (block.type === 'text') {
          const lines = block.lines
          for (const line of lines) {
            const { font, ...rest } = line
            pageLines.push(rest)
          }
        }
      }

      pageLines.sort((a, b) => a.bbox.y - b.bbox.y)
      pdfTextWithCoords[pageNum] = {
        columns: [pageLines],
        width,
        height,
      }
    }

    return pdfTextWithCoords
  }

  private async getPagePixmap(
    pageNum: number,
    scale: number,
    transparent: boolean = false,
  ): Promise<Pixmap> {
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

  async getPageImage(
    pageNum: number,
    scale: number,
    transparent: boolean = false,
  ): Promise<{ blob: Blob, dimensions: { w: number, h: number } }> {
    if (!this.doc) throw new Error('PDF not loaded')

    const pixmap = await this.getPagePixmap(pageNum, scale, transparent)
    const page = this.doc.loadPage(pageNum - 1)
    const [ulx, uly, lrx, lry] = page.getBounds()

    const blob = new Blob([pixmap.asPNG()], { type: 'image/png' })
    page.destroy()

    return {
      blob,
      dimensions: {
        w: Math.abs(lrx - ulx),
        h: Math.abs(lry - uly),
      },
    }
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
    const pagePixmaps: Record<number | string, Pixmap> = {}

    for (const queId of queIds.keys()) {
      const pdfData = questionsPdfData[queId]
      if (!pdfData) continue

      for (const pdfDataItem of pdfData) {
        const pageNum = pdfDataItem.page

        if (!pagePixmaps[pageNum]) {
          pagePixmaps[pageNum] = await this.getPagePixmap(Number(pageNum), scale, transparent)
        }

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

  private async getCroppedImg(pagePixmap: Pixmap, pdfData: PdfData) {
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

Comlink.expose(new MuPdfProcessor())
