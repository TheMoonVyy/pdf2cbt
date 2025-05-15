<template>
  <div class="flex flex-col grow min-h-0">
    <PdfCropperAdvSettingsDrawer
      v-model:settings="settings"
      v-model:advance-settings-visible="visibilityState.advanceSettings"
    />
    <Splitter pt:root:class="flex-1 flex-nowrap min-h-0 min-w-0 rounded-none select-none">
      <SplitterPanel
        pt:root:class="flex flex-col items-center overflow-y-auto!"
        :size="settings.splitterPanelSize"
        :min-size="15"
      >
        <Panel
          header="Settings"
          toggleable
          class="w-full gap-2"
        >
          <div class="flex flex-wrap gap-x-2 gap-y-3 mt-2">
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
          <div class="flex items-center justify-center mt-3">
            <BaseButton
              label="Advance settings"
              severity="help"
              size="small"
              @click="visibilityState.advanceSettings = true"
            />
          </div>
        </Panel>
        <Panel
          header="Current Page Actions"
          :collapsed="true"
          toggleable
          class="w-full"
        >
          <div class="flex gap-3 text-nowrap justify-center">
            <BaseButton
              label="Prev Page"
              severity="help"
              :disabled="pdfState.currentPageNum <= 1 || !isCurrentPageClean || !isPdfLoaded"
              @click="pdfPageNavigation(-1)"
            >
              <template #icon>
                <Icon name="material-symbols:arrow-back-ios-new-rounded" />
              </template>
            </BaseButton>
            <BaseButton
              class="flex flex-row-reverse"
              label="Next Page"
              icon-pos="right"
              severity="help"
              :disabled="pdfState.currentPageNum >= pdfState.totalPages"
              @click="pdfPageNavigation(1)"
            >
              <template #icon>
                <Icon name="material-symbols:arrow-forward-ios-rounded" />
              </template>
            </BaseButton>
          </div>
          <div
            v-if="cropperMode.isLine"
            class="flex mt-3 justify-center items-center"
          >
            <BaseButton
              :label="cropperLineState.skipNext ? 'Skipping Next coordinate...' : 'Skip Next (y2) coordinate'"
              :disabled="cropperLineState.currentCoord !== 'y2' || !cropperMode.isLine"
              severity="warn"
              @click="cropperLineState.skipNext = !cropperLineState.skipNext"
            />
          </div>
          <div class="flex gap-5 text-nowrap justify-center mt-3">
            <BaseButton
              label="Undo"
              :disabled="isCurrentPageClean || !isPdfLoaded"
              severity="warn"
              @click="clearCurrentPageLastQuestion()"
            >
              <template #icon>
                <Icon
                  name="material-symbols:undo-rounded"
                  size="1.3rem"
                />
              </template>
            </BaseButton>
            <BaseButton
              label="Clear All"
              severity="danger"
              :disabled="isCurrentPageClean || !isPdfLoaded"
              @click="clearCurrentPageQuestions()"
            >
              <template #icon>
                <Icon name="material-symbols:refresh" />
              </template>
            </BaseButton>
          </div>
        </Panel>
        <Panel
          header="Crop Coordinates"
          toggleable
          :collapsed="true"
          class="w-full"
          pt:content:class="flex gap-2 px-2"
        >
          <div class="grid grid-cols-2 col-span-3 gap-3 mt-2 label-selecter">
            <BaseFloatLabel
              v-for="key in Object.keys(coords)"
              :key="key"
              class="w-full"
              :label="key.toUpperCase()"
              :label-id="`coords_${key}`"
              label-class="text-xs"
            >
              <InputNumber
                v-model="coords[key as keyof CropCoordinates]"
                :min="0"
                :max="key.startsWith('x') ? currentPageDetails.width : currentPageDetails.height"
                :fluid="true"
                :label-id="`coords_${key}`"
                size="small"
                show-buttons
                :step="1"
                :disabled="!isPdfLoaded || (cropperMode.isLine && cropperLineState.currentCoord !== key)"
                @value-change="syncCoordsAndSelection()"
                @focus="updateInputFocusState(true)"
                @blur="updateInputFocusState(false)"
              />
            </BaseFloatLabel>
          </div>
          <div class="flex justify-center items-center">
            <BaseButton
              label="Set Crop"
              severity="help"
              :disabled="!isPdfLoaded"
              size="small"
              @click="handleCropperCoordinates()"
            />
          </div>
        </Panel>
        <PdfCropperQuestionDetailsPanel
          v-model="currentQuestionData"
          :is-pdf-loaded="isPdfLoaded"
        />
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
          class="flex justify-center mt-4"
        >
          <BaseSimpleFileUpload
            accept="application/pdf,.pdf"
            :label="visibilityState.isLoadingPdf ? 'Please wait, loading PDF...' : 'Select a PDF'"
            :icon-name="visibilityState.isLoadingPdf ? 'line-md:loading-twotone-loop' : 'prime:plus'"
            icon-size="1.5rem"
            invalid-file-type-message="Invalid file. Please select a valid PDF"
            @upload="handlePdfFileUpload"
          />
        </div>
        <div
          class="flex"
          @pointerup="pointerUpHandler"
          @pointerleave="pointerLeaveHandler"
        >
          <div
            class="relative mx-auto cursor-cell mt-4"
            :style="{
              '--pdf-page-scaled-width': `${currentPageDetails.scaledWidth}px`,
              '--pdf-page-scaled-height': `${currentPageDetails.scaledHeight}px`,
            }"
          >
            <div class="inline-block">
              <img
                ref="imgElem"
                :src="currentPageDetails.url"
                class="border border-gray-500 pdf-cropper-img"
                draggable="false"
                :style="{
                  backgroundColor: `#${settings.pageBGColor}`,
                }"
                @pointerdown="pointerDownHandler"
                @pointermove="pointerMoveHandler"
              >
            </div>
            <div
              class="overlay"
              :class="{ hidden: !isPdfLoaded }"
            >
              <div
                ref="boxSelectionElem"
                class="box-selection"
                :class="{
                  hidden: !cropperMode.isBox || (
                    !pointerAndInputState.isPointerDown && !pointerAndInputState.isInputInFocus
                  ),
                }"
              />
              <div
                class="line-selection"
                :class="[
                  { hidden: !cropperMode.isLine },
                  cropperLineState.currentCoord.startsWith('x') ? 'x' : 'y',
                ]"
              />
            </div>
            <div
              class="overlay"
              :class="{ hidden: Boolean(!cropperMode.isLine || !isPdfLoaded) }"
            >
              <div
                class="line-selected x1"
                :class="{ hidden: cropperLineState.currentCoord === 'x1' }"
              />
              <div
                class="line-selected x2"
                :class="{ hidden: cropperLineState.currentCoord.startsWith('x') }"
              />
              <div
                class="line-selected y1"
                :class="{ hidden: cropperLineState.currentCoord !== 'y2' }"
              />
            </div>
            <div
              ref="croppedDivContainerElem"
              class="overlay"
            />
          </div>
        </div>
      </SplitterPanel>
    </Splitter>
    <Dialog
      v-model:visible="visibilityState.questionDetailsDialog"
      header="Invalid Question Details"
      :modal="true"
      :closable="false"
      pt:content:class="p-0"
    >
      <span class="text-center text-surface-500 dark:text-surface-400 block mb-2">
        Make sure all fields are filled
      </span>
      <PdfCropperQuestionDetailsPanel
        v-model="currentQuestionData"
        :is-pdf-loaded="isPdfLoaded"
      />
      <div class="flex justify-center my-3">
        <BaseButton
          label="Done"
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
      <h5 class="text-center text-gray-500 dark:text-gray-300 my-5">
        After downloading once, you can always change the options above to generate &amp; download again with those options
      </h5>
      <div
        v-show="!generateOutputState.generatingImages"
        class="flex justify-center"
      >
        <BaseButton
          label="Generate & Download"
          @click="generatePdfCropperOutput()"
        />
      </div>
      <div class="flex flex-col items-center mt-3 mb-2 text-center">
        <h3 v-show="generateOutputState.generatingImages">
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
        class="flex justify-center mt-5"
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
import '~/src/assets/css/pdf-cropper.css'
import * as Comlink from 'comlink'
import { zip, strToU8, type AsyncZippable } from 'fflate'
import mupdfWorkerFile from '~/src/worker/mupdf.worker?worker'
import type { MuPdfProcessor } from '~/src/worker/mupdf.worker'
import { DataFileNames } from '~/src/types/enums'

