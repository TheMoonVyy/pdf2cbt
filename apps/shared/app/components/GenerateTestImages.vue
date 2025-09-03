<template>
  <div class="hidden" />
</template>

<script lang="ts" setup>
import * as Comlink from 'comlink'
import mupdfWorkerFile from '#layers/shared/app/src/worker/mupdf.worker?worker'
import type { MuPdfProcessor } from '#layers/shared/app/src/worker/mupdf.worker'

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
    section: string
    question: number | string
  }[]
}

const props = defineProps<{
  pdfUint8Array: Uint8Array | null
  questionImgScale: number
  useDevicePixelRatio?: boolean
  cropperSectionsData: CropperSectionsData
}>()

const emit = defineEmits<{
  imageBlobsGenerated: [testImageBlobs: TestImageBlobs]
  currentQuestionProgress: [questionNum: number]
}>()

const mupdfOgWorker = new mupdfWorkerFile()
const mupdfWorker = Comlink.wrap<MuPdfProcessor>(mupdfOgWorker)

const pdfState = {
  scale: props.questionImgScale,
}

mupdfOgWorker.onmessage = (e) => {
  if (e.data.type === 'progress') {
    emit('currentQuestionProgress', e.data.value)
  }
}

function processCropperData(
  cropperData: CropperSectionsData,
): ProcessedCropperData {
  const processedData: ProcessedCropperData = {}
  const scale = pdfState.scale

  for (const sectionKey of Object.keys(cropperData)) {
    const section = cropperData[sectionKey]!

    for (const questionKey of Object.keys(section)) {
      const { pdfData } = cropperData[sectionKey]![questionKey]!

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
    if (!props.pdfUint8Array) return
    const _isBuildForWebsite = useRuntimeConfig().public.isBuildForWebsite as string | boolean
    const preferLoadingLocalMupdfScript = _isBuildForWebsite !== 'true' && _isBuildForWebsite !== true
    await mupdfWorker.loadPdf(props.pdfUint8Array, preferLoadingLocalMupdfScript)

    generateQuestionImages()
  }
  catch (err) {
    useErrorToast('Error Generating Images from PDF:', err)
  }
}

async function generateQuestionImages() {
  const cropperData = utilCloneJson(props.cropperSectionsData)

  const processedCropperData = processCropperData(cropperData)
  const scale = pdfState.scale

  const questionsBlobs = await mupdfWorker.generateQuestionImages(
    processedCropperData,
    scale,
    true,
  )

  mupdfWorker.close()

  emit('imageBlobsGenerated', questionsBlobs)
}

onBeforeUnmount(() => {
  try {
    mupdfWorker.close()
  }
  catch {
    // worker is already closed
  }
})

onMounted(() => {
  const dpr = props.useDevicePixelRatio ? (window.devicePixelRatio || 1) : 1
  pdfState.scale = props.questionImgScale * dpr
  loadPdfFile()
})
</script>
