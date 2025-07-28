<template>
  <div>
    <div class="grid grid-cols-6 w-full gap-2 px-2 h-auto sm:px-4">
      <div class="flex-1 mx-4 sm:mx-0 col-span-6 sm:col-span-3 md:col-span-2 h-112">
        <!-- Here goes the pie chart for the test result summary -->
        <v-chart
          :option="testResultSummaryChartOption"
          :autoresize="{ throttle: 250 }"
        />
      </div>
      <div class="flex-1 mx-4 sm:mx-0 col-span-6 sm:col-span-3 md:col-span-2 h-112">
        <!-- Here goes the pie chart for the time spent on each section -->
        <v-chart
          :option="testQuestionsSummaryChartOption"
          :autoresize="{ throttle: 250 }"
        />
      </div>
      <div class="flex-1 mx-4 sm:mx-0 col-span-6 sm:col-span-4 md:col-span-2 h-112">
        <!-- Here goes the pie chart for the time spent on each section -->
        <v-chart
          :option="timeSpentPerSectionChartOption"
          :autoresize="{ throttle: 250 }"
        />
      </div>
    </div>
    <div
      class="px-2 sm:pr-5 h-[90dvh] col-span-6 mb-20"
    >
      <!-- Here goes the line chart for the test journey -->
      <v-chart
        :option="testJourneyChartOption"
        :autoresize="{ throttle: 250 }"
      />
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

interface ChartTemplates {
  pie: ECOption
  line: ECOption
}

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

provide(THEME_KEY, 'dark')

const {
  chartDataState,
  testResultQuestionsData,
  chartColors,
} = defineProps<{
  chartDataState: ChartDataState
  testResultQuestionsData: Record<number | string, TestResultQuestionData>
  chartColors: {
    qStatus: Record<QuestionStatus, string>
    resultStatus: Record<QuestionResult['status'], string>
  }
}>()

// base template for charts
const chartTemplates: ChartTemplates = {
  pie: {
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
      top: 75,
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
        ...(chartTemplates.pie.series as PieSeriesOption[])[0]!.label,
        formatter: (params: TopLevelFormatterParams) => {
          const p = params as CallbackDataParams
          return `${utilSecondsToTime(p.value as number, 'mmm:ss')} (${p.percent}%)`
        },
      },
    }],
  },

  testResultSummary: {
    ...chartTemplates.pie,
    title: {
      ...chartTemplates.pie.title,
      text: 'Test Result Summary',
    },
    tooltip: {
      ...chartTemplates.pie.tooltip,
      formatter: (params: TopLevelFormatterParams) => {
        const p = params as CallbackDataParams
        const data = p.data as TestResultSeriesDataItem

        let color = ''
        if (data.marks > 0) {
          color = chartColors.resultStatus.correct
        }
        else if (data.marks < 0) {
          color = chartColors.resultStatus.incorrect
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
            color = chartColors.resultStatus.correct
          }
          else if (sectionData.marks < 0) {
            color = chartColors.resultStatus.incorrect
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
      ...(chartTemplates.pie.series as PieSeriesOption[])[0],
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
        if (!p) return ''
        const queIdString = (p.value as [unknown, string])[1]

        if (chartTooltipCache.testJourney.has(queIdString)) {
          return chartTooltipCache.testJourney.get(queIdString)
        }

        const questionData = testResultQuestionsData[queIdString]
        if (!questionData) return ''

        const {
          oriQueId, secQueId, subject, section,
          status, answer, marks, result, timeSpent, type,
        } = questionData

        const { correctAnswer, status: resultStatus, marks: resultMarks } = result

        // don't show subject if section string starts with subject
        const subjectContentText = section.startsWith(subject + '')
          ? null
          : `<p>Subject: ${subject}</p>`

        const stringifyAnswerSeparators = { msm: { rows: '<br>' } }

        // user answer won't be shown if it is null
        let yourAnswerContentText = ''
        if (answer !== null) {
          yourAnswerContentText = '<p>Your Answer: '

          if (Array.isArray(answer)) {
            const sortedAnswer = answer.toSorted((a, b) => a - b)
            if (resultStatus === 'incorrect') {
              sortedAnswer.forEach((ans) => {
                let color = chartColors.resultStatus.incorrect

                if ((correctAnswer as number[]).includes(ans)) {
                  color = chartColors.resultStatus.partial
                }
                yourAnswerContentText += `
                    <span style="color: ${color};">${utilStringifyAnswer(ans, type, false, stringifyAnswerSeparators)}&nbsp</span>
                  `
              })
              yourAnswerContentText += '</p>'
            }
            else {
              yourAnswerContentText += `
                  <span style="color: ${chartColors.resultStatus[resultStatus]};">
                    ${utilStringifyAnswer(sortedAnswer, type, false, stringifyAnswerSeparators)}
                  </span></p>
                `
            }
          }
          else {
            yourAnswerContentText += `
                <span style="color: ${chartColors.resultStatus[resultStatus]};">
                  ${utilStringifyAnswer(answer, type, true, stringifyAnswerSeparators)}
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
              <span style="color: ${chartColors.qStatus[status]};">${utilKeyToLabel(status)}</span>
            </p>
            ${yourAnswerContentText || ''}
            <p>Correct Answer:
              <span style="color: ${chartColors.resultStatus.correct};">
                ${utilStringifyAnswer(correctAnswer, type, true, stringifyAnswerSeparators)}
              </span>
            </p>
            <p>Result:
              <span style="color: ${chartColors.resultStatus[resultStatus]};">
                ${resultStatus === 'partial' ? 'Partially Correct' : utilKeyToLabel(resultStatus)}
              </span>
            </p>
            <p>Marks:
              <span style="color: ${chartColors.resultStatus[resultStatus]};">${resultMarks}</span>
              <span style="color: ${chartColors.resultStatus.partial};"> / ${marks.cm}</span>
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
      nameGap: 25,
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
        formatter: (val: number) => Math.round(val * 1000) / 1000,
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

const testResultSummaryChartOption = computed(() => {
  return {
    ...chartOptions.testResultSummary,
    series: [{
      ...chartOptions.testResultSummary.series[0],
      data: chartDataState.testResultSummary,
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

const pointerTypeIsTouch = shallowRef(false)

const testJourneyChartOption = computed<ECOption>(() => {
  chartTooltipCache.testJourney.clear() // clear tooltip cache

  const dataZoom = [
    { type: 'slider', xAxisIndex: [0], filterMode: 'filter' },
    { type: 'slider', yAxisIndex: [0], filterMode: 'empty' },
    { type: 'inside', xAxisIndex: [0], filterMode: 'filter' },
    { type: 'inside', yAxisIndex: [0], filterMode: 'empty' },
  ]

  if (pointerTypeIsTouch.value) {
    dataZoom.pop()
    dataZoom.pop()
  }

  return {
    ...chartOptions.testJourney,
    legend: {
      ...chartOptions.testJourney.legend,
      data: chartDataState.testJourney.legendData,
    },
    dataZoom: dataZoom,
    yAxis: {
      ...chartOptions.testJourney.yAxis,
      data: chartDataState.testJourney.yAxisData,
    },
    series: chartDataState.testJourney.series,
  } as ECOption
})

const detectTouchDevice = () => {
  pointerTypeIsTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

onMounted(() => detectTouchDevice())
</script>