import type {
  CurrentQuestionData,
  QuestionType,
  CropperOutputData,
  CropperQuestionData,
  CropperSectionsData,
  TestImageBlobs,
} from '~/src/types'
import { IMAGE_FILE_NAME_OF_ZIP_SEPARATOR } from '~/src/shared/constants'

interface PdfState {
  currentPageNum: number
  totalPages: number
  fileUint8Array: Uint8Array | null
}

interface SettingsState {
  cropperMode: 'box' | 'line'
  scale: number
  splitterPanelSize: number
  pageBGColor: string
  cropSelectionGuideColor: string
  cropSelectedRegionColor: string
  cropSelectionSkipColor: string
  qualityFactor: number
  selectionThrottleInterval: number
  minCropDimension: number
}

interface CropCoordinates {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface QuestionData {
  page: number
  sub: string
  sec: string
  type: QuestionType
  options: number
  que: number
  cm: number
  pm: number
  im: number
  x1: number
  y1: number
  x2: number
  y2: number
}

interface CropperLineState {
  currentCoord: 'x1' | 'x2' | 'y1' | 'y2'
  skipNext: boolean
}

interface CropperMode {
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
  totalQuestions: 0,
  preparingDownload: false,
  downloaded: false,
})

const outputFilesToZip = shallowRef<AsyncZippable>({})

