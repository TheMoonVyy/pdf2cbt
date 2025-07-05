<template>
  <div class="flex flex-col grow min-h-0">
    <PdfCropperSettingsDrawer
      v-model:advance-settings-visible="visibilityState.advanceSettings"
    />
    <UiResizablePanelGroup
      direction="horizontal"
      auto-save-id="pdf-cropper-resizable-key"
      class="rounded border border-t-0 grow"
    >
      <UiResizablePanel
        :default-size="26"
        :collapsible="false"
        :min-size="15"
      >
        <UiScrollArea
          class="h-full w-full rounded-md border"
        >
          <div class="flex flex-col items-center">
            <div class="flex flex-col items-center p-4 pb-0 gap-5 w-full">
              <div class="flex flex-wrap gap-8">
                <div class="flex items-center justify-center">
                  <BaseButton
                    variant="help"
                    label="Settings"
                    icon-name="line-md:cog-filled"
                    icon-size="1.2rem"
                    @click="visibilityState.advanceSettings = true"
                  />
                </div>
                <UiTabs
                  v-model="currentMode"
                >
                  <UiTabsList class="grid w-full grid-cols-2 h-10 px-1 gap-0.5">
                    <UiTabsTrigger
                      v-for="option in currentModeSelectOptions"
                      :key="option.value"
                      class="cursor-pointer py-1.5"
                      :value="option.value"
                      :disabled="option.disable || !isPdfLoaded"
                    >
                      {{ option.name }}
                    </UiTabsTrigger>
                  </UiTabsList>
                </UiTabs>
              </div>
              <div class="flex flex-wrap gap-x-2 gap-y-3">
                <BaseFloatLabel
                  class="flex-[1_1_48%] min-w-[45%]"
                  label="Cropper Mode"
                  label-id="cropperModeDD"
                  label-class="text-xs start-1/2! -translate-x-1/2"
                >
                  <BaseSelect
                    id="pre_generate_images"
                    v-model="settings.general.cropperMode"
                    :options="selectOptions.cropperMode"
                    :disabled="currentMode !== 'crop'"
                  />
                </BaseFloatLabel>
                <BaseFloatLabel
                  class="flex-[1_1_48%] min-w-[45%]"
                  label="Zoom"
                  label-id="settings_scale"
                  label-class="text-xs start-1/2! -translate-x-1/2"
                >
                  <BaseInputNumber
                    id="settings_scale"
                    v-model="settings.general.scale"
                    :disabled="!isPdfLoaded"
                    :min="0.3"
                    :max="2.5"
                    :step="0.1"
                  />
                </BaseFloatLabel>
              </div>
              <BaseFloatLabel
                class="w-full"
                label="Page Number"
                label-id="pdf_page_num"
                label-class="start-1/2! -translate-x-1/2"
              >
                <BaseInputNumber
                  id="pdf_page_num"
                  v-model="pdfState.currentPageNum"
                  input-class="h-10 text-base"
                  :disabled="pdfState.currentPageNum === 0 || !isPdfLoaded"
                  :min="1"
                  :max="pdfState.totalPages"
                />
              </BaseFloatLabel>
            </div>
            <BaseButton
              class="my-3.5 shrink-0"
              icon-name="mdi:rocket-launch"
              label="Generate Output"
              :disabled="!hasQuestionsData"
              @click="() => {
                generateOutputState.downloaded = false
                visibilityState.generateOutputDialog = true
              }"
            />
            <PdfCropperQuestionDetailsPanel
              v-model="currentQuestionData"
              :overlays-per-question-data="overlaysPerQuestionData"
              :is-current-question-main-overlay="!activeCropperOverlayId"
              :is-pdf-loaded="isPdfLoaded"
              :overlay-datas="cropperOverlayDatas"
              :page-width="currentPageDetails.width"
              :page-height="currentPageDetails.height"
            />
          </div>
        </UiScrollArea>
      </UiResizablePanel>
      <UiResizableHandle />
      <UiResizablePanel
        :default-size="74"
        :min-size="40"
        :collapsible="false"
      >
        <UiScrollArea
          class="w-full h-full rounded border"
          type="auto"
        >
          <div class="flex flex-col focus-visible:outline-hidden">
            <div
              v-if="!isPdfLoaded"
              class="flex flex-col gap-6 justify-center mt-6"
            >
              <BaseSimpleFileUpload
                class="mx-auto"
                accept="application/pdf,application/zip,.pdf,.zip"
                :label="visibilityState.isLoadingPdf ? 'Please wait, loading PDF...' : 'Select a PDF'"
                :icon-name="visibilityState.isLoadingPdf ? 'line-md:loading-twotone-loop' : 'line-md:plus'"
                invalid-file-type-message="Invalid file. Please select a valid PDF"
                @upload="handleFileUpload"
              />
              <DocsPdfCropper class="mx-4 sm:mx-10 select-text" />
            </div>
            <div
              ref="mainImgPanelElem"
              class="flex"
              tabindex="-1"
              :class="{ hidden: !isPdfLoaded }"
            >
              <div
                class="relative mx-auto cursor-cell mt-4"
                :class="{
                  'blur-cropped': settings.general.blurCroppedRegion,
                }"
                :style="{
                  '--pdf-page-width': currentPageDetails.width,
                  '--pdf-page-height': currentPageDetails.height,
                  '--pdf-page-scale': zoomScaleDebounced,
                  '--pdf-cropped-blur-intensity': settings.general.blurIntensity,
                  '--crop-selection-guide-color': settings.general.cropSelectionGuideColor,
                  '--crop-selected-region-color': settings.general.cropSelectedRegionColor,
                  '--crop-selection-skip-color': settings.general.cropSelectionSkipColor,
                  '--crop-selection-bg-opacity': settings.general.cropSelectionBgOpacity,
                  '--crop-selected-region-bg-opacity': settings.general.cropSelectedRegionBgOpacity,
                }"
              >
                <div class="inline-block">
                  <img
                    :src="currentPageDetails.url"
                    class="border border-gray-500 pdf-cropper-img"
                    draggable="false"
                    :style="{
                      backgroundColor: settings.general.pageBGColor,
                    }"
                  >
                </div>
                <PdfCropperEditCroppedOverlay
                  v-if="isPdfLoaded"
                  v-model="cropperOverlayDatas"
                  v-model:overlays-per-question-data="overlaysPerQuestionData"
                  v-model:active-overlay-id="activeCropperOverlayId"
                  :main-img-panel-elem="mainImgPanelElem"
                  :current-mode="currentMode"
                  :current-page-num="pdfState.currentThrottledPageNum"
                  :page-scale="zoomScaleDebounced"
                  :page-width="currentPageDetails.width"
                  :page-height="currentPageDetails.height"
                  @set-pdf-data="storeCurrentQuestionData"
                />
                <PdfCropperCropOverlay
                  v-if="isPdfLoaded"
                  v-model:current-overlay-data="mainOverlayData"
                  :main-img-panel-elem="mainImgPanelElem"
                  :cropper-mode="cropperMode"
                  :current-mode="currentMode"
                  :current-page-num="pdfState.currentThrottledPageNum"
                  :page-scale="zoomScaleDebounced"
                  :page-width="currentPageDetails.width"
                  :page-height="currentPageDetails.height"
                  @set-pdf-data="storeCurrentQuestionData"
                />
              </div>
            </div>
          </div>
        </UiScrollArea>
      </UiResizablePanel>
    </UiResizablePanelGroup>
    <UiDialog
      v-model:open="visibilityState.questionDetailsDialog"
    >
      <UiDialogContent>
        <UiDialogHeader>
          <UiDialogTitle class="mx-auto">
            Invalid Question Details
          </UiDialogTitle>
        </UiDialogHeader>
        <p class="text-center text-lg mb-2">
          Some question details are missing.<br>
          Make sure all required fields are filled out.
        </p>
        <div class="flex justify-center my-3">
          <BaseButton
            label="Okay"
            @click="visibilityState.questionDetailsDialog = false"
          />
        </div>
      </UiDialogContent>
    </UiDialog>
    <UiDialog
      v-model:open="visibilityState.generateOutputDialog"
    >
      <UiDialogContent class="max-w-full sm:max-w-md px-0">
        <UiDialogHeader class="mb-4">
          <UiDialogTitle class="text-xl font-bold text-center">
            Generate Test (Cropper) Data
          </UiDialogTitle>
        </UiDialogHeader>
        <UiScrollArea class="max-h-128 w-full px-6">
          <div class="grid grid-cols-7 w-full gap-2">
            <div class="flex flex-col col-span-4 gap-1">
              <UiLabel
                for="generate_output_filename"
              >
                File Name
              </UiLabel>
              <UiInput
                id="generate_output_filename"
                v-model.trim="generateOutputState.filename"
                class="md:text-base h-10"
                type="text"
                :maxlength="50"
              />
            </div>
            <div class="flex flex-col gap-1 col-span-3">
              <div class="flex gap-2 justify-center">
                <UiLabel
                  for="generate_output_file_type"
                >
                  File Type
                </UiLabel>
                <IconWithTooltip
                  :tooltip-content="tooltipContent.outputFileType"
                  icon-class="text-xl"
                />
              </div>
              <BaseSelect
                id="generate_output_file_type"
                v-model="generateOutputState.fileType"
                :options="selectOptions.outputFileType"
                size="base"
              />
            </div>
          </div>
          <div
            v-show="generateOutputState.fileType === '.zip'"
            class="grid grid-cols-3 gap-2 my-6"
          >
            <div class="flex flex-col col-span-2 gap-1">
              <div class="flex gap-2 justify-center">
                <UiLabel
                  for="pre_generate_images"
                >
                  Pre-Generate Images
                </UiLabel>
                <IconWithTooltip
                  :tooltip-content="tooltipContent.preGenerateImages"
                  icon-class="text-xl"
                />
              </div>
              <BaseSelect
                id="pre_generate_images"
                v-model="generateOutputState.preGenerateImages"
                :options="selectOptions.preGenerateImages"
              />
            </div>
            <div class="flex flex-col justify-center gap-1">
              <div class="flex gap-2 justify-center">
                <UiLabel
                  for="pre_generate_image_scale"
                >
                  Img Scale
                </UiLabel>
                <IconWithTooltip
                  :tooltip-content="tooltipContent.preGenerateImagesScale"
                  icon-class="text-xl"
                />
              </div>
              <BaseInputNumber
                id="pre_generate_image_scale"
                v-model="generateOutputState.preGenerateImagesScale"
                :disabled="!generateOutputState.preGenerateImages"
                :min="0.5"
                :max="5"
                :step="0.1"
              />
            </div>
          </div>
          <div
            v-show="!generateOutputState.generatingImages"
            class="flex justify-center my-5"
          >
            <BaseButton
              label="Generate & Download"
              @click="generatePdfCropperOutput()"
            />
          </div>
          <div class="flex flex-col items-center mb-2 text-center">
            <h3
              v-show="generateOutputState.generatingImages"
              class="font-semibold"
            >
              Please wait, generating images...<br>
            </h3>
            <h3
              v-if="generateOutputState.generatingImages && generateOutputState.generationProgress > 0"
              class="my-4 text-lg font-semibold text-cyan-400"
            >
              Currently generating {{ generateOutputState.generationProgress }} of {{ generateOutputState.totalQuestions }} questions...<br>
            </h3>
            <h3
              v-show="generateOutputState.generatingImages"
              class="mt-2"
            >
              If generating progress is stuck,
              then click on cancel below and try again with a lower img scale value<br><br>
              If even with a lower scale value,
              it is stuck then cancel again and just download without pre generated images
              (i.e. select "No" above)<br><br>
            </h3>
            <h3 v-show="generateOutputState.preparingDownload">
              preparing download...
            </h3>
            <h3 v-show="generateOutputState.downloaded">
              Downloaded!
            </h3>
          </div>
          <div
            v-show="generateOutputState.generatingImages"
            class="flex justify-center mb-3"
          >
            <BaseButton
              variant="warn"
              label="Cancel Generation"
              @click="() => {
                generateOutputState.generatingImages = false
                generateOutputState.totalQuestions = 0
              }"
            />
          </div>
          <UiAccordion
            type="multiple"
            :default-value="[]"
            :unmount-on-hide="false"
            class="w-full"
          >
            <UiAccordionItem value="1">
              <UiAccordionTrigger>
                Multiple Downloads
              </UiAccordionTrigger>
              <UiAccordionContent>
                <h5 class="text-center text-wrap text-gray-500 dark:text-gray-300 mt-4">
                  After downloading once,
                  you can always change the options above to generate &amp; download again with those options
                </h5>
              </UiAccordionContent>
            </UiAccordionItem>
            <UiAccordionItem value="2">
              <UiAccordionTrigger>
                Important NOTE
              </UiAccordionTrigger>
              <UiAccordionContent>
                <h5 class="text-center text-wrap text-gray-500 dark:text-gray-300 my-5">
                  If you want to later on use the zip file via <strong>"zip from url"</strong> feature
                  and you are keeping the <strong>zip files</strong> in your <strong>github public repository</strong>
                  then your <strong>zip file size should not exceed 20MB</strong> for "zip from url" to work.<br>
                  (This is a limitation imposed by jsDelivr,
                  which is the provider from where your zip file will be loaded after the website internally
                  converts github url to jsDelivr url).
                </h5>
              </UiAccordionContent>
            </UiAccordionItem>
          </UiAccordion>
        </UiScrollArea>
      </UiDialogContent>
    </UiDialog>
    <LazyGenerateTestImages
      v-if="generateOutputState.generatingImages && (generateOutputState.totalQuestions > 0)"
      :pdf-uint8-array="pdfState.fileUint8Array"
      :question-img-scale="generateOutputState.preGenerateImagesScale"
      :cropper-sections-data="cropperSectionsDataForPreGenerateImages"
      @current-question-progress="(questionNum) => generateOutputState.generationProgress = questionNum"
      @image-blobs-generated="addImageBlobsToZipAndDownload"
    />
  </div>
