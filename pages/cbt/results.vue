<template>
  <div
    class="max-h-dvh min-h-dvh w-full border-t-2 overflow-y-auto border-surface-700 dark:bg-surface-900 dark:text-surface-0"
  >
    <div class="p-2">
      <!-- <h4 class="text-xl text-center mb-4">
        This Page is currently under development.
      </h4> -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:mx-4 sm:items-center sm:gap-6 p-2">
        <!-- Import Button -->
        <div class="row-start-1 col-start-1 sm:row-start-1 sm:col-start-1 flex justify-start">
          <BaseSimpleFileUpload
            accept="application/json,.json"
            :label="isScreenWidthSmOrAbove ? 'Import Test Data' : 'Import Data'"
            invalid-file-type-message="Invalid file. Please select a valid JSON file"
            :icon-name="isLoading ? 'line-md:loading-twotone-loop' : 'prime:download'"
            @upload="(file) => showImportExportDialog('Import', file)"
          />
        </div>
        <!-- Export Button -->
        <div class="row-start-1 col-start-1 sm:row-start-1 sm:col-start-3 flex justify-end">
          <BaseButton
            :label="isScreenWidthSmOrAbove ? 'Export Test Data' : 'Export Data'"
            severity="help"
            :disabled="disableExportDataBtn"
            @click="() => showImportExportDialog('Export')"
          >
            <template #icon>
              <Icon
                name="prime:upload"
                size="1.4rem"
              />
            </template>
          </BaseButton>
        </div>
        <!-- Title -->
        <h4
          class="row-start-2 col-start-1 sm:row-start-1 sm:col-start-2
            text-xl text-center flex flex-col sm:flex-row justify-center items-center"
        >
          <span>Showing Results for&nbsp;</span>
          <span class="font-bold">{{ testResultsOutputData?.testConfig.testName ?? 'Demo Mock Test' }}</span>
        </h4>
      </div>
    </div>
    <div v-if="showChart">
      <CbtResultsChartsPanel
        class="mt-4"
        :chart-data-state="chartDataState"
        :test-result-questions-data="testResultQuestionsData"
        :chart-colors="chartColors"
      />
    </div>
    <template v-if="importExportDialogState.isVisible && importExportDialogState.data">
      <CbtResultsImportExportDialog
        :type="importExportDialogState.type"
        :visibility="importExportDialogState.isVisible"
        :data="importExportDialogState.data"
        @processed="processImportExport"
      />
    </template>
    <CbtResultsAnswerKeyDialog
      v-if="showAnswerKeyMissingDialog && testOutputData?.testResultOverview"
      :visibility="showAnswerKeyMissingDialog"
      :test-result-overview="testOutputData.testResultOverview"
      @upload="(data) => {
        testOutputData!.testAnswerKey = data.testAnswerKey
        generateTestResults()
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import type {
  LineSeriesOption,
  PieSeriesOption,
} from 'echarts/types/dist/shared'

import type {
  TestResultsOutputData,
  QuestionResult,
  TestLog,
  TestOutputData,
  TestOutputDataQuestion,
  TestAnswerKeyQuestionData,
  TestSectionKey,
  TestSectionSummary,
  TestResultDataQuestion,
  QuestionStatus,
  TestResultData,
  TestResultOverviewDB,
} from '~/src/types'

import { db } from '~/src/db/cbt-db'

interface ChartDataState {
  testQuestionsSummary: PieSeriesOption['data']
  timeSpentPerSection: PieSeriesOption['data']
  testJourney: {
    legendData: string[]
    yAxisData: string[]
    series: LineSeriesOption[]
  }
  testResultSummary: {
    data: PieSeriesOption['data']
    centerText: string
  }
}

type TestResultSeriesDataItem = {
  name: string
  value: number
  marks: number
  itemStyle: {
    color: string
  }
  sections: {
    [section: TestSectionKey]: {
      count: number
      marks: number
    }
  }
}

const chartColors: {
  qStatus: Record<QuestionStatus, string>
  resultStatus: Record<QuestionResult['status'], string>
} = {
  qStatus: {
    answered: '#BFFF00', // lime
    notAnswered: '#FF5252', // radical red
    marked: '#e879f9', // fuchsia-400
    markedAnswered: '#00ffff', // cyan
    notVisited: '#eee', // gray
  },
  resultStatus: {
    // aside from partial, all colors are same as above
    correct: '#BFFF00',
    incorrect: '#FF5252',
    partial: '#ffff00', // yellow
    dropped: '#e879f9',
    bonus: '#00ffff',
    notAnswered: '#eee',
  },
}

