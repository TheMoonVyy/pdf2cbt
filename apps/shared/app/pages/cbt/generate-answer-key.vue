<template>
  <UiScrollArea
    ref="scrollAreaElem"
    type="auto"
    class="flex"
    viewport-class="min-h-0 h-[calc(100dvh-var(--main-nav-bar-height,0))]!
      [&>div]:flex [&>div]:flex-col"
  >
    <div
      v-if="internalAnswerKeyData && currentPageData"
      class="flex flex-col gap-4 mt-3"
    >
      <h3 class="text-2xl font-bold text-center">
        {{ currentPageData?.section }}
      </h3>

      <div class="flex flex-col gap-10 items-center">
        <CbtGenerateAnswerKeyQuestionAnswerPanel
          v-for="q in Object.keys(internalAnswerKeyData[currentPageData.subject]![currentPageData.section]!)"
          :key="q"
          v-model="internalAnswerKeyData[currentPageData.subject]![currentPageData.section]![q]!"
          :is-question-answer-valid="!currentPageInvalidAnswerQNums?.has(Number(q))"
        />
      </div>

      <div class="grid grid-col-2 gap-x-10 gap-y-7 mt-5 mb-8 w-fit mx-auto">
        <div
          class="col-span-2 sm:row-start-1 sm:col-span-1 flex flex-col items-center"
          :class="prevAndNextSections.prevSection === null ? 'hidden' : ''"
        >
          <BaseButton
            variant="help"
            label-class="text-lg"
            size="lg"
            :label="prevAndNextSections.prevSection?.name ?? ''"
            icon-name="material-symbols:arrow-back-ios-new-rounded"
            @click="changeCurrentPage('prev')"
          />
        </div>
        <div
          class="col-span-2 sm:row-start-1 sm:col-span-1 flex flex-col items-center"
          :class="prevAndNextSections.nextSection === null ? 'hidden' : ''"
        >
          <BaseButton
            :label="prevAndNextSections.nextSection?.name ?? ''"
            class="flex flex-row-reverse"
            label-class="text-lg"
            variant="help"
            size="lg"
            :disabled="!isAllQuestionsInCurrentPageValid"
            icon-name="material-symbols:arrow-forward-ios-rounded"
            @click="changeCurrentPage('next')"
          />
        </div>
        <div
          class="col-span-2 sm:row-start-1 sm:col-span-1 flex flex-col items-center"
          :class="prevAndNextSections.nextSection === null && currentPageData.section
            ? ''
            : 'hidden'"
        >
          <BaseButton
            label="Generate Answer Key"
            label-class="text-lg"
            size="lg"
            :disabled="!isAllQuestionsInCurrentPageValid"
            icon-name="mdi:rocket-launch"
            @click="generateOutputState.showDialog = true"
          />
        </div>
      </div>
    </div>
    <div
      v-else-if="internalAnswerKeyData && sectionsState.sectionsList.length"
      class="flex flex-col sm:flex-row gap-5 sm:gap-10 mt-10 mb-5 items-center sm:justify-center"
    >
      <div
        class="flex flex-col"
      >
        <div class="flex justify-center">
          <span class="pl-5 pr-3 text-lg font-bold">Sort Sections Order</span>
        </div>
        <div class="flex mt-2">
          <CbtOrderList v-model="sectionsState.sectionsList" />
        </div>
      </div>
      <div class="flex flex-col sm:flex-row items-center gap-5">
        <BaseButton
          label="Prompt AI"
          label-class="text-lg"
          size="lg"
          icon-name="mdi:robot-outline"
          icon-size="1.6rem"
          @click="showGeneratePromptDialog = true"
        />
        <BaseButton
          label="Enter Answers Manually"
          label-class="text-lg"
          size="lg"
          icon-name="mdi:pencil-outline"
          icon-size="1.6rem"
          @click="showAnswerKeyMainBlock()"
        />
      </div>
    </div>

    <div
      v-else-if="loadFromCache && cachedTestData?.file"
      class="flex flex-col gap-7 w-full mt-15 items-center"
    >
      <h1 class="text-xl">
        Do you want to load the ZIP file that was generated
        during this session <span class="text-yellow-400">
          {{ utilGetTimeAgo(cachedTestData.time) }}
        </span>?
      </h1>
      <div class="flex justify-center my-3 gap-10">
        <BaseButton
          label="Yes"
          variant="success"
          @click="handleFileUpload(cachedTestData.file)"
        />
        <BaseButton
          label="No"
          variant="warn"
          @click="loadFromCache = false"
        />
      </div>
    </div>

    <div
      v-else-if="dbTestOutputDataState.isDataFound"
      class="flex flex-col gap-5 py-15 items-center"
    >
      <p class="w-full text-lg mx-auto px-6 text-center max-w-240">
        These test data entries were found in your local database<br>
        that may not contain answer key data
        (and therefore do not have results yet).
        <br><br>
        Select the one you want to generate answer key for,<br>
        or you can load a ZIP/JSON file from Test Maker
        or a JSON file from the CBT Interface/Results.
      </p>
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
          @click="loadSelectedTestFromDB"
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
      <h1 class="text-xl text-center">
        You can load either ZIP/JSON file of Test Maker or JSON file of CBT Interface/Results
      </h1>
      <BaseSimpleFileUpload
        accept="application/json,application/zip,.json,.zip"
        :label="'Select ZIP/JSON File'"
        invalid-file-type-message="Please select a valid ZIP or JSON file from Test Maker Page."
        icon-name="line-md:plus"
        @upload="handleFileUpload"
      />
    </div>

    <DocsGenerateAnswerKey class="mt-15" />

    <LazyCbtGenerateAnswerKeyPromptAiDialog
      v-if="internalAnswerKeyData
        && showGeneratePromptDialog
        && sectionsState.sectionsList?.length"
      v-model="showGeneratePromptDialog"
      v-model:internal-answer-key-data="internalAnswerKeyData"
      :sections-list="sectionsState.sectionsList"
      @manual-check="showAnswerKeyMainBlock"
      @generate-answer-key="generateOutputState.showDialog = true"
    />

    <LazyUiDialog
      v-if="internalAnswerKeyData"
      v-model:open="generateOutputState.showDialog"
    >
      <UiDialogContent class="max-w-full sm:max-w-md px-0 pt-4">
        <UiDialogHeader>
          <UiDialogTitle class="text-lg font-bold text-center">
            Generate Test Data (with Answer-key)
          </UiDialogTitle>
        </UiDialogHeader>
        <UiScrollArea class="max-h-128 w-full px-6">
          <div class="grid grid-cols-7 w-full gap-2">
            <div class="flex flex-col col-span-5 gap-2">
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
                :maxlength="100"
              />
            </div>
            <div class="flex flex-col gap-1 col-span-2">
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
              :disable="generateOutputState.preparingDownload"
              @click="downloadOutput()"
            />
          </div>
          <div class="flex justify-center pb-3">
            <span v-show="generateOutputState.preparingDownload">
              Please wait, preparing download...
            </span>
            <span v-show="generateOutputState.downloaded">
              Downloaded!
            </span>
          </div>
        </UiScrollArea>
      </UiDialogContent>
    </LazyUiDialog>
  </UiScrollArea>