</template>

<script setup lang="ts">
import 'assets/css/pdf-cropper.css'
import * as Comlink from 'comlink'
import { zip, strToU8, type AsyncZippable } from 'fflate'
import mupdfWorkerFile from '@/src/worker/mupdf.worker?worker'
import type { MuPdfProcessor } from '@/src/worker/mupdf.worker'
import { SEPARATOR } from '#shared/constants'
import { DataFileNames } from '#shared/enums'

type CropperMode = {
  isBox: boolean
  isLine: boolean
}

type PageImgData = {
  [pageNum: number]: {
    width: number
    height: number
    url: string
    pageScale: number
  }
}

type PdfCropperJsonData = {
  pdfCropperData: CropperOutputData
  pdfFileHash: string
}

const selectOptions = {
  cropperMode: [
    { name: 'Line', value: 'line' },
    { name: 'Box', value: 'box' },
  ],
  outputFileType: ['.zip', '.json'],
  preGenerateImages: [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ],
}

const tooltipContent = {
  outputFileType:
    '".zip" → Includes the JSON and PDF/Image files.\n'
    + '(Recommended to keep files together in one archive).\n\n'
    + '".json" → Downloads only the JSON file.',

  preGenerateImages:
    '"Yes" → Pre-Generates Question Images from PDF now itself to store in zip as png files, this will skip the image generation steps in test interface and results page\'s question preview as images in the zip will be used (Recommended).\n'
    + 'Size of zip file will depend on pdf, questions area and image quality scale. Generally, size of this will be less than the PDF file size.\n\n'
    + '"No" → Zip will contain pdf instead of png. Generates Question Images from PDF when needed in test interface and results page\'s question preview.\n'
    + 'Size of zip file will be almost equal to PDF File size.',

  preGenerateImagesScale:
    'Scale/Quality of the generated images, higher the scale, better the quality but takes more resources.\n'
    + 'This doesn\'t take Device Pixel Ratio into account, so if you are using a very high DPI screen, then you can set this to a greater value.',
}

