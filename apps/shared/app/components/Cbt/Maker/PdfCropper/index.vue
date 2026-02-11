<script setup lang="ts">
import '#layers/shared/app/assets/css/cbt-maker.css'
import { wrap as comlinkWrap } from 'comlink'
import type { MuPdfProcessor } from '#layers/shared/app/src/worker/mupdf.worker'
import type {
  PatternModeParsedConfig,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/parsed-config-for-cropper'
import mupdfWorkerFile from '#layers/shared/app/src/worker/mupdf.worker?worker'
import { SEPARATOR } from '#layers/shared/shared/constants'
import {
  activeOverlayIdKey,
  cropperModeKey,
  pagesImgDataKey,
  pageZoomScaleKey,
  pdfPagesContainerDimsKey,
  currentModeKey,
  pdfPagesContainerScaledDimsKey,
  currentPagesToLoadKey,
  pdfContainerScrollYKey,
  cropperOverlayDatasKey,
  overlaysPerQuestionDataKey,
  instructionsDataKey,
} from '../keys'

const props = defineProps<{
  pdfFile: Uint8Array | null
}>()

const currentStep = defineModel<number>('currentStep', { required: true })

const pdfLoadingState = defineModel<{
  isLoading: boolean
  isLoaded: boolean
}>('pdfLoadingState', { required: true })

const cropperOverlayDatas = inject(cropperOverlayDatasKey)!
const overlaysPerQuestionData = inject(overlaysPerQuestionDataKey)!
const pagesImgData = inject(pagesImgDataKey)!
const instructionsData = inject(instructionsDataKey)!

const { pixelRatio: devicePixelRatio, stop: stopUseDPR } = useDevicePixelRatio()

let mupdfWorker: ReturnType<typeof comlinkWrap<MuPdfProcessor>> | null = null

const pdfContainerScrollAreaRef = useTemplateRef('pdfContainerScrollAreaRef')

const pdfTotalPagesCount = shallowRef(0)

const settings = usePdfCropperLocalStorageSettings()
const pdfPagesContainerDims = shallowReactive({
  w: 0,
  h: 0,
})

const zoomScaleDebounced = shallowRef(settings.value.general.scale)

const activeOverlayId = shallowRef('')
const currentMode = shallowRef<PdfCropperCurrentMode>('crop')

const { form: patternModeForm } = usePatternModeFormData()

const patternModeConfigFormElem = useTemplateRef('patternModeConfigForm')
const patternModeSidePanelElem = useTemplateRef('patternModeSidePanelElem')
const editCroppedOverlayRef = useTemplateRef('editCroppedOverlayRef')

const dialogsState = shallowReactive({
  showSettings: false,
  showQuestionDetails: false,
})

const _isBuildForWebsite = useRuntimeConfig().public.isBuildForWebsite as string | boolean
const preferLoadingLocalMupdfScript = _isBuildForWebsite !== 'true' && _isBuildForWebsite !== true

const patternModeState = shallowReactive({
  pdfPagesPatternModeData: null as null | PdfPagesPatternModeData,
  showEditConfigPanel: false,
})

const isPdfNotLoaded = computed(() => !pdfLoadingState.value.isLoaded)

const pdfPagesContainerScaledDims = computed(() => {
  const scale = zoomScaleDebounced.value
  return {
    w: pdfPagesContainerDims.w * scale,
    h: pdfPagesContainerDims.h * scale,
  }
})

const currentModeSelectOptions = reactive([
  { name: 'Crop', value: 'crop', disable: isPdfNotLoaded },
  { name: 'Edit', value: 'edit', disable: computed(() => cropperOverlayDatas.value.size === 0) },
])

const currentCropperModeSelectOptions = reactive([
  { name: 'Line', value: 'line', disable: isPdfNotLoaded },
  { name: 'Box', value: 'box', disable: isPdfNotLoaded },
  { name: 'Pattern', value: 'pattern', disable: isPdfNotLoaded },
])

const mainOverlayData = reactive<PdfCroppedOverlayInternalData>({
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
  coords: { l: 0, r: 0, t: 0, b: 0 },
  answerOptionsCounterTypePrimary: 'default',
  answerOptionsCounterTypeSecondary: 'default',
})

const answerOptionsRegex = /^\d+(x\d+)?$/i

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
      const {
        answerOptionsCounterTypePrimary,
        answerOptionsCounterTypeSecondary,
      } = dataInCache

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

const pdfContainerScaledScroll = useScroll(() => pdfContainerScrollAreaRef.value?.viewport)

const pdfContainerScrollY = computed({
  get: () => pdfContainerScaledScroll.y.value / zoomScaleDebounced.value,
  set: v => pdfContainerScaledScroll.y.value = v * zoomScaleDebounced.value,
})

const currentPageNum = computed({
  get: () => {
    const y = pdfContainerScrollY.value
    for (const [pageStr, imgData] of Object.entries(pagesImgData)) {
      if (imgData.bottom >= y && imgData.top <= (y + pdfPagesContainerDims.h))
        return Number(pageStr)
    }
    return 0
  },
  set: newPageNum => pdfContainerScrollY.value = (pagesImgData[newPageNum]?.top || 0) + 2,
})

const currentPagesToLoad = computed(() => {
  const pages: number[] = []

  const pNum = currentPageNum.value
  if (pNum === 0) return pages

  const loadCount = settings.value.general.pagesToLoad
  const startNum = Math.max(1, pNum - loadCount)
  const endNum = Math.min(pdfTotalPagesCount.value, pNum + loadCount)

  for (let i = startNum; i <= endNum; i++) {
    pages.push(i)
  }

  return pages
})

const currentQuestionData = computed<PdfCroppedOverlayInternalData>(() => {
  const id = activeOverlayId.value
  if (id) {
    const overlayData = cropperOverlayDatas.value.get(id)
    if (overlayData) {
      return overlayData
    }
  }
  return mainOverlayData
})

const storeOverlayData = (
  oldOverlay: PdfCroppedOverlayInternalData,
  newQueId: string,
  coords: PdfCroppedOverlayCoords | null = null,
) => {
  const existingFirstOverlay = cropperOverlayDatas.value.get(newQueId + SEPARATOR + '1')
  const existingQuestionImgCount = overlaysPerQuestionData.get(newQueId)

  let newOverlay: PdfCroppedOverlayInternalData | null = null
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
      coords: oldOverlay.coords,
    }
  }
  else {
    newOverlay = utilCloneJson(oldOverlay)
    newId = newQueId + SEPARATOR + '1'
    newOverlay.id = newId
    newOverlay.queId = newQueId
    newOverlay.imgNum = 1
  }

  if (coords) newOverlay.coords = coords

  const { l, r, b, t } = newOverlay.coords

  newOverlay.coords.l = Math.min(l, r)
  newOverlay.coords.r = Math.max(l, r)
  newOverlay.coords.t = Math.min(t, b)
  newOverlay.coords.b = Math.max(t, b)

  cropperOverlayDatas.value.set(newId, newOverlay)
  overlaysPerQuestionData.set(newQueId, newImgNum)
}

