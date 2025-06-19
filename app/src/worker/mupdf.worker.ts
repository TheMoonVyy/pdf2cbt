/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Comlink from 'comlink'
import type { Document, Pixmap } from 'mupdf'
import type { TestSectionKey, TestImageBlobs } from '#shared/types'

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

const IS_ONLINE_BUILD = Boolean(import.meta.env.VITE_IS_ONLINE)
const MUPDF_VERSION = import.meta.env.MUPDF_PACKAGE_VERSION as string

const mupdfLocalUrl = '/assets/_mupdf/mupdf.js'
const mupdfJsDelivrUrl = `https://cdn.jsdelivr.net/npm/mupdf@${MUPDF_VERSION}/dist/mupdf.js`

const mupdfScriptUrl = {
  firstUrl: IS_ONLINE_BUILD ? mupdfJsDelivrUrl : mupdfLocalUrl,
  secondUrl: IS_ONLINE_BUILD ? mupdfLocalUrl : mupdfJsDelivrUrl,
}

export class MuPdfProcessor {
  private mupdf: any = null
  private doc: Document | null = null

  async loadMuPdf() {
    if (!this.mupdf) {
      try {
        this.mupdf = await import(/* @vite-ignore */ mupdfScriptUrl.firstUrl)
      }
      catch (err) {
        console.error('Error importing mupdf from first url', err)
        try {
          this.mupdf = await import(/* @vite-ignore */ mupdfScriptUrl.secondUrl)
        }
        catch (err) {
          console.error('Error importing mupdf from second url', err)
        }
      }
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
    if (!this.doc) throw new Error('PDF not loaded')

    const pixmap = await this.getPagePixmap(pageNum, scale, transparent)
    const [ulx, uly, lrx, lry] = this.doc.loadPage(pageNum - 1).getBounds()

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