const generateOutputState = shallowReactive({
  filename: 'pdf2cbt_cropperdata',
  fileType: '.zip',
  preGenerateImages: true,
  preGenerateImagesScale: 2,
  generatingImages: false,
  generationProgress: 0,
  isUploadedFileZipFile: false,
  totalQuestions: 0,
  preparingDownload: false,
  downloaded: false,
})

const outputFilesToZip = shallowRef<AsyncZippable>({})

const userUploadedCropperDataJson = shallowRef<PdfCropperJsonData | null>(null)

const cropperSectionsDataForPreGenerateImages = shallowRef<CropperSectionsData>({})

const { pixelRatio: devicePixelRatio, stop: stopUseDPR } = useDevicePixelRatio()

let mupdfWorker: Comlink.Remote<MuPdfProcessor> | null = null

const mainImgPanelElem = useTemplateRef('mainImgPanelElem')

const pdfState = shallowReactive({
  currentPageNum: 0,
  currentThrottledPageNum: 0,
  totalPages: 0,
  fileUint8Array: null as Uint8Array | null,
})

const currentMode = shallowRef<'crop' | 'edit'>('crop')

const isPdfLoaded = shallowRef(false)

// to store SHA-256 hash of pdf file,
// which will be included in generated output file
let pdfFileHash = ''

