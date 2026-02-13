<script lang="ts" setup>
import { answerOptionsFormatKey } from './keys'

const {
  question,
} = defineProps<{
  question: GenerateAnswerKeyInternalQuestionData
}>()

const questionAnswer = defineModel<Set<number>>({ required: true })
const answerOptionsFormat = inject(answerOptionsFormatKey)!

const optionsStyle = computed(() => {
  const counterType = question.answerOptionsCounterType?.primary?.replace('default', '').trim()

  return {
    '--counter-type': counterType || answerOptionsFormat.mcqAndMsq.counterType,
    '--options-prefix': `"${answerOptionsFormat.mcqAndMsq.prefix}"`,
    '--options-suffix': `"${answerOptionsFormat.mcqAndMsq.suffix}"`,
    'counter-reset': 'answer-options',
  }
})

function onClick(optionNum: number) {
  if (questionAnswer.value.has(optionNum)) {
    questionAnswer.value.delete(optionNum)
  }
  else {
    questionAnswer.value.add(optionNum)
  }
}
</script>

<template>
  <div
    class="grid grid-cols-2 gap-8 mx-auto px-4
        text-base sm:text-sm lg:text-lg text-center **:cursor-pointer"
    :style="optionsStyle"
  >
    <div
      v-for="n in question.answerOptionsCount.rows"
      :key="n"
      class="relative border-2 border-gray-300 rounded-lg p-1 min-w-35
          data-[selected=true]:border-green-400
          data-[selected=true]:text-green-400"
      :data-selected="questionAnswer.has(n)"
      @click="onClick(n)"
    >
      <label class="option-content inline-block" />
    </div>
  </div>
</template>
