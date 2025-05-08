<template>
  <div
    class="flex flex-col grow min-h-0 overflow-auto
      dark:bg-surface-900 dark:text-surface-0 border-t-2 border-surface-700"
  >
    <div
      v-if="dbTestOutputDataState.isDataFound"
      class="flex flex-col gap-5 py-15 items-center"
    >
      <h3 class="w-full text-lg mx-auto px-6 text-center max-w-[60rem]">
        These test data entries were found in your local database<br>
        that may not contain answer key data
        (and therefore do not have results yet).
        <br><br>
        Select the one you want to generate answer key for,<br>
        or you can load a ZIP/JSON file from PDF Cropper
        or a JSON file from the CBT Interface/Results.
      </h3>
      <div class="flex flex-row justify-center flex-wrap gap-6 py-4 px-2 sm:px-4 md:px-8">
        <div
          v-for="(testResultOverview, index) in dbTestOutputDataState.testResultOverviews"
          :key="index"
        >
          <CbtResultsOverviewCard
            :test-result-overview="testResultOverview"
            read-only
            class="w-[80dvh] max-w-3xs sm:w-3xs xl:w-[15rem] cursor-pointer select-none"
            :selected="dbTestOutputDataState.selectedTestResultOverviewIndex === index"
            @click="() => dbTestOutputDataState.selectedTestResultOverviewIndex = index"
          />
        </div>
      </div>
      <div class="flex gap-5 sm:gap-20 mt-5">
        <BaseButton
          label="Load Selected Test"
          :disabled="dbTestOutputDataState.selectedTestResultOverviewIndex === null"
          @click="loadDataFromDB()"
        >
          <template #icon>
            <Icon
              name="mdi:rocket-launch"
              size="1.5rem"
            />
          </template>
        </BaseButton>
        <BaseButton
          label="Upload file instead"
          severity="warn"
          @click="() => {
            dbTestOutputDataState.testResultOverviews = []
            dbTestOutputDataState.isDataFound = false
          }"
        >
          <template #icon>
            <Icon
              name="prime:upload"
              size="1.5rem"
            />
          </template>
        </BaseButton>
      </div>
    </div>
    <div
      v-else-if="!fileUploaderState.isFileLoaded"
      class="flex flex-col gap-5 py-15"
    >
      <h3 class="text-xl text-center">
        You can load either zip/json file of PDF Cropper or json file of CBT Interface/Results
      </h3>
      <CbtFileUpload
        v-model="fileUploaderState.selectedFileType"
        :file-options="selectOptions.fileUploader"
        :validation-function="fileUploaderValidationFunction"
        file-types="zip-or-json"
        empty-slot-text-class="top-[35%]"
        root-class="sm:w-4/5 md:w-3/4 lg:w-2/3 mx-auto"
        content-class="min-h-48 md:min-h-64"
        @on-uploaded="(data) => loadFileData(data.jsonData, data.pdfFile)"
      />
    </div>
    <div
      v-else
      class="flex flex-col items-center gap-4 px-2 md:px-4"
    >
      <div
        v-if="sectionsState.sectionsList && !settingsState.isStarted"
        class="flex flex-col sm:flex-row gap-5 mt-10 mb-5"
      >
        <div
          class="flex flex-col"
        >
          <div class="flex justify-center">
            <span class="pl-5 pr-3 text-lg font-bold">Sort Sections Order</span>
          </div>
          <div class="flex mt-2">
            <CbtInterfaceSectionsOrderList
              v-model="sectionsState.sectionsList"
            />
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex mb-2 gap-3">
            <label
              class="font-bold"
              for="questions_numbering_type"
            >
              Questions Numbering Order
            </label>
            <IconWithTooltip
              :tooltip-content="tooltipContent.questionsNumberingOrderType"
              icon-class="text-lg"
            />
          </div>
          <div class="flex flex-col grow items-center gap-5">
            <Select
              v-model="settingsState.questionsOrder"
              label-id="questions_numbering_type"
              :options="selectOptions.questionsNumberingOrder"
              option-label="name"
              option-value="value"
              :fluid="true"
              pt:root:class="w-4/5"
            />
            <BaseButton
              label="Start"
              size="large"
              class="my-auto"
              @click="showAnswerKeyMainBlock()"
            >
              <template #icon>
                <Icon
                  name="mdi:script-text-key-outline"
                  size="1.6rem"
                />
              </template>
            </BaseButton>
          </div>
        </div>
      </div>
      <div
        v-else-if="subjectsData && currentPageData"
        class="flex flex-col gap-4 mt-3"
      >
        <h2 class="text-3xl font-bold text-center">
          {{ currentPageData?.subject }}
        </h2>
        <h3 class="text-2xl font-bold text-center">
          {{ currentPageData?.section }}
        </h3>
        <table class="mt-4 border border-gray-300 divide-y divide-gray-300">
          <thead class="bg-gray-800">
            <tr class="divide-x divide-gray-300 font-semibold sm:text-lg md:text-xl">
              <th class="p-2 sm:p-3 md:p-4">
                Q. Num
              </th>
              <th class="p-2 sm:p-3 md:p-4">
                Q. Type
              </th>
              <th class="p-2 sm:p-3 md:p-4">
                Input Answer
              </th>
              <th class="p-2 sm:p-3 md:p-4">
                Parsed Answer
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300 text-center">
            <tr
              v-for="(questionData, quesNum, index) in subjectsData[currentPageData.subject][currentPageData.section]"
              :key="quesNum"
              class="divide-x divide-gray-300 sm:text-lg md:text-xl"
            >
              <td class="p-2 sm:p-3 md:px-4">
                {{
                  currentPageData.firstQuestionNum === null
                    ? quesNum
                    : currentPageData.firstQuestionNum + index + 1
                }}
              </td>
              <td class="p-2 sm:p-3 md:px-4">
                {{ formatQuestionTypeText(questionData) }}
              </td>
              <td class="p-2 sm:p-3 md:px-4 text-base">
                <InputText
                  :id="INPUT_ID_PREFIX + index"
                  v-model.trim="subjectsAnswerKeysData[currentPageData.subject][currentPageData.section][quesNum].inputAnswer"
                  type="text"
                  size="large"
                  :trim="true"
                  :max-length="100"
                  pt:root:class="text-center p-2! outline-1 focus:outline-solid! outline-green-500!"
                  @update:model-value="parseInputAnswer(
                    subjectsAnswerKeysData[currentPageData.subject][currentPageData.section][quesNum],
                    questionData.type,
                    questionData.type !== 'nat' ? getQuestionOptions(questionData) : null,
                  )"
                  @keydown.up="(e: Event) => keyDownHandler('arrowUp', e, index)"
                  @keydown.down="(e: Event) => keyDownHandler('arrowDown', e, index)"
                  @keydown.enter="(e: Event) => keyDownHandler('enter', e, index)"
                />
              </td>
              <td
                :data-answer="
                  utilStringifyAnswer(
                    subjectsAnswerKeysData[currentPageData.subject][currentPageData.section][quesNum].savedAnswer,
                  )"
                class="relative p-2 sm:p-3 md:px-4
                  before:content-[attr(data-answer)]
                  before:block
                  before:text-green-400
                  before:font-semibold
                  data-[answer=null]:before:text-red-400
                  before:empty:hidden"
              />
            </tr>
          </tbody>
        </table>
        <div class="grid grid-col-2 gap-3 gap-y-7 mt-5 mb-8">
          <div
            class="col-span-2 sm:row-start-1 sm:col-span-1 flex flex-col items-center"
            :class="prevAndNextSectionsName.prevSection === null ? 'hidden' : ''"
          >
            <BaseButton
              severity="help"
              :label="prevAndNextSectionsName.prevSection ?? ''"
              @click="changeCurrentPage('prev')"
            >
              <template #icon>
                <Icon name="material-symbols:arrow-back-ios-new-rounded" />
              </template>
            </BaseButton>
          </div>
          <div
            class="col-span-2 sm:row-start-1 sm:col-span-1 flex flex-col items-center"
            :class="prevAndNextSectionsName.nextSection === null ? 'hidden' : ''"
          >
            <BaseButton
              class="flex flex-row-reverse"
              icon-pos="right"
              severity="help"
              :label="prevAndNextSectionsName.nextSection ?? ''"
              :disabled="!isAllAnswersInCurrentPageValid"
              @click="changeCurrentPage('next')"
            >
              <template #icon>
                <Icon name="material-symbols:arrow-forward-ios-rounded" />
              </template>
            </BaseButton>
          </div>
          <div
            class="col-span-2 sm:row-start-1 sm:col-span-1 flex flex-col items-center"
            :class="prevAndNextSectionsName.nextSection === null && currentPageData.section
              ? ''
              : 'hidden'"
          >
            <BaseButton
              label="Generate Answer Key"
              :disabled="!isAllAnswersInCurrentPageValid"
              @click="generateOutputState.showDialog = true"
            >
              <template #icon>
                <Icon name="material-symbols:arrow-forward-ios-rounded" />
              </template>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    <Dialog
      v-model:visible="generateOutputState.showDialog"
      header="Download Output"
      :modal="true"
      pt:headerActions:class="ml-5"
      pt:content:class="p-0 px-3"
    >
      <div class="grid grid-cols-5 w-full gap-2">
        <div class="flex flex-col col-span-3">
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
            :maxlength="50"
          />
        </div>
        <div class="flex flex-col col-span-2">
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
            v-model="generateOutputState.selectedFileType"
            label-id="generate_output_file_type"
            :options="outputFileTypeOptions"
            option-label="name"
            option-value="value"
          />
        </div>
      </div>
      <div class="flex justify-center py-3">
        <BaseButton
          label="Download"
          @click="downloadOutput()"
        />
      </div>
      <div class="flex justify-center pb-3">
        <h3 v-show="generateOutputState.preparingDownload">
          Please wait, preparing download...
        </h3>
        <h3 v-show="generateOutputState.downloaded">
          Downloaded!
        </h3>
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { zip, strToU8, type AsyncZippable } from 'fflate'
import type {
  CropperOutputData,
  CropperQuestionData,
  TestOutputDataQuestion,
  TestOutputDataSubjects,
  TestSectionKey,
  TestSectionListItem,
  TestAnswerKeyData,
  QuestionAnswer,
  QuestionType,
  TestResultOverviewDB,
} from '~/src/types'
import { db } from '~/src/db/cbt-db'
import { DataFileNames } from '~/src/types/enums'