const settings = usePdfCropperLocalStorageSettings()

const visibilityState = shallowReactive({
  isLoadingPdf: false,
  advanceSettings: false,
  questionDetailsDialog: false,
  generateOutputDialog: false,
})

const mupdfScripturls = useGetMupdfScriptUrls()

const pageImgData = reactive<PageImgData>({})

// reactive Map of overlay datas keyed by id
const cropperOverlayDatas = reactive(new Map<string, PdfCroppedOverlayData>())

const currentModeSelectOptions = reactive([
  { name: 'Crop', value: 'crop', disable: false },
  { name: 'Edit', value: 'edit', disable: computed(() => cropperOverlayDatas.size === 0) },
])

const activeCropperOverlayId = shallowRef('')

const mainOverlayData = reactive<PdfCroppedOverlayData>({
  id: '',
  queId: '',
  imgNum: 1,
  subject: '',
  section: '',
  que: 1,
  type: 'mcq',
  options: 4,
  marks: {
    cm: 4,
    pm: 1,
    im: -1,
  },
  pdfData: { l: 0, r: 0, t: 0, b: 0, page: 1 },
})

const overlaysPerQuestionData = reactive<PdfCropperOverlaysPerQuestion>(new Map())

const savedMarkingScheme: {
  [questionType in QuestionType]?: {
    cm: number
    pm: number
    im: number
  }
} = {}

