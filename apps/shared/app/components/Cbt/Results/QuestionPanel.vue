<template>
  <div>
    <UiSheet
      v-if="currentQuestionState.data"
      v-model:open="drawerVisibility"
      class="max-h-dvh"
    >
      <UiSheetContent
        side="right"
        class="sm:max-w-none w-full! sm:w-[calc(var(--view-question-drawer)*1%)]! @container
          divide-y divide-gray-500 gap-0"
        :style="{
          '--view-question-drawer': storageSettings.quePreview.drawerWidth,
        }"
        @pointer-down-outside="sheetElemState.onClickOutside($event)"
      >
        <UiSheetHeader class="p-3 pb-2">
          <UiSheetTitle class="flex">
            <span class="text-lg sm:text-xl mx-auto">
              Question Num: {{ displayQuestionNumber }}
            </span>
            <div class="flex gap-2 mr-12 sm:gap-4">
              <BaseButton
                variant="outline"
                size="iconMd"
                title="Question Notes"
                icon-name="mdi:text-box-edit-outline"
                :icon-class="testNotes[currentQuestionState.id] ? 'text-green-400' : 'text-orange-500'"
                @click="() => showNotesDialog = !showNotesDialog"
              />
              <BaseColorPicker
                v-model="storageSettings.quePreview.imgBgColor"
                with-alpha
                title="Question Image BG Color"
                @show="sheetElemState.preventClose = true"
                @close="sheetElemState.preventClose = false"
              />
              <BaseButton
                variant="outline"
                size="iconMd"
                title="Layout Type"
                class="hidden! sm:inline-flex!"
                :class="{
                  'rotate-y-180': storageSettings.quePreview.imgPanelDir === 'right',
                }"
                icon-name="my-icon:sidebar"
                @click="() => {
                  storageSettings.quePreview.imgPanelDir = storageSettings.quePreview.imgPanelDir === 'left'
                    ? 'right'
                    : 'left'
                }"
              />
              <BaseButton
                variant="outline"
                size="iconMd"
                title="Increase Width"
                class="hidden! sm:inline-flex!"
                icon-name="mdi:arrow-expand-left"
                icon-class="text-fuchsia-500"
                :disabled="storageSettings.quePreview.drawerWidth >= 100"
                @click="resizeDrawer('increase')"
              />
              <BaseButton
                variant="outline"
                size="iconMd"
                title="Decrease Width"
                class="hidden! sm:inline-flex!"
                icon-name="mdi:arrow-expand-right"
                icon-class="text-fuchsia-500"
                :disabled="storageSettings.quePreview.drawerWidth <= RESULTS_QUESTION_PANEL_DRAWER_MIN_SIZE"
                @click="resizeDrawer('decrease')"
              />
              <BaseButton
                variant="outline"
                size="iconMd"
                title="Increase Image Size"
                class="hidden! sm:inline-flex!"
                icon-name="mdi:file-image-plus"
                icon-class="text-fuchsia-500"
                :disabled="imageWidth >= 100"
                @click="resizeImage('increase')"
              />
              <BaseButton
                variant="outline"
                size="iconMd"
                title="Decrease Image Size"
                class="hidden! sm:inline-flex!"
                icon-name="mdi:file-image-minus"
                icon-class="text-fuchsia-500"
                :disabled="imageWidth <= 20"
                @click="resizeImage('decrease')"
              />
            </div>
          </UiSheetTitle>
        </UiSheetHeader>

        <div
          class="flex w-full h-full min-h-0 group divide-x divide-gray-500
            data-[vertical=false]:flex-col
            data-[orientation=left]:flex-row-reverse
            data-[orientation=left]:divide-x-reverse"
          :data-vertical="screenWidth.isSmOrAbove"
          :data-orientation="storageSettings.quePreview.imgPanelDir"
        >
          <div
            id="question-panel-side-container"
            class="flex flex-col shrink-0 gap-8 divide-y min-h-0 divide-gray-500
            min-w-90 sm:min-w-80 lg:min-w-90 text-[0.8rem] lg:text-base"
          >
            <div
              class="grid h-fit divide-y divide-gray-500 border-gray-500 rounded
              group-data-[vertical=false]:border
              [&>div]:group-data-[vertical=true]:[&>*]:p-1
              [&>div]:group-data-[vertical=true]:pl-2
              [&>div]:group-data-[vertical=false]:sm:pr-8
              [&>div]:group-data-[vertical=false]:gap-4"
            >
              <div class="flex justify-between items-center py-0.5 px-4">
                <span class="shrink-0 text-nowrap">
                  <span>Time Spent:&nbsp;</span>
                  <span class="font-semibold">
                    {{ utilSecondsToTime(currentQuestionState.data.timeSpent, 'mmm:ss') }}
                  </span>
                </span>
                <span class="text-ellipsis text-right text-nowrap">
                  {{ currentQuestionState.data.section }}
                </span>
              </div>

              <div class="flex justify-between items-center py-0.5 px-4 group-data-[vertical=false]:text-nowrap">
                <div>
                  <span>Result:&nbsp;</span>
                  <span
                    class="font-semibold"
                    :class="styleClasses.resultStatus[currentQuestionState.data.result.status]"
                  >
                    {{ RESULT_STATUS_LABELS[currentQuestionState.data.result.status] }}
                  </span>
                </div>
                <div class="text-right">
                  <span>Type: {{ currentQuestionState.data.type.toUpperCase() }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center py-0.5 px-4 group-data-[vertical=false]:text-nowrap">
                <div>
                  <span>Marks:&nbsp;</span>
                  <span
                    class="font-semibold"
                    :class="styleClasses.resultStatus[currentQuestionState.data.result.status]"
                  >
                    {{ utilMarksWithSign(currentQuestionState.data.result.marks) }}
                  </span>
                </div>
                <div class="text-right">
                  <span>Status:&nbsp;</span>
                  <span
                    class="font-semibold"
                    :class="styleClasses.questionStatus[currentQuestionState.data.status]"
                  >
                    {{ QUESTION_STATUS_LABELS[currentQuestionState.data.status] }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="grow flex flex-col min-h-0 justify-between">
            <div class="flex flex-col min-h-0 gap-6">
              <UiScrollArea
                ref="imgContainerScrollAreaElem"
                type="auto"
              >
                <div class="grid mt-2 px-4 [&>*]:mx-auto">
                  <template v-if="testQuestionsImgUrls[currentTestResultsId]?.[currentQuestionState.id]">
                    <img
                      v-for="(url, index) in testQuestionsImgUrls[currentTestResultsId]![currentQuestionState.id]"
                      :key="index"
                      :src="url"
                      :style="{
                        backgroundColor: storageSettings.quePreview.imgBgColor,
                        width: `${imageWidth}%`,
                      }"
                      draggable="false"
                    >
                  </template>
                  <template v-else-if="pdfRenderingProgress === 'loading-zip-from-url'">
                    <div class="flex items-center gap-4 text-gray-200 justify-center p-6 text-xl sm:text-2xl">
                      <Icon name="line-md:loading-twotone-loop" />
                      <span>Loading ZIP from URL, please wait...</span>
                    </div>
                  </template>
                  <template v-else-if="pdfRenderingProgress === 'loading-file'">
                    <div class="flex items-center gap-4 text-gray-200 justify-center p-6 text-xl sm:text-2xl">
                      <Icon name="line-md:loading-twotone-loop" />
                      <span>Loading your pdf/zip, please wait...</span>
                    </div>
                  </template>
                  <template v-else-if="pdfRenderingProgress === 'loading-pdf-renderer'">
                    <div class="flex items-center gap-4 text-gray-200 justify-center p-6 text-xl sm:text-2xl">
                      <Icon name="line-md:loading-twotone-loop" />
                      <span>Loading PDF Renderer, please wait...</span>
                    </div>
                  </template>
                  <template v-else-if="pdfRenderingProgress === 'generating-img'">
                    <div class="flex items-center gap-4 text-gray-200 justify-center p-6 text-xl sm:text-2xl">
                      <Icon name="material-symbols:rocket-launch" />
                      <span>Generating Question Image, please wait...</span>
                    </div>
                  </template>
                  <template v-else-if="pdfRenderingProgress === 'failed'">
                    <div class="flex items-center gap-4 justify-center text-red-400 p-6 text-xl sm:text-2xl">
                      <Icon name="mdi:alert-circle-outline" />
                      <span>Failed to generate question image from pdf.</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex items-center gap-4 justify-center p-6 text-red-400 text-xl sm:text-2xl">
                      <Icon name="mdi:image-off-outline" />
                      <span>Encountered an Error or No image available to generate.</span>
                    </div>
                  </template>
                </div>
              </UiScrollArea>
              <Teleport
                to="#question-panel-side-container"
                defer
                :disabled="!screenWidth.isSmOrAbove"
              >
                <UiScrollArea
                  ref="answersContainerScrollAreaElem"
                  type="auto"
                >
                  <div class="flex flex-col items-center shrink-0 mt-3 w-full h-full @container px-2">
                    <div
                      v-if="currentQuestionState.data.type === 'mcq' || currentQuestionState.data.type === 'msq'"
                      class="grid grid-cols-2 gap-x-5 sm:@min-lg:gap-x-10 gap-y-10 mx-auto
                        font-bold text-base sm:text-sm lg:text-lg text-center"
                      :style="optionsStyle"
                    >
                      <div
                        v-for="n in parseInt(currentQuestionState.data.answerOptions || '4')"
                        :key="n"
                        class="relative border-2 border-gray-300 rounded-lg p-1
                          min-w-35
                        has-[.option-status-correct]:border-green-500
                        has-[.option-status-correct]:bg-green-500/2
                        has-[.option-result-partial]:border-yellow-500!
                        has-[.option-result-partial]:bg-yellow-500/2!
                        has-[.option-result-incorrect]:border-red-500!
                        has-[.option-result-incorrect]:bg-red-500/2!
                        has-[.option-status-dropped]:border-fuchsia-500
                        has-[.option-status-bonus]:border-cyan-500"
                      >
                        <span
                          :class="'option-status-' + getCorrectAnswerStatus(n)"
                          class="absolute top-0 left-2 -translate-y-1/2 rounded-sm bg-background
                            flex items-center justify-center
                            [.option-status-correct]:[&>.status-correct]:inline-block!
                            [.option-status-bonus]:[&>.status-bonus]:inline-block!
                            [.option-status-dropped]:[&>.status-dropped]:inline-block!
                          [.option-status-correct]:text-green-500
                          [.option-status-bonus]:text-cyan-500
                          [.option-status-dropped]:text-fuchsia-500"
                        >
                          <Icon
                            name="mdi:check-circle"
                            size="1.4rem"
                            class="status-correct hidden!"
                          />
                          <Icon
                            name="mdi:star-circle"
                            size="1.4rem"
                            class="status-bonus hidden!"
                          />
                          <Icon
                            name="mdi:triangle-down"
                            size="1.4rem"
                            class="status-dropped hidden!"
                          />
                        </span>
                        <span
                          :class="'option-result-' + getYourAnswerStatus(n)"
                          class="absolute top-0 right-2 -translate-y-1/2 rounded-sm bg-background
                            flex items-center justify-center text-green-500
                              [.option-result-none]:hidden!
                            [.option-result-partial]:text-yellow-500
                            [.option-result-incorrect]:text-red-500
                            [.option-result-neutral]:text-gray-500"
                          title="Your Answer"
                        >
                          <Icon
                            name="mdi:account-edit"
                            size="1.4rem"
                          />
                        </span>
                        <label class="option-content inline-block" />
                      </div>
                    </div>
                    <div
                      v-else-if="currentQuestionState.data.type === 'nat'"
                      class="grid grid-cols-1 gap-10"
                    >
                      <div
                        v-for="n in (
                        (
                          currentQuestionState.data.result.status === 'incorrect'
                          || currentQuestionState.data.result.status === 'notAnswered'
                        ) ? 2
                          : 1
                        )"
                        :key="n"
                        class="relative text-center text-xl font-bold pb-1
                          border-2 border-gray-300 rounded-lg
                          min-w-35
                        has-[.numeric-status-correct]:border-green-500
                        has-[.numeric-status-correct]:bg-green-500/2
                        has-[.numeric-result-incorrect]:border-red-500!
                        has-[.numeric-result-incorrect]:bg-red-500/2!
                        has-[.numeric-status-dropped]:border-fuchsia-500
                        has-[.numeric-status-bonus]:border-cyan-500"
                      >
                        <span
                          v-if="
                            (
                              n === 1
                              && currentQuestionState.data.result.status !== 'incorrect'
                              && currentQuestionState.data.result.status !== 'notAnswered'
                            ) || (
                              n === 2
                              && (
                                currentQuestionState.data.result.status === 'incorrect'
                                || currentQuestionState.data.result.status === 'notAnswered'
                              )
                            )"
                          :class="'numeric-status-' + getCorrectAnswerStatus(0)"
                          class="absolute top-0 left-2 -translate-y-1/2 rounded-sm bg-background
                            flex items-center justify-center
                            [.numeric-status-correct]:[&>.status-correct]:inline-block!
                            [.numeric-status-bonus]:[&>.status-bonus]:inline-block!
                            [.numeric-status-dropped]:[&>.status-dropped]:inline-block!
                          [.numeric-status-correct]:text-green-500
                          [.numeric-status-bonus]:text-cyan-500
                          [.numeric-status-dropped]:text-fuchsia-500"
                        >
                          <Icon
                            name="mdi:check-circle"
                            size="1.4rem"
                            class="status-correct hidden!"
                          />
                          <Icon
                            name="mdi:star-circle"
                            size="1.4rem"
                            class="status-bonus hidden!"
                          />
                          <Icon
                            name="mdi:triangle-down"
                            size="1.4rem"
                            class="status-dropped hidden!"
                          />
                        </span>
                        <span
                          v-if="n === 1"
                          :class="'numeric-result-' + getYourAnswerStatus(0)"
                          class="absolute top-0 right-2 -translate-y-1/2 rounded-sm bg-background
                            flex items-center justify-center text-gray-300
                            [.numeric-result-correct]:text-green-500
                            [.numeric-result-partial]:text-yellow-500
                            [.numeric-result-incorrect]:text-red-500"
                          title="Your Answer"
                        >
                          <Icon
                            name="mdi:account-edit"
                            size="1.4rem"
                          />
                        </span>
                        {{
                          utilStringifyAnswer(
                            currentQuestionState.data.result.status === 'correct'
                              ? currentQuestionState.data.result.correctAnswer
                              : (n === 1 ? currentQuestionState.data.answer : currentQuestionState.data.result.correctAnswer),
                            currentQuestionState.data.type,
                          )
                        }}
                      </div>
                    </div>
                    <CbtResultsQuestionPanelMsmQuestionTypeDiv
                      :question-data="currentQuestionState.data"
                      :options-format-settings="answerOptionsFormat.msm"
                    />
                  </div>
                </UiScrollArea>
              </Teleport>
            </div>
            <div class="grid grid-cols-2 mx-auto gap-7 @min-md:gap-20 shrink-0 mt-6 mb-8">
              <div class="flex items-center justify-center">
                <BaseButton
                  v-if="currentQueIndex !== 0"
                  :label="screenWidth.isLgOrAbove ? 'Prev Question' : 'Prev Q.'"
                  variant="help"
                  icon-name="material-symbols:arrow-back-ios-rounded"
                  @click="navigateQuestion('prev')"
                />
              </div>
              <div class="flex items-center justify-center">
                <BaseButton
                  v-if="currentQueIndex !== (questionsToPreview.length - 1)"
                  :label="screenWidth.isLgOrAbove ? 'Next Question' : 'Next Q.'"
                  class="flex flex-row-reverse"
                  variant="help"
                  icon-name="material-symbols:arrow-forward-ios-rounded"
                  @click="navigateQuestion('next')"
                />
              </div>
            </div>
          </div>
        </div>
      </UiSheetContent>
    </UiSheet>
    <UiDialog
      v-model:open="fileUploaderState.showLoadPdfDialog"
    >
      <UiDialogContent class="max-w-lg text-center">
        <UiDialogHeader>
          <UiDialogTitle>Upload PDF/ZIP for Question Preview</UiDialogTitle>
        </UiDialogHeader>
        <p class="font-bold text-base text-yellow-300">
          To view question preview, you need to upload this test's PDF or ZIP file
          (the same one you had uploaded on test interface).
        </p>
        <p class="m-4 text-base">
          Once loaded, question images will be in RAM and hence active as long as this website is opened.<br>
          Refreshing the page, closing window, or changing to another test (via My Tests) will clear all imgs thus requiring you to upload the file again if you want to see the question preview.
        </p>
        <UiDialogFooter>
          <BaseSimpleFileUpload
            accept="application/pdf,application/zip,.pdf,.zip"
            label="Upload PDF or ZIP file"
            invalid-file-type-message="Please select a valid PDF or ZIP file which you had uploaded on Test Interface."
            icon-name="prime:upload"
            @upload="handleFileUpload"
          />
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
    <UiDialog
      v-model:open="fileUploaderState.showPdfHashMismatchDialog"
      non-closable
    >
      <UiDialogContent class="max-w-xl">
        <UiDialogHeader>
          <UiDialogTitle>PDF hash is not matching with the one in your test data!</UiDialogTitle>
        </UiDialogHeader>
        <div class="flex mb-6 items-center">
          <p
            class="text-lg text-center"
          >
            PDF file's hash is different to the one that is in your test data.<br><br>
            Hash can differ if even slight modification was done to pdf's contents.<br><br>
            If you are sure that pdf/zip file is correct, then you can continue anyway.<br>
            OR<br>
            You can go back and re-upload the correct one.<br>
          </p>
        </div>
        <UiDialogFooter>
          <BaseButton
            label="Continue anyway"
            variant="warn"
            icon-name="mdi:rocket"
            @click="startRenderingImgs()"
          />
          <BaseButton
            label="Go back to Re-upload"
            icon-name="material-symbols:undo-rounded"
            @click="() => {
              fileUploaderState.showPdfHashMismatchDialog = false
              fileUploaderState.showLoadPdfDialog = true
            }"
          />
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
    <UiDialog
      v-model:open="fileUploaderState.showLoadPdfDataDialog"
      non-closable
    >
      <UiDialogContent class="max-w-lg text-center">
        <UiDialogHeader>
          <UiDialogTitle>PDF Cropper's data is not in your test data!</UiDialogTitle>
        </UiDialogHeader>
        <p class="font-bold text-red-400">
          PDF Cropper's Data is not found in your test data.<br>
          This may happen if you gave this test before April 16, as versions before that didn't have cropper data in test data
        </p>
        <p class="my-6">
          No worries!<br>
          You just need to upload the PDF Cropper data now (either the Zip or json file)
        </p>
        <div class="flex my-5 mx-auto justify-center">
          <BaseSimpleFileUpload
            accept="application/json,application/zip,.json,.zip"
            label="Upload Cropper's ZIP or JSON file"
            invalid-file-type-message="Please select a valid PDF or JSON file which you had uploaded on Test Interface."
            icon-name="prime:upload"
            @upload="(file) => handleFileUpload(file, 'zip-or-json')"
          />
        </div>
      </UiDialogContent>
    </UiDialog>
    <CbtResultsNotesDialog
      v-model="showNotesDialog"
      :current-question-id="currentQuestionState.id"
      :display-question-number="displayQuestionNumber"
    />
  </div>