const cropperSectionsDataForPreGenerateImages = shallowRef<CropperSectionsData>({})

const { pixelRatio: devicePixelRatio, stop: stopUseDPR } = useDevicePixelRatio()

let mupdfWorker: Comlink.Remote<MuPdfProcessor> | null = null

/// / element refs ////
const imgElem = ref<HTMLImageElement>()
const boxSelectionElem = shallowRef<HTMLElement>()
const croppedDivContainerElem = shallowRef<HTMLElement>()

const pdfState = shallowReactive<PdfState>({
  currentPageNum: 0,
  totalPages: 0,
  fileUint8Array: null,
})

const isPdfLoaded = shallowRef(false)

// to store SHA-256 hash of pdf file,
// which will be included in generated output file
let pdfFileHash = ''

// Default settings
const settings = shallowReactive<SettingsState>({
  cropperMode: 'line',
  scale: 1,
  splitterPanelSize: 25,
  pageBGColor: 'ffffff', // white
  // For Advanced settings
  // Colors
  cropSelectionGuideColor: '0000ff', // blue
  cropSelectedRegionColor: '004D00', // dark variant of green
  cropSelectionSkipColor: '8B0000', // dark red
  // Rendering & Input
  qualityFactor: 2,
  selectionThrottleInterval: 30, // in milliseconds
  minCropDimension: 3, // units of coords
})

const visibilityState = shallowReactive({
  isLoadingPdf: false,
  advanceSettings: false,
  questionDetailsDialog: false,
  generateOutputDialog: false,

})

const currentQuestionData = shallowReactive<CurrentQuestionData>({
  subjectName: '',
  sectionName: '',
  questionType: 'mcq',
  totalOptions: 4,
  questionNum: 1,
  correctMarks: 4,
  partialMarks: 1,
  incorrectMarks: -1,
})

const coords = shallowReactive<CropCoordinates>({ x1: 0, y1: 0, x2: 0, y2: 0 })

const pageImgData = reactive<PageImgData>({})

// Stores all data related to questions for output
const questionsData = reactive<Record<number, QuestionData[]>>({})

// State variables for 'Line' cropper mode
const cropperLineState = reactive<CropperLineState>({
  currentCoord: 'x1',
  skipNext: false,
})

const pointerAndInputState = shallowReactive({
  x: 0,
  y: 0,
  isPointerDown: false,
  isInputInFocus: false,
})

const zoomScaleDebounced = shallowRef(1)