const isScreenWidthSmOrAbove = useBreakpoints(
  { sm: 640 },
  { ssrWidth: 640 },
).greaterOrEqual('sm')

const showAnswerKeyMissingDialog = shallowRef(false)

const importExportDialogState = shallowReactive<{
  isVisible: boolean
  type: 'Import' | 'Export'
  data: TestOutputData[] | null
}>({
  isVisible: false,
  type: 'Import',
  data: null,
})

// This holds the loading state of the file upload process.
const isLoading = shallowRef(false)
// toggle for v-if of CbtResultsChartsPanel component
const showChart = shallowRef(false)

// disable export btn if no data is found in db
const disableExportDataBtn = shallowRef(false)

// This holds the output of cbt interface for current results.
const testOutputData = shallowRef<TestOutputData | null>(null)

// This holds output of cbt interface but with results generated
// This is the data this page will mainly be using.
const testResultsOutputData = ref<TestResultsOutputData | null>(null)

// This contains a reduced version of testResultData,
// with queId as the key and questionData as the value
const testResultQuestionsData = shallowRef<Record<number | string, TestResultDataQuestion>>({})

// stores data that computed is using for charts option
const chartDataState = reactive<ChartDataState>({
  testQuestionsSummary: [],
  timeSpentPerSection: [],
  testJourney: {
    legendData: [],
    yAxisData: [],
    series: [],
  },
  testResultSummary: {
    data: [],
    centerText: '',
  },
})

function loadDataToChartDataState() {
  loadQuestionsSummaryToChartDataState()

  chartDataState.timeSpentPerSection = getTestTimebySection()
    .map(item => ({ value: item.timeSpent, name: item.label }))

  loadTestResultToChartDataState()
  loadTestJourneyToChartDataState()

  showChart.value = true
}

function loadTestResultToChartDataState() {
  type InitialData = {
    [resultStatus in QuestionResult['status']]: {
      [section in TestSectionKey]: {
        count: number
        marks: number
      }
    }
  }

  const testResultData = testResultsOutputData.value?.testResultData
  if (!testResultsOutputData.value || !testResultData) return

  const colors: Record<QuestionResult['status'], string> = {
    correct: '#00CC00', // Green
    incorrect: '#FF0000', // Red
    partial: '#FDDD60', // Amber
    dropped: '#FF8A45', // Orange
    bonus: '#58D9F9', // Light Blue
    notAnswered: '#BDBDBD', // Grey
  }

  const initialData: InitialData = {
    correct: {},
    incorrect: {},
    partial: {},
    dropped: {},
    bonus: {},
    notAnswered: {},
  }

  for (const subjectData of Object.values(testResultData)) {
    for (const [section, sectionData] of Object.entries(subjectData)) {
      // add section (name): { count and marks } to each value of "initialData"
      for (const resultStatusData of Object.values(initialData)) {
        resultStatusData[section] = { count: 0, marks: 0 }
      }

      for (const questionData of Object.values(sectionData)) {
        const { result } = questionData

        if (result) {
          initialData[result.status][section].marks += result.marks
          initialData[result.status][section].count++
        }
      }
    }
  }

  const seriesData: TestResultSeriesDataItem[] = []

  for (const [resultStatus, resultStatusData] of Object.entries(initialData)) {
    const filteredSections: Record<TestSectionKey, { count: number, marks: number }> = {}

    let resultStatusValue = 0
    let resultStatusMarks = 0
    for (const [section, data] of Object.entries(resultStatusData)) {
      if (data.count !== 0) {
        filteredSections[section] = data
        resultStatusValue += data.count
        resultStatusMarks += data.marks
      }
    }

    if (Object.keys(filteredSections).length > 0) {
      const typedResultStatus = resultStatus as QuestionResult['status']

      const seriesDataItem: TestResultSeriesDataItem = {
        name: utilKeyToLabel(typedResultStatus),
        value: resultStatusValue,
        marks: resultStatusMarks,
        sections: filteredSections,
        itemStyle: {
          color: colors[typedResultStatus],
        },
      }

      seriesData.push(seriesDataItem)
    }
  }

  const {
    accuracy,
    marksObtained,
    maxMarks,
  } = testResultsOutputData.value.testResultOverview.overview

  const centerText = `${marksObtained}/${maxMarks}\n${accuracy}%`

  chartDataState.testResultSummary.data = seriesData
  chartDataState.testResultSummary.centerText = centerText
}

