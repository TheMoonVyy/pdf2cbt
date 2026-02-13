<script lang="ts" setup>
const question = defineModel<GenerateAnswerKeyInternalQuestionData>({ required: true })

defineProps<{
  isQuestionAnswerValid: boolean
}>()

const isQuestionBonusOrDropped = computed(
  () => question.value.isBonus || question.value.isDropped,
)

function onClickOnBonusOrDropped(btnType: 'bonus' | 'dropped') {
  if (btnType === 'bonus') {
    question.value.isDropped = false
    question.value.isBonus = !question.value.isBonus
  }
  else {
    question.value.isBonus = false
    question.value.isDropped = !question.value.isDropped
  }
}
</script>

<template>
  <div
    class="flex flex-col gap-5 border pt-3 pb-5 rounded-2xl"
    :class="isQuestionAnswerValid ? 'border-yellow-500' : 'border-red-500'"
  >
    <h4 class="text-xl text-center text-nowrap">
      Question {{ question.qNum }} ({{ question.type.toUpperCase() }})
    </h4>

    <template v-if="!isQuestionBonusOrDropped">
      <CbtGenerateAnswerKeyMcqAndMsqAnswer
        v-if="question.type === 'mcq' || question.type === 'msq'"
        v-model="(question.answer as Set<number>)"
        :question="question"
      />
      <CbtGenerateAnswerKeyMsmAnswer
        v-else-if="question.type === 'msm'"
        v-model="(question.answer as QuestionMsmAnswerType)"
        :question="question"
      />
      <CbtGenerateAnswerKeyNatAnswer
        v-else-if="question.type === 'nat'"
        v-model="(question.answer as GenerateAnswerKeyInternalNatAnswer)"
      />
    </template>
    <div
      class="grid grid-cols-2 gap-8 w-full px-4
        text-base sm:text-sm lg:text-lg text-center **:cursor-pointer"
      :class="isQuestionBonusOrDropped
        ? ''
        : 'border-t-2 border-border mt-2 pt-4'"
    >
      <div
        class="relative border-2 border-gray-300 rounded-lg p-1 min-w-35
          data-[selected=true]:border-green-400
          data-[selected=true]:text-green-400"
        :data-selected="question.isBonus"
        @click="onClickOnBonusOrDropped('bonus')"
      >
        Bonus
      </div>
      <div
        class="relative border-2 border-gray-300 rounded-lg p-1 min-w-35
          data-[selected=true]:border-green-400
          data-[selected=true]:text-green-400"
        :data-selected="question.isDropped"
        @click="onClickOnBonusOrDropped('dropped')"
      >
        Dropped
      </div>
    </div>
  </div>
</template>