const currentPageDetails = computed(() => {
  let { url, width, height } = pageImgData[pdfState.currentPageNum] ?? {}
  url ??= ''
  width ??= 0
  height ??= 0

  const zoomScale = zoomScaleDebounced.value

  const data = {
    url: url,
    width: width,
    height: height,
    zoomScale,
    scaledWidth: Math.floor(width * zoomScale),
    scaledHeight: Math.floor(height * zoomScale),
  }

  return data
})

// CSS var() that are being used
const cssVars = reactive({
  cropSelectionGuideColor: useCssVar('--crop-selection-guide-color'),
  cropSelectedRegionColor: useCssVar('--crop-selected-region-color'),
  lineSelectionX: useCssVar('--line-selection-x'),
  lineSelectionY: useCssVar('--line-selection-y'),
  lineSelectedX1: useCssVar('--line-selected-x1'),
  lineSelectedX2: useCssVar('--line-selected-x2'),
  lineSelectedY1: useCssVar('--line-selected-y1'),
})

const imgDrawerCoords = ref<null | { x: number, y: number }>(null)

// pointer coordinates relative to img element
const updateImgDrawerCoords = (e: PointerEvent) => {
  if (imgElem.value && !visibilityState.advanceSettings) {
    const rect = imgElem.value.getBoundingClientRect()
    const xRel = e.clientX - rect.left
    const yRel = e.clientY - rect.top

    const {
      zoomScale,
      width, height,
      scaledWidth, scaledHeight,
    } = currentPageDetails.value

    if (xRel < 0 || yRel < 0 || xRel > scaledWidth || yRel > scaledHeight) {
      imgDrawerCoords.value = null
    }
    else {
      const x = utilClampNumber(xRel, 0, width, zoomScale)
      const y = utilClampNumber(yRel, 0, height, zoomScale)

      imgDrawerCoords.value = { x, y }
    }
  }
}

/*
  Following computered properties are just boolean values being used frequently
  in conditional statements
*/
const cropperMode = computed<CropperMode>(() => ({
  isBox: settings.cropperMode === 'box',
  isLine: settings.cropperMode === 'line',
}))

// Check if current Page has any crop overlays, if not then true else false
const isCurrentPageClean = computed((): boolean => {
  const containsQuestionData = questionsData[pdfState.currentPageNum]?.length ? true : false
  if (cropperMode.value.isBox) {
    return !containsQuestionData
  }
  else if (cropperMode.value.isLine) {
    return !containsQuestionData && cropperLineState.currentCoord === 'x1'
  }
  return false
})

// Flag for generate ouput btn
const hasQuestionsData = computed<boolean>(() =>
  Object.values(questionsData).some(arr => arr.length > 0),
)

// Callbacks
const updateInputFocusState = (inFocus: boolean) => {
  if (cropperMode.value.isBox) {
    if (inFocus) {
      const scale = currentPageDetails.value.zoomScale

      const { x1, y1, x2, y2 } = coords
      setBoxSelectionElemStyles(x1 * scale, y1 * scale, x2 * scale, y2 * scale)
      pointerAndInputState.isInputInFocus = true
    }
    else {
      setBoxSelectionElemStyles(0, 0, 0, 0)
      pointerAndInputState.isInputInFocus = false
    }
  }
  else {
    pointerAndInputState.isInputInFocus = false
  }
}

const pointerDownHandler = (e: PointerEvent) => {
  if (!isPdfLoaded.value) return

  updateImgDrawerCoords(e)

  if (imgElem.value?.hasPointerCapture(e.pointerId)) {
    imgElem.value.releasePointerCapture(e.pointerId)
  }

  if (e.isPrimary && imgDrawerCoords.value) {
    if (cropperMode.value.isBox) {
      const { x, y } = imgDrawerCoords.value
      coords.x1 = x
      coords.y1 = y
    }

    pointerAndInputState.isPointerDown = true
  }
}

const pointerMoveHandler = (e: PointerEvent) => {
  if (!isPdfLoaded.value) return

  updateImgDrawerCoords(e)
}

const pointerUpHandler = (e: PointerEvent) => {
  if (!isPdfLoaded.value) return
  if (e.isPrimary && pointerAndInputState.isPointerDown)
    handleCropperCoordinates()
}

const pointerLeaveHandler = () => {
  if (!isPdfLoaded.value) return

  pointerAndInputState.isPointerDown = false
  if (cropperMode.value.isBox) setBoxSelectionElemStyles(0, 0, 0, 0)
}

