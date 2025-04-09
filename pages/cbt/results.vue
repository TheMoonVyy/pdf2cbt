<template>
  <div
    class="max-h-dvh min-h-dvh w-full border-t-2 overflow-y-auto border-surface-700 dark:bg-surface-900 dark:text-surface-0"
  >
    <div class="m-4">
      <h4 class="text-xl text-center mb-4">
        This Page is currently under development.
      </h4>
      <!-- This is the file upload component for uploading the analysis file -->
      <BaseSimpleFileUpload
        accept="application/json,.json"
        :label="isLoading ? 'Please wait, loading File...' : 'Select the Analysis File'"
        :icon-name="isLoading ? 'line-md:loading-twotone-loop' : 'prime:plus'"
        icon-size="1.5rem"
        invalid-file-type-message="Invalid file. Please select a valid JSON Analysis File."
        @uploader="(e: any) => handleAnalysisFileUpload(e.files)"
      />
    </div>
    <div :class="{ hidden: !isUploaded }">
      <div>
        <div class="flex flex-col h-[84rem] sm:h-auto sm:flex-row w-full justify-evenly">
          <div class="px-2 flex-1 min-w-0 h-[28rem] items-center justify-center">
            <!-- Here goes the pie chart for the test result summary -->
            <v-chart
              :option="testResultSummaryChartOption"
              autoresize
            />
          </div>
          <div class="px-2 items-center min-w-0 h-[28rem] flex-1 justify-center">
            <!-- Here goes the pie chart for the time spent on each section -->
            <v-chart
              :option="testQuestionsSummaryChartOption"
              autoresize
            />
          </div>
          <div class="px-2 items-center min-w-0 h-[28rem] flex-1 justify-center">
            <!-- Here goes the pie chart for the time spent on each section -->
            <v-chart
              :option="timeSpentPerSectionChartOption"
              autoresize
            />
          </div>
        </div>
        <div
          class="px-5 h-[28rem]"
        >
          <!-- Here goes the line chart for the test journey -->
          <v-chart
            :option="testJourneyChartOption"
            autoresize
          />
        </div>
        <!-- <div class="grid"> -->
        <!-- Here goes the Question Journey based on testLogs -->
        <!-- </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  CallbackDataParams,
  LineSeriesOption,
  PieSeriesOption,
  TopLevelFormatterParams,
} from 'echarts/types/dist/shared'

import type {
  QuestionResult,
  QuestionStatus,
  TestLog,
  TestOutputData,
  TestOutputDataQuestion,
  TestAnswerKeyQuestionData,
  TestSectionKey,
} from '~/src/types'

interface ChartTemplates {
  pie: ECOption
  line: ECOption
  donut: ECOption
}

interface ChartDataState {
  testQuestionsSummary: PieSeriesOption['data']
  timeSpentPerSection: PieSeriesOption['data']
  testJourney: unknown
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

provide(THEME_KEY, 'dark')

// These holds the loading state of the file upload process.
const isLoading = shallowRef(false)
const isUploaded = shallowRef(false)

// This ref holds the parsed JSON data from the uploaded file.
const jsonData = shallowRef<TestOutputData | null>(null)

const pieChartTemplate: ECOption = {
  backgroundColor: 'transparent',
  title: {
    text: 'Title',
    left: 'center',
    top: 0,
  },
  legend: {
    top: 35,
    textStyle: {
      color: '#ffffff',
      fontSize: 13,
    },
    type: 'scroll',
    pageIconColor: '#00FF00',
    pageIconInactiveColor: '#eeeeee',
    pageTextStyle: {
      color: '#00cc00',
    },
  },
  tooltip: {
    backgroundColor: '#222222',
    textStyle: {
      color: '#fff',
    },
    formatter: (params: TopLevelFormatterParams) => {
      const p = params as CallbackDataParams
      return `<p><strong>${p.seriesName}</strong></p>${p.marker} ${p.name}: ${p.value} (${p.percent}%)`
    },
  },
  series: [
    {
      name: 'SeriesName',
      type: 'pie',
      radius: '60%',
      center: ['50%', '50%'],
      data: [],
      label: {
        show: true,
        color: '#fff',
        fontSize: 15,
        formatter: '{c} ({d}%)',
      },
      labelLine: {
        lineStyle: {
          width: 2,
        },
      },
    },
  ],
}

// base template for charts
const chartTemplates: ChartTemplates = {
  pie: {
    ...pieChartTemplate as ECOption,
  },

  line: {
    backgroundColor: 'transparent',
    title: {
      text: 'Test Journey',
      left: 'center',
      top: 0,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          color: '#000000',
          backgroundColor: '#ffffff',
          fontSize: 13,
        },
      },
    },
    legend: {
      top: 35,
      textStyle: {
        color: '#ffffff',
      },
    },
    xAxis: {
      type: 'category',
      data: [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Questions Attempted',
        data: [],
        type: 'line',
        smooth: true,
      },
    ],
  },

  donut: {
    ...pieChartTemplate,
    series: [{
      ...(pieChartTemplate.series as PieSeriesOption[])[0],
      radius: ['30%', '60%'],
    }],
  },
}

