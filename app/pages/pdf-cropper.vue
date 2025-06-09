<template>
  <div class="flex flex-col grow min-h-0">
    <PdfCropperSettingsDrawer
      v-model:settings="settings"
      v-model:advance-settings-visible="visibilityState.advanceSettings"
    />
    <Splitter pt:root:class="flex-1 flex-nowrap min-h-0 min-w-0 rounded-none select-none">
      <SplitterPanel
        pt:root:class="flex flex-col items-center overflow-y-auto! w-1/4"
        :size="settings.splitterPanelSize"
        :min-size="15"
      >
        <div class="flex flex-col items-center p-4 gap-5 w-full">
          <div class="flex flex-wrap gap-8">
            <div class="flex items-center justify-center">
              <BaseButton
                label="Settings"
                severity="help"
                size="small"
                @click="visibilityState.advanceSettings = true"
              />
            </div>
            <SelectButton
              v-model="currentMode"
              :options="currentModeSelectOptions"
              option-label="name"
              option-value="value"
              option-disabled="disable"
              :disabled="!isPdfLoaded"
              :allow-empty="false"
            />
          </div>
          <div class="flex flex-wrap gap-x-2 gap-y-3">
            <BaseFloatLabel
              class="flex-[1_1_60%] min-w-[55%]"
              label="Cropper Mode"
              label-id="cropperModeDD"
              label-class="text-xs"
            >
              <Select
                v-model="settings.cropperMode"
                label-id="cropperModeDD"
                :options="selectOptions.cropperMode"
                :disabled="currentMode !== 'crop'"
                option-label="name"
                option-value="value"
                :fluid="true"
                size="small"
              />
            </BaseFloatLabel>
            <BaseFloatLabel
              class="flex-[1_1_35%] min-w-[30%]"
              label="Zoom"
              label-id="settings_scale"
              label-class="text-xs"
            >
              <InputNumber
                v-model="settings.scale"
                :disabled="!isPdfLoaded"
                :min="0.5"
                :max="2"
                :fluid="true"
                label-id="settings_scale"
                size="small"
                show-buttons
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
              v-model="pdfState.currentPageNum"
              :disabled="pdfState.currentPageNum === 0 || !isPdfLoaded"
              :min="1"
              :max="pdfState.totalPages"
              label-id="pdf_page_num"
              :step="1"
              increment-icon="material-symbols:arrow-forward-ios-rounded"
              decrement-icon="material-symbols:arrow-back-ios-new-rounded"
            />
          </BaseFloatLabel>
        </div>
        <PdfCropperQuestionDetailsPanel
          v-model="currentQuestionData"
          :overlays-per-question-data="overlaysPerQuestionData"
          :is-current-question-main-overlay="!activeCropperOverlayId"
          :is-pdf-loaded="isPdfLoaded"
          :overlay-datas="cropperOverlayDatas"
        />
        <Panel
          header="Crop Coordinates"
          toggleable
          :collapsed="true"
          class="w-full"
          pt:content:class="flex gap-2 px-5"
        >
          <div class="grid grid-cols-2 col-span-3 gap-5 mt-2 label-selecter">
            <BaseFloatLabel
              class="w-full"
              label="Left"
              label-id="coords_left"
              label-class="text-xs"
            >
              <InputNumber
                v-model="currentQuestionData.pdfData.l"
                :min="0"
                :max="currentQuestionData.pdfData.r"
                :fluid="true"
                label-id="coords_left"
                size="small"
                show-buttons
                :step="1"
                :disabled="!isPdfLoaded"
              />
            </BaseFloatLabel>
            <BaseFloatLabel
              class="w-full"
              label="Right"
              label-id="coords_right"
              label-class="text-xs"
            >
              <InputNumber
                v-model="currentQuestionData.pdfData.r"
                :min="currentQuestionData.pdfData.l"
                :max="currentPageDetails.width"
                :fluid="true"
                label-id="coords_right"
                size="small"
                show-buttons
                :step="1"
                :disabled="!isPdfLoaded"
              />
            </BaseFloatLabel>
            <BaseFloatLabel
              class="w-full"
              label="Top"
              label-id="coords_top"
              label-class="text-xs"
            >
              <InputNumber
                v-model="currentQuestionData.pdfData.t"
                :min="0"
                :max="currentQuestionData.pdfData.b"
                :fluid="true"
                label-id="coords_top"
                size="small"
                show-buttons
                :step="1"
                :disabled="!isPdfLoaded"
              />
            </BaseFloatLabel>
            <BaseFloatLabel
              class="w-full"
              label="Bottom"
              label-id="coords_bottom"
              label-class="text-xs"
            >
              <InputNumber
                v-model="currentQuestionData.pdfData.b"
                :min="currentQuestionData.pdfData.t"
                :max="currentPageDetails.height"
                :fluid="true"
                label-id="coords_bottom"
                size="small"
                show-buttons
                :step="1"
                :disabled="!isPdfLoaded"
              />
            </BaseFloatLabel>
          </div>
        </Panel>
        <BaseButton
          label="Generate Output"
          class="my-3 mb-5 shrink-0"
          :disabled="!hasQuestionsData"
          @click="() => {
            generateOutputState.downloaded = false
            visibilityState.generateOutputDialog = true
          }"
        />
      </SplitterPanel>
      <SplitterPanel
        pt:root:class="flex flex-col overflow-auto! focus-visible:outline-hidden"
        :size="75"
      >
        <div
          v-if="!isPdfLoaded"
          class="flex flex-col gap-6 justify-center mt-6"
        >
          <BaseSimpleFileUpload
            accept="application/pdf,application/zip,.pdf,.zip"
            :label="visibilityState.isLoadingPdf ? 'Please wait, loading PDF...' : 'Select a PDF'"
            :icon-name="visibilityState.isLoadingPdf ? 'line-md:loading-twotone-loop' : 'prime:plus'"
            icon-size="1.5rem"
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
              'blur-cropped': settings.blurCroppedRegion,
            }"
            :style="{
              '--pdf-page-width': currentPageDetails.width,
              '--pdf-page-height': currentPageDetails.height,
              '--pdf-page-scale': zoomScaleDebounced,
              '--pdf-cropped-blur-intensity': settings.blurIntensity,
              '--crop-selection-guide-color': `#${settings.cropSelectionGuideColor}`,
              '--crop-selected-region-color': `#${settings.cropSelectedRegionColor}`,
              '--crop-selection-skip-color': `#${settings.cropSelectionSkipColor}`,
              '--crop-selection-bg-opacity': settings.cropSelectionBgOpacity,
              '--crop-selected-region-bg-opacity': settings.cropSelectedRegionBgOpacity,
            }"
          >
            <div class="inline-block">
              <img
                :src="currentPageDetails.url"
                class="border border-gray-500 pdf-cropper-img"
                draggable="false"
                :style="{
                  backgroundColor: `#${settings.pageBGColor}`,
                }"
              >
            </div>
            <PdfCropperEditCroppedOverlay
              v-if="isPdfLoaded"
              v-model="cropperOverlayDatas"
              v-model:overlays-per-question-data="overlaysPerQuestionData"
              v-model:active-overlay-id="activeCropperOverlayId"
              v-model:blur-cropped-region="settings.blurCroppedRegion"
              :show-question-details-on-overlay="settings.showQuestionDetailsOnOverlay"
              :main-img-panel-elem="mainImgPanelElem"
              :current-mode="currentMode"
              :current-page-num="pdfState.currentThrottledPageNum"
              :page-scale="zoomScaleDebounced"
              :page-width="currentPageDetails.width"
              :page-height="currentPageDetails.height"
              :selection-throttle-interval="settings.selectionThrottleInterval"
              :move-on-key-press-distance="settings.moveOnKeyPressDistance"
              @set-pdf-data="storeCurrentQuestionData"
            />
            <PdfCropperCropOverlay
              v-if="isPdfLoaded"
              v-model:current-overlay-data="mainOverlayData"
              v-model:blur-cropped-region="settings.blurCroppedRegion"
              :main-img-panel-elem="mainImgPanelElem"
              :cropper-mode="cropperMode"
              :current-mode="currentMode"
              :current-page-num="pdfState.currentThrottledPageNum"
              :page-scale="zoomScaleDebounced"
              :page-width="currentPageDetails.width"
              :page-height="currentPageDetails.height"
              :selection-throttle-interval="settings.selectionThrottleInterval"
              :move-on-key-press-distance="settings.moveOnKeyPressDistance"
              @set-pdf-data="storeCurrentQuestionData"
            />
          </div>
        </div>
      </SplitterPanel>
    </Splitter>
    <Dialog
      v-if="visibilityState.questionDetailsDialog"
      v-model:visible="visibilityState.questionDetailsDialog"
      header="Invalid Question Details"
      :modal="true"
    >
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
    </Dialog>
    <Dialog
      v-model:visible="visibilityState.generateOutputDialog"
      header="Generate Test (Cropper) Data"
      :modal="true"
      pt:headerActions:class="ml-5"
      pt:content:class="p-3 pb-6 flex flex-col max-w-full sm:max-w-md"
    >
      <div class="grid grid-cols-3 w-full gap-2">
        <div class="flex flex-col col-span-2">
          <label
            class="text-center mb-1"
            for="generate_output_filename"
          >
            File Name
          </label>
          <InputText
            v-model.trim="generateOutputState.filename"
            type="text"
            label-id="generate_output_filename"
            :fluid="true"
            :maxlength="50"
          />
        </div>
        <div class="flex flex-col">
          <div class="flex gap-2 justify-center">
            <label
              class="text-center mb-1"
              for="generate_output_file_type"
            >
              File Type
            </label>
            <IconWithTooltip
              :tooltip-content="tooltipContent.outputFileType"
              icon-class="text-xl"
            />
          </div>
          <Select
            v-model="generateOutputState.fileType"
            label-id="generate_output_file_type"
            :options="selectOptions.outputFileType"
          />
        </div>
      </div>
      <div
        v-show="generateOutputState.fileType === '.zip'"
        class="grid grid-cols-3 gap-2 my-6"
      >
        <div class="flex flex-col col-span-2">
          <div class="flex gap-2 justify-center">
            <label
              class="text-center mb-1"
              for="pre_generate_images"
            >
              Pre-Generate Images
            </label>
            <IconWithTooltip
              :tooltip-content="tooltipContent.preGenerateImages"
              icon-class="text-xl"
            />
          </div>
          <Select
            v-model="generateOutputState.preGenerateImages"
            label-id="pre_generate_images"
            :fluid="false"
            :options="selectOptions.preGenerateImages"
            option-label="name"
            option-value="value"
          />
        </div>
        <div class="flex flex-col justify-center">
          <div class="flex gap-2 justify-center">
            <label
              class="text-center mb-1"
              for="pre_generate_image_scale"
            >
              Img Scale
            </label>
            <IconWithTooltip
              :tooltip-content="tooltipContent.preGenerateImagesScale"
              icon-class="text-xl"
            />
          </div>
          <InputNumber
            v-model="generateOutputState.preGenerateImagesScale"
            :disabled="!generateOutputState.preGenerateImages"
            :min="0.5"
            :max="5"
            suffix="x"
            label-id="pre_generate_image_scale"
            show-buttons
            pt:root:class="[&>input]:w-24"
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
          If generating progress is stuck, then click on cancel below and try again with a lower img scale value<br><br>
          If even with a lower scale value, it is stuck then cancel again and just download without pre generated images (i.e. select "No" above)<br><br>
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
          label="Cancel Generation"
          severity="warn"
          @click="() => {
            generateOutputState.generatingImages = false
            generateOutputState.totalQuestions = 0
          }"
        />
      </div>
      <Accordion
        :value="[]"
        multiple
      >
        <AccordionPanel value="0">
          <AccordionHeader>Multiple Downloads</AccordionHeader>
          <AccordionContent>
            <h5 class="text-center text-wrap text-gray-500 dark:text-gray-300 mt-4">
              After downloading once, you can always change the options above to generate &amp; download again with those options
            </h5>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="1">
          <AccordionHeader>Important NOTE</AccordionHeader>
          <AccordionContent>
            <h5 class="text-center text-wrap text-gray-500 dark:text-gray-300 my-5">
              If you want to later on use the zip file via <strong>"zip from url"</strong> feature
              and you are keeping the <strong>zip files</strong> in your <strong>github public repository</strong>
              then your <strong>zip file size should not exceed 20MB</strong> for "zip from url" to work.<br>
              (This is a limitation imposed by jsDelivr, which is the provider from where your zip file will be loaded after the website internally converts github url to jsDelivr url).
            </h5>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </Dialog>
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
import { DataFileNames, Constants } from '#shared/enums'

