<template>
  <div
    class="max-h-dvh min-h-dvh w-full text-foreground bg-background"
  >
    <UiSidebarProvider>
      <CbtResultsSideBar v-model="currentPanelName" />
      <main>
        <UiSidebarTrigger />
        <slot />
      </main>
      <div class="relative min-w-0 flex flex-row w-full">
        <div
          class="flex flex-col w-full grow overflow-auto h-screen"
        >
          <div
            class="py-4 px-2"
          >
            <!-- Title for Test Results PagePanel -->
            <h1
              v-show="currentPanelName !== ResultsPagePanels.MyTests"
              class="text-xl text-center flex flex-col sm:flex-row justify-center items-center"
            >
              <span>Showing Results for&nbsp;</span>
              <ClientOnly>
                <span class="font-bold">
                  {{ computedTestName }}
                </span>
              </ClientOnly>
            </h1>
            <!-- Title for My Tests PagePanel -->
            <div
              v-show="currentPanelName === ResultsPagePanels.MyTests"
              class="grid grid-cols-2 gap-4"
            >
              <h2 class="text-2xl w-full font-bold text-center mx-auto col-span-2 sm:col-span-1 sm:text-end">
                My Tests
              </h2>
              <div class="flex flex-row gap-5 sm:gap-8 text-nowrap mx-auto sm:ml-auto sm:mr-8 col-span-2 sm:col-span-1">
                <!-- Import Button -->
                <BaseSimpleFileUpload
                  class="col-span-2 sm:col-span-1 flex flex-col"
                  accept="application/json,.json"
                  :label="screenWidth.isSmOrAbove ? 'Import Test Data' : 'Import Data'"
                  invalid-file-type-message="Please select a valid JSON file containing Test Data."
                  :icon-name="isLoading ? 'line-md:loading-twotone-loop' : 'prime:download'"
                  @upload="(file) => showImportExportDialog('Import', file)"
                />
                <!-- Export Button -->
                <BaseButton
                  class="col-span-2 sm:col-span-1"
                  :label="screenWidth.isSmOrAbove ? 'Export Test Data' : 'Export Data'"
                  variant="help"
                  icon-name="prime:upload"
                  :disabled="disableExportDataBtn"
                  @click="() => showImportExportDialog('Export')"
                />
              </div>
            </div>
          </div>
          <ClientOnly>
            <div
              v-show="currentPanelName === ResultsPagePanels.Summary"
              class="flex flex-row justify-center flex-wrap gap-5 py-2 sm:py-5 px-4"
            >
              <CbtResultsScoreCard
                v-for="(scoreCardData, idx) in scoreCardsData"
                :key="idx"
                :score-card-data="scoreCardData"
              />
            </div>
          </ClientOnly>
          <CbtResultsChartsPanel
            v-if="showChart"
            v-show="currentPanelName === ResultsPagePanels.Summary"
            class="mt-4"
            :chart-data-state="chartDataState"
            :test-result-questions-data="testResultQuestionsData"
            :chart-colors="chartColors"
          />
          <CbtResultsDetailedPanel
            v-if="testResultJsonData?.testResultData"
            v-show="currentPanelName === ResultsPagePanels.Detailed"
            :wait-until="currentPanelName === ResultsPagePanels.Detailed"
            :test-result-data="testResultJsonData.testResultData"
            :test-questions="Object.values(testResultQuestionsData)"
            :test-config="testResultJsonData.testConfig"
          />
          <CbtResultsMyTestsPanel
            v-show="currentPanelName === ResultsPagePanels.MyTests"
            v-model:disable-export-data-btn="disableExportDataBtn"
            :load-or-refresh-data-when="currentPanelName === ResultsPagePanels.MyTests"
            @view-or-generate-results-clicked="myTestsPanelViewOrGenerateHandler"
            @current-test-renamed="renameCurrentTest"
            @reevaluate-test-results="reevaluateTestResults"
          />
        </div>
      </div>
    </UiSidebarProvider>
    <CbtResultsImportExportDialog
      v-if="importExportDialogState.isVisible && importExportDialogState.data"
      v-model="importExportDialogState.isVisible"
      :type="importExportDialogState.type"
      :data="importExportDialogState.data"
      @processed="processImportExport"
    />
    <CbtResultsAnswerKeyDialog
      v-if="showAnswerKeyMissingDialog && testOutputData?.testResultOverview"
      v-model="showAnswerKeyMissingDialog"
      :test-result-overview="testOutputData.testResultOverview"
      :test-id="currentResultsID"
      @upload="loadAnswerKeyToTest($event.testAnswerKey)"
    />
  </div>