</template>

<script lang="ts" setup>
import { zip, strToU8 } from 'fflate'
import type { AsyncZipOptions, AsyncZippable } from 'fflate'
import { DataFileNames } from '#layers/shared/shared/enums'
import { MIME_TYPE } from '#layers/shared/shared/constants'
import { answerOptionsFormatKey } from '#layers/shared/app/components/Cbt/GenerateAnswerKey/keys'

type SectionListItem = TestSectionListItem & { totalQuestions: number }

type SubjectsData = GenericSubjectsTree<CropperQuestionData | TestInterfaceQuestionData | TestResultQuestionData>

interface DBTestOutputDataState {
  isDataFound: boolean
  testResultOverviews: TestResultOverviewDB[]
  selectedTestResultOverviewIndex: number | null
}

const tooltipContent = {
  outputFileType: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', '(some may not be available depending on the input file/data.)'),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'ZIP'),
          ': Merges the Answer Key Data in uploaded ZIP file. ',
          'The ZIP file will contain all existing data as it was in the loaded ZIP file. ',
          'So you can safely replace the input ZIP file with this new ZIP file.',
          ' (Recommended)',
        ]),
        h('li', [
          h('strong', 'JSON'),
          ': Merges the Answer Key Data in uploaded JSON (or data.json) file.',
        ]),
      ]),
    ]),
}