function loadQuestionsSummaryToChartDataState() {
  const summary: TestSectionSummary = {
    answered: 0,
    notAnswered: 0,
    notVisited: 0,
    marked: 0,
    markedAnswered: 0,
  }

  const testSummary = testResultsOutputData.value?.testSummary
  if (testSummary) {
    for (const row of testSummary) {
      for (const summaryType of Object.keys(summary) as (keyof TestSectionSummary)[]) {
        summary[summaryType] += row[summaryType]
      }
    }
  }

  const seriesData = [
    { name: 'Answered', value: summary.answered, itemStyle: { color: '#00cc00' } },
    { name: 'Not Answered', value: summary.notAnswered, itemStyle: { color: '#FF0000' } },
    { name: 'Not Visited', value: summary.notVisited, itemStyle: { color: '#BDBDBD' } },
    { name: 'Marked for Review', value: summary.marked, itemStyle: { color: '#8F00FF' } },
    { name: 'Marked for Review & Answered', value: summary.markedAnswered, itemStyle: { color: '#00BABA' } },
  ]

  chartDataState.testQuestionsSummary = seriesData
}

// This function calculates the time spent on each section of the test
// by iterating through the test data and summing up the time spent on each question.
function getTestTimebySection() {
  interface timebySection {
    subject: string
    timeSpent: number
    label: string
  }
  const time: timebySection[] = []
  const testResultData = testResultsOutputData.value?.testResultData
  if (testResultData) {
    for (const [subject, subjectData] of Object.entries(testResultData)) {
      for (const [section, sectionData] of Object.entries(subjectData)) {
        let sectionTime = 0
        for (const q of Object.values(sectionData)) {
          sectionTime += q.timeSpent
        }
        time.push({
          subject: subject,
          timeSpent: sectionTime,
          label: section,
        })
      }
    }
  }
  return time
}