watch(
  () => mainOverlayData.type,
  (newQuestionType, oldQuestionType) => {
    const { cm, pm, im } = mainOverlayData.marks

    savedMarkingScheme[oldQuestionType] = {
      cm,
      pm,
      im,
    }

    const newMarkingScheme = savedMarkingScheme[newQuestionType]
    if (newMarkingScheme) {
      const { cm, pm, im } = newMarkingScheme
      mainOverlayData.marks.cm = cm
      mainOverlayData.marks.pm = pm
      mainOverlayData.marks.im = im
    }
  },
)

const zoomScaleDebounced = shallowRef(settings.value.general.scale)

const currentQuestionData = computed<PdfCroppedOverlayData>(() => {
  const id = activeCropperOverlayId.value
  if (id) {
    const overlayData = cropperOverlayDatas.get(id)
    if (overlayData) {
      return overlayData
    }
  }
  return mainOverlayData
})

const storeOverlayData = (
  oldOverlay: PdfCroppedOverlayData,
  newQueId: string,
  pdfData: PdfCroppedOverlayData['pdfData'] | null = null,
) => {
  const existingFirstOverlay = cropperOverlayDatas.get(newQueId + SEPARATOR + '1')
  const existingQuestionImgCount = overlaysPerQuestionData.get(newQueId)

  let newOverlay: PdfCroppedOverlayData | null = null
  let newId = ''
  let newImgNum = 1
  if (existingFirstOverlay && existingQuestionImgCount) {
    newImgNum = existingQuestionImgCount + 1
    const { que, subject, section } = oldOverlay

    newId = newQueId + SEPARATOR + newImgNum

    newOverlay = {
      id: newId,
      queId: newQueId,
      que,
      subject,
      section,
      imgNum: newImgNum,
      type: existingFirstOverlay.type,
      options: existingFirstOverlay.options,
      marks: {
        ...existingFirstOverlay.marks,
      },
      pdfData: oldOverlay.pdfData,
    }
  }
  else {
    newOverlay = utilCloneJson(oldOverlay)
    newId = newQueId + SEPARATOR + '1'
    newOverlay.id = newId
    newOverlay.queId = newQueId
    newOverlay.imgNum = 1
  }

  if (pdfData) newOverlay.pdfData = pdfData

  const { l, r, b, t } = newOverlay.pdfData

  newOverlay.pdfData.l = Math.min(l, r)
  newOverlay.pdfData.r = Math.max(l, r)
  newOverlay.pdfData.t = Math.min(t, b)
  newOverlay.pdfData.b = Math.max(t, b)

  cropperOverlayDatas.set(newId, newOverlay)
  overlaysPerQuestionData.set(newQueId, newImgNum)
}

