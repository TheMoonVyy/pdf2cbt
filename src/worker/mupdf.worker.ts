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

  async getPageImg(
    pageNum: number,
    scale: number,
    output?: 'pixmap',
    transparent?: boolean
  ): Promise<Pixmap>

  async getPageImg(
    pageNum: number,
    scale: number,
    output?: 'blob',
    transparent?: boolean
  ): Promise<{ blob: Blob, dimensions: { w: number, h: number } }>

  async getPageImg(
    pageNum: number,
    scale: number,
    output: 'pixmap' | 'blob' = 'blob',
    transparent: boolean = false,
  ) {
    if (!this.doc) throw new Error('PDF not loaded')

    const page = this.doc.loadPage(pageNum - 1)
    const [ulx, uly, lrx, lry] = page.getBounds()
    const pagePixmap = page.toPixmap(
      this.mupdf!.Matrix.scale(scale, scale),
      this.mupdf!.ColorSpace.DeviceRGB,
      transparent,
      true,
    )

    if (output === 'pixmap') {
      return pagePixmap
    }
    else {
      return {
        blob: new Blob([pagePixmap.asPNG()], { type: 'image/png' }),
        dimensions: {
          w: Math.abs(lrx - ulx),
          h: Math.abs(lry - uly),
        },
      }
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
      const pagePixmap = await this.getPageImg(pageNum, scale, 'pixmap')

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
    this.mupdf = null
    this.doc = null
    self.close()
  }
}

Comlink.expose(new MuPdfProcessor())