function loadTestJourneyToChartDataState() {
  type SeriesDataObj = {
    value: [string | number, string]
    symbol?: 'roundRect'
    itemStyle?: { color: string }
  }

  type SeriesDataValues = {
    [resultStatus in QuestionResult['status']]: SeriesDataObj[]
  }

  if (!testResultsOutputData.value) return

  const { testResultData, testLogs } = testResultsOutputData.value

  for (const subjectData of Object.values(testResultData)) {
    for (const sectionData of Object.values(subjectData)) {
      for (const questionData of Object.values(sectionData)) {
        testResultQuestionsData.value[questionData.queId] = questionData
      }
    }
  }

  const startCountdownTime = getTestStartedCountdownTime(testLogs)
  const finishedCountdownTime = getTestFinishedCountdownTime(testLogs)

  const currentQuestionLogs: { queId: number, startTime: number }[] = []
  for (const log of testLogs) {
    if (log.type === 'currentQuestion') {
      currentQuestionLogs.push({
        queId: log.current.queId,
        startTime: Math.round((Math.abs(startCountdownTime - log.testTime) / 60) * 100) / 100,
      })
    }
  }

  const seriesDataValues: SeriesDataValues = {
    correct: [],
    incorrect: [],
    partial: [],
    dropped: [],
    bonus: [],
    notAnswered: [],
  }

  const symbolItemStyle = { color: '#0ff' }
  const attemptedQueIds: string[] = []

  let lastQueId = 0
  let lastStartTime = 0
  let lastResultStatus: QuestionResult['status'] | null = null
  let lastSeriesDataValuesArray: SeriesDataObj[] = []

  for (let i = 0; i < currentQuestionLogs.length; i++) {
    const { queId, startTime } = currentQuestionLogs[i]

    const questionData = testResultQuestionsData.value[queId]
    const resultStatus = questionData.result.status
    const currentSeriesDataValuesArray = seriesDataValues[resultStatus]
    attemptedQueIds.push(queId + '')

    if (i === 0) {
      currentSeriesDataValuesArray.push({
        value: [lastStartTime, lastQueId + ''],
      })
      currentSeriesDataValuesArray.push({
        value: [startTime, queId + ''],
        symbol: 'roundRect',
        itemStyle: symbolItemStyle,
      })
    }
    else {
      if (lastResultStatus === resultStatus) {
        currentSeriesDataValuesArray.push({
          value: [startTime, lastQueId + ''],
          symbol: 'roundRect',
          itemStyle: symbolItemStyle,
        })
        currentSeriesDataValuesArray.push({
          value: [startTime, queId + ''],
          symbol: 'roundRect',
          itemStyle: symbolItemStyle,
        })
      }
      else {
        lastSeriesDataValuesArray.push({
          value: [startTime, lastQueId + ''],
          symbol: 'roundRect',
          itemStyle: symbolItemStyle,

        })
        lastSeriesDataValuesArray.push({
          value: ['-', lastQueId + ''],
        })

        if (currentSeriesDataValuesArray.length > 0) {
          currentSeriesDataValuesArray.push({
            value: ['-', queId + ''],
          })
        }
        currentSeriesDataValuesArray.push({
          value: [startTime, lastQueId + ''],
        })
        currentSeriesDataValuesArray.push({
          value: [startTime, queId + ''],
          symbol: 'roundRect',
          itemStyle: symbolItemStyle,
        })
      }
    }

    lastResultStatus = resultStatus
    lastQueId = queId
    lastStartTime = startTime
    lastSeriesDataValuesArray = currentSeriesDataValuesArray
  }

  lastSeriesDataValuesArray.push({
    value: [
      Math.round((Math.abs(startCountdownTime - finishedCountdownTime) / 60) * 100) / 100,
      lastQueId + '',
    ],
    symbol: 'roundRect',
    itemStyle: symbolItemStyle,
  })
  lastSeriesDataValuesArray.push({
    value: ['-', lastQueId + ''],
  })

  const legendData: string[] = []
  const series: LineSeriesOption[] = []
  for (const [resultStatus, seriesData] of Object.entries(seriesDataValues)) {
    if (seriesData.length > 0) { // filter out empty ones
      const seriesName = utilKeyToLabel(resultStatus)
      const color = chartColors.resultStatus[resultStatus as QuestionResult['status']]

      const seriesItem: LineSeriesOption = {
        name: seriesName,
        type: 'line',
        step: 'start',
        symbol: 'none',
        symbolSize: 5,
        itemStyle: {
          color,
        },
        lineStyle: { color, width: 3 },
        data: seriesData,
      }
      series.push(seriesItem)
      legendData.push(seriesName)
    }
  }

  const questionQueIds = Object.keys(testResultQuestionsData.value)
  const unattemptedQueIds = questionQueIds.filter(id => !attemptedQueIds.includes(id))

  const seriesItem: LineSeriesOption = {
    name: 'notVisited',
    type: 'line',
    step: 'start',
    lineStyle: { opacity: 0 },
    symbol: 'none',
    data: [],
  }

  unattemptedQueIds.forEach(queId => seriesItem.data!.push(['-', queId]))
  series.push(seriesItem)

  chartDataState.testJourney.series = series
  chartDataState.testJourney.yAxisData = ['0'].concat(questionQueIds)
  chartDataState.testJourney.legendData = legendData
}

// returns the testTime (countdown seconds) of testFinished log from the test logs.
function getTestFinishedCountdownTime(testLogs: TestLog[]) {
  // loop backwards
  for (let i = testLogs.length - 1; i >= 0; i--) {
    if (testLogs[i].type === 'testFinished') {
      return testLogs[i].testTime
    }
  }
  return 0
}

// returns the testTime (countdown seconds) of testStarted log from the test logs.
function getTestStartedCountdownTime(testLogs: TestLog[]) {
  let testTime = testLogs.find(log => log.type === 'testStarted')?.testTime
  if (testTime === undefined) {
    const testDuration = testResultsOutputData.value?.testConfig.testDurationInSeconds
    testTime = testDuration ? testDuration : 0
  }

  return testTime
}