</template>

<script lang="ts" setup>
import type {
  LineSeriesOption,
  PieSeriesOption,
} from 'echarts/types/dist/shared'

import { ResultsPagePanels } from '#layers/shared/shared/enums'

interface ChartDataState {
  testQuestionsSummary: PieSeriesOption['data']
  timeSpentPerSection: PieSeriesOption['data']
  testJourney: {
    legendData: string[]
    yAxisData: string[]
    series: LineSeriesOption[]
  }
  testResultSummary: PieSeriesOption['data']
}

type TestResultSeriesDataItem = {
  name: string
  value: number
  marks: number
  itemStyle: {
    color: string
  }
  sections: {
    [section: string]: {
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
    notConsidered: '#eee',
  },
}

const screenBreakpoints = useBreakpoints(
  { sm: 640 },
  { ssrWidth: 1024 },
)

const db = useDB()

const appVersion = useRuntimeConfig().public.projectVersion

const migrateJsonData = useMigrateJsonData()

const currentResultsID = useCbtResultsCurrentID()

const currentPanelName = shallowRef<ResultsPagePanels>(ResultsPagePanels.Summary)

const screenWidth = reactive({
  isSmOrAbove: screenBreakpoints.greaterOrEqual('sm'),
})

const showAnswerKeyMissingDialog = shallowRef(false)

const importExportDialogState = shallowReactive<{
  isVisible: boolean
  type: 'Import' | 'Export'
  data: TestInterfaceOrResultJsonOutput[] | null
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

// This holds the output of test interface or results for current results.
const testOutputData = shallowRef<TestInterfaceOrResultJsonOutput | null>(null)

// This holds output of cbt interface but with results generated
// This is the data this page will mainly be using.
const testResultJsonData = ref<TestResultJsonOutput | null>(null)

// This contains a reduced version of testResultData,
// with queId as the key and questionData as the value
const testResultQuestionsData = shallowRef<Record<number | string, TestResultQuestionData>>({})

// This contains questions notes of current test
const testNotes = useCurrentTestNotes()

// stores data that computed is using for charts option
const chartDataState = reactive<ChartDataState>({
  testQuestionsSummary: [],
  timeSpentPerSection: [],
  testJourney: {
    legendData: [],
    yAxisData: [],
    series: [],
  },
  testResultSummary: [],
})

const computedTestName = computed(() => {
  const testName = testResultJsonData.value?.testConfig?.testName
  if (testName)
    return testName
  else if (currentResultsID) {
    return ''
  }

  return 'Demo Mock Test'
})

useSeoMeta({
  title: () => 'Test Results - PDF2CBT'
    + (computedTestName.value ? ` | ${computedTestName.value}` : ''),
})

// stores data for score card component
const scoreCardsData = shallowRef<ScoreCardData[]>([])

function loadDataToChartDataState(id: number) {
  if (testResultJsonData.value) {
    const { testResultData } = testResultJsonData.value

    const newTestResultQuestionsData: Record<number | string, TestResultQuestionData> = {}
    for (const subjectData of Object.values(testResultData)) {
      for (const sectionData of Object.values(subjectData)) {
        for (const questionData of Object.values(sectionData)) {
          newTestResultQuestionsData[questionData.queId] = questionData
        }
      }
    }
    testResultQuestionsData.value = newTestResultQuestionsData
  }

  loadQuestionsSummaryToChartDataState()

  chartDataState.timeSpentPerSection = getTestTimebySection()
    .map(item => ({ value: item.timeSpent, name: item.label }))

  loadTestResultToChartDataState()
  loadTestJourneyToChartDataState()
  loadScoreCardsData()

  if (id) currentResultsID.value = id
  showChart.value = true
}

function loadTestResultToChartDataState() {
  type InitialData = {
    [k in ValidQuestionResultStatus]: {
      [section in string]: {
        count: number
        marks: number
      }
    }
  }

  const testResultData = testResultJsonData.value?.testResultData
  if (!testResultJsonData.value || !testResultData) return

  const colors: Record<QuestionResult['status'], string> = {
    correct: '#00CC00', // Green
    incorrect: '#FF0000', // Red
    partial: '#FDDD60', // Amber
    dropped: '#FF8A45', // Orange
    bonus: '#58D9F9', // Light Blue
    notAnswered: '#BDBDBD', // Grey
    notConsidered: '#BDBDBD', // Grey
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

        if (result && result.status !== 'notConsidered') {
          initialData[result.status][section]!.marks += result.marks
          initialData[result.status][section]!.count++
        }
      }
    }
  }

  const seriesData: TestResultSeriesDataItem[] = []

  for (const [resultStatus, resultStatusData] of Object.entries(initialData)) {
    const filteredSections: Record<string, { count: number, marks: number }> = {}

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

  chartDataState.testResultSummary = seriesData
}

function loadQuestionsSummaryToChartDataState() {
  const summary: TestSectionSummary = {
    answered: 0,
    notAnswered: 0,
    notVisited: 0,
    marked: 0,
    markedAnswered: 0,
  }

  const testSummary = testResultJsonData.value?.testSummary
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
  const testResultData = testResultJsonData.value?.testResultData
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

  if (!testResultJsonData.value) return

  const { testLogs } = testResultJsonData.value

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
    notConsidered: [],
  }

  const symbolItemStyle = { color: '#0ff' }
  const attemptedQueIds: string[] = []

  let lastQueId = 0
  let lastStartTime = 0
  let lastResultStatus: QuestionResult['status'] | null = null
  let lastSeriesDataValuesArray: SeriesDataObj[] = []

  for (let i = 0; i < currentQuestionLogs.length; i++) {
    const { queId, startTime } = currentQuestionLogs[i]!

    const questionData = testResultQuestionsData.value[queId]!
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

function loadScoreCardsData() {
  const subjectsData = testResultJsonData.value?.testResultData
  const testDuration = testResultJsonData.value?.testConfig.testDurationInSeconds

  if (!subjectsData || !testDuration) return

  const scoreCards: Record<string, Record<string, ScoreCardData>> = {}
  for (const [subject, subjectData] of Object.entries(subjectsData)) {
    scoreCards[subject] ??= {}

    for (const [section, sectionData] of Object.entries(subjectData)) {
      scoreCards[subject][section] = getSectionScoreCardData(sectionData, section)
    }
  }

  const newScoreCardDatas: ScoreCardData[] = []

  // if there are more than 1 subject,
  // then make subject-wise scorecard
  if (Object.keys(scoreCards).length > 1) {
    for (const [subject, sectionsCards] of Object.entries(scoreCards)) {
      // get sum only if there are more than 1 section in this subject
      if (Object.keys(sectionsCards).length > 1) {
        const subjectCard = getSumOfScoreCardData(Object.values(sectionsCards), subject)
        newScoreCardDatas.push(subjectCard)
      }
      else {
        const subjectCard = Object.values(sectionsCards)[0]
        if (subjectCard) {
          subjectCard.title = subject
          newScoreCardDatas.push(subjectCard)
        }
      }
    }
  }
  else {
    // one subject found, then make section-wise score card
    const sectioncards = Object.values(scoreCards)[0]
    if (sectioncards) {
      for (const card of Object.values(sectioncards)) {
        newScoreCardDatas.push(card)
      }
    }
  }

  const testOverallCard = getSumOfScoreCardData(newScoreCardDatas, 'Test Overall')
  testOverallCard.testDuration = testDuration

  newScoreCardDatas.unshift(testOverallCard)

  scoreCardsData.value = newScoreCardDatas
}

function getEmptyScoreCardData(): ScoreCardData {
  return {
    title: '',
    marks: {
      correct: 0,
      partial: 0,
      incorrect: 0,
      bonus: 0,
      dropped: 0,
    },
    marksObtained: 0,
    maxMarks: 0,
    accuracy: {
      count: 0,
      denominator: 0,
    },
    timeSpent: 0,
    testDuration: 0,
    questionsAttempted: 0,
    totalQuestions: 0,
  }
}

function getSectionScoreCardData(sectionData: TestResultSectionData, title: string = '') {
  const cardData = getEmptyScoreCardData()

  for (const question of Object.values(sectionData)) {
    const { status, result, marks, timeSpent } = question

    if (result.status === 'notConsidered')
      continue

    cardData.timeSpent += timeSpent
    cardData.maxMarks += marks.max ?? marks.cm
    if (status === 'answered' || status === 'markedAnswered') cardData.questionsAttempted++
    cardData.totalQuestions++

    if (result.status !== 'notAnswered') {
      cardData.marks[result.status] += result.marks
      if (result.status === 'correct' || result.status === 'partial') {
        cardData.accuracy.count += result.accuracyNumerator
        cardData.accuracy.denominator++
      }
      else if (result.status === 'incorrect') {
        cardData.accuracy.denominator++
      }
    }
  }

  cardData.marksObtained = Object.values(cardData.marks).reduce((a, b) => a + b, 0)
  cardData.title = title

  return cardData
}

function getSumOfScoreCardData(cardDatas: ScoreCardData[], title: string = '') {
  const cardSum = getEmptyScoreCardData()

  for (const data of cardDatas) {
    cardSum.maxMarks += data.maxMarks
    cardSum.marksObtained += data.marksObtained
    cardSum.questionsAttempted += data.questionsAttempted
    cardSum.totalQuestions += data.totalQuestions
    cardSum.timeSpent += data.timeSpent
    cardSum.accuracy.count += data.accuracy.count
    cardSum.accuracy.denominator += data.accuracy.denominator

    for (const k of Object.keys(cardSum.marks) as (keyof ScoreCardData['marks'])[]) {
      cardSum.marks[k] += data.marks[k]
    }
  }

  if (title) cardSum.title = title

  return cardSum
}

// returns the testTime (countdown seconds) of testFinished log from the test logs.
function getTestFinishedCountdownTime(testLogs: TestLog[]) {
  // loop in reverse
  for (let i = testLogs.length - 1; i >= 0; i--) {
    if (testLogs[i]?.type === 'testFinished') {
      return testLogs[i]!.testTime
    }
  }
  return 0
}

// returns the testTime (countdown seconds) of testStarted log from the test logs.
function getTestStartedCountdownTime(testLogs: TestLog[]) {
  let testTime = testLogs.find(log => log.type === 'testStarted')?.testTime
  if (testTime === undefined) {
    const testDuration = testResultJsonData.value?.testConfig.testDurationInSeconds
    testTime = testDuration ? testDuration : 0
  }

  return testTime
}

function generateTestResults(
  loadToTestResultsOutputData?: true,
  testDataToUse?: TestInterfaceOrResultJsonOutput | null
): boolean | null

function generateTestResults(
  loadToTestResultsOutputData: false,
  testDataToUse?: TestInterfaceOrResultJsonOutput | null
): TestResultJsonOutput | null | false

function generateTestResults(
  loadToTestResultsOutputData: boolean = true,
  testDataToUse: TestInterfaceOrResultJsonOutput | null = testOutputData.value,
) {
  if (!testDataToUse) return false

  const {
    testConfig,
    testData,
    testSummary,
    testLogs,
    testAnswerKey,
  } = testDataToUse as TestInterfaceJsonOutput

  if (!testConfig || !testData || !testSummary || !testLogs) return false

  if (!testDataToUse.testResultOverview) {
    testDataToUse.testResultOverview = utilGetTestResultOverview(testDataToUse)
  }

  if (!testAnswerKey) {
    showAnswerKeyMissingDialog.value = true
    return null
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
          const testResultSectionData = testResultData[subject][section]

          for (const [question, questionData] of Object.entries(sectionData)) {
            const answerData = testAnswerKey[subject]?.[section]?.[question]
            const correctAnswer = (
              answerData?.type
                ? answerData.correctAnswer
                : answerData as unknown as QuestionAnswer // answer key data format uptil v1.29.0
            ) ?? null

            if (correctAnswer === null) {
              throw new Error(
                `Answer for (${subject}) ${section}: ${question} is not present/valid in Test Answer Key`,
              )
            }

            const currentQuestionData = utilCloneJson(questionData as TestResultQuestionData)

            currentQuestionData.result = utilGetQuestionResult(currentQuestionData, correctAnswer)
            currentQuestionData.oriQueId = parseInt(question)
            currentQuestionData.subject = subject
            currentQuestionData.section = section

            testResultSectionData[question] = currentQuestionData
          }

          const sectionQuestions = Object.values(testResultSectionData)
          const totalOptionalQuestions = testConfig.optionalQuestions
            ?.find(obj => obj.subject === subject && obj.section === section)
            ?.count || 0

          if (totalOptionalQuestions > 0) {
            // sort questions such that attempted questions are to the left of the array,
            // unattempted questions will thus be to the right but in their original relative order
            sectionQuestions.sort((a, b) => {
              const isAttemptedA = a.status === 'answered' || a.status === 'markedAnswered'
              const isAttemptedB = b.status === 'answered' || b.status === 'markedAnswered'

              if (isAttemptedA !== isAttemptedB) {
                return isAttemptedA ? -1 : 1
              }

              return a.queId - b.queId
            })

            // set questions after mandatory questions to notConsidered as they are optional ones
            let i = Math.max(0, sectionQuestions.length - totalOptionalQuestions)
            for (; i < sectionQuestions.length; i++) {
              const q = sectionQuestions[i]!
              q.result.status = 'notConsidered'
              q.result.marks = 0
              q.result.accuracyNumerator = 0
              q.marks.max = 0
            }
          }

          for (const question of sectionQuestions) {
            if (question.result.status === 'notConsidered')
              continue

            maxMarks += question.marks.max ?? question.marks.cm
            marksObtained += question.result.marks
            if (question.status === 'answered'
              || question.status === 'markedAnswered')
              questionsAttempted++

            switch (question.result.status) {
              case 'correct':
              case 'partial':
                totalCorrect += question.result.accuracyNumerator
                totalAnswered++
                break
              case 'incorrect':
                totalAnswered++
            }
            totalQuestions++
          }
        }
      }

      const testResultOverview = testDataToUse.testResultOverview
      testResultOverview.overview = {
        maxMarks,
        marksObtained,
        timeSpent: Math.abs(getTestStartedCountdownTime(testLogs) - getTestFinishedCountdownTime(testLogs)),
        testDuration: testDataToUse.testConfig.testDurationInSeconds,
        totalQuestions,
        questionsAttempted,
        accuracy: Math.round((totalCorrect / (totalAnswered || 1)) * 10000) / 100,
      }

      const resultsOutputData: TestResultJsonOutput = {
        testConfig,
        testSummary,
        testLogs,
        testResultData,
        testResultOverview,
        appVersion,
        generatedBy: 'testResultsPage',
      }

      if (loadToTestResultsOutputData) {
        testResultJsonData.value = resultsOutputData
        testOutputData.value = null // not required anymore
        return true // success flag
      }
      else {
        return resultsOutputData
      }
    }
    catch (err) {
      if (err instanceof Error)
        useErrorToast(err.name, err)
      else
        useErrorToast('Error evaluating Test Results', err)

      return false
    }
  }
}