type UnknownRecord = Record<string, unknown>

type FileUploaderData = {
  pdfFile: Uint8Array | null
  jsonData: Record<string, unknown>
}

type SectionListItem = TestSectionListItem & { totalQuestions: number }

type QuestionAnswerKeyData = {
  inputAnswer: string
  savedAnswer: QuestionAnswer | 'DROPPED' | 'BONUS'
}

type SubjectsAnswerKeysData = {
  [subject: keyof CropperOutputData]: {
    [section: TestSectionKey]: {
      [question: number | string]: QuestionAnswerKeyData
    }
  }
}

interface DBTestOutputDataState {
  isDataFound: boolean
  testResultOverviews: TestResultOverviewDB[]
  selectedTestResultOverviewIndex: number | null
  isDataFromDB: boolean
}

// if yes then load that and this below will be storing it
const dbTestOutputDataState = shallowReactive<DBTestOutputDataState>({
  isDataFound: false, // boolean to indicate if testResultOverviews without results generated is found or not
  testResultOverviews: [], // list of testResultOverviews without results generated
  selectedTestResultOverviewIndex: null,
  isDataFromDB: false, // is data that is loaded (or being used) from db?
})

// if data to generate from is not found in db then
// ask user to upload file of cropper/interface/results, this will store the fileUploader related data
const fileUploaderState = shallowReactive({
  selectedFileType: 'json',
  isFileLoaded: false,
})

