/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Comlink from 'comlink'
import type { Document, Pixmap } from 'mupdf'
import type { TestSectionKey } from '~/src/types'

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
    section: TestSectionKey
    question: number | string
  }[]
}

type TestQuestionsBlobs = {
  [section: TestSectionKey]: {
    [question: number | string]: Blob[]
  }
}

export class MuPdfProcessor {
  private mupdf: any = null
  private doc: Document | null = null

  private mupdfScript = '/assets/_mupdf/mupdf.js'

  async loadMuPdf() {
    if (!this.mupdf) {
      this.mupdf = await import(/* @vite-ignore */ this.mupdfScript)
    }
  }

  async loadPdf(pdfFile: Uint8Array | ArrayBuffer, getPageCount: boolean = false) {
    await this.loadMuPdf()
    this.doc = this.mupdf.Document.openDocument(pdfFile, 'application/pdf')

    if (getPageCount) return this.doc?.countPages()
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

  async getPageImage(
    pageNum: number,
    scale: number,
    transparent: boolean = false,
  ): Promise<{ blob: Blob, dimensions: { w: number, h: number } }> {
    const pixmap = await this.getPagePixmap(pageNum, scale, transparent)
    const [ulx, uly, lrx, lry] = pixmap.getBounds()

    return {
      blob: new Blob([pixmap.asPNG()], { type: 'image/png' }),
      dimensions: {
        w: Math.abs(lrx - ulx),
        h: Math.abs(lry - uly),
      },
    }
  }

  async generateQuestionImages(
    processedCropperData: ProcessedCropperData,
    scale: number,
  ) {
    if (!this.doc) throw new Error('PDF not loaded')

    let progressCount = 0
    const imageBlobs: TestQuestionsBlobs = {}

    for (const pageKey of Object.keys(processedCropperData)) {
      const pageNum = parseInt(pageKey)
      const pagePixmap = await this.getPagePixmap(pageNum, scale)

      for (const questionData of processedCropperData[pageKey]) {
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
    indexes: number[],
    questionsPdfData: [string, PdfData[]][],
    scale: number = 2,
    transparent: boolean = false,
  ) {
    const pagePixmaps: Record<number | string, Pixmap> = {}

    for (const i of indexes) {
      const [queId, pdfData] = questionsPdfData[i]

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