function handleCropperCoordinates() {
  pointerAndInputState.isPointerDown = false
  pointerAndInputState.isInputInFocus = false

  const { x1, y1, x2, y2 } = coords
  const x = Math.abs(x1 - x2)
  const y = Math.abs(y1 - y2)
  const minCropDimension = settings.minCropDimension

  if (cropperMode.value.isLine) {
    const currentCoord = cropperLineState.currentCoord

    if (currentCoord === 'x2') {
      if (x < minCropDimension) return
    }
    else if (currentCoord === 'y2') {
      if (y < minCropDimension) return

      if (validateQuestionDetails()) processAndSaveCoords()
      return
    }

    processAndSaveCoords()
  }
  else if (cropperMode.value.isBox) {
    setBoxSelectionElemStyles(0, 0, 0, 0)

    if (x > minCropDimension && y > minCropDimension) {
      if (validateQuestionDetails()) processAndSaveCoords()
    }
  }
}

function processAndSaveCoords() {
  if (cropperMode.value.isLine) {
    const currentCoord = cropperLineState.currentCoord

    switch (currentCoord) {
      case 'x1':
        updateLineSelectedCss('x2', false)
        cropperLineState.currentCoord = 'x2'
        break
      case 'x2':
        updateLineSelectedCss('y1', false)
        cssVars.lineSelectionX = '0px'
        cssVars.lineSelectionY = '0px'
        cropperLineState.currentCoord = 'y1'
        break
      case 'y1':
        updateLineSelectedCss('y2', false)
        cropperLineState.currentCoord = 'y2'
        break
      case 'y2':
        if (!cropperLineState.skipNext) {
          storeCurrentQuestionData(coords)
          renderCurrentPageCroppedOverlays(true)
        }
        cropperLineState.skipNext = false
        coords.y1 = coords.y2
        updateLineSelectedCss('y2', false)
        break
    }
  }
  else if (cropperMode.value.isBox) {
    storeCurrentQuestionData(coords)
    renderCurrentPageCroppedOverlays(true)
  }
}

function storeCurrentQuestionData(cropCoords: CropCoordinates, incrementQuestion: boolean = true) {
  let x1: number, y1: number, x2: number, y2: number

  if (cropCoords.x1 < cropCoords.x2) {
    x1 = cropCoords.x1
    x2 = cropCoords.x2
  }
  else {
    x1 = cropCoords.x2
    x2 = cropCoords.x1
  }

  if (cropCoords.y1 < cropCoords.y2) {
    y1 = cropCoords.y1
    y2 = cropCoords.y2
  }
  else {
    y1 = cropCoords.y2
    y2 = cropCoords.y1
  }

  const page = pdfState.currentPageNum
  const {
    subjectName: sub,
    sectionName: sec,
    questionType: type,
    questionNum: que,
    totalOptions: options,
    correctMarks: cm,
    partialMarks: pm,
    incorrectMarks: im,
  } = currentQuestionData

  const questionData: QuestionData = {
    page, sub, sec, type, options, que,
    cm, pm, im,
    x1, y1, x2, y2,
  }

  if (!questionsData[page]) questionsData[page] = []
  questionsData[page].push(questionData)

  if (incrementQuestion) currentQuestionData.questionNum++
}

function validateQuestionDetails(): boolean {
  const {
    subjectName,
    sectionName,
    questionType,
    questionNum,
    correctMarks,
    partialMarks,
    incorrectMarks,
  } = currentQuestionData

  const passed = subjectName.trim()
    && sectionName.trim()
    && ['mcq', 'msq', 'nat'].includes(questionType)
    && (Number.isFinite(questionNum) && questionNum !== 0)
    && Number.isFinite(correctMarks)
    && Number.isFinite(partialMarks)
    && Number.isFinite(incorrectMarks)

  if (passed) {
    return true
  }
  else {
    visibilityState.questionDetailsDialog = true
    return false
  }
}

