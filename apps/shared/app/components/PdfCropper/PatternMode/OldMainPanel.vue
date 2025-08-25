<template>
  <div class="flex justify-center items-center gap-8 mt-10">
    <BaseSimpleFileUpload
      accept="application/json,.json"
      label="Select Config"
      invalid-file-type-message="Please select a valid JSON file that was exported from this page."
      icon-name="line-md:cog-filled"
      @upload="handleFileUpload"
    />
    <BaseButton
      label="Download PDF Data"
      variant="warn"
      icon-name="prime:download"
      :disabled="!props.pdfPagesPatternModeData"
      @click="downloadExtractedPdfData"
    />
  </div>
</template>

<script lang="ts" setup>
import patternBasedCropperWorker from '#layers/shared/app/src/worker/text-pattern-based-crop.worker?worker'
import type { PatternBasedCropFn } from '#layers/shared/app/src/worker/text-pattern-based-crop.worker'
import {
  getPatternModeConfigSchema,
  type PatternModeParsedConfig,
  type PatternModeConfigJson,
} from '#layers/shared/shared/schema/pdf-cropper-pattern-mode'
import { wrap as comlinkWrap } from 'comlink'

type OptionalQuestions = NonNullable<PdfCropperJsonOutput['testConfig']['optionalQuestions']>

const props = defineProps<{
  totalPages: number
  pageImgData: PageImgData
  pdfPagesPatternModeData: PdfPagesPatternModeData | null
}>()

const emit = defineEmits<{
  loadPdfPatternModeData: [pageNums: number[], settings: PatternModeParsedConfig['settings']]
}>()

const cropperOverlayDatas = defineModel<Map<string, PdfCroppedOverlayData>>({ required: true })

const overlaysPerQuestionData = defineModel<Map<string, number>>('overlaysPerQuestionData', { required: true })

const optionalQuestions = defineModel<OptionalQuestions>('optionalQuestions', { required: true })

let patternBasedCrop: ReturnType<typeof comlinkWrap<PatternBasedCropFn>> | null = null

const initWorker = () => {
  patternBasedCrop = comlinkWrap<PatternBasedCropFn>(new patternBasedCropperWorker())
}

let parsedConfig: PatternModeParsedConfig | null = null

onMounted(initWorker)

const state = {
  config: null as null | PatternModeConfigJson,
}

const downloadExtractedPdfData = () => {
  if (props.pdfPagesPatternModeData)
    utilSaveFile('pdf_data.json', new Blob([JSON.stringify(props.pdfPagesPatternModeData, null, 2)]))
}

const pdfTextDataWatcherHandle = watch(
  () => props.pdfPagesPatternModeData,
  () => parsedConfig?.subjects ? runCropper(parsedConfig?.subjects) : null,
)

pdfTextDataWatcherHandle.pause()

async function handleFileUpload(file: File) {
  state.config = await utilParseJsonFile(file) as PatternModeConfigJson

  // const pageNums = getPdfPageNumsToSearchIn(state.config.subjects)
  validateConfigAndRunCropper()
  if (parsedConfig) {
    const pageNums = [...parsedConfig.subjects[0]!.start.searchIn.pages]
      .sort((a, b) => a - b)
    emit('loadPdfPatternModeData', pageNums, parsedConfig.settings)
  }
}

function validateConfigAndRunCropper() {
  if (!state.config) return

  const configSchema = getPatternModeConfigSchema(props.totalPages)
  const result = configSchema.safeParse(utilCloneJson(state.config))

  if (result.success) {
    pdfTextDataWatcherHandle.resume()
    parsedConfig = result.data
  }
  else {
    console.error(result.error)
  }
}

async function runCropper(subjectsConfig: PatternModeParsedConfig['subjects']) {
  if (!state.config || !props.pdfPagesPatternModeData) return
  if (!patternBasedCrop) initWorker()
  if (!patternBasedCrop) return

  pdfTextDataWatcherHandle.pause()

  const { pageImgData, pdfPagesPatternModeData } = props

  const newOverlays = await patternBasedCrop(subjectsConfig, utilCloneJson(pdfPagesPatternModeData), utilCloneJson(pageImgData))
  optionalQuestions.value = []
  const overlays = cropperOverlayDatas.value
  const overlaysCount = overlaysPerQuestionData.value
  overlaysCount.clear()
  overlays.clear()

  for (const overlay of newOverlays.values()) {
    const { id, queId } = overlay
    overlays.set(id, overlay)

    const count = (overlaysCount.get(queId) || 0) + 1
    overlaysCount.set(queId, count)
  }

  for (const [subjectName, subjectConf] of Object.entries(subjectsConfig)) {
    for (const [sectionName, sectionConf] of Object.entries(subjectConf.sections)) {
      const optQues = sectionConf.questions.optionalQuestionsCount
      if (optQues) {
        optionalQuestions.value.push({
          subject: subjectName,
          section: sectionName,
          count: optQues,
        })
      }
    }
  }
}

// function getPdfPageNumsToSearchIn(
//   configData: PatternModeConfigJson['subjects'],
//   totalPages: number = props.totalPages,
// ) {
//   let pageNums = new Set<number>()

//   for (const subjectConfig of Object.values(configData)) {
//     if (pageNums.size === totalPages)
//       break

//     const subjectPages = utilParsePdfPageNumbers(subjectConfig.searchIn.pages, totalPages)
//     pageNums = new Set([...pageNums, ...subjectPages])

//     if ('sections' in subjectConfig) {
//       for (const sectionConfig of Object.values(subjectConfig.sections)) {
//         if (pageNums.size === totalPages)
//           break

//         const sectionPages = utilParsePdfPageNumbers(sectionConfig.searchIn.pages, totalPages)
//         pageNums = new Set([...pageNums, ...sectionPages])

//         if (pageNums.size === totalPages)
//           break

//         const questionPages = utilParsePdfPageNumbers(sectionConfig.questions.pagesToSearchIn, totalPages)
//         pageNums = new Set([...pageNums, ...questionPages])
//       }
//     }
//     else if (pageNums.size !== totalPages) {
//       const questionPages = utilParsePdfPageNumbers(subjectConfig.questions.pagesToSearchIn, totalPages)
//       pageNums = new Set([...pageNums, ...questionPages])
//     }
//   }

//   return [...pageNums].sort((a, b) => a - b)
// }
</script>
