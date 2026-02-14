<script lang="ts" setup>
import '#layers/shared/app/assets/css/cbt-maker.css'
import {
  cropperOverlayDatasKey,
  downloadDataKey,
  instructionsDataKey,
  outputZipFileNameKey,
  overlaysPerQuestionDataKey,
  pagesImgDataKey,
  testConfigKey,
} from '#layers/shared/app/components/Cbt/Maker/keys'

useSeoMeta({
  title: 'Test Maker - PDF2CBT',
})

const pdfCropperPanelElem = useTemplateRef('pdfCropperPanel')

const migrateJsonData = useMigrateJsonData()

const jsonOutputData = shallowRef<CbtMakerJsonOutput>(
  migrateJsonData.getPdfCropperJsonOutputTemplate(),
)

const instructionsData = reactive<CbtMakerInternalInstructionsData>({
  testInstructions: {
    type: 'default',
    pages: [],
    declaration: '',
  },
  additionalData: {},
})

const pdfLoadingState = shallowReactive({
  isLoading: false,
  isLoaded: false,
})

const pagesImgData = reactive<PagesImgData>({})

const currentStep = shallowRef<number>(1)

const pdfFile = shallowRef<Uint8Array | null>(null)

const testConfig = reactive<PdfCropperJsonOutput['testConfig']>({
  pdfFileHash: '', // SHA-256 hash of pdf file
  additionalData: {},
})

// reactive Map of overlay datas keyed by id
// id = (section || subject) + SEPARATOR + queNum + SEPARATOR + imgNum
const cropperOverlayDatas = ref(new Map<string, PdfCroppedOverlayInternalData>())

// count of overlays per question using queId as key
const overlaysPerQuestionData = reactive<PdfCropperOverlaysPerQuestion>(new Map())

const outputZipFileName = shallowRef('pdf2cbt_cropperdata')

const dialogsState = shallowReactive({
  showEditExistingFiles: false,
  showGenerateOutput: false,
})

async function handlePdfFileUpload(file: File | Uint8Array) {
  pdfLoadingState.isLoading = true
  testConfig.pdfFileHash = ''
  testConfig.additionalData = {}

  try {
    if (file instanceof File) {
      const filenameParts = file.name.split('.')
      filenameParts.pop()
      const filename = filenameParts.join('.')
      outputZipFileName.value = filename

      pdfFile.value = new Uint8Array(await file.arrayBuffer())
    }
    else {
      pdfFile.value = file
    }

    await nextTick()

    return pdfCropperPanelElem.value?.loadPdfFile()
  }
  catch (err) {
    useErrorToast('Error loading uploaded file:', err)
    return err
  }
}

async function loadExistingData(
  data: {
    pdfBuffer: Uint8Array
    jsonData: PdfCropperJsonOutput | AnswerKeyJsonOutputBasedOnPdfCropper
    filename: string
  },
) {
  try {
    if (!pdfCropperPanelElem.value)
      throw new Error('Pdf Cropper Panel Ref is undefined')

    const maybeErr = await handlePdfFileUpload(data.pdfBuffer)
    if (maybeErr instanceof Error) {
      throw maybeErr
    }

    jsonOutputData.value = data.jsonData

    const { pdfFileHash, additionalData, testInstructions } = data.jsonData.testConfig ?? {}
    testConfig.pdfFileHash = pdfFileHash || ''

    if (testInstructions?.type) {
      instructionsData.testInstructions.type = testInstructions.type
    }

    for (const [subject, subjectData] of Object.entries(additionalData || {})) {
      for (const [section, sectionData] of Object.entries(subjectData.sections)) {
        if (sectionData.optionalQuestions || sectionData.instructions?.type) {
          instructionsData.additionalData[subject] = { sections: {} }

          instructionsData.additionalData[subject].sections[section] = {
            optionalQuestions: sectionData.optionalQuestions || 0,
            instructions: {
              type: sectionData.instructions?.type || 'none',
            },
          }
        }
      }
    }

    utilPdfCropperDataToInternalData(
      data.jsonData.pdfCropperData,
      pagesImgData,
      cropperOverlayDatas.value,
      overlaysPerQuestionData,
    )
    outputZipFileName.value = data.filename

    pdfLoadingState.isLoaded = true
  }
  catch (err) {
    useErrorToast('Error loading JSON Data of Existing files', err)
  }
}

const downloadData = computed(() => {
  return {
    pdfFile: pdfFile.value,
    jsonOutputData: jsonOutputData.value,
  }
})

provide(outputZipFileNameKey, outputZipFileName)
provide(downloadDataKey, downloadData)
provide(testConfigKey, testConfig)
provide(pagesImgDataKey, pagesImgData)
provide(cropperOverlayDatasKey, cropperOverlayDatas)
provide(overlaysPerQuestionDataKey, overlaysPerQuestionData)
provide(instructionsDataKey, instructionsData)
</script>

<template>
  <div class="flex flex-col grow min-h-0">
    <CbtMakerPdfCropper
      v-show="currentStep === 1"
      ref="pdfCropperPanel"
      v-model:current-step="currentStep"
      v-model:pdf-loading-state="pdfLoadingState"
      v-model:cropper-overlay-datas="cropperOverlayDatas"
      v-model:overlays-per-question-data="overlaysPerQuestionData"
      v-model:page-img-data="pagesImgData"
      :pdf-file="pdfFile"
    >
      <div class="flex flex-col gap-6 justify-center py-6 h-full">
        <div class="flex gap-5 items-center justify-center">
          <BaseSimpleFileUpload
            accept="application/pdf,.pdf"
            :label="pdfLoadingState.isLoading ? 'Please wait, loading PDF...' : 'Select a PDF'"
            :icon-name="pdfLoadingState.isLoading ? 'line-md:loading-twotone-loop' : 'line-md:plus'"
            invalid-file-type-message="Please select a valid PDF."
            @upload="handlePdfFileUpload"
          />
          <BaseButton
            label="Load Existing Data"
            variant="warn"
            @click="dialogsState.showEditExistingFiles = true"
          />
        </div>
        <DocsCbtMaker class="mx-4 sm:mx-10" />
      </div>
    </CbtMakerPdfCropper>
    <LazyCbtMakerPostCropper
      v-if="pdfLoadingState.isLoaded"
      v-show="currentStep !== 1"
      v-model="currentStep"
    />
    <LazyCbtMakerPdfCropperEditExistingFilesDialog
      v-if="dialogsState.showEditExistingFiles"
      v-model="dialogsState.showEditExistingFiles"
      @uploaded-data="loadExistingData"
    />
  </div>
</template>