function renderCurrentPageCroppedOverlays(renderOnlyLastOverlay: boolean = false) {
  const pageQuestionsData = questionsData[pdfState.currentPageNum]
  if (pageQuestionsData?.length) {
    const n = pageQuestionsData.length
    let i = renderOnlyLastOverlay ? (n - 1) : 0

    for (; i < n; i++) {
      const { x1, y1, x2, y2 } = pageQuestionsData[i]
      addCroppedOverlayElem({ x1, y1, x2, y2 })
    }
  }
}

function addCroppedOverlayElem(cropCoords: CropCoordinates) {
  const scale = currentPageDetails.value.zoomScale
  const { x1, y1, x2, y2 } = cropCoords
  const div = document.createElement('div')
  div.className = 'final-rectangle'
  div.style.left = `${x1 * scale}px`
  div.style.top = `${y1 * scale}px`
  div.style.width = `${(x2 - x1) * scale}px`
  div.style.height = `${(y2 - y1) * scale}px`

  croppedDivContainerElem.value!.appendChild(div)
}

function clearCroppedDivContainerElem(onlyLastChild: boolean = false) {
  if (croppedDivContainerElem.value) {
    if (onlyLastChild) {
      const lastElementChild = croppedDivContainerElem.value.lastElementChild
      if (lastElementChild) {
        croppedDivContainerElem.value.removeChild(lastElementChild)
      }
    }
    else {
      croppedDivContainerElem.value.replaceChildren()
    }
  }
}

const clearCurrentPageQuestions = () => {
  if (isPdfLoaded.value) {
    const currentPageNum = pdfState.currentPageNum
    const currentPageQuestions = questionsData[currentPageNum]
    if (currentPageQuestions) {
      currentPageQuestions.length = 0
    }
    coords.x1 = 0
    coords.y1 = 0
    coords.x2 = 0
    coords.y2 = 0

    cropperLineState.currentCoord = 'x1'
    clearCroppedDivContainerElem()

    const recentQuestion = getLastQuestionData()
    if (recentQuestion) {
      currentQuestionData.subjectName = recentQuestion.sub
      currentQuestionData.sectionName = recentQuestion.sec
      currentQuestionData.questionType = recentQuestion.type
      currentQuestionData.questionNum = recentQuestion.que + 1
      currentQuestionData.correctMarks = recentQuestion.cm
      currentQuestionData.partialMarks = recentQuestion.pm
      currentQuestionData.incorrectMarks = recentQuestion.im
    }
    else {
      currentQuestionData.questionNum = 1
    }
  }
}

const clearCurrentPageLastQuestion = () => {
  if (isPdfLoaded.value) {
    const currentPageNum = pdfState.currentPageNum
    const currentPageQuestions = questionsData[currentPageNum]
    const currentPageLastQuestion = currentPageQuestions?.pop()

    if (cropperMode.value.isLine) {
      coords.y2 = 0
      if (currentPageLastQuestion) {
        coords.x1 = currentPageLastQuestion.x1
        coords.x2 = currentPageLastQuestion.x2
        const y1 = currentPageLastQuestion.y1
        coords.y1 = y1
        updateLineSelectedCss('y2', false)
      }
      else {
        const currentCoord = cropperLineState.currentCoord

        switch (currentCoord) {
          case 'y2':
            coords.y1 = 0
            cropperLineState.currentCoord = 'y1'
            break
          case 'y1':
            coords.y1 = 0
            coords.x2 = 0
            cropperLineState.currentCoord = 'x2'
            break
          case 'x2':
            coords.y1 = 0
            coords.x2 = 0
            coords.x1 = 0
            cropperLineState.currentCoord = 'x1'
            break
        }
      }
    }
    if (currentPageLastQuestion) {
      currentQuestionData.questionNum--
      clearCroppedDivContainerElem(true)
    }
  }
}

function updateLineSelectedCss(currentCoord: string, fallthrough: boolean = false) {
  const scale = currentPageDetails.value.zoomScale
  switch (currentCoord) {
    case 'y2':
      cssVars.lineSelectedY1 = `${coords.y1 * scale}px`
      if (!fallthrough) break
    // fallthrough
    case 'y1':
      cssVars.lineSelectedX2 = `${coords.x2 * scale}px`
      if (!fallthrough) break
    // fallthrough
    case 'x2':
      cssVars.lineSelectedX1 = `${coords.x1 * scale}px`
  }
}