const tooltipContent = {
  questionsNumberingOrderType:
    'Select how question numbers appear in the "Q. Num" Column. This is for visual use only (internally all questions are referred by original Q. Num):\n\n'
    + 'Original → Uses the numbering as provided in the data.\n\n'
    + 'Cumulative → Continues numbering across sections (e.g., 1-20, 21-40, 41-60).\n\n'
    + 'Section-wise → Resets numbering in each section (e.g., 1-20, 1-20, 1-20).',

  outputFileType:
    'zip → Merges Answer Key data into data.json file of uploaded zip file.\n\n'
    + 'json (merged) → Merges Answer Key data into the uploaded json file.\n\n'
    + 'json (separate) → Separate Answer Key Data json file\n\n\n'
    + 'some may not be available depending on the input file/data',
}

const INPUT_ID_PREFIX = 'input-answer-q-'

// to store raw uploaded file data
const uploadedFileData = shallowRef<FileUploaderData | null>(null)

const selectOptions = {
  questionsNumberingOrder: [
    { name: 'Original', value: 'original' },
    { name: 'Cumulative', value: 'cumulative' },
    { name: 'Section-wise', value: 'section-wise' },
  ],

  fileUploader: [
    { name: 'ZIP', value: 'zip' },
    { name: 'JSON', value: 'json' },
  ],
}

