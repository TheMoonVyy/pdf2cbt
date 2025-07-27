<template>
  <div
    class="flex flex-col grow min-h-0 overflow-auto"
  >
    <div
      v-if="dbTestOutputDataState.isDataFound"
      class="flex flex-col gap-5 py-15 items-center"
    >
      <h3 class="w-full text-lg mx-auto px-6 text-center max-w-240">
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
            class="w-[80dvh] max-w-3xs sm:w-3xs xl:w-60 cursor-pointer select-none"
            :selected="dbTestOutputDataState.selectedTestResultOverviewIndex === index"
            @click="() => dbTestOutputDataState.selectedTestResultOverviewIndex = index"
          />
        </div>
      </div>
      <div class="flex gap-5 sm:gap-20 mt-5">
        <BaseButton
          label="Load Selected Test"
          :disabled="dbTestOutputDataState.selectedTestResultOverviewIndex === null"
          icon-name="mdi:rocket-launch"
          icon-size="1.5rem"
          @click="loadDataFromDB()"
        />
        <BaseButton
          label="Upload file instead"
          variant="warn"
          icon-name="prime:upload"
          icon-size="1.5rem"
          @click="() => {
            dbTestOutputDataState.testResultOverviews = []
            dbTestOutputDataState.isDataFound = false
          }"
        />
      </div>
    </div>
    <div
      v-else-if="!fileUploaderState.isFileLoaded"
      class="flex flex-col gap-5 py-15 items-center"
    >
      <h3 class="text-xl text-center">
        You can load either zip/json file of PDF Cropper or json file of CBT Interface/Results
      </h3>
      <BaseSimpleFileUpload
        accept="application/json,application/zip,.json,.zip"
        :label="'Select ZIP/JSON File'"
        invalid-file-type-message="Please select a valid ZIP or JSON file from PDF Cropper Page."
        icon-name="line-md:plus"
        @upload="handleFileUpload"
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
            <CbtSectionsOrderList
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
              :content="tooltipContent.questionsNumberingOrderType"
            />
          </div>
          <div class="flex flex-col grow items-center gap-5">
            <BaseSelect
              id="questions_numbering_type"
              v-model="settingsState.questionsOrder"
              size="lg"
              :options="selectOptions.questionsNumberingOrder"
              class="w-4/5"
            />
            <BaseButton
              label="Start"
              label-class="text-lg"
              class="my-auto"
              size="lg"
              icon-name="mdi:script-text-key-outline"
              icon-size="1.6rem"
              @click="showAnswerKeyMainBlock()"
            />
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
          <thead class="bg-gray-900">
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
              v-for="(questionData, quesNum, index) in subjectsData[currentPageData.subject]?.[currentPageData.section]"
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
                <UiInput
                  :id="INPUT_ID_PREFIX + index"
                  v-model.trim="subjectsAnswerKeysData![currentPageData.subject]![currentPageData.section]![quesNum]!.inputAnswer"
                  type="text"
                  size="large"
                  :max-length="100"
                  class="text-center sm:text-base md:text-lg h-10
                    focus-visible:ring-1 focus-visible:border-green-500! focus-visible:ring-green-500!"
                  @update:model-value="parseInputAnswer(
                    subjectsAnswerKeysData![currentPageData.subject]![currentPageData.section]![quesNum]!,
                    questionData.type,
                    questionData.type !== 'nat' ? questionData.answerOptions : null,
                  )"
                  @keydown.up="(e: Event) => keyDownHandler('arrowUp', e, index)"
                  @keydown.down="(e: Event) => keyDownHandler('arrowDown', e, index)"
                  @keydown.enter="(e: Event) => keyDownHandler('enter', e, index)"
                />
              </td>
              <td
                :data-answer="
                  utilStringifyAnswer(
                    subjectsAnswerKeysData![currentPageData.subject]![currentPageData.section]![quesNum]!.savedAnswer,
                    questionData.type,
                  )"
                class="relative p-2 sm:p-3 md:px-4
                  whitespace-pre-line
                  before:content-[attr(data-answer)]
                  before:block
                  before:text-green-400
                  before:font-semibold
                  data-[answer=null]:before:text-red-400
                  before:empty:hidden"
                :class="questionData.type === 'msm' ? 'not-data-[answer=null]:text-left' : ''"
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
              variant="help"
              label-class="text-lg"
              size="lg"
              :label="prevAndNextSectionsName.prevSection ?? ''"
              icon-name="material-symbols:arrow-back-ios-new-rounded"
              @click="changeCurrentPage('prev')"
            />
          </div>
          <div
            class="col-span-2 sm:row-start-1 sm:col-span-1 flex flex-col items-center"
            :class="prevAndNextSectionsName.nextSection === null ? 'hidden' : ''"
          >
            <BaseButton
              :label="prevAndNextSectionsName.nextSection ?? ''"
              class="flex flex-row-reverse"
              label-class="text-lg"
              variant="help"
              size="lg"
              :disabled="!isAllAnswersInCurrentPageValid"
              icon-name="material-symbols:arrow-forward-ios-rounded"
              @click="changeCurrentPage('next')"
            />
          </div>
          <div
            class="col-span-2 sm:row-start-1 sm:col-span-1 flex flex-col items-center"
            :class="prevAndNextSectionsName.nextSection === null && currentPageData.section
              ? ''
              : 'hidden'"
          >
            <BaseButton
              label="Generate Answer Key"
              label-class="text-lg"
              size="lg"
              :disabled="!isAllAnswersInCurrentPageValid"
              icon-name="mdi:rocket-launch"
              @click="generateOutputState.showDialog = true"
            />
          </div>
        </div>
      </div>
    </div>

    <DocsGenerateAnswerKey
      v-if="!fileUploaderState.isFileLoaded || dbTestOutputDataState.isDataFound"
    />

    <UiDialog
      v-model:open="generateOutputState.showDialog"
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
                  :content="tooltipContent.outputFileType"
                  icon-size="1.25rem"
                />
              </div>
              <BaseSelect
                id="generate_output_file_type"
                v-model="generateOutputState.selectedFileType"
                size="base"
                :options="outputFileTypeOptions"
              />
            </div>
          </div>
          <div class="flex justify-center py-5">
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
        </UiScrollArea>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script lang="ts" setup>
