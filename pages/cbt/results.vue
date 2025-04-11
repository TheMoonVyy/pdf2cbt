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
        <div class="flex flex-col w-full gap-2 px-2 h-[84rem] sm:h-auto sm:px-4 sm:flex-row justify-evenly">
          <div class="flex-1 min-w-0 h-[28rem]">
            <!-- Here goes the pie chart for the test result summary -->
            <v-chart
              :option="testResultSummaryChartOption"
              autoresize
            />
          </div>
          <div class="flex-1 min-w-0 h-[28rem]">
            <!-- Here goes the pie chart for the time spent on each section -->
            <v-chart
              :option="testQuestionsSummaryChartOption"
              autoresize
            />
          </div>
          <div class="flex-1 min-w-0 h-[28rem]">
            <!-- Here goes the pie chart for the time spent on each section -->
            <v-chart
              :option="timeSpentPerSectionChartOption"
              autoresize
            />
          </div>
        </div>
        <div
          class="px-2 md:px-5 h-[90dvh] mb-20"
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
  TestLog,
  TestOutputData,
  TestOutputDataQuestion,
  TestAnswerKeyQuestionData,
  TestSectionKey,
  TestSectionSummary,
  TestResultDataQuestion,
  QuestionStatus,
} from '~/src/types'

interface ChartTemplates {
  pie: ECOption
  line: ECOption
  donut: ECOption
}

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

provide(THEME_KEY, 'dark')

// These holds the loading state of the file upload process.
const isLoading = shallowRef(false)
const isUploaded = shallowRef(false)

// This ref holds the parsed JSON data from the uploaded file.
const jsonData = shallowRef<TestOutputData | null>(null)

// This contains a reduced version of testResultData,
// with queId as the key and questionData as the value
const testResultQuestionsData: Record<number | string, TestResultDataQuestion> = {}

