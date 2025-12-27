<template>
  <div class="flex flex-col grow min-h-0">
    <PdfCropperSettingsDrawer
      v-model:advance-settings-visible="dialogsState.showSettings"
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
          type="auto"
        >
          <div class="flex flex-col items-center">
            <div class="flex flex-col items-center p-4 pb-0 gap-3 w-full">
              <div class="flex flex-wrap gap-2 md:gap-3.5 items-center">
                <div class="flex items-center justify-center">
                  <BaseButton
                    variant="help"
                    title="Settings"
                    size="icon"
                    icon-name="line-md:cog-filled"
                    icon-size="1.2rem"
                    @click="dialogsState.showSettings = true"
                  />
                </div>
                <BaseFloatLabel
                  label="Zoom"
                  label-id="settings_scale"
                  label-class="text-xs start-1/2! -translate-x-1/2"
                >
                  <BaseInputNumber
                    id="settings_scale"
                    v-model="settings.general.scale"
                    input-class="w-26"
                    :disabled="!isPdfLoaded"
                    :min="0.3"
                    :max="2.5"
                    :step="0.1"
                  />
                </BaseFloatLabel>
                <UiTabs v-model="currentMode">
                  <UiTabsList class="grid w-full grid-cols-2 h-10 px-1 gap-0.5">
                    <UiTabsTrigger
                      v-for="option in currentModeSelectOptions"
                      :key="option.value"
                      class="cursor-pointer py-1.5"
                      :value="option.value"
                      :disabled="option.disable"
                    >
                      {{ option.name }}
                    </UiTabsTrigger>
                  </UiTabsList>
                </UiTabs>
              </div>
              <div
                v-show="currentMode === 'crop'"
                class="flex flex-col gap-1"
              >
                <UiLabel class="text-center text-sm">
                  Cropper Mode
                </UiLabel>
                <ClientOnly>
                  <UiTabs v-model="settings.general.cropperMode">
                    <UiTabsList class="grid w-full grid-cols-3 h-10 px-1 gap-0.5">
                      <UiTabsTrigger
                        v-for="option in currentCropperModeSelectOptions"
                        :key="option.value"
                        class="cursor-pointer py-1.5"
                        :value="option.value"
                        :disabled="option.disable"
                      >
                        {{ option.name }}
                      </UiTabsTrigger>
                    </UiTabsList>
                  </UiTabs>
                </ClientOnly>
              </div>
              <div class="flex flex-wrap gap-4 mt-3">
                <BaseButton
                  class="flex-[1_1_45%] min-w-[40%]"
                  variant="warn"
                  label="Bulk Edit"
                  icon-name="line-md:edit"
                  icon-size="1.2rem"
                  :disabled="cropperOverlayDatas.size === 0"
                  @click="dialogsState.showBulkEdit = true"
                />
                <BaseFloatLabel
                  class="flex-[1_1_45%] min-w-[40%]"
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
              <PdfCropperPatternModeSidePanel
                v-show="cropperMode.isPattern"
                ref="patternModeSidePanelElem"
                v-model="patternModeState.showEditConfigPanel"
                v-model:current-mode="currentMode"
                v-model:cropper-overlay-datas="cropperOverlayDatas"
                v-model:overlays-per-question-data="overlaysPerQuestionData"
                v-model:optional-questions="testConfig.optionalQuestions"
                :is-form-ready="!!patternModeConfigFormElem?.isFormReady"
                :is-pdf-loaded="isPdfLoaded"
                :page-img-data="pageImgData"
                :total-pages="pdfState.totalPages"
                @load-pdf-pattern-mode-data="loadPdfPatternModeData"
              />
            </div>
            <BaseButton
              class="my-3.5 shrink-0"
              icon-name="mdi:rocket-launch"
              label="Generate Output"
              :disabled="!hasQuestionsData"
              @click="() => {
                generateOutputState.downloaded = false
                dialogsState.showGenerateOutput = true
              }"
            />
            <PdfCropperQuestionDetailsPanel
              v-show="!cropperMode.isPattern"
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
      <UiResizableHandle :disabled="!settings.general.allowResizingPanels" />
      <UiResizablePanel
        :default-size="74"
        :min-size="40"
        :collapsible="false"
      >
        <UiScrollArea
          v-show="!isPdfLoaded
            || !(
              currentMode === 'crop'
              && cropperMode.isPattern
              && patternModeState.showEditConfigPanel
            )"
          ref="pdfPageScrollAreaElem"
          class="w-full h-full rounded border"
          type="auto"
        >
          <div class="flex flex-col focus-visible:outline-hidden">
            <div
              v-if="!isPdfLoaded"
              class="flex flex-col gap-6 justify-center mt-6"
            >
              <div class="flex gap-5 items-center justify-center">
                <BaseSimpleFileUpload
                  accept="application/pdf,.pdf"
                  :label="dialogsState.isLoadingPdf ? 'Please wait, loading PDF...' : 'Select a PDF'"
                  :icon-name="dialogsState.isLoadingPdf ? 'line-md:loading-twotone-loop' : 'line-md:plus'"
                  invalid-file-type-message="Please select a valid PDF."
                  @upload="handlePdfFileUpload"
                />
                <BaseButton
                  label="Load Existing Data"
                  variant="warn"
                  @click="dialogsState.showEditExistingFiles = true"
                />
              </div>
              <DocsPdfCropper class="mx-4 sm:mx-10 select-text" />
            </div>
            <template v-else>
              <!-- Pdf Page Container -->
              <div
                ref="mainImgPanelElem"
                class="flex select-none touch-none"
                tabindex="-1"
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
                  <div
                    ref="imgContainerElem"
                    class="inline-block"
                  >
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
            </template>
          </div>
        </UiScrollArea>
        <div
          v-show="isPdfLoaded && currentMode === 'crop' && cropperMode.isPattern"
          class="hidden flex-col gap-3 w-full h-full items-center last:flex"
        >
          <p class="text-sm text-center mt-10">
            <span class="text-lg font-bold mx-auto">Please wait. Loading config editor...</span><br><br>
            Webpage might be unresponsive for a few seconds while loading the config editor.
          </p>
        </div>
        <PdfCropperPatternModeConfigForm
          v-if="patternModeForm"
          v-show="currentMode === 'crop'
            && cropperMode.isPattern
            && patternModeState.showEditConfigPanel"
          ref="patternModeConfigForm"
        />
      </UiResizablePanel>
    </UiResizablePanelGroup>
    <UiDialog v-model:open="dialogsState.showQuestionDetails">
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
            @click="dialogsState.showQuestionDetails = false"
          />
        </div>
      </UiDialogContent>
    </UiDialog>
    <LazyUiDialog
      v-if="isPdfLoaded"
      v-model:open="dialogsState.showGenerateOutput"
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
                  :content="tooltipContent.outputFileType"
                  icon-size="1.25rem"
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
                  :content="tooltipContent.preGenerateImages"
                  icon-size="1.25rem"
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
                  :content="tooltipContent.preGenerateImagesScale"
                  icon-size="1.25rem"
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
            <span
              v-show="generateOutputState.generatingImages"
              class="font-semibold"
            >
              Please wait, generating images...<br>
            </span>
            <span
              v-if="generateOutputState.generatingImages && generateOutputState.generationProgress > 0"
              class="my-4 text-lg font-semibold text-cyan-400"
            >
              Currently generating {{ generateOutputState.generationProgress }} of {{ generateOutputState.totalQuestions }} questions...<br>
            </span>
            <p
              v-show="generateOutputState.generatingImages"
              class="mt-2"
            >
              If generating progress is stuck,
              then click on cancel below and try again with a lower img scale value<br><br>
              If even with a lower scale value,
              it is stuck then cancel again and just download without pre generated images
              (i.e. select "No" above)<br><br>
            </p>
            <span v-show="generateOutputState.preparingDownload">
              preparing download...
            </span>
            <span v-show="generateOutputState.downloaded">
              Downloaded!
            </span>
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
                <span class="text-center text-wrap text-gray-500 dark:text-gray-300 mt-4">
                  After downloading once,
                  you can always change the options above to generate &amp; download again with those options
                </span>
              </UiAccordionContent>
            </UiAccordionItem>
            <UiAccordionItem value="2">
              <UiAccordionTrigger>
                Important NOTE
              </UiAccordionTrigger>
              <UiAccordionContent>
                <p class="text-center text-wrap text-gray-500 dark:text-gray-300 my-5">
                  If you want to later on use the zip file via <strong>"zip from url"</strong> feature
                  and you are keeping the <strong>zip files</strong> in your <strong>github public repository</strong>
                  then your <strong>zip file size should not exceed 20MB</strong> for "zip from url" to work.<br>
                  (This is a limitation imposed by jsDelivr,
                  which is the provider from where your zip file will be loaded after the website internally
                  converts github url to jsDelivr url).
                </p>
              </UiAccordionContent>
            </UiAccordionItem>
          </UiAccordion>
        </UiScrollArea>
      </UiDialogContent>
    </LazyUiDialog>
    <LazyPdfCropperBulkEditDialog
      v-if="isPdfLoaded"
      v-model="dialogsState.showBulkEdit"
      v-model:optional-questions="testConfig.optionalQuestions"
      v-model:overlay-datas="cropperOverlayDatas"
      :pages-dimensions="pageImgData"
      :allow-resizing-panels="settings.general.allowResizingPanels"
    />
    <LazyGenerateTestImages
      v-if="generateOutputState.generatingImages && (generateOutputState.totalQuestions > 0)"
      :pdf-uint8-array="pdfState.fileUint8Array"
      :question-img-scale="generateOutputState.preGenerateImagesScale"
      :cropper-sections-data="cropperSectionsDataForPreGenerateImages"
      @current-question-progress="(questionNum) => generateOutputState.generationProgress = questionNum"
      @image-blobs-generated="addImageBlobsToZipAndDownload"
    />
    <LazyPdfCropperEditExistingFilesDialog
      v-if="dialogsState.showEditExistingFiles"
      v-model="dialogsState.showEditExistingFiles"
      @uploaded-data="loadExistingData"
    />
  </div>