</template>

<script lang="ts" setup>
import { strFromU8 } from 'fflate'
import * as Comlink from 'comlink'
import mupdfWorkerFile from '#layers/shared/app/src/worker/mupdf.worker?worker'
import type { MuPdfProcessor } from '#layers/shared/app/src/worker/mupdf.worker'
import {
  QUESTION_STATUS_LABELS,
  RESULT_STATUS_LABELS,
  RESULTS_QUESTION_PANEL_DRAWER_MIN_SIZE,
} from '#layers/shared/shared/constants'

interface Props {
  allQuestions: TestResultQuestionData[]
  questionsToPreview: TestResultQuestionData[]
  testConfig: TestResultJsonOutput['testConfig']
  questionsNumberingOrder: keyof Pick<TestResultQuestionData, 'oriQueId' | 'queId' | 'secQueId'>
  answerOptionsFormat: CbtUiSettings['questionPanel']['answerOptionsFormat']
}

type QuestionsPdfData = {
  [queId: string | number]: {
    page: number
    x: number
    y: number
    w: number
    h: number
  }[]
}

type PdfCropperJsonData = {
  pdfCropperData: CropperOutputData
}

type PdfRenderingProgress = 'loading-zip-from-url'
  | 'loading-file'
  | 'loading-pdf-renderer'
  | 'generating-img'
  | 'done'
  | 'failed'

