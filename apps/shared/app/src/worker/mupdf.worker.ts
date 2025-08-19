/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Comlink from 'comlink'
import type { Document, Pixmap } from 'mupdf'
import type { TestImageBlobs } from '#layers/shared/shared/types/cbt-interface'
import type { PageImgData } from '#layers/shared/shared/types/pdf-cropper'

interface PdfData {
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

export class MuPdfProcessor {
  private mupdf: any = null
  private doc: Document | null = null

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
          console.error(`Error importing mupdf from url No. ${i + 1}:`, err)
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
    this.doc = this.mupdf.Document.openDocument(pdfFile, 'application/pdf')

    if (getPageCount)
      return this.doc?.countPages()
  }

  private async getPagePixmap(
    pageNum: number,
    scale: number,
    transparent: boolean = false,
  ): Promise<Pixmap> {
    if (!this.doc) throw new Error('PDF not loaded')

    const page = this.doc.loadPage(pageNum - 1)
    return page.toPixmap(
      this.mupdf!.Matrix.scale(scale, scale),
      this.mupdf!.ColorSpace.DeviceRGB,
      transparent,
      true,
    )
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