// function to evaluate a question and return QuestionResult
function getQuestionResult(
  questionData: TestOutputDataQuestion,
  questionCorrectAnswer: TestAnswerKeyQuestionData,
): QuestionResult {
  const { type, status, answer } = questionData
  const marks = {
    cm: Math.abs(questionData.marks.cm),
    pm: Math.abs(questionData.marks.pm ?? 0),
    im: Math.abs(questionData.marks.im) * -1,
  }

  const result: QuestionResult = {
    marks: 0,
    status: 'notAnswered',
    correctAnswer: questionCorrectAnswer,
  }

  if (questionCorrectAnswer === 'DROPPED') {
    result.marks = marks.cm
    result.status = 'dropped'
    return result
  }

  if (status === 'answered' || status === 'markedAnswered') {
    if (questionCorrectAnswer === 'BONUS') {
      result.marks = marks.cm
      result.status = 'bonus'
      return result
    }

    if (type === 'mcq' || type === 'nat') {
      if (answer === questionCorrectAnswer) {
        result.marks = marks.cm
        result.status = 'correct'
      }
      else {
        result.marks = marks.im
        result.status = 'incorrect'
      }
    }
    else { // type is msq
      const userAnswers = new Set(answer as number[])
      const correctAnswers = new Set(questionCorrectAnswer as number[])

      // here subset also includes same/equal to correctAnswers as well (not proper subset)
      const isUserAnswersSubsetOfCorrectAnswers = [...userAnswers].every(a => correctAnswers.has(a))

      if (isUserAnswersSubsetOfCorrectAnswers) {
        if (userAnswers.size === correctAnswers.size) {
          result.marks = marks.cm
          result.status = 'correct'
        }
        else {
          result.marks = marks.pm * userAnswers.size
          result.status = 'partial'
        }
      }
      else {
        result.marks = marks.im
        result.status = 'incorrect'
      }
    }
  }

  return result
}

function generateTestResults() {
  if (!testOutputData.value) return

  const { testConfig, testData, testSummary, testLogs, testAnswerKey } = testOutputData.value

  if (!testConfig || !testData || !testSummary || !testLogs) return

  try {
    testOutputData.value.testResultOverview = utilGetTestResultOverview(testOutputData.value)
  }
  catch (err) {
    console.error(err)
  }

  if (!testOutputData.value.testResultOverview) return

  if (!testAnswerKey) {
    showAnswerKeyMissingDialog.value = true
  }
  else {
    try {
      const testResultData: TestResultData = {}

      let marksObtained = 0
      let maxMarks = 0
      let totalCorrect = 0
      let totalAnswered = 0
      let totalQuestions = 0
      let questionsAttempted = 0

      for (const [subject, subjectData] of Object.entries(testData)) {
        testResultData[subject] = {}

        for (const [section, sectionData] of Object.entries(subjectData)) {
          testResultData[subject][section] = {}
          const testResultDataSection = testResultData[subject][section]

          for (const [question, questionData] of Object.entries(sectionData)) {
            const correctAnswer = testAnswerKey[subject]?.[section]?.[question] ?? null

            if (correctAnswer === null) {
              throw new Error(
                `Answer for (${subject}) ${section}: ${question} is not present/valid in Test Answer Key`,
              )
            }

            testResultDataSection[question] = JSON.parse(JSON.stringify(questionData))

            testResultDataSection[question].result = getQuestionResult(questionData, correctAnswer)
            testResultDataSection[question].oriQueId = parseInt(question)
            testResultDataSection[question].subject = subject
            testResultDataSection[question].section = section

            const currentQuestionData = testResultDataSection[question]

            maxMarks += currentQuestionData.marks.cm
            marksObtained += currentQuestionData.result.marks
            if (currentQuestionData.status === 'answered' || currentQuestionData.status === 'markedAnswered') {
              questionsAttempted++
            }
            const resultStatus = currentQuestionData.result.status
            if (resultStatus === 'correct') {
              totalCorrect++
              totalAnswered++
            }
            else if (resultStatus === 'partial') {
            // result.marks was obtained by count * marks.pm
            // so dividing by marks.pm to get count back
              const count = currentQuestionData.result.marks / (currentQuestionData.marks.pm || 1)
              // fraction count
              totalCorrect += count / (currentQuestionData.totalOptions || 4)
              totalAnswered++
            }
            else if (resultStatus === 'incorrect') {
              totalAnswered++
            }

            totalQuestions++
          }
        }
      }

      const testResultOverview = testOutputData.value.testResultOverview
      testResultOverview.overview = {
        maxMarks,
        marksObtained,
        timeSpent: Math.abs(getTestStartedCountdownTime(testLogs) - getTestFinishedCountdownTime(testLogs)),
        testDuration: testOutputData.value.testConfig.testDurationInSeconds,
        totalQuestions,
        questionsAttempted,
        accuracy: Math.round((totalCorrect / (totalAnswered || 1)) * 10000) / 100,
      }

      testResultsOutputData.value = {
        testConfig,
        testSummary,
        testLogs,
        testResultData,
        testResultOverview,
      }

      testOutputData.value = null // not required anymore
      return true // success flag
    }
    catch (err) {
      console.error(err)
    }
  }
}