const showPanel = defineModel<boolean>('showPanel', { required: true })
const currentQueIndex = defineModel<number>({ required: true })

const showNotesDialog = shallowRef(false)

const imgContainerScrollAreaElem = useTemplateRef('imgContainerScrollAreaElem')
const answersContainerScrollAreaElem = useTemplateRef('answersContainerScrollAreaElem')

const migrateJsonData = useMigrateJsonData()

const {
  allQuestions,
  questionsToPreview,
  testConfig,
  questionsNumberingOrder,
  answerOptionsFormat,
} = defineProps<Props>()

const drawerVisibility = shallowRef(false)

const fileUploaderState = shallowReactive<{
  pdfUint8Array: Uint8Array | null
  cropperData: PdfCropperJsonData | null
  testImageBlobs: TestImageBlobs | null
  showLoadPdfDialog: boolean
  showPdfHashMismatchDialog: boolean
  showLoadPdfDataDialog: boolean
}>({
  pdfUint8Array: null,
  cropperData: null,
  testImageBlobs: null,
  showLoadPdfDialog: false,
  showPdfHashMismatchDialog: false,
  showLoadPdfDataDialog: false,
})

const screenBreakpoints = useBreakpoints(
  { sm: 640, lg: 1024 },
  { ssrWidth: 1024 },
)