import Accordion from '@/src/volt/Accordion.vue'
import AccordionPanel from '@/src/volt/AccordionPanel.vue'
import AccordionHeader from '@/src/volt/AccordionHeader.vue'
import AccordionContent from '@/src/volt/AccordionContent.vue'
import SelectButton from '@/src/volt/SelectButton.vue'

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

const LOCAL_STORAGE_SETTINGS_KEY = 'pdf-cropper-settings'

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

// Default settings
const settings = shallowReactive<PdfCropperSettings>({
  cropperMode: 'line',
  scale: 1,
  splitterPanelSize: 26, // in %
  /* For settings Drawer */
  // General Settings
  qualityFactor: 1.5,
  pageBGColor: 'ffffff',
  minCropDimension: 10, // units of coords
  moveOnKeyPressDistance: 10, // units of coords
  // Crop Selection
  cropSelectionGuideColor: '0000ff', // blue
  cropSelectionBgOpacity: 15, // in %
  cropSelectionSkipColor: '8B0000', // dark red
  selectionThrottleInterval: 30, // in milliseconds
  // Cropped Region
  cropSelectedRegionColor: '004D00', // dark variant of green
  cropSelectedRegionBgOpacity: 15, // in %
  showQuestionDetailsOnOverlay: true,
  blurCroppedRegion: true,
  blurIntensity: 1.5, // in px
})