watch(currentQuestionData,
  (newData, oldData) => {
    if (newData.id === oldData.id) return

    const { id, queId: oldQueId, subject, section, que } = oldData
    if (!id) return

    const oldOverlay = cropperOverlayDatas.get(id)
    if (oldOverlay) {
      const newQueId = `${section || subject}${SEPARATOR}${que}`
      if (id.includes(newQueId + SEPARATOR)) {
        const imgNum = oldOverlay.imgNum
        const oldImgCount = overlaysPerQuestionData.get(oldQueId) || 1

        if (imgNum === 1 && oldImgCount > 1) {
          const nextOverlayData = cropperOverlayDatas.get(oldQueId + SEPARATOR + 2)
          if (!nextOverlayData) return

          let isDataChanged = false
          for (const keyData of ['type', 'options'] as const) {
            if (oldOverlay[keyData] !== nextOverlayData[keyData]) {
              isDataChanged = true
              break
            }
          }
          if (!isDataChanged) {
            for (const keyData of ['cm', 'pm', 'im'] as const) {
              if (oldOverlay.marks[keyData] !== nextOverlayData.marks[keyData]) {
                isDataChanged = true
                break
              }
            }
          }
          if (!isDataChanged) return

          const { type, options, marks } = oldOverlay
          for (const newImgNum of utilRange(2, oldImgCount + 1)) {
            const overlay = cropperOverlayDatas.get(oldQueId + SEPARATOR + newImgNum)
            if (!overlay) return

            overlay.type = type
            overlay.options = options
            overlay.marks = { ...marks }
          }
        }

        return
      }
      storeOverlayData(oldOverlay, newQueId)
    }

    // Shift overlays to left to fill the one that was deleted/moved
    // Delete last one since it's now duplicated in the previous one
    // if there is no next overlay to begin with, then deletes the current one that needs to be deleted
    let currentImgNum = oldOverlay?.imgNum || oldData.imgNum
    while (true) {
      const currentId = oldQueId + SEPARATOR + currentImgNum
      const nextId = oldQueId + SEPARATOR + (currentImgNum + 1)

      const nextOverlayData = cropperOverlayDatas.get(nextId)
      if (nextOverlayData) {
        nextOverlayData.id = currentId
        nextOverlayData.imgNum = currentImgNum
        cropperOverlayDatas.set(currentId, nextOverlayData)
      }
      else {
        cropperOverlayDatas.delete(currentId)
        break
      }

      currentImgNum++
    }

    const oldImgCount = overlaysPerQuestionData.get(oldQueId)
    if (typeof oldImgCount === 'number') {
      if (oldImgCount > 1) overlaysPerQuestionData.set(oldQueId, oldImgCount - 1)
      else overlaysPerQuestionData.delete(oldQueId)
    }
  },
  { deep: false, flush: 'pre' },
)

const currentPageDetails = computed(() => {
  const { url = '', width = 0, height = 0 } = pageImgData[pdfState.currentThrottledPageNum] ?? {}
  const zoomScale = zoomScaleDebounced.value

  const data = {
    url,
    width,
    height,
    zoomScale,
  }

  return data
})

/*
  Following computered properties are just boolean values being used frequently
  in conditional statements
*/
const cropperMode = computed<CropperMode>(() => ({
  isBox: settings.value.general.cropperMode === 'box',
  isLine: settings.value.general.cropperMode === 'line',
}))

// Flag for generate ouput btn
const hasQuestionsData = computed<boolean>(() => cropperOverlayDatas.size > 0)

function storeCurrentQuestionData(
  pdfData: PdfCroppedOverlayData['pdfData'] | null = null,
  incrementQuestion: boolean = true,
) {
  const { subject, section, que } = mainOverlayData
  if (!subject) {
    visibilityState.questionDetailsDialog = true
    return
  }

  if (!pdfData) pdfData = { ...mainOverlayData.pdfData }

  const { l, r, b, t } = pdfData

  if ((Math.abs(l - r) < settings.value.general.minCropDimension)
    || (Math.abs(b - t) < settings.value.general.minCropDimension)) {
    return
  }

  const queId = `${section || subject}${SEPARATOR}${que}`
  storeOverlayData(mainOverlayData, queId, pdfData)

  if (incrementQuestion) mainOverlayData.que++
}

const handleFileUpload = async (file: File) => {
  userUploadedCropperDataJson.value = null
  pdfState.fileUint8Array = null
  generateOutputState.isUploadedFileZipFile = false
  visibilityState.isLoadingPdf = true

  await nextTick()

  pdfFileHash = ''
  try {
    const zipCheckStatus = await utilIsZipFile(file)
    if (zipCheckStatus > 0) {
      const unzippedData = await utilUnzipTestDataFile(file, 'pdf-and-json', false)
      if (unzippedData.pdfBuffer && unzippedData.jsonData) {
        pdfState.fileUint8Array = unzippedData.pdfBuffer
        userUploadedCropperDataJson.value = unzippedData.jsonData as PdfCropperJsonData
        pdfFileHash = userUploadedCropperDataJson.value?.pdfFileHash || ''
        visibilityState.isLoadingPdf = false
        generateOutputState.isUploadedFileZipFile = true
        visibilityState.generateOutputDialog = true
      }
    }
    else {
      file.arrayBuffer().then((buffer) => {
        pdfState.fileUint8Array = new Uint8Array(buffer)
        loadPdfFile()
      })
    }
  }
  catch (err) {
    console.error('Error loading uploaded file:', err)
  }
}