const screenWidth = reactive({
  isSmOrAbove: screenBreakpoints.greaterOrEqual('sm'),
  isLgOrAbove: screenBreakpoints.greaterOrEqual('lg'),
})

const pdfRenderingProgress = shallowRef<PdfRenderingProgress>('loading-file')

const storageSettings = useCbtResultsLocalStorageSettings()

const questionResultStatusOfNotConsideredQues = new Map<number, ValidQuestionResultStatus>()

// style for <img> width, % as unit
const imageWidth = shallowRef(100)

const testNotes = useCurrentTestNotes()

const sheetElemState = shallowReactive({
  preventClose: false,
  onClickOutside: function (e: CustomEvent) {
    if (this.preventClose) {
      e.preventDefault()
    }
  },
})

const _isBuildForWebsite = useRuntimeConfig().public.isBuildForWebsite as string | boolean
const preferLoadingLocalMupdfScript = _isBuildForWebsite !== 'true' && _isBuildForWebsite !== true

// the urls of questions which will be used for question preview
const testQuestionsImgUrls = useCbtResultsTestQuestionsImgUrls()

const currentTestResultsId = useCbtResultsCurrentID()

// constant styleClasses
const styleClasses = {
  resultStatus: {
    correct: 'text-green-400',
    incorrect: 'text-red-400',
    partial: 'text-yellow-400',
    bonus: 'text-sky-400',
    dropped: 'text-fuchsia-400',
    notAnswered: 'text-gray-300',
    notConsidered: 'text-gray-400',
  },
  questionStatus: {
    answered: 'text-green-400',
    notAnswered: 'text-red-400',
    marked: 'text-fuchsia-400',
    markedAnswered: 'text-sky-400',
    notVisited: 'text-gray-300',
  },
}