const chartOptions = {
  testQuestionsSummary: {
    ...chartTemplates.pie,
    title: {
      ...chartTemplates.pie.title,
      text: 'Question Status Summary',
    },
    series: [{
      ...(chartTemplates.pie.series as PieSeriesOption[])[0],
      name: 'Questions',
    }],
  },

  timeSpentPerSection: {
    ...chartTemplates.pie,
    title: {
      ...chartTemplates.pie.title,
      text: 'Time Spent per Section',
    },
    tooltip: {
      ...chartTemplates.pie.tooltip,
      formatter: (params: TopLevelFormatterParams) => {
        const p = params as CallbackDataParams
        const body = `${p.marker} ${p.name}: ${utilSecondsToTime(p.value as number, 'mmm:ss')} (${p.percent}%)`
        return `<p><strong>${p.seriesName}</strong></p>${body}`
      },
    },
    series: [{
      ...(chartTemplates.pie.series as PieSeriesOption[])[0],
      name: 'Time Spent',
      label: {
        ...(chartTemplates.pie.series as PieSeriesOption[])[0].label,
        formatter: (params: TopLevelFormatterParams) => {
          const p = params as CallbackDataParams
          return `${utilSecondsToTime(p.value as number, 'mmm:ss')} (${p.percent}%)`
        },
      },
    }],
  },

  testResultSummary: {
    ...chartTemplates.donut,
    title: {
      ...chartTemplates.donut.title,
      text: 'Test Result Summary',
    },
    tooltip: {
      ...chartTemplates.donut.tooltip,
      formatter: (params: TopLevelFormatterParams) => {
        const p = params as CallbackDataParams
        const data = p.data as TestResultSeriesDataItem
        const marksWithSign = data.marks >= 0 ? '+' + data.marks : data.marks
        const header = `<p>${p.marker} <strong>${p.name}: </strong>${p.value} (${marksWithSign}) (${p.percent}%)</p>`

        let body = ''
        for (const [section, sectionData] of Object.entries(data.sections)) {
          const sectionMarksWithSign = sectionData.marks >= 0 ? '+' + sectionData.marks : sectionData.marks
          body += `<p>${section}: ${sectionData.count} (${sectionMarksWithSign})</p>`
        }

        return header + body
      },
    },
    series: [{
      ...(chartTemplates.donut.series as PieSeriesOption[])[0],
      name: 'Test Result',
    }],
  },
}

// stores data that computed is using for charts option
const chartDataState = reactive<ChartDataState>({
  testQuestionsSummary: [],
  timeSpentPerSection: [],
  testJourney: {
    xAxisData: [],
    data: [],
  },
  testResultSummary: {
    data: [],
    centerText: '123/600',
  },
})

const testResultSummaryChartOption = computed(() => {
  return {
    ...chartOptions.testResultSummary,
    series: [{
      ...chartOptions.testResultSummary.series[0],
      data: chartDataState.testResultSummary.data,
    }],
    graphic: [{
      type: 'text',
      left: 'center',
      top: 'middle',
      style: {
        text: chartDataState.testResultSummary.centerText,
        fill: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 34,
        textAlign: 'center',
        textVerticalAlign: 'middle',
      },
    }],
  }
})

