<template>
  <div>
    <Drawer
      v-if="currentQuestion"
      v-model:visible="drawerVisibility"
      position="right"
      :dismissable="true"
      :modal="true"
      class="w-full! sm:w-(--view-question-drawer)!"
      :style="{
        '--view-question-drawer': drawerWidthLocalStorageValue,
      }"
      pt:header:class="py-1.5 px-4"
      pt:content:class="px-0 flex flex-col pb-0"
    >
      <template #header>
        <div class="grow flex justify-between items-center mr-1 sm:mr-5">
          <h3 class="text-xl mx-auto">
            Question No. {{
              questionsNumberingOrder === 'oriQueId'
                ? currentQuestion.oriQueId
                : (
                  questionsNumberingOrder === 'secQueId'
                    ? currentQuestion.secQueId
                    : currentQuestion.queId
                )
            }}
          </h3>
          <div class="flex gap-2 sm:gap-4">
            <div class="flex items-center justify-center">
              <ColorPicker
                v-model="questionImgBgColor"
                class="caret-transparent"
                format="hex"
                title="Question Image BG Color"
              />
            </div>
            <BaseButton
              variant="text"
              rounded
              raised
              title="Increase Width"
              class="hidden! sm:inline-flex!"
              :disabled="drawerWidthLocalStorageValue === '100%'"
              @click="resizeDrawer('increase')"
            >
              <template #icon>
                <Icon
                  name="mdi:arrow-expand-left"
                  class="text-2xl text-green-400"
                />
              </template>
            </BaseButton>
            <BaseButton
              variant="text"
              rounded
              raised
              title="Decrease Width"
              class="hidden! sm:inline-flex!"
              :disabled="drawerWidthLocalStorageValue === '40%'"
              @click="resizeDrawer('decrease')"
            >
              <template #icon>
                <Icon
                  name="mdi:arrow-expand-right"
                  class="text-2xl text-green-400"
                />
              </template>
            </BaseButton>
          </div>
        </div>
      </template>
      <div class="flex flex-col w-full border border-gray-500 divide divide-y divide-gray-500 rounded">
        <div
          class="flex items-center justify-between gap-10 w-full py-0.5 px-4 sm:pr-8"
        >
          <span class="shrink-0">
            <span>Time Spent:&nbsp;</span>
            <span class="font-semibold">{{ utilSecondsToTime(currentQuestion.timeSpent, 'mmm:ss') }}</span>
          </span>
          <span class="truncate grow text-right">
            {{ currentQuestion.section }}
          </span>
        </div>
        <div
          class="flex shrink-0 py-0.5 px-4 sm:pr-8 w-full justify-between items-center
          text-nowrap overflow-hidden"
        >
          <div>
            <span>Result:&nbsp;</span>
            <span
              class="font-semibold"
              :class="styleClasses.resultStatus[currentQuestion.result.status]"
            >
              {{ formattedResultStatus[currentQuestion.result.status] }}
            </span>
          </div>
          <div>
            <span>Type: {{ currentQuestion.type.toUpperCase() }}</span>
          </div>
        </div>
        <div
          class="flex shrink-0 py-0.5 px-4 sm:pr-8 w-full justify-between items-center
          text-nowrap overflow-hidden"
        >
          <div>
            <span>Marks:&nbsp;</span>
            <span
              class="font-semibold"
              :class="styleClasses.resultStatus[currentQuestion.result.status]"
            >
              {{ utilMarksWithSign(currentQuestion.result.marks) }}
            </span>
          </div>
          <div>
            <span>Status:&nbsp;</span>
            <span
              class="font-semibold"
              :class="styleClasses.questionStatus[currentQuestion.status]"
            >
              {{ formattedQuestionStatus[currentQuestion.status] }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex flex-col mt-2 mb-6 overflow-auto px-3">
        <template v-if="testQuestionsImgUrls[currentTestResultsId]?.[currentQuestionId]">
          <img
            v-for="(url, index) in testQuestionsImgUrls[currentTestResultsId][currentQuestionId]"
            :key="index"
            :src="url"
            :style="{
              backgroundColor: `#${questionImgBgColor}`,
            }"
            draggable="false"
          >
        </template>
        <template v-else-if="pdfRenderingProgress === 'loading-pdf'">
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
      <div class="grow flex flex-col items-center shrink-0 w-full @container">
        <div
          v-if="currentQuestion.type !== 'nat'"
          class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 sm:@min-lg:gap-x-10 gap-y-10 mx-auto
          font-bold text-lg text-center"
          :style="optionsStyle"
        >
          <div
            v-for="n in (currentQuestion.totalOptions || 4)"
            :key="n"
            class="relative border-2 border-gray-300 rounded-lg p-2 min-w-64 sm:min-w-60 sm:@min-lg:min-w-64
            has-[.option-status-correct]:border-green-500 has-[.option-status-correct]:bg-green-500/2
            has-[.option-result-partial]:border-yellow-500! has-[.option-result-partial]:bg-yellow-500/2!
            has-[.option-result-incorrect]:border-red-500! has-[.option-result-incorrect]:bg-red-500/2!
            has-[.option-status-dropped]:border-fuchsia-500
            has-[.option-status-bonus]:border-cyan-500"
          >
            <span
              :class="'option-status-' + getCorrectAnswerStatus(n)"
              class="absolute top-0 left-3 -translate-y-1/2 rounded-md px-2 text-xs
             [.option-status-correct]:bg-green-800 [.option-status-correct]:[&>.status-correct]:inline!
             [.option-status-bonus]:bg-cyan-800 [.option-status-bonus]:[&>.status-bonus]:inline!
             [.option-status-dropped]:bg-fuchsia-800 [.option-status-dropped]:[&>.status-dropped]:inline!"
            >
              <span class="status-correct hidden">Correct Answer</span>
              <span class="status-bonus hidden">Bonus</span>
              <span class="status-dropped hidden">Dropped</span>
            </span>
            <span
              :class="'option-result-' + getYourAnswerStatus(n)"
              class="absolute top-0 right-5 -translate-y-1/2 rounded-md text-white px-2 text-xs bg-green-800
              [.option-result-correct]:bg-green-800 [.option-result-partial]:bg-yellow-800
              [.option-result-incorrect]:bg-red-800 [.option-result-none]:hidden
              [.option-result-neutral]:bg-gray-600"
            >
              Your Answer
            </span>
            <label
              class="option-content inline-block"
            />
          </div>
        </div>
        <div
          v-else
          class="grid grid-cols-1 gap-10"
        >
          <div
            v-for="n in (
            currentQuestion.result.status === 'incorrect' || currentQuestion.result.status === 'notAnswered'
            ? 2
            : 1
            )"
            :key="n"
            class="relative text-center text-xl font-bold p-2
            border-2 border-gray-300 rounded-lg min-w-64 sm:min-w-60 sm:@min-lg:min-w-64
            has-[.numeric-status-correct]:border-green-500 has-[.numeric-status-correct]:bg-green-500/2
            has-[.numeric-result-incorrect]:border-red-500! has-[.numeric-result-incorrect]:bg-red-500/2!
            has-[.numeric-status-dropped]:border-fuchsia-500
            has-[.numeric-status-bonus]:border-cyan-500"
          >
            <span
              v-if="
                (
                  n === 1
                  && currentQuestion.result.status !== 'incorrect'
                  && currentQuestion.result.status !== 'notAnswered'
                ) || (
                  n === 2
                  && (
                    currentQuestion.result.status === 'incorrect'
                    || currentQuestion.result.status === 'notAnswered'
                  )
                )"
              :class="'numeric-status-' + getCorrectAnswerStatus(0)"
              class="absolute top-0 left-3 -translate-y-1/2 rounded-md px-2 text-xs
             [.numeric-status-correct]:bg-green-800 [.numeric-status-correct]:[&>.status-correct]:inline!
             [.numeric-status-bonus]:bg-cyan-800 [.numeric-status-bonus]:[&>.status-bonus]:inline!
             [.numeric-status-dropped]:bg-fuchsia-800 [.numeric-status-dropped]:[&>.status-dropped]:inline!"
            >
              <span class="status-correct hidden">Correct Answer</span>
              <span class="status-bonus hidden">Bonus</span>
              <span class="status-dropped hidden">Dropped</span>
            </span>
            <span
              v-if="n === 1"
              :class="'numeric-result-' + getYourAnswerStatus(0)"
              class="absolute top-0 right-5 -translate-y-1/2 rounded-md text-white px-2 text-xs bg-gray-600
              [.numeric-result-correct]:bg-green-800 [.numeric-result-partial]:bg-yellow-800
              [.numeric-result-incorrect]:bg-red-800"
            >
              Your Answer
            </span>
            {{
              utilStringifyAnswer(
                currentQuestion.result.status === 'correct'
                  ? currentQuestion.result.correctAnswer
                  : (n === 1 ? currentQuestion.answer : currentQuestion.result.correctAnswer),
              )
            }}
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 w-full shrink-0 mt-6 mb-8">
        <div class="flex items-center justify-center">
          <BaseButton
            v-if="panelState.firstQuestionId !== currentQuestionId"
            label="Prev Question"
            severity="help"
            @click="navigateQuestion('prev')"
          >
            <template #icon>
              <Icon
                name="material-symbols:arrow-back-ios-rounded"
                size="1.4rem"
              />
            </template>
          </BaseButton>
        </div>
        <div class="flex items-center justify-center">
          <BaseButton
            v-if="panelState.lastQuestionId !== currentQuestionId"
            label="Next Question"
            class="flex flex-row-reverse"
            severity="help"
            @click="navigateQuestion('next')"
          >
            <template #icon>
              <Icon
                name="material-symbols:arrow-forward-ios-rounded"
                size="1.4rem"
              />
            </template>
          </BaseButton>
        </div>
      </div>
    </Drawer>
    <Dialog
      v-model:visible="fileUploaderState.showLoadPdfDialog"
      header="Upload PDF/ZIP for Question Preview"
      :draggable="false"
      :modal="true"
      pt:root:class="mx-auto max-w-lg"
      pt:title:class="p-0 mx-auto"
      pt:content:class="px-4 text-center"
      pt:header:class="gap-4"
    >
      <h4 class="font-bold text-yellow-300">
        To view question preview, you need to upload this test's PDF or ZIP file
        (the same one you had uploaded on test interface).
      </h4>
      <h4 class="m-6">
        Once loaded, question images will be in RAM and hence active as long as this website is opened.<br>
        Refreshing the page, closing window, or changing to another test (via My Tests) will clear all imgs thus requiring you to upload the file again if you want to see the question preview.
      </h4>
      <div class="flex my-5 mx-auto justify-center">
        <BaseSimpleFileUpload
          accept="application/pdf,application/zip,.pdf,.zip"
          label="Upload PDF or ZIP file"
          invalid-file-type-message="Invalid file. Please select a valid PDF or ZIP file which you had uploaded on Test Interface"
          icon-name="prime:upload"
          @upload="handleFileUpload"
        />
      </div>
    </Dialog>
    <Dialog
      v-model:visible="fileUploaderState.showPdfHashMismatchDialog"
      header="PDF hash is not matching with the one in your test data!"
      :modal="true"
      :closable="false"
      :close-on-escape="false"
      :block-scroll="true"
      :draggable="false"
      pt:content:class="flex flex-col px-0 py-4 max-w-xl"
    >
      <div class="flex mb-6 items-center">
        <h3
          class="text-lg text-center"
        >
          PDF file's hash is different to the one that is in your test data.<br><br>
          Hash can differ if even slight modification was done to pdf's contents.<br><br>
          If you are sure that pdf/zip file is correct, then you can continue anyway.<br>
          OR<br>
          You can go back and re-upload the correct one.<br>
        </h3>
      </div>
      <div class="flex flex-col sm:flex-row px-2 sm:px-8 gap-x-5 gap-y-3 justify-between">
        <BaseButton
          label="Continue anyway"
          severity="warn"
          @click="startRenderingImgs()"
        >
          <template #icon>
            <Icon
              name="mdi:rocket"
              size="1.4rem"
            />
          </template>
        </BaseButton>
        <BaseButton
          label="Go back to Re-upload"
          @click="() => {
            fileUploaderState.showPdfHashMismatchDialog = false
            fileUploaderState.showLoadPdfDialog = true
          }"
        >
          <template #icon>
            <Icon
              name="material-symbols:undo-rounded"
              size="1.4rem"
            />
          </template>
        </BaseButton>
      </div>
    </Dialog>
    <Dialog
      v-model:visible="fileUploaderState.showLoadPdfDataDialog"
      header="PDF Cropper's data is not in your test data."
      :modal="true"
      :closable="false"
      :close-on-escape="false"
      :block-scroll="true"
      :draggable="false"
      pt:root:class="mx-auto max-w-lg"
      pt:title:class="p-0 mx-auto"
      pt:content:class="px-4 text-center"
      pt:header:class="gap-4"
    >
      <h4 class="font-bold text-red-400">
        PDF Cropper's Data is not found in your test data.<br>
        This may happen if you gave this test before April 16, as versions before that didn't have cropper data in test data
      </h4>
      <h4 class="my-6">
        No worries!<br>
        You just need to upload the PDF Cropper data now (either the Zip or json file)
      </h4>
      <div class="flex my-5 mx-auto justify-center">
        <BaseSimpleFileUpload
          accept="application/json,application/zip,.json,.zip"
          label="Upload Cropper's ZIP or JSON file"
          invalid-file-type-message="Invalid file. Please select a valid PDF or JSON file which you had uploaded on Test Interface"
          icon-name="prime:upload"
          @upload="(file) => handleFileUpload(file, 'zip-or-json')"
        />
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { strFromU8, unzip } from 'fflate'
import * as Comlink from 'comlink'
import type { CropperOutputData, QuestionResult, QuestionStatus, TestResultDataQuestion } from '~/src/types'
import { LocalStorageKeys, DataFileNames } from '~/src/types/enums'
import { db } from '~/src/db/cbt-db'
import mupdfWorkerFile from '~/src/worker/mupdf.worker?worker'
import type { MuPdfProcessor } from '~/src/worker/mupdf.worker'