// scale used for rendering imgs from pdf
const imgScale = 2

// just a simple watcher to set showPanel to false if no dialogs/question panel is being shown
// showPanel is being used as v-if on this component (so false will unmount this component)
watch(
  [
    drawerVisibility,
    () => fileUploaderState.showLoadPdfDialog,
    () => fileUploaderState.showLoadPdfDataDialog,
    () => fileUploaderState.showPdfHashMismatchDialog,
  ],
  ([new1, new2, new3, new4]) => {
    if (!new1 && !new2 && !new3 && !new4) showPanel.value = false
  },
)

const currentQuestionState = computed(() => {
  const queIndex = currentQueIndex.value
  const data = questionsToPreview[queIndex] || questionsToPreview[0]!
  const id = data.queId
  return { data, id }
})

const optionsStyle = computed(() => {
  const options = answerOptionsFormat.mcqAndMsq
  const counterType = currentQuestionState.value.data.answerOptionsCounterType?.primary
    ?.replace('default', '')
    .trim()

  return {
    '--counter-type': counterType || options.counterType,
    '--options-prefix': `"${options.prefix}"`,
    '--options-suffix': `"${options.suffix}"`,
    'counter-reset': 'answer-options',
  }
})

const displayQuestionNumber = computed(() => {
  if (questionsNumberingOrder === 'oriQueId') {
    return currentQuestionState.value.data.oriQueId
  }
  else if (questionsNumberingOrder === 'secQueId') {
    return currentQuestionState.value.data.secQueId
  }
  else {
    return currentQuestionState.value.data.queId
  }
})