async function loadPdfFile(isFirstLoad: boolean = true) {
  try {
    if (!pdfState.fileUint8Array) return
    closeMupdfWorker()
    mupdfWorker = Comlink.wrap<MuPdfProcessor>(new mupdfWorkerFile())

    const pagesCount = await mupdfWorker.loadPdf(pdfState.fileUint8Array, mupdfScripturls, true)
    if (pagesCount && isFirstLoad) {
      pdfState.totalPages = pagesCount
      pdfState.currentPageNum = 1

      await renderPage(pdfState.currentPageNum)
      isPdfLoaded.value = true
    }
  }
  catch (err) {
    console.error('Error loading PDF:', err)
  }
}

async function renderPage(pageNum: number) {
  if (mupdfWorker === null) {
    await loadPdfFile()
  }
  if (!mupdfWorker) return

  try {
    const dpr = devicePixelRatio.value || 1
    const qualityFactor = settings.value.general.qualityFactor

    const pageScale = dpr * qualityFactor

    const maybeExistingPage = pageImgData[pageNum]
    if (!maybeExistingPage || maybeExistingPage.pageScale !== pageScale) {
      if (maybeExistingPage?.url) {
        URL.revokeObjectURL(maybeExistingPage.url)
      }

      const pageData = await mupdfWorker.getPageImage(pageNum, pageScale, true)

      pageImgData[pageNum] = {
        url: URL.createObjectURL(pageData.blob),
        width: pageData.dimensions.w,
        height: pageData.dimensions.h,
        pageScale,
      }
    }
  }
  catch (err) {
    console.error('Error rendering page:', err)
  }
}

function transformDataToOutputFormat(data: Map<string, PdfCroppedOverlayData>) {
  type StructuredOverlayData = {
    [subject: string]: {
      [section: string]: {
        [question: string | number]: {
          [imgNum: string | number]: PdfCroppedOverlayData
        }
      }
    }
  }

  const structuredOverlayData: StructuredOverlayData = {}

  for (const overlayData of data.values()) {
    const { subject, section: rawSection, que, imgNum } = overlayData
    const section = rawSection || subject

    structuredOverlayData[subject] ||= {}
    structuredOverlayData[subject][section] ||= {}
    structuredOverlayData[subject][section][que] ||= {}
    structuredOverlayData[subject][section][que][imgNum] = overlayData
  }

  const subjectsData: CropperOutputData = {}

  for (const [subject, subjectData] of Object.entries(structuredOverlayData)) {
    subjectsData[subject] = {}

    for (const [section, sectionData] of Object.entries(subjectData)) {
      subjectsData[subject][section] = {}

      for (const [question, overlayDatas] of Object.entries(sectionData)) {
        const sortedQuestionOverlays = Object.values(overlayDatas).sort((a, b) => a.imgNum - b.imgNum)

        const pdfData: PdfCropperCoords[] = sortedQuestionOverlays.map((data) => {
          const { l, r, t, b, page } = data.pdfData
          return { x1: l, x2: r, y1: t, y2: b, page }
        })

        const { que, type, options, marks } = sortedQuestionOverlays[0]!
        subjectsData[subject][section][question] = {
          que,
          type: type,
          marks: {
            ...marks,
          },
          pdfData,
        }

        if (type !== 'msq') delete subjectsData[subject][section][question].marks.pm
        if (type === 'msq' || type === 'mcq') {
          subjectsData[subject][section][question].options = options || 4
        }
      }
    }
  }

  const pdfCropperData = subjectsData

  const outputData = {
    pdfCropperData,
    pdfFileHash,
  }

  return outputData
}