import { zip, strToU8 } from 'fflate'
import type { AsyncZippable } from 'fflate'
import { DataFileNames } from '#layers/shared/shared/enums'

type SectionListItem = TestSectionListItem & { totalQuestions: number }

type QuestionAnswerKeyData = {
  inputAnswer: string
  savedAnswer: QuestionAnswer
}

type SubjectsAnswerKeysData = GenericSubjectsTree<QuestionAnswerKeyData>

type SubjectsData = GenericSubjectsTree<CropperQuestionData | TestInterfaceQuestionData>

interface DBTestOutputDataState {
  isDataFound: boolean
  testResultOverviews: TestResultOverviewDB[]
  selectedTestResultOverviewIndex: number | null
  isDataFromDB: boolean
}

const tooltipContent = {
  questionsNumberingOrderType: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', [
        'Select how question numbers appear in the "Q. Num" Column. ',
        'This is for visual use only (internally all questions are referred by original Q. Num):',
      ]),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'Original'),
          ': Uses original numbering as it is.',
        ]),
        h('li', [
          h('strong', 'Cumulative'),
          ': Continues numbering across sections (e.g. 1-20, 21-40, 41-60).',
        ]),
        h('li', [
          h('strong', 'Section-wise'),
          ': Resets numbering in each section (e.g. 1-20, 1-20, 1-20).',
        ]),
      ]),
    ]),

  outputFileType: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', '(some may not be available depending on the input file/data.)'),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'ZIP'),
          ': Merges Answer Key data into data.json file of loaded ZIP file. ',
          'The ZIP file will contain all existing data as it was in the loaded ZIP file. ',
          'So you safely replace the input ZIP file with this new ZIP file.',
        ]),
        h('li', [
          h('strong', 'JSON (merged)'),
          ': Merges Answer Key data into the uploaded json file, preserving existing data.',
        ]),
        h('li', [
          h('strong', 'JSON (separate)'),
          ': JSON file will contain only the Answer Key Data.',
        ]),
      ]),
    ]),
}

const INPUT_ID_PREFIX = 'input-answer-q-'

const migrateJsonData = useMigrateJsonData()

// if yes then load that and this below will be storing it
const dbTestOutputDataState = shallowReactive<DBTestOutputDataState>({
  isDataFound: false, // boolean to indicate if testResultOverviews without results generated is found or not
  testResultOverviews: [], // list of testResultOverviews without results generated
  selectedTestResultOverviewIndex: null,
  isDataFromDB: false, // is data that is loaded (or being used) from db?
})

