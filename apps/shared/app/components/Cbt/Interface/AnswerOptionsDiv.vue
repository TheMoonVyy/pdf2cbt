<template>
  <div
    v-if="props.questionType === 'mcq' || props.questionType === 'msq'"
    class="flex flex-col"
    :style="optionsStyle"
  >
    <template v-if="props.questionType === 'msq'">
      <div
        v-for="n in parseInt(props.totalOptions)"
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
        v-for="n in parseInt(props.totalOptions)"
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
const { uiSettings } = useCbtSettings()

const props = defineProps<{
  totalOptions: string
  questionType: QuestionType
  answerOptionsCounterType?: TestInterfaceQuestionData['answerOptionsCounterType']
}>()

const optionsStyle = computed(() => {
  const answerOptionsFormat = uiSettings.value.questionPanel.answerOptionsFormat.mcqAndMsq
  const counterType = props.answerOptionsCounterType?.primary?.replace('default', '').trim()

  return {
    '--counter-type': counterType || answerOptionsFormat.counterType,
    '--options-prefix': `"${answerOptionsFormat.prefix}"`,
    '--options-suffix': `"${answerOptionsFormat.suffix}"`,
    '--options-font-size': `${answerOptionsFormat.fontSize}rem`,
    '--options-zoom-size': `${answerOptionsFormat.zoomSize}`,
    'row-gap': `${answerOptionsFormat.rowGap}rem`,
    'counter-reset': 'answer-options',
  }
})

const questionAnswer = defineModel<QuestionAnswer>({ required: true })
</script>