async function generatePdfCropperOutput() {
  const pdfU8Array = pdfState.fileUint8Array
  generateOutputState.downloaded = false
  outputFilesToZip.value = {}

  if (!pdfU8Array) return

  const fileType = generateOutputState.fileType
  const preGenerateImages = generateOutputState.preGenerateImages
  const isPreGenerateImagesMode = fileType === '.zip' && preGenerateImages

  if (isPreGenerateImagesMode) {
    generateOutputState.generatingImages = true
    generateOutputState.preparingDownload = false
    generateOutputState.totalQuestions = 0
    generateOutputState.generationProgress = 0
    closeMupdfWorker()
    await nextTick()
  }
  else {
    generateOutputState.preparingDownload = true
    generateOutputState.generatingImages = false
  }

  const filename = generateOutputState.filename + fileType

  if (!pdfFileHash) pdfFileHash = await utilGetHash(pdfU8Array)

  const jsonData = generateOutputState.isUploadedFileZipFile
    ? userUploadedCropperDataJson.value!
    : transformDataToOutputFormat(toRaw(cropperOverlayDatas))

  jsonData.pdfFileHash = pdfFileHash

  const jsonString = JSON.stringify(jsonData, null, 2)

  if (fileType === '.json') {
    const outputBlob = new Blob([jsonString], { type: 'application/json' })
    utilSaveFile(filename, outputBlob)
    generateOutputState.preparingDownload = false
    generateOutputState.downloaded = true
  }
  else {
    const jsonU8Array = strToU8(jsonString)

    outputFilesToZip.value[DataFileNames.DataJson] = [jsonU8Array, { level: 6 }]

    if (isPreGenerateImagesMode) {
      const pdfCropperData = jsonData.pdfCropperData
      const cropperSectionsData: CropperSectionsData = {}

      let totalQuestions = 0
      for (const subjectData of Object.values(pdfCropperData)) {
        for (const [sectionName, sectionData] of Object.entries(subjectData)) {
          cropperSectionsData[sectionName] = sectionData
          totalQuestions += Object.keys(sectionData).length
        }
      }

      cropperSectionsDataForPreGenerateImages.value = cropperSectionsData
      generateOutputState.totalQuestions = totalQuestions
    }
    else {
      outputFilesToZip.value[DataFileNames.QuestionsPdf] = pdfU8Array
      zipAndDownloadOutput()
    }
  }
}

async function zipAndDownloadOutput() {
  const filesToZip = outputFilesToZip.value

  if (Object.keys(filesToZip).length > 0) {
    zip(filesToZip, { level: 0 }, (err, compressedZip) => {
      if (err) {
        console.error('Error creating zip:', err)
        generateOutputState.preparingDownload = false
        return
      }
      const outputBlob = new Blob([compressedZip], { type: 'application/zip' })
      const { filename, fileType } = generateOutputState
      utilSaveFile(filename + fileType, outputBlob)
      generateOutputState.preparingDownload = false
      generateOutputState.downloaded = true
    })
  }
  else {
    generateOutputState.preparingDownload = false
  }
}

async function addImageBlobsToZipAndDownload(testImageBlobs: TestImageBlobs) {
  generateOutputState.preparingDownload = true
  generateOutputState.generatingImages = false
  generateOutputState.totalQuestions = 0

  for (const [sectionName, sectionData] of Object.entries(testImageBlobs)) {
    for (const [questionNum, questionData] of Object.entries(sectionData)) {
      for (let i = 0; i < questionData.length; i++) {
        const imageBlob = questionData[i]
        if (!imageBlob) continue

        const imageBuffer = new Uint8Array(await imageBlob.arrayBuffer())
        const sectionNameWithSeparator = sectionName + SEPARATOR
        const questionNameWithSeparator = questionNum + SEPARATOR

        const filename = `${sectionNameWithSeparator}${questionNameWithSeparator}${i + 1}.png`
        outputFilesToZip.value[filename] = imageBuffer
      }
    }
  }

  zipAndDownloadOutput()
}

onMounted(() => {
  zoomScaleDebounced.value = settings.value.general.scale

  watchDebounced(
    [() => settings.value.general.scale, () => settings.value.general.qualityFactor],
    ([oldScale], [newScale]) => {
      if (oldScale !== newScale) {
        zoomScaleDebounced.value = settings.value.general.scale
        renderPage(pdfState.currentThrottledPageNum)
      }
      else {
        renderPage(pdfState.currentThrottledPageNum)
      }
    },
    { debounce: 500, maxWait: 3000 },
  )

  watchThrottled(() => pdfState.currentPageNum,
    (newNum, prevNum) => {
      if (prevNum !== newNum) {
        const newPageNum = pdfState.currentPageNum
        pdfState.currentThrottledPageNum = newPageNum

        if (newPageNum <= 1) return

        if (!pageImgData[newPageNum]) {
          renderPage(newPageNum)
        }
      }
    },
    { throttle: 1000, trailing: true, leading: true },
  )
})

const closeMupdfWorker = () => {
  try {
    mupdfWorker?.close()
    mupdfWorker = null
  }
  catch {
    // maybe worker is not active
  }
}

// clean up
onBeforeUnmount(() => {
  closeMupdfWorker()

  for (const pageData of Object.values(pageImgData)) {
    const { url } = pageData
    if (url) {
      URL.revokeObjectURL(url)
    }
  }

  stopUseDPR()
})
</script>