const testQuestionsSummaryChartOption = computed(() => {
  return {
    ...chartOptions.testQuestionsSummary,
    series: [{
      ...chartOptions.testQuestionsSummary.series[0],
      data: chartDataState.testQuestionsSummary,
    }],
  }
})

const timeSpentPerSectionChartOption = computed(() => {
  return {
    ...chartOptions.timeSpentPerSection,
    series: [{
      ...chartOptions.timeSpentPerSection.series[0],
      data: chartDataState.timeSpentPerSection,
    }],
  }
})

const testJourneyChartOption = computed<ECOption>(() => {
  const xAxisData = Array.from({ length: 6 }, (_, i) => {
    let testTime = 0
    if (jsonData.value?.testLogs) {
      const { start, end } = getStartEndTimestamp(jsonData.value.testLogs)
      testTime = (end - start) / 60000
    }

    const start = Math.round((i * testTime / 6) * 10) / 10
    const end = Math.round(((i + 1) * testTime / 6) * 10) / 10
    return `${start}-${end} min`
  })

  const seriesData = getAttemptedQuestionsbyInveral(
    getLatestLogsByQueId(jsonData.value?.testLogs ?? []),
    6,
  )

  const series = (chartTemplates.line.series as LineSeriesOption[])[0]
  return {
    ...chartTemplates.line,
    xAxis: {
      ...chartTemplates.line.xAxis,
      data: xAxisData,
    },
    series: [{
      ...series,
      data: seriesData,
    }],
  }
})

// This function handles the file upload and parsing of the JSON data.
// It sets the isLoading state to true while the file is being processed.
function handleAnalysisFileUpload(files: File | File[]) {
  isLoading.value = true
  const file = Array.isArray(files) ? files[0] : files
  utilParseJsonFile(file)
    .then((parsedData) => {
      if (parsedData) {
        jsonData.value = parsedData
        isUploaded.value = true
        loadDataToChartDataState()
      }
    })
    .catch(err => console.error('Error parsing JSON:', err))
    .finally(() => {
      isLoading.value = false
    })
}

function loadDataToChartDataState() {
  loadQuestionsSummaryToChartDataState()

  chartDataState.timeSpentPerSection = getTestTimebySection()
    .map(item => ({ value: item.timeSpent, name: item.label }))

  generateTestResult()
  loadTestResultToChartDataState()
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

  const testData = jsonData.value?.testData
  if (!testData) return

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

  let totalMaxMarks = 0
  let totalQuestionsAnswered = 0
  let totalQuestionsAnsweredCorrect = 0
  for (const subjectData of Object.values(testData)) {
    for (const [section, sectionData] of Object.entries(subjectData)) {
      // add section (name): { count and marks } to each value of "initialData"
      for (const resultStatusData of Object.values(initialData)) {
        resultStatusData[section] = { count: 0, marks: 0 }
      }

      for (const questionData of Object.values(sectionData)) {
        const { result, marks } = questionData

        if (result) {
          initialData[result.status][section].marks += result.marks
          initialData[result.status][section].count++

          const resultStatus = result.status
          if (resultStatus === 'correct') {
            totalQuestionsAnsweredCorrect++
            totalQuestionsAnswered++
          }
          else if (resultStatus === 'partial') {
            // result.marks was obtained by count * marks.pm
            // so deviding by marks.pm to get count back
            const count = result.marks / (marks.pm || 1)
            // fraction count
            totalQuestionsAnsweredCorrect += count / (questionData.totalOptions || 4)
            totalQuestionsAnswered++
          }
          else if (resultStatus === 'incorrect') {
            totalQuestionsAnswered++
          }
        }
        totalMaxMarks += marks.cm
      }
    }
  }

  const seriesData: TestResultSeriesDataItem[] = []
  let totalMarksObtained = 0

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

    totalMarksObtained += resultStatusMarks
  }

  const accuracy = Math.round((totalQuestionsAnsweredCorrect / (totalQuestionsAnswered || 1)) * 10000) / 100
  const centerText = `${totalMarksObtained}/${totalMaxMarks}\n${accuracy}%`

  chartDataState.testResultSummary.data = seriesData
  chartDataState.testResultSummary.centerText = centerText
}