useSeoMeta({
  title: 'Generate Answer Key - PDF2CBT',
})

const migrateJsonData = useMigrateJsonData()

const db = useDB()

const loadFromCache = shallowRef(true)

const cachedTestData = useCachedTestData()

const testMakerSettings = usePdfCropperLocalStorageSettings()

const internalAnswerKeyData = ref<GenerateAnswerKeyInternalSubjectsData | null>(null)

const { uiSettings } = useCbtSettings()

provide(answerOptionsFormatKey, uiSettings.value.questionPanel.answerOptionsFormat)

const scrollAreaElem = useTemplateRef('scrollAreaElem')

const generateOutputState = shallowReactive({
  showDialog: false,
  selectedFileType: 'zip' as 'zip' | 'json',
  filename: 'pdf2cbt_answer_key',
  preparingDownload: false,
  downloaded: false,
})

const downloadedSignal = useTimeoutFn(
  () => generateOutputState.downloaded = false,
  3000,
  {
    immediate: false,
    immediateCallback: false,
  },
)

const showGeneratePromptDialog = shallowRef(false)

// if isDataFound then load that and this below will be storing it
const dbTestOutputDataState = shallowReactive<DBTestOutputDataState>({
  isDataFound: false, // if testResultOverviews without results generated is found or not
  testResultOverviews: [], // list of testResultOverviews without results generated
  selectedTestResultOverviewIndex: null,
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

const sectionsState = reactive({
  sectionsList: [] as SectionListItem[],
  currentSection: null as SectionListItem | null,
})

const isStringValidNatNumFormat = (
  text: string,
  trim: boolean = true,
) => /^-?\d+(\.\d+)?$/.test(trim ? text.trim() : text)

const outputFileTypeOptions = computed(() => {
  const options = [
    { name: '.zip', value: 'zip' },
    { name: '.json', value: 'json' },
  ]

  if (!fileUploaderState.unzippedFiles) {
    options.shift()
  }

  return options
})

const currentPageData = computed(() => {
  let subjectName = ''
  const currentSectionName = sectionsState.currentSection?.name

  if (!internalAnswerKeyData.value || !currentSectionName) return

  for (const sectionItem of sectionsState.sectionsList) {
    if (sectionItem.name === currentSectionName) {
      subjectName = sectionItem.subject
      break
    }
  }

  const sectionTotalQuestions = Object.keys(
    internalAnswerKeyData.value[subjectName]?.[currentSectionName] ?? {},
  ).length

  return {
    subject: subjectName,
    section: currentSectionName,
    sectionTotalQuestions,
  }
})

const prevAndNextSections = computed(() => {
  const currentSection = sectionsState.currentSection?.name
  let prevSection: SectionListItem | null = null
  let nextSection: SectionListItem | null = null

  if (currentSection && currentPageData.value) {
    const i = sectionsState.sectionsList.findIndex(
      section => section.name === currentSection,
    )

    if (i !== -1) {
      if (i > 0) {
        prevSection = sectionsState.sectionsList[i - 1] ?? null
      }
      if (i < (sectionsState.sectionsList.length - 1)) {
        nextSection = sectionsState.sectionsList[i + 1] ?? null
      }
    }
  }

  return {
    prevSection,
    nextSection,
  }
})

const currentPageInvalidAnswerQNums = computed(() => {
  const qNums = new Set<number>()
  if (!currentPageData.value) return null

  const section = currentPageData.value.section
  const subject = currentPageData.value.subject

  const questions = Object.values(
    internalAnswerKeyData.value![subject]![section]!,
  )

  for (const q of questions) {
    if (!checkIfQuestionIsAnswered(q))
      qNums.add(q.qNum)
  }

  return qNums.size ? qNums : null
})

const isAllQuestionsInCurrentPageValid = computed(() => {
  if (currentPageInvalidAnswerQNums.value?.size) {
    return false
  }
  return true
})

function showAnswerKeyMainBlock() {
  sectionsState.currentSection = sectionsState.sectionsList[0] ?? null
  scrollAreaElem.value?.scrollTop()
}

function changeCurrentPage(changeTo: 'prev' | 'next') {
  if (changeTo === 'next' && prevAndNextSections.value.nextSection) {
    sectionsState.currentSection = prevAndNextSections.value.nextSection
  }
  else if (changeTo === 'prev' && prevAndNextSections.value.prevSection) {
    sectionsState.currentSection = prevAndNextSections.value.prevSection
  }
  scrollAreaElem.value?.scrollTop()
}

function checkIfQuestionIsAnswered(question: GenerateAnswerKeyInternalQuestionData) {
  if (question.isBonus || question.isDropped) return true

  const { type, answer } = question
  if (type === 'mcq' || type === 'msq') {
    return Boolean((answer as Set<number>).size)
  }

  if (type === 'msm') {
    for (const col of Object.values(answer as QuestionMsmAnswerType)) {
      if (!col.length) return false
    }
    return true
  }

  if (type === 'nat') {
    const ans = (answer as GenerateAnswerKeyInternalNatAnswer).values().toArray()

    const hasOnlyOneItem = ans.length === 1

    const iterUpto = hasOnlyOneItem
      ? 1
      : (ans.length - 1) // exclude last item

    for (let i = 0; i < iterUpto; i++) {
      const item = ans[i]!

      if (item.isRange) {
        if (!isStringValidNatNumFormat(item.min)
          || !isStringValidNatNumFormat(item.max)) {
          return false
        }
      }
      else if (!isStringValidNatNumFormat(item.value)) {
        return false
      }
    }
    if (!hasOnlyOneItem) {
      // last OR slot can be left empty

      const item = ans[iterUpto]!
      if (item.isRange) {
        if (item.max.trim() || item.min.trim()) {
          if (!isStringValidNatNumFormat(item.min)
            || !isStringValidNatNumFormat(item.max)) {
            return false
          }
        }
      }
      else if (item.value.trim()) {
        if (!isStringValidNatNumFormat(item.value))
          return false
      }
    }

    return true
  }
}

function parseNatAnswerText(answerText: string) {
  const maybeRangeAnswerStrs = answerText
    .toUpperCase()
    .replaceAll(',', 'OR')
    .split('OR').map(n => n.trim())

  const answer: GenerateAnswerKeyInternalNatAnswer = new Map()
  let count = 0

  for (const maybeRangeAnswerStr of maybeRangeAnswerStrs) {
    if (maybeRangeAnswerStr.includes('TO')) {
      const rangeParts = maybeRangeAnswerStr.split('TO').map(n => n.trim())
      if (rangeParts.length === 2
        && rangeParts.every(item => isStringValidNatNumFormat(item))) {
        const rangeFloats = rangeParts.map(n => parseFloat(n))
        const min = String(Math.min(...rangeFloats))
        const max = String(Math.max(...rangeFloats))
        answer.set(
          ++count,
          { min, max, value: '', isRange: true },
        )
      }
      else {
        return null
      }
    }
    else {
      if (isStringValidNatNumFormat(maybeRangeAnswerStr)) {
        answer.set(
          ++count,
          { min: '', max: '', isRange: false, value: maybeRangeAnswerStr },
        )
      }
      else {
        return null
      }
    }
  }

  return answer
}

async function checkForTestOutputDataInDB() {
  try {
    const testResultOverviews = await db.getTestResultOverviews('addedDescending', 10)
    const overviewsList: TestResultOverviewDB[] = []
    for (const data of testResultOverviews) {
      if (typeof data?.overview?.marksObtained !== 'number') {
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

function loadSelectedTestFromDB() {
  const index = dbTestOutputDataState.selectedTestResultOverviewIndex
  if (typeof index === 'number') {
    const id = dbTestOutputDataState.testResultOverviews[index]?.id
    if (id) {
      loadDataFromDB(id)
    }
  }
}

async function loadDataFromDB(id: number) {
  try {
    const data = await db.getTestOutputData(id)

    const testOutputData = data?.testOutputData
    if (!testOutputData)
      throw new Error(`No test data found in db for the test with id = ${id}.`)

    let subjectsData: SubjectsData | null = null
    if ('testData' in testOutputData) {
      subjectsData = testOutputData.testData
    }
    else if ('testResultData' in testOutputData) {
      subjectsData = testOutputData.testResultData
    }

    if (subjectsData) {
      dbTestOutputDataState.isDataFound = false
      dbTestOutputDataState.testResultOverviews = []
      generateOutputState.selectedFileType = 'json'
      fileUploaderState.jsonData = testOutputData as unknown as AnswerKeyJsonOutput
      loadDataState(subjectsData)
      return true
    }
  }
  catch (err) {
    useErrorToast('Error while loading selected Test Data from db', err)
  }
  return false
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
      generateOutputState.selectedFileType = 'zip'
    }
    else {
      fileUploaderState.jsonData = migrateJsonData.answerKeyData(await utilParseJsonFile(file))
      generateOutputState.selectedFileType = 'json'
    }

    const filenameParts = file.name.split('.')
    if (filenameParts.length > 1) {
      filenameParts.pop()
    }
    generateOutputState.filename = filenameParts.join('.')

    const jsonData = fileUploaderState.jsonData
    let subjectsData: SubjectsData | null = null
    if ('testData' in jsonData) {
      subjectsData = jsonData?.testData ?? null
    }
    else if ('pdfCropperData' in jsonData) {
      subjectsData = jsonData?.pdfCropperData ?? null
    }
    else if ('testResultData' in jsonData) {
      subjectsData = jsonData?.testResultData ?? null
    }

    if (subjectsData === null) {
      useErrorToast('Error: Uploaded file is not in valid format')
      return
    }

    loadDataState(subjectsData)
  }
  catch (err) {
    useErrorToast('Error while handling file upload', err)
  }
}

function loadDataState(subjectsData: SubjectsData) {
  if (!subjectsData) return

  sectionsState.sectionsList.length = 0

  const existingTestAnswerKey = fileUploaderState.jsonData?.testAnswerKey

  const newInternalAnswerKeyData: GenerateAnswerKeyInternalSubjectsData = {}

  let sectionCount = 0
  for (const [subject, subjectData] of Object.entries(subjectsData)) {
    newInternalAnswerKeyData[subject] = {}
    const existingSubjectAnsKey = existingTestAnswerKey?.[subject]

    for (const [section, sectionData] of Object.entries(subjectData)) {
      newInternalAnswerKeyData[subject][section] = {}
      const existingSectionAnsKey = existingSubjectAnsKey?.[section]

      const sectionListItem: SectionListItem = {
        subject,
        name: section,
        totalQuestions: Object.keys(sectionData).length,
        id: ++sectionCount,
      }
      sectionsState.sectionsList.push(sectionListItem)

      for (const [question, questionData] of Object.entries(sectionData)) {
        const existingOldQAnsKey = existingSectionAnsKey?.[question]?.correctAnswer ?? null

        let existingAnswer: QuestionAnswer | null = null
        if (existingOldQAnsKey) {
          existingAnswer = existingOldQAnsKey
        }
        else if ('result' in questionData && questionData.result?.correctAnswer) {
          existingAnswer = questionData.result.correctAnswer
        }

        newInternalAnswerKeyData[subject][section][question] = getInternalQuestionAnswer(
          parseInt(question),
          questionData,
          existingAnswer,
        )
      }
    }
  }

  internalAnswerKeyData.value = newInternalAnswerKeyData
}

function getInternalQuestionAnswer(
  qNum: number,
  qData: Pick<TestResultQuestionData,
  'answerOptions' | 'answerOptionsCounterType' | 'type'
  >,
  existingAnswer: QuestionAnswer | null,
): GenerateAnswerKeyInternalQuestionData {
  const {
    type,
    answerOptions = '4',
    answerOptionsCounterType,
  } = qData

  const isBonus = typeof existingAnswer === 'string'
    && existingAnswer.toLowerCase().startsWith('bonus')

  const isDropped = typeof existingAnswer === 'string'
    && existingAnswer.toLowerCase().startsWith('drop')

  if (isBonus || isDropped)
    existingAnswer = null

  if (type === 'mcq' || type === 'msq') {
    if (type === 'mcq' && existingAnswer && !Array.isArray(existingAnswer)) {
      existingAnswer = [existingAnswer as number]
    }

    return {
      qNum,
      type,
      answerOptionsCounterType,
      answerOptions,
      answerOptionsCount: utilGetMaxRowsAndColsFromAnswerOptions(answerOptions),
      isBonus,
      isDropped,
      answer: new Set<number>(Array.isArray(existingAnswer) ? existingAnswer : []),
    }
  }
  else if (type === 'msm') {
    const answerOptionsCount = utilGetMaxRowsAndColsFromAnswerOptions(answerOptions)
    const _existingAnswer = existingAnswer && typeof existingAnswer === 'object'
      ? existingAnswer
      : {}

    const answer: QuestionMsmAnswerType = {}
    for (const row of utilRange(1, answerOptionsCount.rows + 1)) {
      const existingCols = _existingAnswer[row]
      if (Array.isArray(existingCols)) {
        answer[row] = [...existingCols]
      }
      else {
        answer[row] = []
      }
    }

    return {
      qNum,
      type,
      answerOptions,
      answerOptionsCounterType,
      answerOptionsCount,
      isBonus,
      isDropped,
      answer,
    }
  }
  else { // is nat
    let answer: GenerateAnswerKeyInternalNatAnswer | null = null
    if (typeof existingAnswer === 'string') {
      answer = parseNatAnswerText(existingAnswer)
    }

    if (!answer)
      answer = new Map([[1, { min: '', max: '', value: '', isRange: false }]])

    return {
      qNum,
      type,
      answerOptionsCounterType,
      answerOptionsCount: { rows: 0, cols: 0 },
      isBonus,
      isDropped,
      answer,
    }
  }
}

function generateAnswerKey() {
  if (!internalAnswerKeyData.value) return

  const testAnswerKeyData: TestAnswerKeyData = {}

  const rawData = internalAnswerKeyData.value
  for (const [subjectName, sectionsData] of Object.entries(rawData)) {
    testAnswerKeyData[subjectName] = {}

    for (const [sectionName, questionsData] of Object.entries(sectionsData)) {
      testAnswerKeyData[subjectName][sectionName] = {}

      for (const [quesNum, questionData] of Object.entries(questionsData)) {
        const { type, answerOptions } = questionData

        let correctAnswer: QuestionAnswer
        if (questionData.isBonus) {
          correctAnswer = 'BONUS'
        }
        else if (questionData.isDropped) {
          correctAnswer = 'DROPPED'
        }
        else if (type === 'nat') {
          correctAnswer = (questionData.answer as GenerateAnswerKeyInternalNatAnswer)
            .values()
            .filter((item) => {
              if (item.isRange) {
                return Boolean(item.min.trim() && item.max.trim())
              }
              return Boolean(item.value.trim())
            })
            .map((item) => {
              if (item.isRange) {
                return `${item.min.trim()}TO${item.max.trim()}`
              }
              return item.value.trim()
            })
            .toArray()
            .join(',')
        }
        else if (type === 'mcq' || type === 'msq') {
          correctAnswer = (questionData.answer as Set<number>).values().toArray()
        }
        else {
          correctAnswer = utilCloneJson(
            questionData.answer as QuestionMsmAnswerType,
          )
        }

        testAnswerKeyData[subjectName][sectionName][quesNum] = {
          type,
          answerOptions,
          correctAnswer,
        }
      }
    }
  }

  if (Object.keys(testAnswerKeyData).length > 0) {
    return testAnswerKeyData
  }
}

async function downloadOutput() {
  const selectedFileType = generateOutputState.selectedFileType
  generateOutputState.preparingDownload = true
  generateOutputState.downloaded = false

  const zipCompLevel = testMakerSettings.value.download.zipCompLevel

  const testAnswerKeyData = generateAnswerKey()
  if (!testAnswerKeyData) {
    generateOutputState.preparingDownload = false
    return
  }

  const filename = generateOutputState.filename

  const jsonData = fileUploaderState.jsonData
    ? utilCloneJson(fileUploaderState.jsonData)
    : {} as AnswerKeyJsonOutput

  jsonData.testAnswerKey = testAnswerKeyData
  jsonData.appVersion = migrateJsonData.getAppVersion()
  jsonData.generatedBy = 'answerKeyPage'

  const outputJsonString = JSON.stringify(jsonData, null, 2)

  if (selectedFileType === 'json') {
    const outputBlob = new Blob([outputJsonString], { type: MIME_TYPE.json })
    utilSaveFile(`${filename}.json`, outputBlob)
    generateOutputState.preparingDownload = false
    downloadedSignal.stop()
    generateOutputState.downloaded = true
    downloadedSignal.start()
    cachedTestData.value = null
  }
  else {
    if (!fileUploaderState.unzippedFiles) {
      generateOutputState.preparingDownload = false
      return
    }

    const jsonU8Array = strToU8(outputJsonString)
    fileUploaderState.unzippedFiles[DataFileNames.DataJson] = [jsonU8Array, { level: 6 }]

    zip(
      fileUploaderState.unzippedFiles,
      { level: zipCompLevel as AsyncZipOptions['level'] },
      (err, compressedZip) => {
        if (err) {
          useErrorToast('Error creating zip file:', err)
          generateOutputState.preparingDownload = false
          return
        }

        try {
          const outputBlob = new Blob(
            [compressedZip as unknown as Uint8Array<ArrayBuffer>],
            { type: MIME_TYPE.zip },
          )
          const time = Date.now()
          cachedTestData.value = {
            by: 'generate-answer-key',
            file: new File(
              [outputBlob],
              utilGetFileNameForCachedTestData('CBT-GAK', time),
              { type: outputBlob.type },
            ),
            time,
          }
          utilSaveFile(`${filename}.zip`, outputBlob)
          downloadedSignal.stop()
          generateOutputState.downloaded = true
          downloadedSignal.start()
        }
        finally {
          generateOutputState.preparingDownload = false
        }
      })
  }
}

onBeforeMount(() => {
  const route = useRoute()

  const rawTestId = route.query.test_id

  const testId = typeof rawTestId === 'string' ? parseInt(rawTestId, 10) : null

  if (testId && !isNaN(testId)) {
    loadDataFromDB(testId)
      .then((status) => {
        if (!status) checkForTestOutputDataInDB()
      })
  }
  else {
    checkForTestOutputDataInDB()
  }
})
</script>
