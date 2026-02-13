<script lang="ts" setup>
import { answerOptionsFormatKey } from './keys'

const {
  question,
} = defineProps<{
  question: GenerateAnswerKeyInternalQuestionData
}>()
const questionAnswer = defineModel<QuestionMsmAnswerType>({ required: true })

const answerOptionsFormat = inject(answerOptionsFormatKey)!

const optionsStyle = computed(() => {
  const row = answerOptionsFormat.msm.row
  const col = answerOptionsFormat.msm.col
  const rowCounterType = question.answerOptionsCounterType?.primary?.replace('default', '').trim()
  const colCounterType = question.answerOptionsCounterType?.secondary?.replace('default', '').trim()

  return {
    '--msm-row-counter-type': rowCounterType || row.counterType,
    '--msm-row-prefix': `"${row.prefix}"`,
    '--msm-row-suffix': `"${row.suffix}"`,

    '--msm-col-counter-type': colCounterType || col.counterType,
    '--msm-col-prefix': `"${col.prefix}"`,
    '--msm-col-suffix': `"${col.suffix}"`,

    'counter-reset': 'msm-row-labels msm-col-labels',
  }
})
</script>

<template>
  <div
    class="grid max-w-max px-4"
    style="row-gap: 1.4rem; column-gap: 1.4rem; --msm-row-font-size: 1.25rem; --msm-col-font-size: 1.25rem;"
    :style="[
      optionsStyle,
      {
        gridTemplateColumns: `repeat(${question.answerOptionsCount.cols + 1}, minmax(0, 1fr))`,
        gridTemplateRows: `1fr repeat(${question.answerOptionsCount.rows}, 1fr)`,
      }]"
  >
    <!-- Top-left empty placeholder -->
    <div />

    <!-- column labels -->
    <label
      v-for="colNum in question.answerOptionsCount.cols"
      :key="colNum"
      class="msm-col-label-content inline-block text-center font-bold"
    />

    <!-- Now the main grid (row by row) -->
    <template
      v-for="(_, rowNum) in questionAnswer"
      :key="rowNum"
    >
      <!-- Row label -->
      <label
        class="msm-row-label-content inline-block text-center font-bold"
      />

      <!-- Row cells -->
      <div
        v-for="colNum in question.answerOptionsCount.cols"
        :key="colNum"
        class="w-full h-full flex items-center justify-center"
      >
        <input
          v-model="questionAnswer[rowNum]!"
          class="cursor-pointer block mx-auto accent-green-400"
          style="zoom: 1.6;"
          type="checkbox"
          name="msm-options"
          :value="colNum"
        >
      </div>
    </template>
  </div>
</template>