async function loadTestOutputData(
  id: number | null = null,
  fallbackToDemo: boolean = true,
  verifyId: boolean = true,
) {
  let data: TestInterfaceOrResultJsonOutput | null = null
  let testNotesData: TestNotes = {}

  try {
    if (verifyId) {
      const testOverview = await db.getTestResultOverview(id ? id : null)
      if (testOverview?.id) {
        id = testOverview.id
      }
    }

    if (id) {
      const outputData = await db.getTestOutputData(id)
      if (outputData?.testOutputData) {
        data = outputData.testOutputData
      }
      const testDBNotes = await db.getTestNotes(id)
      testNotesData = testDBNotes || {}
    }
  }
  catch (err) {
    useErrorToast('Error loading test data from db:', err)
  }

  // either there is no data in db or there was an error
  // so load demo data
  if (!data && fallbackToDemo) {
    const demoData = await import('#layers/shared/app/assets/json/results_demo_data.json').then(m => m.default)
    if (demoData) {
      data = demoData as unknown as TestResultJsonOutput
    }
  }

  testNotes.value = testNotesData

  if (data) {
    testOutputData.value = data
    return { id, status: true }
  }

  return { id, status: false }
}

async function myTestsPanelViewOrGenerateHandler(id: number, btnType: 'generate' | 'view') {
  const { status } = await loadTestOutputData(id, false, false)
  if (status) {
    if (btnType === 'view' && testOutputData.value?.generatedBy === 'testResultsPage') {
      testResultJsonData.value = testOutputData.value as TestResultJsonOutput
      currentPanelName.value = ResultsPagePanels.Summary
      loadDataToChartDataState(id)
      return
    }

    const data = generateTestResults(false)
    if (data) {
      await db.replaceTestOutputDataAndResultOverview(id, utilCloneJson(data))
    }
  }
}