function loadQuestionsSummaryToChartDataState() {
  const seriesData = [
    { name: 'Answered', value: getTestSummaryData('answered'), itemStyle: { color: '#00cc00' } },
    { name: 'Not Answered', value: getTestSummaryData('notAnswered'), itemStyle: { color: '#FF0000' } },
    { name: 'Not Visited', value: getTestSummaryData('notVisited'), itemStyle: { color: '#BDBDBD' } },
    { name: 'Marked for Review', value: getTestSummaryData('marked'), itemStyle: { color: '#8F00FF' } },
    { name: 'Marked for Review & Answered', value: getTestSummaryData('markedAnswered'), itemStyle: { color: '#0000FF' } },
  ]

  chartDataState.testQuestionsSummary = seriesData
}

// This function calculates the total number of questions for each type
// by iterating through the test summary data of each section and summing up the values.
function getTestSummaryData(
  questionStatus: QuestionStatus,
): number {
  let num = 0
  if (jsonData.value) {
    jsonData.value.testSummary.forEach((section) => {
      num += section[questionStatus]
    })
  }
  return num // Ensure a number is always returned
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
  if (jsonData.value) {
    Object.keys(jsonData.value.testData).forEach(
      (subject: string) => {
        Object.keys(jsonData.value?.testData[subject] ?? {}).forEach((section) => {
          let sectionTime = 0
          Object.values(jsonData.value?.testData[subject][section] ?? {}).forEach((q) => {
            sectionTime += q.timeSpent
          })
          time.push({
            subject: subject,
            timeSpent: sectionTime,
            label: section,
          })
        })
      },
    )
  }
  return time
}

// This function filters the test logs to get the latest log for each question ID (queId).
function getLatestLogsByQueId(testLogs: TestLog[]) {
  const latestLogsMap = new Map()

  // Iterate through the logs
  for (const log of testLogs) {
    const queId = log.current?.queId // Extract queId from the log
    if (queId !== undefined) {
      // Check if the queId exists in the map or if the current log has a later timestamp
      if (!latestLogsMap.has(queId) || log.timestamp > latestLogsMap.get(queId).timestamp) {
        latestLogsMap.set(queId, log) // Update the map with the latest log
      }
    }
  }
  // Convert the Map values to an array
  return Array.from(latestLogsMap.values())
}

// This function retrieves the start and end timestamps from the test logs.
function getStartEndTimestamp(testLogs: TestLog[]): { start: number, end: number } {
  const start = testLogs.find(log => log.type === 'testStarted')?.timestamp || 0
  const end = testLogs.find(log => log.type === 'testFinished')?.timestamp || 0
  return { start, end }
}

// This function calculates the number of attempted questions in each time interval.
function getAttemptedQuestionsbyInveral(uniqueTestLog: TestLog[], interval: number): number[] {
  const attemptedQuestions: number[] = Array(interval).fill(0)
  const { start, end } = getStartEndTimestamp(jsonData.value?.testLogs ?? [])
  const totalDuration = end - start
  const intervalDuration = totalDuration / interval
  uniqueTestLog.forEach((log) => {
    const attemptedTime = log.timestamp - start
    const intervalIndex = Math.floor(attemptedTime / intervalDuration)
    if (intervalIndex >= 0) {
      if (intervalIndex < interval) {
        attemptedQuestions[intervalIndex] += 1 // Increment the count for the corresponding interval
      }
      else {
        attemptedQuestions[interval - 1] += 1 // Increment the last interval if it exceeds
      }
    }
  })
  return attemptedQuestions
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

function generateTestResult() {
  const testData = jsonData.value?.testData
  const testAnswerKey = jsonData.value?.testAnswerKey

  if (!testData || !testAnswerKey) return

  try {
    for (const [subject, subjectData] of Object.entries(testData)) {
      for (const [section, sectionData] of Object.entries(subjectData)) {
        for (const [question, questionData] of Object.entries(sectionData)) {
          const correctAnswer = testAnswerKey[subject]?.[section]?.[question] ?? null

          if (correctAnswer === null) {
            throw new Error(
              `Answer for (${subject}) ${section}: ${question} is not present/valid in Test Answer Key`,
            )
          }

          questionData.result = getQuestionResult(questionData, correctAnswer)
        }
      }
    }
    jsonData.value!.isResult = true
  }
  catch (err) {
    console.error(err)
  }
}
</script>