// to determine label to show on option's left side, for any question type
const getCorrectAnswerStatus = (optionNum: number) => {
  const questionData = currentQuestionState.value.data
  const resultStatus = questionData.result.status
  if (resultStatus === 'bonus'
    || resultStatus === 'dropped') {
    return resultStatus
  }

  if (questionData.type === 'mcq') {
    if (optionNum === questionData.result.correctAnswer
      || (
        Array.isArray(questionData.result.correctAnswer)
        && questionData.result.correctAnswer.includes(optionNum)
      )
    ) {
      return 'correct'
    }
    else {
      return 'notCorrect'
    }
  }
  else if (questionData.type === 'msq') {
    if (Array.isArray(questionData.result.correctAnswer)) {
      if (questionData.result.correctAnswer.includes(optionNum)) {
        return 'correct'
      }
      else {
        return 'notCorrect'
      }
    }
    else {
      return 'notCorrect'
    }
  }
  else {
    return 'correct'
  }
}

const getNotConsideredQuestionResultStatus = (
  questionData: TestResultQuestionData,
): ValidQuestionResultStatus => {
  let resultStatus: ValidQuestionResultStatus

  const status = questionResultStatusOfNotConsideredQues.get(questionData.queId)
  if (status)
    resultStatus = status
  else {
    if (questionData.status !== 'answered' && questionData.status !== 'markedAnswered')
      resultStatus = 'notAnswered'
    else
      resultStatus = utilGetQuestionResult(questionData, questionData.result.correctAnswer).status

    questionResultStatusOfNotConsideredQues.set(questionData.queId, resultStatus)
  }

  return resultStatus
}

// label to show on option's right side, for any question type
const getYourAnswerStatus = (optionNum: number) => {
  const questionData = currentQuestionState.value.data
  const { result, type, answer } = questionData

  let resultStatus = result.status

  if (resultStatus === 'notConsidered') {
    resultStatus = getNotConsideredQuestionResultStatus(questionData)
  }

  if (resultStatus === 'notAnswered') {
    return 'none'
  }

  if (type === 'mcq') {
    if (optionNum === answer) {
      if (resultStatus === 'bonus' || resultStatus === 'dropped') {
        return 'neutral'
      }
      return resultStatus
    }
  }
  else if (type === 'msq') {
    if (Array.isArray(answer)
      && Array.isArray(result.correctAnswer)
      && answer.includes(optionNum)) {
      if (resultStatus === 'incorrect') {
        if (result.correctAnswer.includes(optionNum)) {
          return 'partial'
        }
        else {
          return 'incorrect'
        }
      }
      else {
        if (resultStatus === 'bonus' || resultStatus === 'dropped') {
          return 'neutral'
        }
        return 'correct'
      }
    }
  }
  else {
    if (resultStatus === 'bonus' || resultStatus === 'dropped') {
      return 'neutral'
    }
    return resultStatus
  }

  return 'none'
}

const navigateQuestion = (type: 'next' | 'prev') => {
  if (type === 'prev') {
    currentQueIndex.value = Math.max(0, currentQueIndex.value - 1)
  }
  else {
    currentQueIndex.value = Math.min(questionsToPreview.length - 1, currentQueIndex.value + 1)
  }

  imgContainerScrollAreaElem.value?.scrollTopLeft()
  answersContainerScrollAreaElem.value?.scrollTopLeft()
}

const resizeDrawer = (resizeType: 'increase' | 'decrease') => {
  const currentSize = storageSettings.value.quePreview.drawerWidth

  if (resizeType === 'increase' && currentSize < 100) {
    storageSettings.value.quePreview.drawerWidth = Math.min(currentSize + 5, 100)
  }
  else if (resizeType === 'decrease' && currentSize > 0) {
    storageSettings.value.quePreview.drawerWidth = Math.max(currentSize - 5, RESULTS_QUESTION_PANEL_DRAWER_MIN_SIZE)
  }
}

const resizeImage = (resizeType: 'increase' | 'decrease') => {
  const currentSize = imageWidth.value

  if (resizeType === 'increase' && currentSize < 100) {
    imageWidth.value = Math.min(currentSize + 5, 100)
  }
  else if (resizeType === 'decrease' && currentSize > 0) {
    imageWidth.value = Math.max(currentSize - 5, 20)
  }
}

const handleFileUpload = async (
  file: File, type: 'zip-or-pdf' | 'zip-or-json' = 'zip-or-pdf',
  isZipSoSkipCheckingAgain: boolean = false,
) => {
  const zipCheckScore = isZipSoSkipCheckingAgain ? 2 : await utilIsZipFile(file)
  if (zipCheckScore > 0) {
    pdfRenderingProgress.value = 'loading-file'
    loadUploadedFile(file, 'zip')
  }
  else {
    if (type === 'zip-or-pdf') {
      const pdfCheckScore = await utilIsPdfFile(file)
      if (pdfCheckScore > 0) {
        pdfRenderingProgress.value = 'loading-file'
        loadUploadedFile(file, 'pdf')
      }
    }
    else {
      pdfRenderingProgress.value = 'loading-file'
      loadUploadedFile(file, 'json')
    }
  }
}