async function pdfPageNavigation(pageDelta: number) {
  const newPage = pdfState.currentPageNum + pageDelta

  if (pageDelta === 0 || newPage < 0 || newPage > pdfState.totalPages) return

  pdfState.currentPageNum = newPage
  await renderPage(newPage, true)

  if (pageDelta > 0) {
    if (cropperMode.value.isLine) {
      const lastQuestionData = getLastQuestionData()
      if (lastQuestionData) {
        const { x1, x2 } = lastQuestionData

        coords.x1 = x1
        coords.x2 = x2
        coords.y1 = 0
        coords.y2 = 0

        cropperLineState.currentCoord = 'y1'
      }
      else {
        cropperLineState.currentCoord = 'x1'
      }
    }
  }
  else {
    const pageLastQuestionData = getLastQuestionData(newPage)
    if (pageLastQuestionData) {
      renderCurrentPageCroppedOverlays(false)

      if (cropperMode.value.isLine) {
        const { x1, x2, y2 } = pageLastQuestionData

        coords.x1 = x1
        coords.x2 = x2
        coords.y1 = y2
        coords.y2 = 0

        updateLineSelectedCss('y2', true)
        cropperLineState.currentCoord = 'y2'
      }
    }
    else {
      cropperLineState.currentCoord = 'x1'
    }
  }
}

function getLastQuestionData(pageNum: number = 0) {
  if (pageNum === 0) {
    const decreasingOrderPageNumkeys = Object.keys(questionsData).map(Number).sort((a, b) => b - a)

    for (let i = 0; i < decreasingOrderPageNumkeys.length; i++) {
      const n = decreasingOrderPageNumkeys[i]
      const questionData = questionsData[n]?.at(-1)
      if (questionData) {
        return questionData
      }
    }
  }
  else {
    const questionData = questionsData[pageNum]?.at(-1)
    if (questionData) {
      return questionData
    }
  }
  return null
}

const keydownCallback = (e: KeyboardEvent) => {
  if (e.ctrlKey && cropperMode.value.isLine && cropperLineState.currentCoord === 'y2') {
    cropperLineState.skipNext = true
  }
}

const keyUpCallback = () => {
  cropperLineState.skipNext = false
}

const syncCoordsAndSelection = useThrottleFn(
  (updateCoords: boolean = false) => {
    if (updateCoords) {
      if (imgDrawerCoords.value) {
        if (cropperMode.value.isLine) {
          const { x, y } = imgDrawerCoords.value
          const currentCoord = cropperLineState.currentCoord

          coords[currentCoord] = currentCoord.startsWith('x') ? x : y
          drawCropperSelection()
        }
        else if (cropperMode.value.isBox && pointerAndInputState.isPointerDown) {
          const { x, y } = imgDrawerCoords.value
          coords.x2 = x
          coords.y2 = y
          drawCropperSelection()
        }
      }
    }
    else {
      drawCropperSelection()
    }
  },
  () => settings.selectionThrottleInterval, // Throttle
  true, // call fn when time is up as well
)

function drawCropperSelection() {
  if (cropperMode.value.isBox) {
    const scale = currentPageDetails.value.zoomScale
    const x1 = coords.x1 * scale
    const y1 = coords.y1 * scale
    const x2 = coords.x2 * scale
    const y2 = coords.y2 * scale
    const width = x2 - x1
    const height = y2 - y1
    const left = width > 0 ? x1 : x2
    const top = height > 0 ? y1 : y2
    const absWidth = Math.abs(width)
    const absHeight = Math.abs(height)

    setBoxSelectionElemStyles(left, top, absWidth, absHeight)
  }
  else if (cropperMode.value.isLine) {
    const scale = currentPageDetails.value.zoomScale
    const currentCoord = cropperLineState.currentCoord
    const val = coords[currentCoord] * scale

    if (currentCoord === 'x1' || currentCoord === 'x2') {
      cssVars.lineSelectionX = `${val}px`
    }
    else if (currentCoord === 'y1' || currentCoord === 'y2') {
      cssVars.lineSelectionY = `${val}px`
    }
  }
}