</template>

<script setup lang="ts">
import '#layers/shared/app/assets/css/pdf-cropper.css'
import { wrap as comlinkWrap } from 'comlink'
import { zip, strToU8 } from 'fflate'
import type { AsyncZippable } from 'fflate'
import type { MuPdfProcessor } from '#layers/shared/app/src/worker/mupdf.worker'
import type {
  PatternModeParsedConfig,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/parsed-config-for-cropper'
import mupdfWorkerFile from '#layers/shared/app/src/worker/mupdf.worker?worker'
import { SEPARATOR } from '#layers/shared/shared/constants'
import { DataFileNames } from '#layers/shared/shared/enums'

type JsonOutputData = PdfCropperJsonOutput | AnswerKeyJsonOutputBasedOnPdfCropper

type PdfCropperTestConfig = Omit<PdfCropperJsonOutput['testConfig'], 'optionalQuestions'>
  & Required<Pick<PdfCropperJsonOutput['testConfig'], 'optionalQuestions'>>

useSeoMeta({
  title: 'PDF Cropper - PDF2CBT',
})

const selectOptions = {
  outputFileType: ['.zip', '.json'],
  preGenerateImages: [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ],
}

const tooltipContent = {
  outputFileType: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'Output file formats:'),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'ZIP'),
          ': Includes the JSON and PDF/Image files (Recommended to keep files together in one archive).',
        ]),
        h('li', [
          h('strong', 'JSON'),
          ': Downloads only the JSON file. You will have to upload PDF + JSON files going forward.',
        ]),
      ]),
    ]),

  preGenerateImages: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'Pre-Generate Question Images?'),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'Yes'),
          ': Pre-Generates Question Images from PDF now itself to store in zip as png files, ',
          'this will skip the image generation steps in test interface and results page\'s question preview as, ',
          'images in the zip will be used (Recommended).',
        ]),
        h('li', [
          h('strong', 'No'),
          ': Zip will contain the PDF instead of PNGs. ',
          'Generates Question Images from PDF when needed in test interface and results page\'s question preview.\n',
        ]),
      ]),
    ]),

  preGenerateImagesScale: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'Scale/Quality of the generated images, higher the scale, better the quality but takes more resources.'),
      h('p', [
        'This doesn\'t take Device Pixel Ratio into account, ',
        'so if you are using a very high DPI screen, then you can set this to a greater value.',
      ]),
    ]),
}