// if data to generate from is not found in db then
// ask user to upload file of cropper/interface/results, this will store the fileUploader related data
const fileUploaderState = shallowReactive<{
  isFileLoaded: boolean
  unzippedFiles: AsyncZippable | null
  jsonData: AnswerKeyJsonOutput | null
}>({
  isFileLoaded: false,
  unzippedFiles: null,
  jsonData: null,
})

const db = useDB()

const selectOptions = {
  questionsNumberingOrder: [
    { name: 'Original', value: 'original' },
    { name: 'Cumulative', value: 'cumulative' },
    { name: 'Section-wise', value: 'section-wise' },
  ],
}

const settingsState = shallowReactive({
  questionsOrder: 'original',
  isStarted: false,
})

const currentPageSectionName = shallowRef<string>('')

const sectionsState = reactive({
  sectionsList: [] as SectionListItem[],
  currentPageSectionName: '',
})

let subjectsData: SubjectsData | null = null

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

  if (fileUploaderState.unzippedFiles) {
    return options
  }

  if (dbTestOutputDataState.isDataFromDB) {
    return [options.at(-1)!]
  }
  else {
    options.shift()
    return options
  }
})

const currentPageData = computed(() => {
  let subjectName = ''
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

  const sectionTotalQuestions = Object.keys(subjectsData[subjectName]?.[currentSectionName] ?? {}).length
  return {
    subject: subjectName,
    section: currentSectionName,
    firstQuestionNum,
    sectionTotalQuestions,
  }
})