const testJourneyColors: {
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
    backgroundColor: '#1E1E1E',
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
    ...pieChartTemplate,
  },

  line: {
    backgroundColor: 'transparent',
    title: {
      text: 'Title',
      left: 'center',
      textStyle: {
        fontSize: 23,
        color: '#fff',
      },
      top: 0,
    },
    tooltip: {
      backgroundColor: '#1E1E1E',
      textStyle: {
        color: '#fff',
      },
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
      top: 40,
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
      icon: 'rect',
    },
    xAxis: {
      type: 'category',
      data: [],
    },
    yAxis: {
      type: 'value',
    },
    grid: {
      top: 85,
      containLabel: true,
    },
    series: [
      {
        name: 'seriesName',
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

const chartTooltipCache = {
  testJourney: new Map<string, string>(),
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

        let color = ''
        if (data.marks > 0) {
          color = testJourneyColors.resultStatus.correct
        }
        else if (data.marks < 0) {
          color = testJourneyColors.resultStatus.incorrect
        }

        const headerMarksContent = color
          ? `<span style="color: ${color};">${data.marks}</span>`
          : `${data.marks}`

        const header = `<strong>
          <p style="font-size: 1rem; line-height: 1.5rem;">
            ${p.marker}${p.name}: ${p.value} (${headerMarksContent}) (${p.percent}%)
          </p>
          `

        let body = ''
        for (const [section, sectionData] of Object.entries(data.sections)) {
          let color = ''
          if (sectionData.marks > 0) {
            color = testJourneyColors.resultStatus.correct
          }
          else if (sectionData.marks < 0) {
            color = testJourneyColors.resultStatus.incorrect
          }
          const marksContent = color
            ? `<span style="color: ${color};">${sectionData.marks}</span>`
            : `${sectionData.marks}`

          body += `
              <p>${section}: ${sectionData.count}
                (${marksContent})
              </p>
            `
        }

        return header + body + '</strong>'
      },
    },
    series: [{
      ...(chartTemplates.donut.series as PieSeriesOption[])[0],
      name: 'Test Result',
    }],
  },

  testJourney: {
    ...chartTemplates.line,
    title: {
      ...chartTemplates.line.title,
      text: 'Test Journey',
    },
    legend: {
      ...chartTemplates.line.legend,
    },
    tooltip: {
      ...chartTemplates.line.tooltip,
      formatter: (params: TopLevelFormatterParams) => {
        const p = Array.isArray(params) ? params[0] : params
        const queIdString = (p.value as [unknown, string])[1]

        if (chartTooltipCache.testJourney.has(queIdString)) {
          return chartTooltipCache.testJourney.get(queIdString)
        }

        const questionData = testResultQuestionsData[queIdString]
        if (!questionData) return ''

        const {
          oriQueId, secQueId, subject, section,
          status, answer, marks, result, timeSpent,
        } = questionData

        const { correctAnswer, status: resultStatus, marks: resultMarks } = result

        // don't show subject if section string starts with subject
        const subjectContentText = (section + '').startsWith(subject + '')
          ? null
          : `<p>Subject: ${subject}</p>`

        // user answer won't be shown if it is null
        let yourAnswerContentText = ''
        if (answer !== null) {
          yourAnswerContentText = '<p>Your Answer: '

          if (Array.isArray(answer)) {
            const sortedAnswer = answer.toSorted()
            if (resultStatus === 'incorrect') {
              sortedAnswer.forEach((ans) => {
                let color = testJourneyColors.resultStatus.incorrect

                if ((correctAnswer as number[]).includes(ans)) {
                  color = testJourneyColors.resultStatus.partial
                }
                yourAnswerContentText += `
                    <span style="color: ${color};">${utilStringifyAnswer(ans)}&nbsp</span>
                  `
              })
              yourAnswerContentText += '</p>'
            }
            else {
              yourAnswerContentText += `
                  <span style="color: ${testJourneyColors.resultStatus[resultStatus]};">
                    ${utilStringifyAnswer(sortedAnswer, ' ')}
                  </span></p>
                `
            }
          }
          else {
            yourAnswerContentText += `
                <span style="color: ${testJourneyColors.resultStatus[resultStatus]};">
                  ${utilStringifyAnswer(answer)}
                </span></p>
              `
          }
        }

        const tooltipContent = `
            <strong style="line-height: 1.5rem;">
            <p style="margin-bottom: 0.5rem;">Question ID: ${secQueId}-${oriQueId}-${queIdString}</p>
            ${subjectContentText || ''}
            <p>Section: ${section}</p>
            <p>Q. Status:
              <span style="color: ${testJourneyColors.qStatus[status]};">${utilKeyToLabel(status)}</span>
            </p>
            ${yourAnswerContentText || ''}
            <p>Correct Answer:
              <span style="color: ${testJourneyColors.resultStatus.correct};">
                ${utilStringifyAnswer(correctAnswer, ' ', true)}
              </span>
            </p>
            <p>Result:
              <span style="color: ${testJourneyColors.resultStatus[resultStatus]};">
                ${resultStatus === 'partial' ? 'Partially Correct' : utilKeyToLabel(resultStatus)}
              </span>
            </p>
            <p>Marks:
              <span style="color: ${testJourneyColors.resultStatus[resultStatus]};">${resultMarks}</span>
              <span style="color: ${testJourneyColors.resultStatus.partial};"> / ${marks.cm}</span>
            </p>
            <p>Time Spent: <span>${utilSecondsToTime(timeSpent, 'mmm:ss')}</span></p>
            </strong>
          `

        chartTooltipCache.testJourney.set(queIdString, tooltipContent)
        return tooltipContent
      },
    },
    xAxis: {
      name: 'Time (in minutes)',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        align: 'center',
        fontSize: 23,
        fontWeight: 'bold',
        color: 'cyan',
      },
      type: 'value',
      min: 0,
      axisLabel: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
        formatter: (val: number) => Number.isInteger(val) ? val.toString() : val.toFixed(1),
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: '#ffffff',
        },
      },
      splitLine: {
        show: true,
      },
      axisLine: {
        show: false,
      },
    },
    yAxis: {
      name: 'Question ID',
      nameLocation: 'middle',
      nameGap: 50,
      nameRotate: 90,
      nameTextStyle: {
        align: 'center',
        fontSize: 23,
        fontWeight: 'bold',
        color: 'cyan',
      },
      type: 'category',
      boundaryGap: false,
      axisLabel: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 15,
      },
      axisTick: {
        lineStyle: {
          color: '#ffffff',
        },
      },
      splitLine: {
        show: true,
      },
      axisLine: {
        show: false,
      },
      data: [],
    },
  },
}

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
  chartTooltipCache.testJourney.clear() // clear tooltip cache

  return {
    ...chartOptions.testJourney,
    legend: {
      ...chartOptions.testJourney.legend,
      data: chartDataState.testJourney.legendData,
    },
    yAxis: {
      ...chartOptions.testJourney.yAxis,
      data: chartDataState.testJourney.yAxisData,
    },
    series: chartDataState.testJourney.series,
  } as ECOption
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

  if (jsonData.value && !jsonData.value.testResultData) generateTestResult()

  chartDataState.timeSpentPerSection = getTestTimebySection()
    .map(item => ({ value: item.timeSpent, name: item.label }))

  loadTestResultToChartDataState()
  loadTestJourneyToChartDataState()
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

  const testResultData = jsonData.value?.testResultData
  if (!testResultData) return

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
  for (const subjectData of Object.values(testResultData)) {
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
  const summary: TestSectionSummary = {
    answered: 0,
    notAnswered: 0,
    notVisited: 0,
    marked: 0,
    markedAnswered: 0,
  }

  const testSummary = jsonData.value?.testSummary
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
  if (jsonData.value?.testResultData) {
    for (const [subject, subjectData] of Object.entries(jsonData.value.testResultData)) {
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

  const testResultData = jsonData.value?.testResultData
  const testLogs = jsonData.value?.testLogs
  if (!testResultData || !testLogs) return

  for (const subjectData of Object.values(testResultData)) {
    for (const sectionData of Object.values(subjectData)) {
      for (const questionData of Object.values(sectionData)) {
        testResultQuestionsData[questionData.queId] = questionData
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

    const questionData = testResultQuestionsData[queId]
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
      const color = testJourneyColors.resultStatus[resultStatus as QuestionResult['status']]

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

  const questionQueIds = Object.keys(testResultQuestionsData)
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

  console.log(series)
}

// returns the testTime (countdown seconds) of testFinished log from the test logs.
function getTestFinishedCountdownTime(testLogs: TestLog[]) {
  for (const log of testLogs) {
    if (log.type === 'testFinished') {
      return log.testTime
    }
  }
  return 0
}

// returns the testTime (countdown seconds) of testStarted log from the test logs.
function getTestStartedCountdownTime(testLogs: TestLog[]) {
  let testTime = testLogs.find(log => log.type === 'testStarted')?.testTime
  if (testTime === undefined) {
    const testDuration = jsonData.value?.testConfig.testDurationInSeconds
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

function generateTestResult() {
  const testData = jsonData.value?.testData
  const testAnswerKey = jsonData.value?.testAnswerKey

  if (!jsonData.value || !testData || !testAnswerKey) return

  try {
    jsonData.value.testResultData = {}

    for (const [subject, subjectData] of Object.entries(testData)) {
      jsonData.value.testResultData[subject] = {}

      for (const [section, sectionData] of Object.entries(subjectData)) {
        jsonData.value.testResultData[subject][section] = {}
        const testResultDataSection = jsonData.value.testResultData[subject][section]

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
        }
      }
    }
  }
  catch (err) {
    console.error(err)
    jsonData.value.testResultData = undefined
  }
}
</script>