const migrateJsonData = useMigrateJsonData()

const jsonOutputData = shallowRef<JsonOutputData>(
  migrateJsonData.getPdfCropperJsonOutputTemplate(),
)

const pdfPageScrollAreaElem = useTemplateRef('pdfPageScrollAreaElem')

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

let mupdfWorker: ReturnType<typeof comlinkWrap<MuPdfProcessor>> | null = null

const mainImgPanelElem = useTemplateRef('mainImgPanelElem')

const pdfState = shallowReactive({
  currentPageNum: 0,
  currentThrottledPageNum: 0,
  totalPages: 0,
  fileUint8Array: null as Uint8Array | null,
})

const testConfig = reactive<PdfCropperTestConfig>({
  pdfFileHash: '', // SHA-256 hash of pdf file
  optionalQuestions: [],
})

const currentMode = shallowRef<PdfCropperCurrentMode>('crop')

const isPdfLoaded = shallowRef(false)

const settings = usePdfCropperLocalStorageSettings()

const { form: patternModeForm } = usePatternModeFormData()

const patternModeConfigFormElem = useTemplateRef('patternModeConfigForm')

const patternModeSidePanelElem = useTemplateRef('patternModeSidePanelElem')

const dialogsState = shallowReactive({
  isLoadingPdf: false,
  showSettings: false,
  showQuestionDetails: false,
  showGenerateOutput: false,
  showBulkEdit: false,
  showEditExistingFiles: false,
})