const fileUploaderValidationFunction = (data: FileUploaderData): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const status = Boolean(data.jsonData?.pdfCropperData || data.jsonData.testData)

    if (status) {
      resolve(true)
    }
    else {
      reject('JSON File is not in valid format, are you sure you had selected correct file?')
    }
  })
}

const settingsState = shallowReactive({
  questionsOrder: 'original',
  isStarted: false,
})

const currentPageSectionName = shallowRef<TestSectionKey>('')

const sectionsState = reactive<{
  sectionsList: SectionListItem[]
  currentPageSectionName: TestSectionKey
}>({
  sectionsList: [],
  currentPageSectionName: '',
})

let subjectsData: CropperOutputData | TestOutputDataSubjects | null = null

const subjectsAnswerKeysData = ref<SubjectsAnswerKeysData>({})

// final output data that will be generated for json file
const testAnswerKeyData: TestAnswerKeyData = {}

const generateOutputState = shallowReactive({
  showDialog: false,
  selectedFileType: 'json-merged',
  filename: 'pdf2cbt_answer_key',
  preparingDownload: false,
  downloaded: false,
})

const outputFileTypeOptions = computed(() => {
  const options = [
    { name: '.zip', value: 'zip' },
    { name: '.json (merged)', value: 'json-merged' },
    { name: '.json (separate)', value: 'json-separate' },
  ]

  if (uploadedFileData.value) {
    if (uploadedFileData.value.pdfFile && fileUploaderState.selectedFileType === 'zip') {
      return options
    }
  }

  if (dbTestOutputDataState.isDataFromDB) {
    return [{ name: '.json', value: 'json-separate' }]
  }
  else {
    options.shift()
    return options
  }
})

const currentPageData = computed(() => {
  let subjectName: keyof CropperOutputData = ''
  const currentSectionName = currentPageSectionName.value
  // zero based as x+1 is being done in template
  // null to imply to use original numbering
  let firstQuestionNum: number | null = 0

  const questionsOrder = settingsState.questionsOrder

  if (!subjectsData) return

  if (questionsOrder === 'cumulative') {
    for (const sectionItem of sectionsState.sectionsList) {
      if (sectionItem.name === currentSectionName) {
        subjectName = sectionItem.subject
        break
      }
      else {
        firstQuestionNum += sectionItem.totalQuestions
      }
    }
  }
  else {
    for (const sectionItem of sectionsState.sectionsList) {
      if (sectionItem.name === currentSectionName) {
        subjectName = sectionItem.subject
        break
      }
    }

    if (questionsOrder === 'original') {
      firstQuestionNum = null
    }
  }

  const sectionTotalQuestions = Object.keys(subjectsData[subjectName][currentSectionName]).length
  return {
    subject: subjectName,
    section: currentSectionName,
    firstQuestionNum,
    sectionTotalQuestions,
  }
})

const prevAndNextSectionsName = computed(() => {
  const currentSection = currentPageSectionName.value
  let prevSection: TestSectionKey | null = null
  let nextSection: TestSectionKey | null = null

  if (currentSection && currentPageData.value) {
    const i = sectionsState.sectionsList.findIndex(
      section => section.name === currentSection,
    )

    if (i !== -1) {
      if (i > 0) prevSection = sectionsState.sectionsList[i - 1].name
      if (i < (sectionsState.sectionsList.length - 1)) nextSection = sectionsState.sectionsList[i + 1].name
    }
  }

  return {
    prevSection,
    nextSection,
  }
})