function setBoxSelectionElemStyles(left: number, top: number, width: number, height: number) {
  if (boxSelectionElem.value && cropperMode.value.isBox) {
    boxSelectionElem.value.style.left = `${left}px`
    boxSelectionElem.value.style.top = `${top}px`
    boxSelectionElem.value.style.width = `${width}px`
    boxSelectionElem.value.style.height = `${height}px`
  }
}

// For ongoing crop selection
const selectionWatchHandle = watch(
  [cropperMode, imgDrawerCoords],
  () => syncCoordsAndSelection(true),
  { deep: true },
)

selectionWatchHandle.pause() // as not required on initial webpage load

const handlePdfFileUpload = (file: File) => {
  visibilityState.isLoadingPdf = true

  file.arrayBuffer().then((buffer) => {
    pdfState.fileUint8Array = new Uint8Array(buffer)
    pdfFileHash = ''
    loadPdfFile()
  })
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

      await renderPage(pdfState.currentPageNum, true)
      isPdfLoaded.value = true
      selectionWatchHandle.resume()
    }
  }
  catch (err) {
    console.error('Error loading PDF:', err)
  }
}

async function renderPage(pageNum: number, refreshOverlays: boolean = true) {
  if (!imgElem.value) return
  if (mupdfWorker === null) {
    await loadPdfFile()
  }
  if (!mupdfWorker) return

  try {
    const dpr = devicePixelRatio.value || 1
    const qualityFactor = settings.qualityFactor

    const pageScale = dpr * qualityFactor

    if (refreshOverlays) clearCroppedDivContainerElem()

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
    if (refreshOverlays) {
      renderCurrentPageCroppedOverlays(false)
      if (cropperMode.value.isLine) {
        const currentCoord = cropperLineState.currentCoord
        updateLineSelectedCss(currentCoord, true)
      }
    }
  }
  catch (err) {
    console.error('Error rendering page:', err)
    clearCroppedDivContainerElem()
  }
}

function transformDataToOutputFormat(data: Record<number, QuestionData[]>) {
  const arr = Object.values(data).flat()

  const subjectsData: CropperOutputData = {}

  for (const questionData of arr) {
    const { sub, sec, que, type, options, cm, pm, im, ...rest } = questionData

    const cropperQuesData: CropperQuestionData = {
      que,
      type,
      options,
      marks: { cm, pm, im },
      pdfData: [
        { ...rest },
      ],
    }

    if (type === 'nat') delete cropperQuesData.options
    if (type !== 'msq') delete cropperQuesData.marks.pm

    subjectsData[sub] ??= {}
    subjectsData[sub][sec] ??= {}

    if (subjectsData[sub][sec][que]) {
      subjectsData[sub][sec][que].pdfData.push(rest)
    }
    else {
      subjectsData[sub][sec][que] = cropperQuesData
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

  const Data = structuredClone(toRaw(questionsData))
  const jsonData = transformDataToOutputFormat(Data)
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
        const imageBuffer = new Uint8Array(await questionData[i].arrayBuffer())
        const sectionNameWithSeparator = sectionName + IMAGE_FILE_NAME_OF_ZIP_SEPARATOR
        const questionNameWithSeparator = questionNum + IMAGE_FILE_NAME_OF_ZIP_SEPARATOR

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

  watchEffect(() => {
    const selectionColor = cropperLineState.skipNext
      ? settings.cropSelectionSkipColor
      : settings.cropSelectionGuideColor

    cssVars.cropSelectionGuideColor = `#${selectionColor}`
    cssVars.cropSelectedRegionColor = `#${settings.cropSelectedRegionColor}`
  })

  watchDebounced(
    [() => settings.scale, () => settings.qualityFactor],
    ([oldScale], [newScale]) => {
      if (oldScale !== newScale) {
        zoomScaleDebounced.value = settings.scale
        renderPage(pdfState.currentPageNum, true)
      }
      else {
        renderPage(pdfState.currentPageNum, false)
      }
    },
    { debounce: 500, maxWait: 3000 },
  )

  window.addEventListener('keydown', keydownCallback)
  window.addEventListener('keyup', keyUpCallback)
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
  window.removeEventListener('keydown', keydownCallback)
  window.removeEventListener('keyup', keyUpCallback)
})
</script>