async function reevaluateTestResults(id: number, testAnswerKey: TestAnswerKeyData) {
  try {
    const testData = await db.getTestOutputData(id)
    if (!(testData?.testOutputData && 'testResultData' in testData.testOutputData))
      return

    const testWithResultData = testData.testOutputData as TestResultJsonOutput
    const testDataToUse: TestInterfaceJsonOutput = {
      ...testWithResultData,
      testData: testWithResultData.testResultData,
      testAnswerKey,
      generatedBy: 'testInterfacePage',
    }
    if ('testResultData' in testDataToUse)
      delete testDataToUse.testResultData

    const data = generateTestResults(false, testDataToUse)
    if (!data) return

    await db.replaceTestOutputDataAndResultOverview(id, utilCloneJson(data))

    if (currentResultsID.value === id) {
      testResultJsonData.value = null
      await nextTick()
      testResultJsonData.value = data
      testOutputData.value = null
      loadDataToChartDataState(id)
    }
  }
  catch (err) {
    useErrorToast('Error re-evaluating test results with new answer key', err)
  }
}

async function loadAnswerKeyToTest(testAnswerKey: TestAnswerKeyData) {
  if (!testAnswerKey || !testOutputData.value) return;

  (testOutputData.value as TestInterfaceJsonOutput).testAnswerKey = testAnswerKey

  const testData = migrateJsonData.answerKeyData(
    testOutputData.value,
    true,
  ) as unknown as TestInterfaceOrResultJsonOutput

  testOutputData.value = testData

  const testResultOverview = utilCloneJson(utilGetTestResultOverview(testData))
  testData.testResultOverview = testResultOverview
  const testResultOverviewDB = await db.getTestResultOverviewByCompoundIndex(testResultOverview)

  if (testResultOverviewDB && testResultOverviewDB.id) {
    const status = generateTestResults()
    if (status) {
      let id = 0
      try {
        await db.replaceTestOutputDataAndResultOverview(
          testResultOverviewDB.id,
          utilCloneJson(testResultJsonData.value!),
        )
        id = testResultOverviewDB.id
      }
      catch (err) {
        useErrorToast('Error updating test data after loading answer key', err)
      }
      loadDataToChartDataState(id)
    }
  }
}