interface Props {
  formattedQuestionStatus: {
    [status in QuestionStatus]: string
  }
  formattedResultStatus: {
    [status in QuestionResult['status']]: string
  }
  questionFiltersState: {
    status: string[]
    result: string[]
  }
  selectedSubAndSec: {
    subject: string
    section: string
  }
  previewQuestionId: number | string
  questionsNumberingOrder: keyof Pick<TestResultDataQuestion, 'oriQueId' | 'queId' | 'secQueId'>
  overallConstants: string[]
  allQuestions: TestResultDataQuestion[]
  testPdfFileHash: string
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

const showPanel = defineModel<boolean>('showPanel', { required: true })
const currentQuestionId = shallowRef<string | number>(0)

const {
  formattedQuestionStatus,
  formattedResultStatus,
  questionFiltersState,
  selectedSubAndSec,
  previewQuestionId,
  questionsNumberingOrder,
  overallConstants,
  allQuestions,
  testPdfFileHash,
} = defineProps<Props>()

const [TEST_OVERALL, OVERALL] = overallConstants

const drawerVisibility = shallowRef(false)

const fileUploaderState = shallowReactive<{
  pdfUint8Array: Uint8Array | null
  cropperData: PdfCropperJsonData | null
  showLoadPdfDialog: boolean
  showPdfHashMismatchDialog: boolean
  showLoadPdfDataDialog: boolean
}>({
  pdfUint8Array: null,
  cropperData: null,
  showLoadPdfDialog: false,
  showPdfHashMismatchDialog: false,
  showLoadPdfDataDialog: false,
})

const pdfRenderingProgress = shallowRef<'loading-pdf' | 'generating-img' | 'done' | 'failed'>('loading-pdf')

// settings for question panel's drawer
const drawerWidthLocalStorageValue = useLocalStorage(LocalStorageKeys.ResultsQuestionPanelWidth, '60%')
const questionImgBgColor = shallowRef('ffffff')

// settings of mcq/msq options display text format
const answerOptionsFormat = ref({
  prefix: 'Option ',
  suffix: '',
  counterType: 'upper-latin',
})

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

// watch for showPanel (which parent triggers)
// if imgs of current Test ID is present then directly show the question panel
// else cleanup, and ask user to upload pdf as test id is different.
watch(showPanel,
  (newValue) => {
    if (newValue) {
      currentQuestionId.value = previewQuestionId
      const testId = currentTestResultsId.value
      if (!testQuestionsImgUrls.value[testId]) {
        cleanupQuestionImgs()
        if (testId === 0) {
          loadDemoImages()
          drawerVisibility.value = true
        }
        else {
          fileUploaderState.showLoadPdfDialog = true
        }
      }
      else {
        drawerVisibility.value = true
      }
    }
  },
  { immediate: true },
)

// just a simple watcher to set showPanel to false if both question Panel and uploadPDF dialog is not visible
// this will allow parent to trigger (the watcher above) question panel again.
watch(
  [drawerVisibility, () => fileUploaderState.showLoadPdfDialog],
  () => {
    if (!drawerVisibility.value && !fileUploaderState.showLoadPdfDialog) {
      showPanel.value = false
    }
  },
)

// stores panel's questions related data
// questionsData is filtered version of allQuestions using detailed panel's questions table's filters
// queIds, first and last Question ID is used to navigate and show/hide prex and next buttons
const panelState = computed(() => {
  const selectedSubject = selectedSubAndSec.subject
  const selectedSection = selectedSubAndSec.section

  const newQuestions: Record<string | number, TestResultDataQuestion> = {}
  const queIds: number[] = []
  let firstQuestionId = 0
  let lastQuestionId = 0

  for (const question of allQuestions) {
    const { subject, section, status, result, queId } = question

    if (selectedSubject !== TEST_OVERALL && selectedSubject !== subject) continue

    if (selectedSubject !== TEST_OVERALL
      && selectedSection !== (subject + OVERALL)
      && selectedSection !== section) continue

    if (!questionFiltersState.status.includes(status)) continue

    if (!questionFiltersState.result.includes(result.status)) continue

    newQuestions[queId] = question
    queIds.push(queId)

    firstQuestionId ||= queId
    lastQuestionId = queId
  }

  return {
    questions: newQuestions,
    queIds,
    firstQuestionId,
    lastQuestionId,
  }
})

const currentQuestion = computed(() => {
  const queId = currentQuestionId.value
  return panelState.value.questions[queId]
})

// mcq/msq options styles
const optionsStyle = computed(() => {
  return {
    '--counter-type': answerOptionsFormat.value.counterType,
    '--options-prefix': `"${answerOptionsFormat.value.prefix}"`,
    '--options-suffix': `"${answerOptionsFormat.value.suffix}"`,
    'counter-reset': 'answer-options',
  }
})

// to determine label to show on option's left side, for any question type
const getCorrectAnswerStatus = (optionNum: number) => {
  if (currentQuestion.value.result.status === 'bonus') {
    return 'bonus'
  }

  if (currentQuestion.value.result.status === 'dropped') {
    return 'dropped'
  }

  if (currentQuestion.value.type === 'mcq') {
    if (optionNum === currentQuestion.value.result.correctAnswer) {
      return 'correct'
    }
    else {
      return 'notCorrect'
    }
  }
  else if (currentQuestion.value.type === 'msq') {
    if (Array.isArray(currentQuestion.value.result.correctAnswer)) {
      if (currentQuestion.value.result.correctAnswer.includes(optionNum)) {
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

// label to show on option's right side, for any question type
const getYourAnswerStatus = (optionNum: number) => {
  const resultStatus = currentQuestion.value.result.status
  if (resultStatus === 'notAnswered') {
    return 'none'
  }

  if (currentQuestion.value.type === 'mcq') {
    if (optionNum === currentQuestion.value.answer) {
      if (resultStatus === 'bonus' || resultStatus === 'dropped') {
        return 'neutral'
      }
      return resultStatus
    }
  }
  else if (currentQuestion.value.type === 'msq') {
    if (Array.isArray(currentQuestion.value.answer)
      && Array.isArray(currentQuestion.value.result.correctAnswer)
      && currentQuestion.value.answer.includes(optionNum)) {
      if (resultStatus === 'incorrect') {
        if (currentQuestion.value.result.correctAnswer.includes(optionNum)) {
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
  const currentQueId = Number(currentQuestionId.value)
  const queIds = panelState.value.queIds
  const currentQueIdIndex = queIds.findIndex(n => n == currentQueId)
  let newQueId = 0

  if (type === 'prev' && currentQueIdIndex > 0) {
    newQueId = queIds[currentQueIdIndex - 1]
  }
  else if (type === 'next' && currentQueIdIndex < queIds.length) {
    newQueId = queIds[currentQueIdIndex + 1]
  }

  if (panelState.value.questions[newQueId]) {
    currentQuestionId.value = newQueId
  }
}

const resizeDrawer = (resizeType: 'increase' | 'decrease') => {
  const currentSize = parseInt(drawerWidthLocalStorageValue.value || '70%')

  if (resizeType === 'increase' && currentSize < 100) {
    drawerWidthLocalStorageValue.value = Math.min(currentSize + 5, 100) + '%'
  }
  else if (resizeType === 'decrease' && currentSize > 0) {
    drawerWidthLocalStorageValue.value = Math.max(currentSize - 5, 40) + '%'
  }
}

const handleFileUpload = async (file: File, type: 'zip-or-pdf' | 'zip-or-json' = 'zip-or-pdf') => {
  const zipCheckScore = await utilIsZipFile(file)
  if (zipCheckScore > 0) {
    loadUploadedFile(file, 'zip')
  }
  else {
    if (type === 'zip-or-pdf') {
      const pdfCheckScore = await utilIsPdfFile(file)
      if (pdfCheckScore > 0) {
        loadUploadedFile(file, 'pdf')
      }
    }
    else {
      loadUploadedFile(file, 'json')
    }
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
      const data = await unzipFile(file)
      fileUploaderState.pdfUint8Array = data.pdfFile
      fileUploaderState.cropperData = data.jsonData
    }
    else {
      fileUploaderState.cropperData = JSON.parse(strFromU8(new Uint8Array(await file.arrayBuffer())))
    }

    if (fileUploaderState.pdfUint8Array) {
      if (fileType !== 'json' && testPdfFileHash) {
        const currentPdfHash = await utilGetHash(fileUploaderState.pdfUint8Array)
        if (currentPdfHash !== testPdfFileHash) {
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

async function unzipFile(zipFile: File | Blob) {
  const zipU8Array = new Uint8Array(await zipFile.arrayBuffer())

  return new Promise<{
    pdfFile: Uint8Array
    jsonData: PdfCropperJsonData
  }>((resolve, reject) => {
    unzip(zipU8Array, (err, files) => {
      if (err) {
        reject(err.message)
        return
      }

      const pdfFile = files[DataFileNames.questionsPdf] ?? null
      const jsonFile = files[DataFileNames.dataJson] ?? null
      if (pdfFile && jsonFile) {
        const jsonData = JSON.parse(strFromU8(jsonFile))
        resolve({ pdfFile, jsonData })
      }
      else {
        reject(DataFileNames.questionsPdf + ' is not in ZIP file!')
      }
    })
  })
}

async function loadDemoImages() {
  pdfRenderingProgress.value = 'loading-pdf'
  const zipModule = await import('~/src/assets/zip/results_demo_pngs.zip?url')
  const zipUrl = zipModule.default

  const res = await fetch(zipUrl)
  const buffer = await res.arrayBuffer()
  const zipU8Array = new Uint8Array(buffer)

  pdfRenderingProgress.value = 'generating-img'

  unzip(zipU8Array, (err, files) => {
    if (err) {
      pdfRenderingProgress.value = 'failed'
      throw err
    }

    testQuestionsImgUrls.value[0] = {}
    for (const [filename, imageUint8Array] of Object.entries(files).toSorted()) {
      const queId = parseInt(filename.split('-')[0])
      const blob = new Blob([imageUint8Array], { type: 'image/png' })
      const url = URL.createObjectURL(blob)
      testQuestionsImgUrls.value[0][queId] ||= []
      testQuestionsImgUrls.value[0][queId].push(url)
    }

    if (Object.keys(testQuestionsImgUrls.value[0] || {}).length > 0) {
      pdfRenderingProgress.value = 'done'
    }
    else {
      pdfRenderingProgress.value = 'failed'
    }
  })
}

function getQuestionsPdfData(questions: TestResultDataQuestion[]) {
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

  pdfRenderingProgress.value = 'loading-pdf'

  try {
    const mupdfOgWorker = new mupdfWorkerFile()
    mupdfWorker = Comlink.wrap<MuPdfProcessor>(mupdfOgWorker)

    if (!mupdfOgWorker || !mupdfWorker) throw new Error('mupdf worker is undefined')

    await mupdfWorker.loadPdf(fileUploaderState.pdfUint8Array, false)

    const questionsData = utilCloneJson(Object.entries(questionsPdfData))
    const currentQueId = currentQuestionId.value

    let currentQueIndex = questionsData.findIndex(([queId]) => currentQueId == queId)
    if (currentQueIndex === -1) currentQueIndex = 0

    // array of indexes of questionsData
    // sorted in a way that the indexes are alternating around currentQueIndex
    // to prioritize rendering questions around currentQuestion

    // eg: if currentQueIndex is 5, and there are 8 total questions (hence max index 7) then
    // alternateIndexes will be [5, 6, 4, 7, 3, 2, 1, 0]
    const alternateIndexes: number[] = []
    const totalQuestions = questionsData.length

    for (let offset = 0; ; offset++) {
      let added = false

      const plus = currentQueIndex + offset
      if (plus < totalQuestions) {
        alternateIndexes.push(plus)
        added = true
      }

      if (offset !== 0) {
        const minus = currentQueIndex - offset
        if (minus >= 0) {
          alternateIndexes.push(minus)
          added = true
        }
      }

      if (!added) break
    }

    testQuestionsImgUrls.value[testId] ||= {}

    mupdfOgWorker.onmessage = (e) => {
      if (e.data.type === 'question-image') {
        const { queId, blob } = e.data as { queId: number, blob: Blob }

        const imgUrl = URL.createObjectURL(blob)
        testQuestionsImgUrls.value[testId][queId] ??= []
        testQuestionsImgUrls.value[testId][queId].push(imgUrl)
      }
    }
    pdfRenderingProgress.value = 'generating-img'
    await mupdfWorker.generateAndPostQuestionImagesIndividually(alternateIndexes, questionsData, imgScale, true)
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
  const imgColorString = localStorage.getItem(LocalStorageKeys.ResultsQuestionPanelImgBgColor)
  if (imgColorString) questionImgBgColor.value = imgColorString

  db.getSettings()
    .then((data) => {
      if (data) {
        const { prefix, suffix, counterType } = data.uiSettings.questionPanel.answerOptionsFormat
        answerOptionsFormat.value = { prefix, suffix, counterType }
      }
    })
})

onBeforeUnmount(() => {
  localStorage.setItem(LocalStorageKeys.ResultsQuestionPanelImgBgColor, questionImgBgColor.value)
})
</script>