const isAllAnswersInCurrentPageValid = computed(() => {
  if (!currentPageData.value) return false

  const section = currentPageData.value.section
  const subject = currentPageData.value.subject

  const isSomeAnswerNull = Object.values(
    subjectsAnswerKeysData.value[subject][section],
  ).some(question => question.savedAnswer === null)

  return !isSomeAnswerNull
})

const changeCurrentPage = (changeTo: 'prev' | 'next') => {
  if (changeTo === 'next' && prevAndNextSectionsName.value.nextSection) {
    currentPageSectionName.value = prevAndNextSectionsName.value.nextSection
  }
  else if (changeTo === 'prev' && prevAndNextSectionsName.value.prevSection) {
    currentPageSectionName.value = prevAndNextSectionsName.value.prevSection
  }
}

// for "Q. Type" column
const formatQuestionTypeText = (questionData: CropperQuestionData | TestOutputDataQuestion) => {
  const questionType = questionData.type
  const questionTypeUpperCase = questionType.toUpperCase()

  if (questionType === 'nat') {
    return questionTypeUpperCase
  }
  else {
    const options = getQuestionOptions(questionData) as number
    return `${questionTypeUpperCase} (${options})`
  }
}

// parse and convert text to number or null
const parseMcqInputText = (text: string, totalOptions: number) => {
  if (text.length !== 1) return null

  let parsedNum: number | null = null
  if (text >= 'A' && text <= 'Z') {
    parsedNum = (text.charCodeAt(0) - 'A'.charCodeAt(0) + 1)
  }
  else if (text >= '1' && text <= '9') {
    parsedNum = parseInt(text, 10)
  }

  if (parsedNum !== null && parsedNum <= totalOptions) {
    return parsedNum
  }

  return null
}

// parse and convert text to number[] or null while removing duplicate chars
const parseMsqInputText = (text: string, totalOptions: number) => {
  const chars = [...text]
  const filteredChars = chars.filter(ch => /[A-Z1-9]/.test(ch))
  const parsedList = filteredChars
    .map(char => parseMcqInputText(char, totalOptions))

  // Remove duplicates from final numbers and delete null if present
  const uniqueValues = new Set(parsedList)
  uniqueValues.delete(null)

  const uniqueNumbers = [...uniqueValues as Set<number>].sort((a, b) => a - b)

  return uniqueNumbers.length ? uniqueNumbers : null
}

const isStringValidNatNumFormat = (text: string) => /^-?\d+(\.\d+)?$/.test(text)

const parseNatInputText = (text: string) => {
  if (text.includes('TO')) {
    const answerStrs = text.split('TO').map(n => n.trim())

    const isValidFormat = answerStrs.every(isStringValidNatNumFormat)
    if (isValidFormat && answerStrs.length === 2) {
      const answerFloats = answerStrs.map(n => parseFloat(n))
      const [lowerLimit, upperLimit] = answerFloats[0] <= answerFloats[1]
        ? answerStrs
        : answerStrs.toReversed()

      return `${lowerLimit}TO${upperLimit}`
    }
    else {
      return null
    }
  }
  else if (text.includes(',')) {
    const answerStrs = text.split(',').map(n => n.trim())
    const isValidFormat = answerStrs.every(isStringValidNatNumFormat)
    if (isValidFormat) {
      return answerStrs.join(',')
    }
    else {
      return null
    }
  }
  else {
    const answer = text.trim()
    if (isStringValidNatNumFormat(answer)) {
      return answer
    }
    else {
      return null
    }
  }
}