async function showImportExportDialog(
  type: 'Import' | 'Export',
  importDataFile: File | null = null,
) {
  try {
    if (type === 'Export') {
      const data = await db.getTestResultOverviews('addedDescending')
      if (Array.isArray(data) && data.length > 0) {
        const testResultOverviews: Partial<TestInterfaceOrResultJsonOutput>[] = []
        data.forEach(data => testResultOverviews.push({ testResultOverview: data }))

        importExportDialogState.type = type
        importExportDialogState.data = testResultOverviews as TestInterfaceOrResultJsonOutput[]
        importExportDialogState.isVisible = true
      }
    }
    else if (importDataFile && type === 'Import') {
      importExportDialogState.data = null

      const importedData = await utilParseJsonFile(importDataFile)
      if (Array.isArray(importedData.testOutputDatas)) {
        const testOutputDatas = importedData.testOutputDatas
          .map((data: unknown) => migrateJsonData.testInterfaceOrResultData(data))

        importExportDialogState.data = testOutputDatas
      }
      else if (importedData.testConfig
        && (importedData.testData || importedData.testResultData)
        && importedData.testSummary
        && importedData.testLogs
      ) {
        importExportDialogState.data = [migrateJsonData.testInterfaceOrResultData(importedData)]
      }

      if (importExportDialogState.data !== null) {
        importExportDialogState.type = type
        importExportDialogState.isVisible = true
      }
    }
  }
  catch (err) {
    useErrorToast(`Error while ${type}ing Test Data`, err)
  }
}

