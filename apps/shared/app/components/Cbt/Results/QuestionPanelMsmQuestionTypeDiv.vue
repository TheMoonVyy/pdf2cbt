<template>
  <div
    v-if="questionData.type === 'msm'"
    class="grid gap-5"
    :style="[
      optionsStyle,
      {
        gridTemplateColumns: `repeat(${totalRowsAndCols.cols + 1}, minmax(0, 1fr))`,
        gridTemplateRows: `1fr repeat(${totalRowsAndCols.rows}, 1fr)`,
      }]"
  >
    <!-- Top-left empty placeholder -->
    <div />

    <!-- column labels -->
    <label
      v-for="colNum in totalRowsAndCols.cols"
      :key="colNum"
      class="msm-col-label-content inline-block text-center"
    />

    <!-- Now the main grid (row by row) -->
    <template
      v-for="[rowNum, cols] in datas"
      :key="rowNum"
    >
      <!-- Row label -->
      <label
        class="msm-row-label-content inline-block text-center"
      />

      <!-- Row cells -->
      <div
        v-for="(colStatus, colNum) in cols"
        :key="colNum"
        class="w-full h-full flex items-center justify-center"
      >
        <Icon

          :name="checkboxIconNameAndColor[colStatus].name"
          :class="checkboxIconNameAndColor[colStatus].class"
          size="1.5rem"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  questionData: TestResultQuestionData
}>()

const checkboxIconNameAndColor = {
  correct: {
    name: 'material-symbols:check-box-rounded',
    class: 'text-green-400',
  },
  partial: {
    name: 'material-symbols:check-box-rounded',
    class: 'text-orange-400',
  },
  incorrect: {
    name: 'my-icon:checkboxcross',
    class: 'text-red-400',
  },
  notAnswered: {
    name: 'material-symbols:check-box-outline-blank',
    class: '',
  },
  dropped: {
    name: 'material-symbols:indeterminate-check-box',
    class: 'text-purple-400',
  },
  bonus: {
    name: 'material-symbols:indeterminate-check-box',
    class: 'text-cyan-400',
  },
} as const

const totalRowsAndCols = computed(
  () => utilGetMaxRowsAndColsFromMsmOptions(props.questionData.answerOptions || '4'),
)

const datas = computed(() => {
  const dataToReturn = new Map<number, QuestionResult['status'][]>()

  if (props.questionData.type !== 'msm')
    return dataToReturn

  const { answer, result } = props.questionData

  const resultStatus = result.status
  const userAnswerObj = (answer ?? {}) as QuestionMsmAnswerType
  const correctAnswerObj = typeof result.correctAnswer === 'object'
    ? (result.correctAnswer || {}) as QuestionMsmAnswerType
    : {}

  const userAnswers = new Set<string>()
  const correctAnswers = new Set<string>()
  for (const [rowNumStr, cols] of Object.entries(userAnswerObj)) {
    for (const colNum of cols) {
      userAnswers.add(`${rowNumStr}-${colNum}`)
    }
  }

  for (const [rowNumStr, cols] of Object.entries(correctAnswerObj)) {
    for (const colNum of cols) {
      correctAnswers.add(`${rowNumStr}-${colNum}`)
    }
  }

  const { rows, cols } = totalRowsAndCols.value

  for (let row = 1; row <= rows; row++) {
    const rowData: QuestionResult['status'][] = []

    for (let col = 1; col <= cols; col++) {
      if (resultStatus === 'dropped' || resultStatus === 'bonus') {
        rowData.push(resultStatus)
        continue
      }

      const id = `${row}-${col}`
      if (resultStatus === 'correct' || resultStatus === 'notAnswered') {
        rowData.push(correctAnswers.has(id) ? 'correct' : 'notAnswered')
      }
      else {
        const isIdInUserAnswers = userAnswers.has(id)
        const isIdInCorrectAnswers = correctAnswers.has(id)

        if (isIdInUserAnswers && isIdInCorrectAnswers) {
          rowData.push('partial')
        }
        else if (isIdInUserAnswers) {
          rowData.push('incorrect')
        }
        else {
          rowData.push(isIdInCorrectAnswers ? 'correct' : 'notAnswered')
        }
      }
    }

    dataToReturn.set(row, rowData)
  }

  return dataToReturn
})

const { uiSettings } = useCbtSettings()

const optionsStyle = computed(() => {
  const msmFormats = uiSettings.value.questionPanel.answerOptionsFormat.msm
  const { row, col } = msmFormats

  return {
    '--msm-row-counter-type': row.counterType,
    '--msm-row-prefix': `"${row.prefix}"`,
    '--msm-row-suffix': `"${row.suffix}"`,
    '--msm-row-font-size': `${row.fontSize * 0.9}rem`,
    '--msm-col-counter-type': col.counterType,
    '--msm-col-prefix': `"${col.prefix}"`,
    '--msm-col-suffix': `"${col.suffix}"`,
    '--msm-col-font-size': `${col.fontSize * 0.9}rem`,
    'counter-reset': 'msm-row-labels msm-col-labels',
  }
})
</script>