const _isBuildForWebsite = useRuntimeConfig().public.isBuildForWebsite as string | boolean
const preferLoadingLocalMupdfScript = _isBuildForWebsite !== 'true' && _isBuildForWebsite !== true

const patternModeState = shallowReactive({
  pdfPagesPatternModeData: null as null | PdfPagesPatternModeData,
  showEditConfigPanel: false,
})

const pageImgData = reactive<PageImgData>({})

// reactive Map of overlay datas keyed by id ((section || subject) + SEPARATOR + queNum + SEPARATOR + imgNum)
const cropperOverlayDatas = reactive(new Map<string, PdfCroppedOverlayData>())

const isPdfNotLoaded = computed(() => !isPdfLoaded.value)

const currentModeSelectOptions = reactive([
  { name: 'Crop', value: 'crop', disable: isPdfNotLoaded },
  { name: 'Edit', value: 'edit', disable: computed(() => cropperOverlayDatas.size === 0) },
])

const currentCropperModeSelectOptions = reactive([
  { name: 'Line', value: 'line', disable: isPdfNotLoaded },
  { name: 'Box', value: 'box', disable: isPdfNotLoaded },
  { name: 'Pattern', value: 'pattern', disable: isPdfNotLoaded },
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
  answerOptions: '4',
  marks: {
    cm: 4,
    pm: 1,
    im: -1,
  },
  pdfData: { l: 0, r: 0, t: 0, b: 0, page: 1 },
  answerOptionsCounterTypePrimary: 'default',
  answerOptionsCounterTypeSecondary: 'default',
})

const answerOptionsRegex = /^\d+(x\d+)?$/i

// count of overlays per question using queId as key
const overlaysPerQuestionData = reactive<PdfCropperOverlaysPerQuestion>(new Map())

const cachedData: {
  [questionType in QuestionType]?: {
    markingScheme: {
      cm: number
      pm: number
      im: number
    }
    answerOptions: string
    answerOptionsCounterTypePrimary: string
    answerOptionsCounterTypeSecondary: string
  }
} = {}