const prevAndNextSectionsName = computed(() => {
  const currentSection = currentPageSectionName.value
  let prevSection: string | null = null
  let nextSection: string | null = null

  if (currentSection && currentPageData.value) {
    const i = sectionsState.sectionsList.findIndex(
      section => section.name === currentSection,
    )

    if (i !== -1) {
      if (i > 0) {
        const name = sectionsState.sectionsList[i - 1]?.name
        if (name) prevSection = name
      }
      if (i < (sectionsState.sectionsList.length - 1)) {
        const name = sectionsState.sectionsList[i + 1]?.name
        if (name) nextSection = name
      }
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
    subjectsAnswerKeysData.value![subject]![section]!,
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
const formatQuestionTypeText = (questionData: CropperQuestionData | TestInterfaceQuestionData) => {
  const questionType = questionData.type
  const questionTypeUpperCase = questionType.toUpperCase()

  if (questionType === 'nat') {
    return questionTypeUpperCase
  }
  else {
    return `${questionTypeUpperCase} (${questionData.answerOptions})`
  }
}

// parse and convert string character to number or null
const parseInputTextChar = (text: string, answerOptions: number) => {
  if (text.length !== 1) return null

  let parsedNum: number | null = null
  if (text >= 'A' && text <= 'Z') {
    parsedNum = (text.charCodeAt(0) - 'A'.charCodeAt(0) + 1)
  }
  else if (text >= '1' && text <= '9') {
    parsedNum = parseInt(text, 10)
  }

  if (parsedNum !== null && parsedNum <= answerOptions) {
    return parsedNum
  }

  return null
}

// parse and convert text to number[] or null while removing duplicate chars
const parseMcqOrMsqInputText = (text: string, answerOptions: number) => {
  const chars = [...text]
  const filteredChars = chars.filter(ch => /[A-Z1-9]/.test(ch))
  const parsedList = filteredChars
    .map(char => parseInputTextChar(char, answerOptions))

  // Remove duplicates from final numbers and delete null if present
  const uniqueValues = new Set(parsedList)
  uniqueValues.delete(null)

  const uniqueNumbers = [...uniqueValues as Set<number>].sort((a, b) => a - b)

  return uniqueNumbers.length ? uniqueNumbers : null
}

const isStringValidNatNumFormat = (text: string) => /^-?\d+(\.\d+)?$/.test(text)

const parseNatInputText = (text: string) => {
  const maybeRangeAnswerStrs = text
    .replace(',', 'OR')
    .split('OR').map(n => n.trim())

  const results: string[] = []

  for (const maybeRangeAnswerStr of maybeRangeAnswerStrs) {
    if (maybeRangeAnswerStr.includes('TO')) {
      const rangeParts = maybeRangeAnswerStr.split('TO').map(n => n.trim())
      if (rangeParts.length === 2 && rangeParts.every(isStringValidNatNumFormat)) {
        const rangeFloats = rangeParts.map(n => parseFloat(n))
        const lowerLimit = Math.min(...rangeFloats)
        const upperLimit = Math.max(...rangeFloats)
        results.push(`${lowerLimit}TO${upperLimit}`)
      }
      else {
        return null
      }
    }
    else {
      if (isStringValidNatNumFormat(maybeRangeAnswerStr)) {
        results.push(maybeRangeAnswerStr)
      }
      else {
        return null
      }
    }
  }
  return results.length > 0 ? results.join(',') : null
}

const parseMsmInputText = (inputText: string, options: string): QuestionMsmAnswerType | null => {
  const charCodeOfA = 'A'.charCodeAt(0)
  const charCodeOfP = 'P'.charCodeAt(0)
  const wrapNum = charCodeOfP - charCodeOfA

  const answerParts = inputText
    .replace(/[A-Z]/g, (char) => {
      const charNum = char.charCodeAt(0) - charCodeOfA
      const wrapped = (charNum % wrapNum) + 1
      return wrapped.toString()
    })
    .replace(/\(/g, '[')
    .replace(/\)/g, ']')
    .split(',').map(n => n.trim())

  const optionsMaxData = utilGetMaxRowsAndColsFromMsmOptions(options)
  const rowsCharPattern = `[1-${optionsMaxData.rows % 10}]`
  const colsCharPattern = `[1-${optionsMaxData.cols % 10}]`
  const partPattern = new RegExp(`^(${rowsCharPattern}+)\\s*-\\s*\\[?\\s*(${colsCharPattern}+)\\s*\\]?$`)

  const isValidFormat = answerParts.every(part => partPattern.test(part))

  if (!isValidFormat)
    return null

  const resultSet: Record<number | string, Set<number>> = {}

  for (const part of answerParts) {
    const match = part.match(partPattern)
    if (!match) continue

    const rowStr = match[1]!
    const colStr = match[2]!

    const row = Number(rowStr)
    const cols = colStr.split('').map(Number).sort((a, b) => a - b)

    if (resultSet[row]) {
      for (const col of cols) {
        resultSet[row].add(col)
      }
    }
    else {
      resultSet[row] = new Set(cols)
    }
  }

  const entries = Object.entries(resultSet)
    .map(([rowNum, colsSet]) => [rowNum, [...colsSet].sort((a, b) => a - b)])

  return Object.fromEntries(entries)
}

// for parsing Input Answer and then storing it to savedAnswer
function parseInputAnswer(
  questionData: QuestionAnswerKeyData,
  questionType: QuestionType,
  answerOptions?: string | null,
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
      if (questionType === 'nat') {
        questionData.savedAnswer = parseNatInputText(inputAnswer)
      }
      else if (questionType === 'msm') {
        questionData.savedAnswer = parseMsmInputText(inputAnswer, answerOptions || '4')
      }
      else {
        questionData.savedAnswer = parseMcqOrMsqInputText(inputAnswer, parseInt(answerOptions || '4'))
      }
    }
  }
  else {
    questionData.savedAnswer = null
  }
}

function loadFileData() {
  const jsonData = fileUploaderState.jsonData
  if (jsonData?.generatedBasedOn === 'testInterfacePage') {
    subjectsData = jsonData?.testData ?? null
  }
  else if (jsonData?.generatedBasedOn === 'pdfCropperPage') {
    subjectsData = jsonData?.pdfCropperData ?? null
  }

  if (subjectsData === null) {
    useErrorToast('Error: Uploaded file is not in valid format')
    return
  }

  if (fileUploaderState.unzippedFiles) {
    generateOutputState.selectedFileType = 'zip'
  }

  loadDataState()
}

async function handleFileUpload(files: File | File[]) {
  try {
    const file = Array.isArray(files) ? files[0] : files
    if (!file) return
    const zipFileCheckStatus = await utilIsZipFile(file)
    if (zipFileCheckStatus > 0) {
      const { jsonData, unzippedFiles } = await utilUnzipTestDataFile(file, 'json-only', true)
      fileUploaderState.jsonData = migrateJsonData.answerKeyData(jsonData)
      fileUploaderState.unzippedFiles = unzippedFiles ?? null
    }
    else {
      fileUploaderState.jsonData = migrateJsonData.answerKeyData(await utilParseJsonFile(file))
    }

    loadFileData()
  }
  catch (err) {
    useErrorToast('Error while handling file upload', err)
  }
}

function loadDataState() {
  if (!subjectsData) return

  const existingTestAnswerKey = fileUploaderState.jsonData?.testAnswerKey || {}

  const stringifyAnswerSeparators = {
    mcq: ', ',
    msq: ', ',
    nat: ' or ',
    msm: {
      cols: '',
      rows: ', ',
      rowColsIndicator: '-',
    },
  }

  for (const [subject, sectionData] of Object.entries(subjectsData)) {
    subjectsAnswerKeysData.value[subject] ??= {}

    for (const [sectionName, questionsData] of Object.entries(sectionData)) {
      const sectionListItem: SectionListItem = {
        subject,
        name: sectionName,
        totalQuestions: Object.keys(questionsData).length,
        id: 0, // initial, proper id is being set below
      }
      sectionsState.sectionsList.push(sectionListItem)

      subjectsAnswerKeysData.value[subject][sectionName] ??= {}

      for (const [question, questionData] of Object.entries(questionsData)) {
        // load existing testAnswerKey if present in loaded json data
        const savedAnswer = existingTestAnswerKey?.[subject]?.[sectionName]?.[question] ?? null

        const answerText = utilStringifyAnswer(savedAnswer, questionData.type, true, stringifyAnswerSeparators)

        const inputAnswer = answerText === 'null' ? '' : answerText
        subjectsAnswerKeysData.value[subject][sectionName][question] = { inputAnswer, savedAnswer }
      }
    }
  }

  sectionsState.sectionsList.forEach((item, idx) => item.id = idx + 1) // set id

  currentPageSectionName.value = sectionsState.sectionsList[0]!.name
  fileUploaderState.isFileLoaded = true
}

function generateAnswerKey() {
  const rawData = utilCloneJson(subjectsAnswerKeysData.value)
  for (const [subjectName, sectionsData] of Object.entries(rawData)) {
    testAnswerKeyData[subjectName] ??= {}

    for (const [sectionName, questionsData] of Object.entries(sectionsData)) {
      testAnswerKeyData[subjectName][sectionName] ??= {}

      for (const [quesNum, questionData] of Object.entries(questionsData)) {
        const savedAnswer = questionData.savedAnswer
        testAnswerKeyData[subjectName][sectionName][quesNum] = utilCloneJson(savedAnswer)
      }
    }
  }
}

async function downloadOutput() {
  const selectedFileType = generateOutputState.selectedFileType
  if (selectedFileType != 'json-separate' && !fileUploaderState.jsonData) return

  generateOutputState.preparingDownload = true
  if (Object.keys(testAnswerKeyData).length === 0) {
    generateAnswerKey()
  }

  const filename = generateOutputState.filename
  let fileExtension: '.zip' | '.json' = '.json'
  let outputJsonString = ''

  if (selectedFileType === 'json-separate') {
    const jsonData = migrateJsonData.answerKeyData({ testAnswerKey: testAnswerKeyData })
    outputJsonString = JSON.stringify(jsonData, null, 2)
  }
  else {
    const jsonData = fileUploaderState.jsonData ?? {} as AnswerKeyJsonOutput
    jsonData.testAnswerKey = testAnswerKeyData

    outputJsonString = JSON.stringify(jsonData, null, 2)

    if (selectedFileType === 'zip' && fileUploaderState.unzippedFiles) {
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
    if (!fileUploaderState.unzippedFiles) return

    const jsonU8Array = strToU8(outputJsonString)
    fileUploaderState.unzippedFiles[DataFileNames.DataJson] = [jsonU8Array, { level: 6 }]

    zip(fileUploaderState.unzippedFiles, { level: 0 }, (err, compressedZip) => {
      if (err) {
        useErrorToast('Error creating zip file:', err)
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
        if (testOutputData) {
          const generatedBy = testOutputData.generatedBy
          if (generatedBy === 'testInterfacePage') {
            subjectsData = testOutputData.testData
          }
          else if (generatedBy === 'testResultsPage') {
            subjectsData = testOutputData.testResultData
          }
        }

        if (subjectsData) {
          dbTestOutputDataState.isDataFound = false
          dbTestOutputDataState.testResultOverviews = []
          loadDataState()
          dbTestOutputDataState.isDataFromDB = true
          generateOutputState.selectedFileType = 'json-separate'
        }
      }
      catch (err) {
        useErrorToast('Error while loading selected Test Data from db', err)
      }
    }
  }
}

async function checkForTestOutputDataInDB() {
  try {
    const testResultOverviews = await db.getTestResultOverviews('addedDescending', 10)
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
    useErrorToast('Error while trying to load test result overviews from db:', err)
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
  const name = sectionsState.sectionsList[0]?.name
  if (name) currentPageSectionName.value = name
  settingsState.isStarted = true
}

onBeforeMount(checkForTestOutputDataInDB)
</script>