async function loadTestOutputData(id: number | null = null): Promise<boolean> {
  let data: TestOutputData | null = null

  try {
    const testOverview = await db.getTestResultOverview(id ? id : null)
    if (testOverview?.id) {
      const outputData = await db.getTestOutputData(testOverview.id)
      if (outputData?.testOutputData) {
        data = outputData.testOutputData
      }
    }
    else if (!testOverview && id === null) {
      disableExportDataBtn.value = true
    }
  }
  catch (err) {
    console.error('Error while loading test results from db:', err)
  }

  // either there is no data in db or there was an error
  // so load demo data
  if (!data) {
    const demoData = await import('~/src/assets/json/results_demo_data.json').then(m => m.default)
    if (demoData) {
      data = demoData as unknown as TestOutputData
    }
  }

  if (data) {
    testOutputData.value = data
    return true
  }

  return false
}

async function showImportExportDialog(
  type: 'Import' | 'Export',
  importDataFile: File | null = null,
) {
  try {
    if (type === 'Export') {
      const data = await db.getTestResultOverview(null, true)
      if (Array.isArray(data) && data.length > 0) {
        const testResultOverviews: Partial<TestOutputData>[] = []
        data.forEach(data => testResultOverviews.push({ testResultOverview: data }))

        importExportDialogState.type = type
        importExportDialogState.data = testResultOverviews as TestOutputData[]
        importExportDialogState.isVisible = true
      }
    }
    else if (importDataFile && type === 'Import') {
      importExportDialogState.data = null

      const importedData = await utilParseJsonFile(importDataFile)

      if (importedData.testOutputDatas) {
        importExportDialogState.data = importedData.testOutputDatas as TestOutputData[]
      }
      else if (importedData.testConfig
        && (importedData.testData || importedData.testResultData)
        && importedData.testSummary
        && importedData.testLogs
      ) {
        importedData.testResultOverview = utilGetTestResultOverview(importedData)
        importExportDialogState.data = [importedData] as TestOutputData[]
      }

      if (importExportDialogState.data !== null) {
        importExportDialogState.type = type
        importExportDialogState.isVisible = true
      }
    }
  }
  catch (err) {
    console.error(`Error while ${type}ing Test Data`, err)
  }
}

async function processImportExport(
  type: 'Import' | 'Export',
  data: (TestOutputData | TestResultsOutputData)[],
) {
  if (type === 'Import') {
    try {
      const dataItem = data[0]
      if (dataItem) {
        db.addTestOutputData(dataItem as TestOutputData)
          .then(id => onMountedCallback(id))
      }
    }
    catch (err) {
      console.error('Error while trying to save Imported Test Data to DB:', err)
    }
  }
  else {
    try {
      const ids: number[] = []
      for (const outputData of data) {
        const id = (outputData.testResultOverview as TestResultOverviewDB).id
        if (id) ids.push(id)
      }

      const testOutputDataDBList = await db.getTestOutputDatas(ids)
      const testOutputDatas: (TestOutputData | TestResultsOutputData)[] = []

      for (const outputData of testOutputDataDBList) {
        if (outputData?.testOutputData) testOutputDatas.push(outputData.testOutputData)
      }

      if (testOutputDatas.length > 0) {
        const outputBlob = new Blob([JSON.stringify({ testOutputDatas })], { type: 'application/json' })
        utilSaveFile('pdf2cbt_test_results.json', outputBlob)
      }
    }
    catch (err) {
      console.error(err)
    }
  }

  importExportDialogState.isVisible = false
  importExportDialogState.data = null
}

function onMountedCallback(id: number | null = null) {
  loadTestOutputData(id).then((status) => {
    if (status) {
      let isReadyToLoad = true
      if (!testOutputData.value?.testResultData) {
        isReadyToLoad = generateTestResults() || false
      }

      if (isReadyToLoad) loadDataToChartDataState()
    }
  })
}

onMounted(() => onMountedCallback())
</script>