async function tryLoadingZipFromUrl(
  zipOriginalUrl: string,
  zipConvertedUrl: string = '',
  isDemoZip: boolean = false,
) {
  let zipFile: File | null = null
  pdfRenderingProgress.value = 'loading-zip-from-url'
  drawerVisibility.value = true

  const unableToLoadCallback = () => {
    if (isDemoZip) {
      pdfRenderingProgress.value = 'failed'
    }
    else {
      pdfRenderingProgress.value = 'loading-file'
      fileUploaderState.showLoadPdfDialog = true
      drawerVisibility.value = false
    }
  }

  try {
    if (zipConvertedUrl) {
      const data = await utilFetchZipFromUrl(zipConvertedUrl, false, isDemoZip)
      zipFile = data.zipFile ?? null
    }
    if (zipOriginalUrl && !zipFile) {
      const data = await utilFetchZipFromUrl(zipOriginalUrl, true, isDemoZip)
      zipFile = data.zipFile ?? null
    }

    if (zipFile) {
      pdfRenderingProgress.value = 'loading-file'
      handleFileUpload(zipFile, 'zip-or-pdf', true)
    }
    else {
      throw new Error(`url: ${zipConvertedUrl || zipOriginalUrl}`)
    }
  }
  catch (err) {
    console.error('Error while fetching zip from url', err)
    unableToLoadCallback()
  }
}

async function loadUploadedFile(file: File, fileType: 'zip' | 'pdf' | 'json') {
  fileUploaderState.showPdfHashMismatchDialog = false

  try {
    if (fileType === 'pdf') {
      fileUploaderState.pdfUint8Array = new Uint8Array(await file.arrayBuffer())
      fileUploaderState.cropperData = null
    }
    else if (fileType === 'zip') {
      const data = await utilUnzipTestDataFile(file, 'all')
      fileUploaderState.testImageBlobs = data.testImageBlobs
      fileUploaderState.pdfUint8Array = data.pdfBuffer
      fileUploaderState.cropperData = migrateJsonData.pdfCropperData(data.jsonData)
    }
    else {
      fileUploaderState.cropperData = migrateJsonData.pdfCropperData(
        JSON.parse(strFromU8(new Uint8Array(await file.arrayBuffer()))),
      )
    }

    if (fileUploaderState.pdfUint8Array || fileUploaderState.testImageBlobs) {
      if (fileUploaderState.pdfUint8Array && fileType !== 'json' && testConfig.pdfFileHash) {
        const currentPdfHash = await utilGetHash(fileUploaderState.pdfUint8Array)
        if (currentPdfHash !== testConfig.pdfFileHash) {
          fileUploaderState.showLoadPdfDialog = false
          fileUploaderState.showPdfHashMismatchDialog = true
          return
        }
      }
      startRenderingImgs()
    }
  }
  catch (err) {
    console.error('Error while loading the Uploaded File for Question Preview', err)
  }
}

async function startRenderingImgs() {
  fileUploaderState.showLoadPdfDialog = false
  fileUploaderState.showPdfHashMismatchDialog = false
  fileUploaderState.showLoadPdfDataDialog = false

  if (fileUploaderState.testImageBlobs) {
    drawerVisibility.value = true
    pdfRenderingProgress.value = 'loading-file'

    const questionSectionsRelations: Record<string | number, { section: string, que: number | string }> = {}
    for (const question of allQuestions) {
      const { queId, section, oriQueId } = question
      questionSectionsRelations[queId] = { section, que: oriQueId }
    }

    const testId = currentTestResultsId.value
    testQuestionsImgUrls.value[testId] = utilGetQuestionsUrlsFromTestImageBlobs(
      fileUploaderState.testImageBlobs,
      Object.entries(questionSectionsRelations),
    )
    pdfRenderingProgress.value = 'done'
    fileUploaderState.cropperData = null
    fileUploaderState.pdfUint8Array = null
    fileUploaderState.testImageBlobs = null
  }
  else {
    const questionsPdfData = getQuestionsPdfData(allQuestions)
    if (questionsPdfData) {
      drawerVisibility.value = true
      renderPdftoImgs(questionsPdfData)
    }
    else if (!fileUploaderState.cropperData) {
      fileUploaderState.showLoadPdfDataDialog = true
    }
    else {
      console.error('Error: pdfData not found in questions data')
    }
  }
}

async function loadDemoTestZip() {
  try {
    pdfRenderingProgress.value = 'loading-zip-from-url'
    drawerVisibility.value = true

    const zipModule = await import('#layers/shared/app/assets/zip/demo_test_data_pre_generated.zip?url')
    const zipUrl = zipModule.default

    if (zipUrl) tryLoadingZipFromUrl(zipUrl, '', true)
  }
  catch (err) {
    console.error('Error loading Demo Test Zip file', err)
    pdfRenderingProgress.value = 'failed'
  }
}

