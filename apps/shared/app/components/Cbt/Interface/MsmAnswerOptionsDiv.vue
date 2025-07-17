<template>
  <div
    v-if="questionType === 'msm'"
    class="grid max-w-max"
    :style="[
      optionsStyle,
      {
        gridTemplateColumns: `repeat(${colsCount + 1}, minmax(0, 1fr))`,
        gridTemplateRows: `1fr repeat(${Object.keys(questionAnswer).length}, 1fr)`,
      }]"
  >
    <!-- Top-left empty placeholder -->
    <div />

    <!-- column labels -->
    <label
      v-for="colNum in colsCount"
      :key="colNum"
      class="msm-col-label-content inline-block text-center"
    />

    <!-- Now the main grid (row by row) -->
    <template
      v-for="(_, rowNum) in questionAnswer"
      :key="rowNum"
    >
      <!-- Row label -->
      <label
        class="msm-row-label-content inline-block text-center"
      />

      <!-- Row cells -->
      <div
        v-for="colNum in colsCount"
        :key="colNum"
        class="w-full h-full flex items-center justify-center"
      >
        <input
          v-model="questionAnswer[rowNum]!"
          class="cursor-pointer block mx-auto"
          type="checkbox"
          name="msm-options"
          :value="colNum"
          :style="{ zoom: 'var(--zoom-size)' }"
          @change="emit('answerChanged', questionAnswer); emit('logCurrentAnswer')"
        >
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  totalOptions: string
  questionType: QuestionType
  answerOptionsCounterType?: TestInterfaceQuestionData['answerOptionsCounterType']
}>()

const emit = defineEmits<{
  logCurrentAnswer: []
  answerChanged: [answer: QuestionMsmAnswerType]
}>()

const questionAnswer = defineModel<QuestionMsmAnswerType>({ required: true })

const colsCount = computed(() => parseInt(props.totalOptions.split('x').pop() || '4'))

const { uiSettings } = useCbtSettings()

const optionsStyle = computed(() => {
  const msmFormats = uiSettings.value.questionPanel.answerOptionsFormat.msm
  const { row, col, zoomSize } = msmFormats
  const rowCounterType = props.answerOptionsCounterType?.primary?.replace('default', '').trim()
  const colCounterType = props.answerOptionsCounterType?.secondary?.replace('default', '').trim()

  return {
    '--msm-row-counter-type': rowCounterType || row.counterType,
    '--msm-row-prefix': `"${row.prefix}"`,
    '--msm-row-suffix': `"${row.suffix}"`,
    '--msm-row-font-size': `${row.fontSize}rem`,
    '--msm-col-counter-type': colCounterType || col.counterType,
    '--msm-col-prefix': `"${col.prefix}"`,
    '--msm-col-suffix': `"${col.suffix}"`,
    '--msm-col-font-size': `${col.fontSize}rem`,
    '--zoom-size': zoomSize,
    'counter-reset': 'msm-row-labels msm-col-labels',
    'rowGap': `${row.gap}rem`,
    'columnGap': `${col.gap}rem`,
  }
})
</script>