// for parsing Input Answer and then storing it to savedAnswer
function parseInputAnswer(
  questionData: QuestionAnswerKeyData,
  questionType: QuestionType,
  totalOptions: number | null,
) {
  const inputAnswer = questionData.inputAnswer.toUpperCase()

  if (inputAnswer) {
    if (inputAnswer.includes('BONUS')) {
      questionData.savedAnswer = 'BONUS'
    }
    else if (inputAnswer.includes('DROP')) {
      questionData.savedAnswer = 'DROPPED'
    }
    else {
      if (questionType === 'mcq') {
        questionData.savedAnswer = parseMcqInputText(inputAnswer[0], totalOptions ?? 4)
      }
      else if (questionType === 'msq') {
        questionData.savedAnswer = parseMsqInputText(inputAnswer, totalOptions ?? 4)
      }
      else {
        questionData.savedAnswer = parseNatInputText(inputAnswer)
      }
    }
  }
  else {
    questionData.savedAnswer = null
  }
}

function getQuestionOptions(questionData: CropperQuestionData | TestOutputDataQuestion) {
  if (questionData.type === 'nat') return null

  if ('options' in questionData) {
    return questionData.options ?? 4
  }
  else if ('totalOptions' in questionData) {
    return questionData?.totalOptions ?? 4
  }

  return 4
}

function loadFileData(
  jsonData: UnknownRecord,
  pdfFile: Uint8Array | null,
) {
  if (jsonData.testData) {
    subjectsData = jsonData.testData as TestOutputDataSubjects
  }
  else if (jsonData.testOutputDatas) {
    const testOutputData = (jsonData.testOutputDatas as Record<string, unknown>[])[0]
    if (testOutputData.testData) {
      subjectsData = testOutputData.testData as TestOutputDataSubjects
    }
  }
  else {
    subjectsData = jsonData.pdfCropperData as CropperOutputData
  }

  if (subjectsData === null) {
    console.error('Error: Uploaded file is not in valid format')
    return
  }

  if (pdfFile && fileUploaderState.selectedFileType === 'zip') {
    generateOutputState.selectedFileType = 'zip'
  }

  loadDataState(jsonData, pdfFile)
}

function loadDataState(
  jsonData: UnknownRecord,
  pdfFile: Uint8Array | null,
) {
  uploadedFileData.value = {
    pdfFile,
    jsonData,
  }
  if (!subjectsData) return

  for (const [subject, sectionData] of Object.entries(subjectsData)) {
    subjectsAnswerKeysData.value[subject] ??= {}

    for (const [sectionName, questionsData] of Object.entries(sectionData)) {
      const sectionListItem: SectionListItem = {
        subject,
        name: sectionName,
        totalQuestions: Object.keys(questionsData as UnknownRecord).length,
      }
      sectionsState.sectionsList.push(sectionListItem)

      subjectsAnswerKeysData.value[subject][sectionName] ??= {}

      for (const question of Object.keys(questionsData as UnknownRecord)) {
        subjectsAnswerKeysData.value[subject][sectionName][question] = {
          inputAnswer: '',
          savedAnswer: null,
        }
      }
    }
  }

  currentPageSectionName.value = sectionsState.sectionsList[0].name
  fileUploaderState.isFileLoaded = true
}

function generateAnswerKey() {
  const rawData = JSON.parse(JSON.stringify(subjectsAnswerKeysData.value)) as SubjectsAnswerKeysData
  for (const [subjectName, sectionsData] of Object.entries(rawData)) {
    testAnswerKeyData[subjectName] ??= {}

    for (const [sectionName, questionsData] of Object.entries(sectionsData)) {
      testAnswerKeyData[subjectName][sectionName] ??= {}

      for (const [quesNum, questionData] of Object.entries(questionsData)) {
        const savedAnswer = questionData.savedAnswer
        const copiedSavedAnswer = Array.isArray(savedAnswer)
          ? [...savedAnswer]
          : savedAnswer
        testAnswerKeyData[subjectName][sectionName][quesNum] = copiedSavedAnswer
      }
    }
  }
}

