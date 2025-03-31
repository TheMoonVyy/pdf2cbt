<template>
  <div />
</template>

<script lang="ts" setup>
import * as Comlink from 'comlink'
import mupdfWorkerFile from '~/src/worker/mupdf.worker?worker'
import type { MuPdfProcessor } from '~/src/worker/mupdf.worker'

import type {
  TestState,
  CropperSectionsData,
  TestSectionKey,
} from '~/src/types'

interface PdfState {
  scale: number
}

type PageNumKey = number | string

type ProcessedCropperData = {
  [page: PageNumKey]: {
    pdfData: {
      page: number
      x: number
      y: number
      w: number
      h: number
    }
    section: TestSectionKey
    question: number | string
  }[]
}

const testState = defineModel<TestState>('testState', {
  type: Object,
  required: true,
})

const props = defineProps<{
  questionImgScale: number
}>()

const mupdfOgWorker = new mupdfWorkerFile()
const mupdfWorker = Comlink.wrap<MuPdfProcessor>(mupdfOgWorker)

const pdfState: PdfState = {
  scale: 1,
}

const { cropperSectionsData, testSectionsImgUrls } = useCbtTestData()

mupdfOgWorker.addEventListener('message', (event) => {
  if (event.data.type === 'progress') {
    testState.value.preparingTestCurrentQuestion = event.data.value
  }
})

function processCropperData(
  cropperData: CropperSectionsData,
): ProcessedCropperData {
  const processedData: ProcessedCropperData = {}
  const scale = pdfState.scale

  for (const sectionKey of Object.keys(cropperData) as TestSectionKey[]) {
    const section = cropperData[sectionKey]

    for (const questionKey of Object.keys(section)) {
      const { pdfData } = cropperData[sectionKey][questionKey]

      for (const pdfDataItem of pdfData) {
        const { page, x1, y1, x2, y2 } = pdfDataItem
        const x = Math.min(x1, x2) * scale
        const y = Math.min(y1, y2) * scale
        const w = Math.abs(x2 - x1) * scale
        const h = Math.abs(y2 - y1) * scale

        processedData[page] ??= []

        processedData[page].push({
          pdfData: { page, x, y, w, h },
          section: sectionKey,
          question: parseInt(questionKey),
        })
      }
    }
  }

  return processedData
}

async function loadPdfFile() {
  try {
    if (!testState.value.pdfFile) return

    await mupdfWorker.loadPdf(testState.value.pdfFile)

    generateQuestionImages()
  }
  catch (err) {
    console.error('Error loading PDF:', err)
  }
}

async function generateQuestionImages() {
  let cropperData: CropperSectionsData
  const ogData = cropperSectionsData.value
  try {
    cropperData = isReactive(ogData)
      ? structuredClone(toRaw(ogData))
      : structuredClone(toValue(ogData))
  }
  catch {
    try {
      cropperData = JSON.parse(JSON.stringify(ogData))
    }
    catch {
      cropperData = ogData
    }
  }

  const processedCropperData = processCropperData(cropperData)
  const scale = pdfState.scale

  const questionsBlobs = await mupdfWorker.generateQuestionImages(
    processedCropperData,
    scale,
  )

  mupdfWorker.close()

  for (const [section, sectionData] of Object.entries(questionsBlobs)) {
    testSectionsImgUrls.value[section] = {}

    for (const [question, blobs] of Object.entries(sectionData)) {
      testSectionsImgUrls.value[section][question] ??= []

      for (const blob of blobs) {
        const url = URL.createObjectURL(blob)
        testSectionsImgUrls.value[section][question].push(url)
      }
    }
  }

  testState.value.pdfFile = null
  testState.value.currentProcess = 'test-is-ready'
}

onMounted(() => {
  const dpr = window.devicePixelRatio || 1
  pdfState.scale = props.questionImgScale * dpr
  loadPdfFile()
})
</script>