async function processImportExport(
  type: 'Import' | 'Export',
  data: (TestInterfaceOrResultJsonOutput)[],
) {
  if (type === 'Import') {
    try {
      if (data.length > 0) {
        const queryList: [string, number, number][] = []
        for (const dataItem of data) {
          const {
            testName,
            testStartTime,
            testEndTime,
          } = utilGetTestResultOverview(dataItem)

          queryList.push([testName, testStartTime, testEndTime])
        }
        const duplicateDatas = await db.getTestResultOverviewsByCompoundIndexes(queryList)

        if (duplicateDatas.length > 0) {
          useErrorToast('Error: Importing duplicate test data is disallowed, a better way to handle this will be available soon')
        }
        else if (queryList.length > 0) {
          await db.bulkAddTestOutputData(utilCloneJson(data))
        }
      }
    }
    catch (err) {
      useErrorToast('Error while trying to save Imported Test Data to DB:', err)
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
      const testNotesDBList = await db.bulkGetTestNotes(ids)

      if (!testOutputDataDBList || !testNotesDBList) {
        throw new Error('Error: testOutputDataDBList or testNotesDBList is undefined')
      }

      const testNotesObject: Record<string | number, TestNotes> = {}
      for (const notesItem of testNotesDBList) {
        const { id, notes } = notesItem ?? {}
        if (id && notes) {
          testNotesObject[id] = notes
        }
      }

      const testOutputDatas: TestInterfaceOrResultJsonOutput[] = []

      for (const outputData of testOutputDataDBList) {
        const { id, testOutputData } = outputData ?? {}
        if (testOutputData) {
          if (id && testNotesObject[id]) {
            testOutputData.testNotes = testNotesObject[id]
          }
          testOutputDatas.push(testOutputData)
        }
      }

      if (testOutputDatas.length > 0) {
        const outputBlob = new Blob([JSON.stringify({ testOutputDatas })], { type: 'application/json' })
        utilSaveFile('pdf2cbt_test_results.json', outputBlob)
      }
    }
    catch (err) {
      useErrorToast(`Error ${type}ing Test Data(s)`, err)
    }
  }

  importExportDialogState.isVisible = false
  importExportDialogState.data = null
}

const renameCurrentTest = (newName: string) => {
  if (!testResultJsonData.value) return

  testResultJsonData.value.testConfig.testName = newName
  testResultJsonData.value.testResultOverview.testName = newName
}

function onMountedCallback(id: number | null = null) {
  loadTestOutputData(id)
    .then((statusObj) => {
      if (statusObj.status) {
        let isReadyToLoad = true
        if (testOutputData.value?.generatedBy !== 'testResultsPage') {
          isReadyToLoad = generateTestResults() || false
          if (isReadyToLoad && id && testResultJsonData.value) {
            db.replaceTestOutputDataAndResultOverview(
              id,
              utilCloneJson(testResultJsonData.value),
            )
          }
        }
        else {
          testResultJsonData.value = testOutputData.value as TestResultJsonOutput
          testOutputData.value = null
        }

        if (isReadyToLoad)
          loadDataToChartDataState(statusObj.id || 0)
      }
    })
    .finally(() => {
      db.getSettings()
        .then((data) => {
          const settings = data?.uiSettings
          if (settings) {
            const { uiSettings } = useCbtSettings()
            utilSelectiveMergeObj(uiSettings.value, settings)
          }
        })
    })
}

onMounted(() => onMountedCallback(currentResultsID.value || null))
</script>