// watch for changes to currentQuestionData user does from questions details fields
// if details has changed, and modify the overlay data based on what was changed
watch(currentQuestionData,
  (newData, oldData) => {
    if (newData.id === oldData.id) return

    const { id, queId: oldQueId, subject, section, que } = oldData
    if (!id) return

    const oldOverlay = cropperOverlayDatas.value.get(id)
    if (oldOverlay) {
      const newQueId = `${section || subject}${SEPARATOR}${que}`
      if (id.includes(newQueId + SEPARATOR)) { // is id upto queId same
        const imgNum = oldOverlay.imgNum
        const oldImgCount = overlaysPerQuestionData.get(oldQueId) || 1

        // if oldOverlay is first overlay/img of the question and question contains multiple overlays
        // then copy data (if changed) to other overlays of the question as well
        if (imgNum === 1 && oldImgCount > 1) {
          const nextOverlayData = cropperOverlayDatas.value.get(oldQueId + SEPARATOR + 2)
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
            const overlay = cropperOverlayDatas.value.get(oldQueId + SEPARATOR + newImgNum)
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

      const nextOverlayData = cropperOverlayDatas.value.get(nextId)
      if (nextOverlayData) {
        nextOverlayData.id = currentId
        nextOverlayData.imgNum = currentImgNum
        cropperOverlayDatas.value.set(currentId, nextOverlayData)
      }
      else {
        // Delete last one since it's now duplicated in the previous one
        // if there is no next overlay to begin with, then deletes the current one that needs to be deleted
        cropperOverlayDatas.value.delete(currentId)
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

/*
  Following computered properties are just boolean values being used frequently
  in conditional statements
*/
const cropperMode = computed<CropperMode>(() => ({
  isBox: currentMode.value === 'crop' && settings.value.general.cropperMode === 'box',
  isLine: currentMode.value === 'crop' && settings.value.general.cropperMode === 'line',
  isPattern: currentMode.value === 'crop' && settings.value.general.cropperMode === 'pattern',
}))

// Flag for generate output btn
const hasQuestionsData = computed<boolean>(() => cropperOverlayDatas.value.size > 0)

function storeCurrentQuestionData(
  coords: PdfCroppedOverlayCoords | null = null,
  incrementQuestion: boolean = true,
) {
  const { subject, section, que, answerOptions } = mainOverlayData
  if (!subject || !(answerOptionsRegex.test(answerOptions))) {
    dialogsState.showQuestionDetails = true
    return
  }

  if (!coords) coords = { ...mainOverlayData.coords }

  const { l, r, b, t } = coords

  const minDims = settings.value.general.minCropDimension
  if ((Math.abs(l - r) < minDims) || (Math.abs(b - t) < minDims)) {
    return
  }

  const queId = `${section || subject}${SEPARATOR}${que}`
  storeOverlayData(mainOverlayData, queId, coords)

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

async function loadPdfFile(isFirstLoad: boolean = true, onlyLoadPdf = false) {
  try {
    if (!props.pdfFile) return

    closeMupdfWorker()
    mupdfWorker = comlinkWrap<MuPdfProcessor>(new mupdfWorkerFile())

    const pagesCount = await mupdfWorker.loadPdf(
      props.pdfFile,
      preferLoadingLocalMupdfScript,
      isFirstLoad,
    )
    if (pagesCount && isFirstLoad) {
      pdfTotalPagesCount.value = pagesCount
      pdfContainerScrollY.value = 0

      const _pageImgData = await mupdfWorker.getAllPagesDimensionsData()
      let w = 0
      let h = 0
      for (const img of Object.values(_pageImgData)) {
        w = Math.max(w, img.width)
        h += img.height
      }
      pdfPagesContainerDims.h = h
      pdfPagesContainerDims.w = w

      Object.assign(pagesImgData, _pageImgData)
    }
    if (!onlyLoadPdf) {
      await renderCurrentPages()
      pdfLoadingState.value.isLoading = false
      pdfLoadingState.value.isLoaded = true
    }
  }
  catch (err) {
    useErrorToast('Error loading PDF:', err)
  }
}

async function renderPage(pageNum: number) {
  try {
    if (!mupdfWorker) await loadPdfFile(false)
    if (!mupdfWorker) return

    const dpr = devicePixelRatio.value || 1
    const qualityFactor = settings.value.general.qualityFactor

    const pageScale = dpr * qualityFactor * zoomScaleDebounced.value

    const maybeExistingPage = pagesImgData[pageNum]
    if (!maybeExistingPage?.url || maybeExistingPage?.pageScale !== pageScale) {
      if (maybeExistingPage?.url) {
        URL.revokeObjectURL(maybeExistingPage.url)
      }

      const pageImgBlob = await mupdfWorker.getPageImage(pageNum, pageScale, true)

      const pageData = pagesImgData[pageNum]!
      pageData.url = URL.createObjectURL(pageImgBlob)
      pageData.pageScale = pageScale
    }
  }
  catch (err) {
    useErrorToast('Error rendering PDF Page:', err)
  }
}

async function renderCurrentPages() {
  const pages = currentPagesToLoad.value
  for (const pageNum of pages)
    renderPage(pageNum)
}

function closeMupdfWorker() {
  try {
    mupdfWorker?.close()
  }
  catch {
    // maybe worker is not active
  }
  mupdfWorker = null
}

onMounted(() => {
  zoomScaleDebounced.value = settings.value.general.scale

  watchDebounced(
    [() => settings.value.general.scale, () => settings.value.general.qualityFactor],
    ([oldScale], [newScale]) => {
      if (oldScale !== newScale) {
        const scale = settings.value.general.scale
        const currentScrollY = pdfContainerScrollY.value
        zoomScaleDebounced.value = scale
        nextTick(() => pdfContainerScrollY.value = currentScrollY)
        renderCurrentPages()
      }
      else {
        renderCurrentPages()
      }
    },
    { debounce: 300, maxWait: 3000 },
  )

  watchThrottled(
    currentPagesToLoad,
    renderCurrentPages,
    { throttle: 500, trailing: true, leading: true },
  )
})

// clean up
onBeforeUnmount(() => {
  closeMupdfWorker()

  for (const pageData of Object.values(pagesImgData)) {
    const url = pageData.url
    if (url)
      URL.revokeObjectURL(url)
  }

  stopUseDPR()
})

defineExpose({ loadPdfFile })

provide(pdfPagesContainerDimsKey, pdfPagesContainerDims)
provide(pdfPagesContainerScaledDimsKey, pdfPagesContainerScaledDims)
provide(pageZoomScaleKey, zoomScaleDebounced)
provide(currentPagesToLoadKey, currentPagesToLoad)
provide(pdfContainerScrollYKey, pdfContainerScrollY)
provide(activeOverlayIdKey, activeOverlayId)
provide(currentModeKey, currentMode)
provide(cropperModeKey, cropperMode)
</script>

<template>
  <div class="flex flex-col grow min-h-0">
    <CbtMakerPdfCropperSettingsDrawer
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
                    icon-name="material-symbols:settings"
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
                    :disabled="!pdfLoadingState.isLoaded"
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
                <BaseFloatLabel
                  class="flex-[1_1_55%] min-w-[50%]"
                  label="Page Number"
                  label-id="pdf_page_num"
                  label-class="start-1/2! -translate-x-1/2"
                >
                  <BaseInputNumber
                    id="pdf_page_num"
                    v-model="currentPageNum"
                    input-class="h-10 text-base"
                    :disabled="currentPageNum === 0 || !pdfLoadingState.isLoaded"
                    :min="1"
                    :max="pdfTotalPagesCount"
                  />
                </BaseFloatLabel>
              </div>
            </div>
            <BaseButton
              class="my-3.5 shrink-0 mt-5"
              icon-name="material-symbols:check-circle-outline"
              label="Finish Cropping"
              :disabled="!hasQuestionsData"
              @click="currentStep = 2"
            />

            <CbtMakerPdfCropperPatternModeSidePanel
              v-show="cropperMode.isPattern"
              ref="patternModeSidePanelElem"
              v-model="patternModeState.showEditConfigPanel"
              v-model:current-mode="currentMode"
              v-model:cropper-overlay-datas="cropperOverlayDatas"
              v-model:overlays-per-question-data="overlaysPerQuestionData"
              v-model:additional-data="instructionsData.additionalData"
              :is-form-ready="!!patternModeConfigFormElem?.isFormReady"
              :is-pdf-loaded="pdfLoadingState.isLoaded"
              :page-img-data="pagesImgData"
              :total-pages="pdfTotalPagesCount"
              @load-pdf-pattern-mode-data="loadPdfPatternModeData"
            />

            <CbtMakerPdfCropperQuestionDetailsPanel
              v-show="!cropperMode.isPattern"
              v-model="currentQuestionData"
              :is-current-question-main-overlay="!activeOverlayId"
              :is-pdf-loaded="pdfLoadingState.isLoaded"
            />
          </div>
        </UiScrollArea>
      </UiResizablePanel>
      <UiResizableHandle :disabled="!settings.general.allowResizingPanels" />
      <UiResizablePanel
        :default-size="74"
        :min-size="40"
        :collapsible="false"
        class="flex justify-center"
      >
        <slot v-if="!pdfLoadingState.isLoaded" />

        <UiScrollArea
          ref="pdfContainerScrollAreaRef"
          type="auto"
          scroll-bar-class="-right-3.5! w-3.5"
          :style="{ '--reka-scroll-area-thumb-width': '14px' }"
        >
          <div
            v-show="pdfLoadingState.isLoaded && !(
              cropperMode.isPattern
              && patternModeState.showEditConfigPanel
            )"
            class="relative"
            :class="{
              'blur-cropped': settings.general.blurCroppedRegion,
            }"
            :style="{
              '--pdf-page-scale': zoomScaleDebounced,
              '--pdf-pages-container-width': pdfPagesContainerDims.w,
              '--pdf-pages-container-height': pdfPagesContainerDims.h,
              '--pdf-cropped-blur-intensity': settings.general.blurIntensity,
              '--crop-selection-guide-color': settings.general.cropSelectionGuideColor,
              '--crop-selected-region-color': settings.general.cropSelectedRegionColor,
              '--crop-selection-skip-color': settings.general.cropSelectionSkipColor,
              '--crop-selection-bg-opacity': settings.general.cropSelectionBgOpacity,
              '--crop-selected-region-bg-opacity': settings.general.cropSelectedRegionBgOpacity,
              'background-color': settings.general.pageBGColor,
            }"
          >
            <div
              class="flex flex-col focus-visible:outline-hidden"
              style="overflow-anchor: none;"
              :style="{
                width: `${pdfPagesContainerScaledDims.w}px`,
                height: `${pdfPagesContainerScaledDims.h}px`,
              }"
              tabindex="-1"
            >
              <template
                v-for="(pageImg, pageNum) in pagesImgData"
                :key="pageNum"
              >
                <img
                  v-if="currentPagesToLoad.includes(Number(pageNum))"
                  :src="pageImg.url"
                  class="border-x border-gray-500 pdf-cropper-img"
                  :style="{
                    '--pdf-page-width': pageImg.width,
                    '--pdf-page-height': pageImg.height,
                    '--pdf-page-top': pageImg.top,
                  }"
                  draggable="false"
                >
              </template>
            </div>
            <CbtMakerPdfCropperCroppedOverlays
              :class="{
                'pointer-events-none': currentMode === 'crop',
              }"
              :show-labels="settings.general.showQuestionDetailsOnOverlay"
              @on-pointer-down-on-cropped-overlay="editCroppedOverlayRef?.onPointerDownOnCroppedOverlay"
              @on-start-resize-on-cropped-overlay="editCroppedOverlayRef?.onStartResizeOnCroppedOverlay"
            />
            <CbtMakerPdfCropperLineCropperMode
              v-if="cropperMode.isLine"
              v-model="mainOverlayData.coords"
              @set-cropped-rect="storeCurrentQuestionData"
            />
            <CbtMakerPdfCropperBoxCropperMode
              v-else-if="cropperMode.isBox"
              v-model="mainOverlayData.coords"
              @set-cropped-rect="storeCurrentQuestionData"
            />
            <CbtMakerPdfCropperEditCroppedOverlay
              v-else-if="currentMode === 'edit'"
              ref="editCroppedOverlayRef"
              :current-page-num="currentPageNum"
              @set-cropped-rect="storeCurrentQuestionData"
            />
          </div>
        </UiScrollArea>

        <div
          v-show="pdfLoadingState.isLoaded
            && cropperMode.isPattern
            && patternModeState.showEditConfigPanel"
          class="hidden flex-col gap-3 w-full h-full items-center last:flex"
        >
          <p class="text-sm text-center mt-10">
            <span class="text-lg font-bold mx-auto">Please wait. Loading config editor...</span><br><br>
            Webpage might be unresponsive for a few seconds while loading the config editor.
          </p>
          <CbtMakerPdfCropperPatternModeConfigForm
            v-if="patternModeForm"
            v-show="cropperMode.isPattern
              && patternModeState.showEditConfigPanel"
            ref="patternModeConfigForm"
          />
        </div>
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
  </div>
</template>