function getQuestionsPdfData(questions: TestResultQuestionData[]) {
  const newQuestionsPdfData: QuestionsPdfData = {}
  const pdfCropperData = fileUploaderState.cropperData?.pdfCropperData

  for (const question of questions) {
    const { queId, subject, section, oriQueId } = question
    const pdfData = (question.pdfData ?? pdfCropperData?.[subject]?.[section]?.[oriQueId]?.pdfData)
      ?? null

    newQuestionsPdfData[queId] = []

    if (pdfData) {
      for (const pdfDataItem of pdfData) {
        const { page, x1, y1, x2, y2 } = pdfDataItem
        const x = Math.min(x1, x2) * imgScale
        const y = Math.min(y1, y2) * imgScale
        const w = Math.abs(x2 - x1) * imgScale
        const h = Math.abs(y2 - y1) * imgScale

        newQuestionsPdfData[queId].push({ page, x, y, w, h })
      }
    }
    else {
      return null
    }
  }

  return newQuestionsPdfData
}

async function renderPdftoImgs(questionsPdfData: QuestionsPdfData) {
  if (!fileUploaderState.pdfUint8Array) throw new Error('PDF is not loaded')

  let mupdfWorker: Comlink.Remote<MuPdfProcessor> | null = null

  const testId = currentTestResultsId.value

  pdfRenderingProgress.value = 'loading-pdf-renderer'

  try {
    const mupdfOgWorker = new mupdfWorkerFile()
    mupdfWorker = Comlink.wrap<MuPdfProcessor>(mupdfOgWorker)

    if (!mupdfOgWorker || !mupdfWorker) throw new Error('mupdf worker is undefined')

    await mupdfWorker.loadPdf(fileUploaderState.pdfUint8Array, preferLoadingLocalMupdfScript)

    questionsPdfData = utilCloneJson(questionsPdfData)

    const currQueIndex = currentQueIndex.value
    const totalQuestionsToPreview = questionsToPreview.length
    // map of queIds
    // sorted in a way that the indexes are alternating around currentQueIndex of questionsToPreview
    // to prioritize rendering questions around currentQuestion
    // then at last add the remaining questions of the test which is not in questionsToPreview
    const queIds = new Map<number, number>()

    for (let offset = 0; ; offset++) {
      let added = false

      const plus = currQueIndex + offset
      if (plus < totalQuestionsToPreview) {
        const queId = questionsToPreview[plus]!.queId

        queIds.set(queId, queId)
        added = true
      }

      if (offset > 0) {
        const minus = currQueIndex - offset
        if (minus >= 0) {
          const queId = questionsToPreview[minus]!.queId

          queIds.set(queId, queId)
          added = true
        }
      }

      if (!added) break
    }

    // add remaining questions to queIds map
    for (const queData of allQuestions) {
      const queId = queData.queId
      if (!queIds.has(queId)) {
        queIds.set(queId, queId)
      }
    }

    testQuestionsImgUrls.value[testId] ||= {}

    mupdfOgWorker.onmessage = (e) => {
      if (e.data.type === 'question-image') {
        const { queId, blob } = e.data as { queId: number, blob: Blob }

        const imgUrl = URL.createObjectURL(blob)
        testQuestionsImgUrls.value[testId]![queId] ??= []
        testQuestionsImgUrls.value[testId]![queId].push(imgUrl)
      }
    }
    pdfRenderingProgress.value = 'generating-img'
    await mupdfWorker.generateAndPostQuestionImagesIndividually(queIds, questionsPdfData, imgScale, true)
    pdfRenderingProgress.value = 'done'
  }
  catch (err) {
    console.error('Error while rendering PDF to Preview Questions:', err)
  }
  finally {
    // Close worker
    if (mupdfWorker) {
      mupdfWorker.close()
    }
    if (pdfRenderingProgress.value !== 'done') {
      pdfRenderingProgress.value = 'failed'
      if (Object.keys(testQuestionsImgUrls.value[testId] || {}).length === 0) {
        if (testQuestionsImgUrls.value[testId]) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete testQuestionsImgUrls.value[testId]
        }
      }
    }
    fileUploaderState.cropperData = null
    fileUploaderState.pdfUint8Array = null
    fileUploaderState.testImageBlobs = null
  }
}

function cleanupQuestionImgs() {
  for (const questionImgs of Object.values(testQuestionsImgUrls.value)) {
    for (const imgs of Object.values(questionImgs)) {
      imgs.forEach(url => URL.revokeObjectURL(url))
    }
  }

  testQuestionsImgUrls.value = {}
}

onBeforeMount(() => {
  // if imgs of current Test ID is present then directly show the question panel
  // else cleanup, and ask user to upload pdf as test id is different.
  const testId = currentTestResultsId.value
  if (!testQuestionsImgUrls.value[testId]) {
    cleanupQuestionImgs()
    if (testId === 0) {
      loadDemoTestZip()
    }
    else {
      const { zipOriginalUrl, zipConvertedUrl } = testConfig
      if (zipOriginalUrl || zipConvertedUrl) {
        tryLoadingZipFromUrl(zipOriginalUrl || '', zipConvertedUrl || '')
      }
      else {
        fileUploaderState.showLoadPdfDialog = true
      }
    }
  }
  else {
    drawerVisibility.value = true
  }
})
</script>