const visibilityState = shallowReactive({
  isLoadingPdf: false,
  advanceSettings: false,
  questionDetailsDialog: false,
  generateOutputDialog: false,
})

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

const ID_SEPARATOR = Constants.separator

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

const zoomScaleDebounced = shallowRef(settings.scale)

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
  const existingFirstOverlay = cropperOverlayDatas.get(newQueId + ID_SEPARATOR + '1')
  const existingQuestionImgCount = overlaysPerQuestionData.get(newQueId)

  let newOverlay: PdfCroppedOverlayData | null = null
  let newId = ''
  let newImgNum = 1
  if (existingFirstOverlay && existingQuestionImgCount) {
    newImgNum = existingQuestionImgCount + 1
    const { que, subject, section } = oldOverlay

    newId = newQueId + ID_SEPARATOR + newImgNum

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
    newId = newQueId + ID_SEPARATOR + '1'
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
      const newQueId = `${section || subject}${ID_SEPARATOR}${que}`
      if (id.includes(newQueId + ID_SEPARATOR)) {
        const imgNum = oldOverlay.imgNum
        const oldImgCount = overlaysPerQuestionData.get(oldQueId) || 1

        if (imgNum === 1 && oldImgCount > 1) {
          const nextOverlayData = cropperOverlayDatas.get(oldQueId + ID_SEPARATOR + 2)
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
            const overlay = cropperOverlayDatas.get(oldQueId + ID_SEPARATOR + newImgNum)
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
      const currentId = oldQueId + ID_SEPARATOR + currentImgNum
      const nextId = oldQueId + ID_SEPARATOR + (currentImgNum + 1)

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
  isBox: settings.cropperMode === 'box',
  isLine: settings.cropperMode === 'line',
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

  if ((Math.abs(l - r) < settings.minCropDimension)
    || (Math.abs(b - t) < settings.minCropDimension)) {
    return
  }

  const queId = `${section || subject}${ID_SEPARATOR}${que}`
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

    const pagesCount = await mupdfWorker.loadPdf(pdfState.fileUint8Array, true)
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
    const qualityFactor = settings.qualityFactor

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

    outputFilesToZip.value[DataFileNames.dataJson] = [jsonU8Array, { level: 6 }]

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
      outputFilesToZip.value[DataFileNames.questionsPdf] = pdfU8Array
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
        const sectionNameWithSeparator = sectionName + ID_SEPARATOR
        const questionNameWithSeparator = questionNum + ID_SEPARATOR

        const filename = `${sectionNameWithSeparator}${questionNameWithSeparator}${i + 1}.png`
        outputFilesToZip.value[filename] = imageBuffer
      }
    }
  }

  zipAndDownloadOutput()
}

function syncSettingsWithLocalStorage(save: boolean = false) {
  try {
    if (save) {
      const settingsJson = utilCloneJson(settings, true)
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, settingsJson)
    }
    else {
      const localSettingsData = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY)

      if (localSettingsData) {
        const parsedData = JSON.parse(localSettingsData)
        utilSelectiveMergeObj(
          settings as unknown as Record<string, unknown>,
          parsedData,
        )
      }
    }
  }
  catch (err) {
    const msg = `Error ${save ? 'storing' : 'accessing'} ${LOCAL_STORAGE_SETTINGS_KEY} data in LocalStorage`
    console.error(msg, err)
  }
}

onMounted(() => {
  syncSettingsWithLocalStorage()
  zoomScaleDebounced.value = settings.scale

  watchDebounced(
    [() => settings.scale, () => settings.qualityFactor],
    ([oldScale], [newScale]) => {
      if (oldScale !== newScale) {
        zoomScaleDebounced.value = settings.scale
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
  syncSettingsWithLocalStorage(true)

  for (const pageData of Object.values(pageImgData)) {
    const { url } = pageData
    if (url) {
      URL.revokeObjectURL(url)
    }
  }

  stopUseDPR()
})
</script>