// store and use marking scheme, answer options, counter type datas for each question type
watch(
  () => mainOverlayData.type,
  (newQuestionType, oldQuestionType) => {
    const { cm, pm, im } = mainOverlayData.marks
    const {
      answerOptions,
      answerOptionsCounterTypePrimary,
      answerOptionsCounterTypeSecondary,
    } = mainOverlayData

    cachedData[oldQuestionType] = {
      markingScheme: { cm, pm, im },
      answerOptions: answerOptionsRegex.test(answerOptions) ? answerOptions : '',
      answerOptionsCounterTypePrimary,
      answerOptionsCounterTypeSecondary,
    }

    const dataInCache = cachedData[newQuestionType]
    if (dataInCache) {
      const { cm, pm, im } = dataInCache.markingScheme
      mainOverlayData.marks.cm = cm
      mainOverlayData.marks.pm = pm
      mainOverlayData.marks.im = im
      mainOverlayData.answerOptionsCounterTypePrimary = answerOptionsCounterTypePrimary
      mainOverlayData.answerOptionsCounterTypeSecondary = answerOptionsCounterTypeSecondary
      if (dataInCache.answerOptions)
        mainOverlayData.answerOptions = dataInCache.answerOptions
    }
    else if (oldQuestionType !== 'nat'
      && newQuestionType !== 'nat'
      && (oldQuestionType === 'msm' || newQuestionType === 'msm')) {
      mainOverlayData.answerOptionsCounterTypePrimary = 'default'
    }

    if (newQuestionType === 'nat') {
      mainOverlayData.answerOptionsCounterTypePrimary = 'default'
      mainOverlayData.answerOptionsCounterTypeSecondary = 'default'
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
      answerOptions: existingFirstOverlay.answerOptions,
      answerOptionsCounterTypePrimary: existingFirstOverlay.answerOptionsCounterTypePrimary,
      answerOptionsCounterTypeSecondary: existingFirstOverlay.answerOptionsCounterTypeSecondary,
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

// watch for changes to currentQuestionData user does from questions details fields
// if details has changed, and modify the overlay data based on what was changed
watch(currentQuestionData,
  (newData, oldData) => {
    if (newData.id === oldData.id) return

    const { id, queId: oldQueId, subject, section, que } = oldData
    if (!id) return

    const oldOverlay = cropperOverlayDatas.get(id)
    if (oldOverlay) {
      const newQueId = `${section || subject}${SEPARATOR}${que}`
      if (id.includes(newQueId + SEPARATOR)) { // is id upto queId same
        const imgNum = oldOverlay.imgNum
        const oldImgCount = overlaysPerQuestionData.get(oldQueId) || 1

        // if oldOverlay is first overlay/img of the question and question contains multiple overlays
        // then copy data (if changed) to other overlays of the question as well
        if (imgNum === 1 && oldImgCount > 1) {
          const nextOverlayData = cropperOverlayDatas.get(oldQueId + SEPARATOR + 2)
          if (!nextOverlayData) return

          let isDataChanged = false
          const keys = [
            'type', 'answerOptionsCounterTypePrimary',
            'answerOptionsCounterTypeSecondary', 'answerOptions',
          ] as const

          for (const key of keys) {
            if (oldOverlay[key] !== nextOverlayData[key]) {
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

          const {
            type,
            answerOptions,
            marks,
            answerOptionsCounterTypePrimary,
            answerOptionsCounterTypeSecondary,
          } = oldOverlay

          for (const newImgNum of utilRange(2, oldImgCount + 1)) {
            const overlay = cropperOverlayDatas.get(oldQueId + SEPARATOR + newImgNum)
            if (!overlay) return

            overlay.type = type
            overlay.answerOptions = answerOptions
            overlay.marks = { ...marks }
            overlay.answerOptionsCounterTypePrimary = answerOptionsCounterTypePrimary
            overlay.answerOptionsCounterTypeSecondary = answerOptionsCounterTypeSecondary
          }
        }

        return
      }
      storeOverlayData(oldOverlay, newQueId)
    }

    // Shift overlays to left to fill the oldOverlay that has been deleted/moved
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
        // Delete last one since it's now duplicated in the previous one
        // if there is no next overlay to begin with, then deletes the current one that needs to be deleted
        cropperOverlayDatas.delete(currentId)
        break
      }

      currentImgNum++
    }

    const oldImgCount = overlaysPerQuestionData.get(oldQueId)
    if (typeof oldImgCount === 'number') {
      if (oldImgCount > 1)
        overlaysPerQuestionData.set(oldQueId, oldImgCount - 1)
      else
        overlaysPerQuestionData.delete(oldQueId)
    }
  },
  { deep: false, flush: 'pre' },
)

const currentPageDetails = computed(() => {
  const { url = '', width = 0, height = 0 } = pageImgData[pdfState.currentThrottledPageNum] ?? {}
  const zoomScale = zoomScaleDebounced.value

  return {
    url,
    width,
    height,
    zoomScale,
  }
})

/*
  Following computered properties are just boolean values being used frequently
  in conditional statements
*/
const cropperMode = computed<CropperMode>(() => ({
  isBox: settings.value.general.cropperMode === 'box',
  isLine: settings.value.general.cropperMode === 'line',
  isPattern: settings.value.general.cropperMode === 'pattern',
}))

// Flag for generate output btn
const hasQuestionsData = computed<boolean>(() => cropperOverlayDatas.size > 0)

function storeCurrentQuestionData(
  pdfData: PdfCroppedOverlayData['pdfData'] | null = null,
  incrementQuestion: boolean = true,
) {
  const { subject, section, que, answerOptions } = mainOverlayData
  if (!subject || !(answerOptionsRegex.test(answerOptions))) {
    dialogsState.showQuestionDetails = true
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

async function loadPdfPatternModeData(
  pageNums: number[],
  options: PatternModeParsedConfig['settings'],
) {
  if (!mupdfWorker) await loadPdfFile(false, true)
  if (!mupdfWorker) return

  patternModeSidePanelElem.value?.runCropper(await mupdfWorker.getPdfPatternData(pageNums, options))
}

async function handlePdfFileUpload(file: File | Uint8Array) {
  dialogsState.isLoadingPdf = true
  testConfig.pdfFileHash = ''
  testConfig.optionalQuestions.length = 0

  try {
    if (file instanceof File) {
      const filenameParts = file.name.split('.')
      filenameParts.pop()
      const filename = filenameParts.join('.')
      generateOutputState.filename = filename

      pdfState.fileUint8Array = new Uint8Array(await file.arrayBuffer())
    }
    else {
      pdfState.fileUint8Array = file
    }

    loadPdfFile()
  }
  catch (err) {
    useErrorToast('Error loading uploaded file:', err)
  }
}

async function loadPdfFile(isFirstLoad: boolean = true, onlyLoadPdf = false) {
  try {
    if (!pdfState.fileUint8Array) return
    closeMupdfWorker()
    mupdfWorker = comlinkWrap<MuPdfProcessor>(new mupdfWorkerFile())

    const pagesCount = await mupdfWorker.loadPdf(pdfState.fileUint8Array, preferLoadingLocalMupdfScript, isFirstLoad)
    if (pagesCount && isFirstLoad) {
      pdfState.totalPages = pagesCount
      pdfState.currentPageNum = 1

      const _pageImgData = await mupdfWorker.getAllPagesDimensionsData()
      Object.assign(pageImgData, _pageImgData)
    }
    if (!onlyLoadPdf) {
      await renderPage(pdfState.currentPageNum)
      dialogsState.isLoadingPdf = false
      isPdfLoaded.value = true
    }
  }
  catch (err) {
    useErrorToast('Error loading PDF:', err)
  }
}

async function renderPage(pageNum: number) {
  try {
    if (!mupdfWorker)
      await loadPdfFile(false)

    if (!mupdfWorker) return

    const dpr = devicePixelRatio.value || 1
    const qualityFactor = settings.value.general.qualityFactor

    const pageScale = dpr * qualityFactor

    const maybeExistingPage = pageImgData[pageNum]
    if (!maybeExistingPage?.url || maybeExistingPage?.pageScale !== pageScale) {
      if (maybeExistingPage?.url) {
        URL.revokeObjectURL(maybeExistingPage.url)
      }

      const pageImgBlob = await mupdfWorker.getPageImage(pageNum, pageScale, true)

      const pageData = pageImgData[pageNum]!
      pageData.url = URL.createObjectURL(pageImgBlob)
      pageData.pageScale = pageScale
    }
  }
  catch (err) {
    useErrorToast('Error rendering PDF Page:', err)
  }
}

function transformDataToOutputFormat(data: Map<string, PdfCroppedOverlayData>): JsonOutputData {
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

        const {
          que,
          type,
          answerOptions,
          marks,
          answerOptionsCounterTypePrimary,
          answerOptionsCounterTypeSecondary,
        } = sortedQuestionOverlays[0]!
        const questionData: CropperQuestionData = {
          que,
          type: type,
          marks: {
            ...marks,
          },
          pdfData,
        }

        const answerOptionsCounterType: CropperQuestionData['answerOptionsCounterType'] = {}

        if (type !== 'msq') delete questionData.marks.pm
        if (type === 'msq' || type === 'mcq' || type === 'msm') {
          questionData.answerOptions = answerOptions || '4'

          if (answerOptionsCounterTypePrimary !== 'default') {
            answerOptionsCounterType.primary = answerOptionsCounterTypePrimary
          }
          if (type === 'msm') {
            questionData.marks.max = marks.cm * parseInt(answerOptions || '4')
            if (answerOptionsCounterTypeSecondary !== 'default')
              answerOptionsCounterType.secondary = answerOptionsCounterTypeSecondary
          }
        }
        if (answerOptionsCounterType.primary || answerOptionsCounterType.secondary) {
          questionData.answerOptionsCounterType = answerOptionsCounterType
        }

        subjectsData[subject][section][question] = questionData
      }
    }
  }

  const outputData = utilCloneJson(jsonOutputData.value)
  outputData.pdfCropperData = subjectsData
  outputData.testConfig.pdfFileHash = testConfig.pdfFileHash

  if (testConfig.optionalQuestions.length)
    outputData.testConfig.optionalQuestions = utilCloneJson(testConfig.optionalQuestions)

  migrateJsonData.removeEmptyKeysFromTestConfig(outputData.testConfig)

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
    await nextTick()
  }
  else {
    generateOutputState.preparingDownload = true
    generateOutputState.generatingImages = false
  }

  const filename = generateOutputState.filename + fileType

  if (!testConfig.pdfFileHash)
    testConfig.pdfFileHash = await utilGetHash(pdfU8Array)

  const jsonData = transformDataToOutputFormat(toRaw(cropperOverlayDatas))

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

async function loadExistingData(
  data: {
    pdfBuffer: Uint8Array
    jsonData: PdfCropperJsonOutput | AnswerKeyJsonOutputBasedOnPdfCropper
    filename: string
  },
) {
  try {
    await handlePdfFileUpload(data.pdfBuffer)

    jsonOutputData.value = data.jsonData

    const { pdfFileHash, optionalQuestions } = data.jsonData.testConfig ?? {}
    testConfig.pdfFileHash = pdfFileHash || ''
    if (Array.isArray(optionalQuestions) && optionalQuestions.length > 0) {
      testConfig.optionalQuestions = optionalQuestions
    }

    for (const [subject, subjectData] of Object.entries(data.jsonData.pdfCropperData)) {
      for (const [section, sectionData] of Object.entries(subjectData)) {
        for (const [question, questionData] of Object.entries(sectionData)) {
          const {
            pdfData,
            que,
            answerOptions,
            answerOptionsCounterType,
            type,
          } = questionData

          const marks: PdfCroppedOverlayData['marks'] = {
            cm: questionData.marks.cm,
            pm: questionData.marks.pm ?? 1,
            im: questionData.marks.im,
          }

          const queId = `${section}${SEPARATOR}${question}`

          let imgNum = 0
          for (const data of pdfData) {
            imgNum++
            const id = `${queId}${SEPARATOR}${imgNum}`
            const { page, x1, x2, y1, y2 } = data

            const pdfData = {
              page,
              l: Math.min(x1, x2),
              r: Math.max(x1, x2),
              t: Math.min(y1, y2),
              b: Math.max(y1, y2),
            }

            const overlayData: PdfCroppedOverlayData = {
              id,
              queId,
              que,
              subject,
              section,
              imgNum,
              type,
              answerOptions: answerOptions || '4',
              marks,
              pdfData,
              answerOptionsCounterTypePrimary: answerOptionsCounterType?.primary || 'default',
              answerOptionsCounterTypeSecondary: answerOptionsCounterType?.secondary || 'default',
            }

            cropperOverlayDatas.set(id, overlayData)
          }
          overlaysPerQuestionData.set(queId, imgNum)
        }
      }
    }

    generateOutputState.filename = data.filename
  }
  catch (err) {
    useErrorToast('Error loading JSON Data of Existing files', err)
  }
}

async function zipAndDownloadOutput() {
  const filesToZip = outputFilesToZip.value

  if (Object.keys(filesToZip).length > 0) {
    zip(filesToZip, { level: 0 }, (err, compressedZip) => {
      if (err) {
        useErrorToast('Error creating zip file:', err)
        generateOutputState.preparingDownload = false
        return
      }

      const outputBlob = new Blob(
        [compressedZip as unknown as Uint8Array<ArrayBuffer>],
        { type: 'application/zip' },
      )

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
        pdfPageScrollAreaElem.value?.scrollTopLeft()

        if (!pageImgData[newPageNum]?.url) {
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
  }
  catch {
    // maybe worker is not active
  }
  mupdfWorker = null
}

// clean up
onBeforeUnmount(() => {
  closeMupdfWorker()

  for (const pageData of Object.values(pageImgData)) {
    const url = pageData.url
    if (url)
      URL.revokeObjectURL(url)
  }

  stopUseDPR()
})
</script>