async function downloadOutput() {
  if (!uploadedFileData.value) return

  generateOutputState.preparingDownload = true
  if (Object.keys(testAnswerKeyData).length === 0) {
    generateAnswerKey()
  }

  const uploadedData = toValue(uploadedFileData)!

  uploadedData.jsonData.testAnswerKey = testAnswerKeyData

  const filename = generateOutputState.filename
  let fileExtension: '.zip' | '.json' = '.json'
  let outputJsonString = ''
  const selectedFileType = generateOutputState.selectedFileType

  if (selectedFileType === 'json-separate') {
    outputJsonString = JSON.stringify({ testAnswerKey: testAnswerKeyData }, null, 2)
  }
  else {
    outputJsonString = JSON.stringify(uploadedData.jsonData, null, 2)

    if (selectedFileType === 'zip' && uploadedData.pdfFile) {
      fileExtension = '.zip'
    }
  }

  if (fileExtension === '.json') {
    const outputBlob = new Blob([outputJsonString], { type: 'application/json' })
    utilSaveFile(filename + fileExtension, outputBlob)
    generateOutputState.preparingDownload = false
    generateOutputState.downloaded = true
  }
  else {
    const pdfU8Array = uploadedData.pdfFile
    if (!pdfU8Array) return

    const jsonU8Array = strToU8(outputJsonString)

    const zipFiles: AsyncZippable = {}

    zipFiles[DataFileNames.questionsPdf] = pdfU8Array
    zipFiles[DataFileNames.dataJson] = [jsonU8Array, { level: 6 }]

    zip(zipFiles, { level: 0 }, (err, compressedZip) => {
      if (err) {
        console.error('Error creating zip:', err)
        return
      }
      const outputBlob = new Blob([compressedZip], { type: 'application/zip' })
      utilSaveFile(filename + fileExtension, outputBlob)
      generateOutputState.preparingDownload = false
      generateOutputState.downloaded = true
    })
  }
}

async function loadDataFromDB() {
  const index = dbTestOutputDataState.selectedTestResultOverviewIndex
  if (typeof index === 'number') {
    const id = dbTestOutputDataState.testResultOverviews[index]?.id
    if (id) {
      try {
        const data = await db.getTestOutputData(id)
        const testOutputData = data?.testOutputData
        if (testOutputData && 'testData' in testOutputData) {
          subjectsData = testOutputData.testData
        }
        else if (testOutputData && 'testResultData' in testOutputData) {
          subjectsData = testOutputData.testResultData
        }
        if (subjectsData) {
          dbTestOutputDataState.isDataFound = false
          dbTestOutputDataState.testResultOverviews = []
          loadDataState({}, null)
          dbTestOutputDataState.isDataFromDB = true
          generateOutputState.selectedFileType = 'json-separate'
        }
      }
      catch (err) {
        console.error('Error while loading selected testOutputData from db', err)
      }
    }
  }
}

async function checkForTestOutputDataInDB() {
  try {
    const testResultOverviews = await db.testResultOverviews.orderBy('id').reverse().limit(10).toArray()
    const overviewsList: TestResultOverviewDB[] = []
    for (const data of testResultOverviews) {
      if (!data?.overview?.marksObtained) {
        overviewsList.push(data)
      }
    }

    if (overviewsList.length > 0) {
      dbTestOutputDataState.testResultOverviews = overviewsList
      dbTestOutputDataState.isDataFound = true
    }
  }
  catch (err) {
    console.error('Error while trying to load test result overviews from db:', err)
  }
}

const keyDownHandler = (type: 'arrowUp' | 'arrowDown' | 'enter', e: Event, queIndex: number) => {
  if (!currentPageData.value) return

  const lastQuestionIndex = currentPageData.value.sectionTotalQuestions - 1
  if (lastQuestionIndex < 0) return

  if (type === 'arrowUp') {
    if (queIndex === 0) return

    const prev = document.getElementById(INPUT_ID_PREFIX + (queIndex - 1))
    if (prev && typeof prev.focus === 'function') prev.focus()
    return
  }
  else if ((type === 'arrowDown' || type === 'enter') && queIndex < lastQuestionIndex) {
    const next = document.getElementById(INPUT_ID_PREFIX + (queIndex + 1))
    if (next && typeof next.focus === 'function') next.focus()
    return
  }
}

function showAnswerKeyMainBlock() {
  currentPageSectionName.value = sectionsState.sectionsList[0].name
  settingsState.isStarted = true
}

onBeforeMount(checkForTestOutputDataInDB)
</script>
