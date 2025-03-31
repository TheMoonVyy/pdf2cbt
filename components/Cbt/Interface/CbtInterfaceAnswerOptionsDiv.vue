<template>
  <div
    v-if="props.questionType !== 'nat'"
    class="flex flex-col"
    :style="optionsStyle"
  >
    <template v-if="props.questionType === 'msq'">
      <div
        v-for="n in props.totalOptions"
        :key="n"
        class="flex"
      >
        <input
          :id="'msq-answer-option-' + n"
          v-model="questionAnswer"
          class="cursor-pointer"
          type="checkbox"
          name="msq-options"
          :value="n"
          :style="{ zoom: 'var(--options-zoom-size)' }"
        >
        <label
          class="option-content text-2xl inline-block cursor-pointer pl-4"
          :for="'msq-answer-option-' + n"
          :style="{
            fontSize: 'var(--options-font-size)',
          }"
        />
      </div>
    </template>
    <template v-else>
      <div
        v-for="n in props.totalOptions"
        :key="n"
        class="flex"
      >
        <input
          :id="'mcq-answer-option-' + n"
          v-model.number="questionAnswer"
          class="cursor-pointer"
          type="radio"
          name="mcq-options"
          :value="n"
          :style="{ zoom: 'var(--options-zoom-size)' }"
        >
        <label
          class="option-content text-2xl inline-block cursor-pointer pl-4"
          :for="'mcq-answer-option-' + n"
          :style="{
            fontSize: 'var(--options-font-size)',
          }"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { QuestionType } from '~/src/types'

type QuestionAnswer = number | number[] | string | null

const { uiSettings } = useCbtSettings()

const optionsStyle = computed(() => {
  const answerOptionsFormat = uiSettings.value.questionPanel.answerOptionsFormat

  return {
    '--counter-type': answerOptionsFormat.counterType,
    '--options-prefix': `"${answerOptionsFormat.prefix}"`,
    '--options-suffix': `"${answerOptionsFormat.suffix}"`,
    '--options-font-size': `${answerOptionsFormat.fontSize}rem`,
    '--options-zoom-size': `${answerOptionsFormat.zoomSize}`,
    'row-gap': `${answerOptionsFormat.rowGap}rem`,
    'counter-reset': 'answer-options',
  }
})

const props = defineProps<{
  totalOptions: number
  questionType: QuestionType
}>()

const questionAnswer = defineModel<QuestionAnswer>({ required: true })
</script>

<style>
.option-content::after {
  counter-increment: answer-options;
  content: var(--options-prefix) counter(answer-options, var(--counter-type)) var(--options-suffix);
}
</style>
