<template>
  <div class="flex flex-col items-center gap-2 font-[Roboto] mr-auto ml-4">
    <input
      id="numeric-answer-input"
      class="border border-slate-400 outline-hidden caret-transparent select-none selection:bg-transparent"
      type="text"
      autocomplete="off"
      :value="questionAnswer"
      readonly
      @blur="onBlurHandler()"
    >
    <div
      ref="keypadContainerElem"
      class="flex flex-col items-center gap-1 px-6 py-2 bg-gray-200/60 select-none font-bold"
    >
      <label
        for="numeric-answer-input"
        class="text-center bg-gray-300/70 border border-slate-400 rounded-md
          px-2 py-1 w-fit cursor-pointer"
        @pointerdown.prevent
        @click="specialKeyHandler('BACKSPACE')"
      >
        Backspace
      </label>
      <div
        v-for="(row, i) in numericKeys"
        :key="i"
        class="flex gap-1"
      >
        <label
          v-for="(key, j) in row"
          :key="j"
          for="numeric-answer-input"
          class="text-center content-center h-9 w-7 font-bold
            bg-gray-100 border border-slate-500 rounded-md cursor-pointer"
          @pointerdown.prevent
          @click="keypadKeyHandler(key)"
        >
          {{ key }}
        </label>
      </div>
      <div class="flex gap-1">
        <label
          for="numeric-answer-input"
          class="px-2 py-1
            bg-gray-300/70 border border-slate-400 rounded-md cursor-pointer"
          @pointerdown.prevent
          @click="specialKeyHandler('LEFT')"
        >
          ←
        </label>
        <label
          for="numeric-answer-input"
          class="px-2 py-1
            bg-gray-300/70 border border-slate-400 rounded-md cursor-pointer"
          @pointerdown.prevent
          @click="specialKeyHandler('RIGHT')"
        >
          →
        </label>
      </div>
      <label
        for="numeric-answer-input"
        class="text-center bg-gray-300/70 border border-slate-400 rounded-md
           px-2 py-1 w-fit cursor-pointer"
        @pointerdown.prevent
        @click="specialKeyHandler('CLEAR_ALL')"
      >
        Clear All
      </label>
    </div>
  </div>
</template>

<script lang="ts" setup>
const numericKeys = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', '.', '-'],
]

const questionAnswer = defineModel<string>({ required: true })

const props = defineProps<{
  currentQueId: number
  questionType: QuestionType
  lastLoggedAnswer: QuestionAnswer
}>()

const emit = defineEmits<{
  logCurrentAnswer: []
}>()

const currentAnswerStringIndex = shallowRef(0)

watch(
  [() => props.currentQueId, questionAnswer, currentAnswerStringIndex],
  (
    [newQueId, newAnswer, newIndex],
    [oldQueId, oldAnswer, oldIndex],
  ) => {
    if (newQueId !== oldQueId) {
      if (props.questionType === 'nat') {
        currentAnswerStringIndex.value = questionAnswer.value.length
      }
    }
    else if ((oldIndex === newIndex) && (newAnswer !== oldAnswer)) {
      currentAnswerStringIndex.value = questionAnswer.value.length
    }
  },
)

const keypadKeyHandler = (key: string) => {
  const value = questionAnswer.value
  const index = currentAnswerStringIndex.value
  if (key === '-') {
    if (index === 0) {
      questionAnswer.value = value.slice(0, index) + key + value.slice(index)
      currentAnswerStringIndex.value = index + 1
    }
  }
  else {
    questionAnswer.value = value.slice(0, index) + key + value.slice(index)
    currentAnswerStringIndex.value = index + 1
  }
}

const specialKeyHandler = (
  key: 'BACKSPACE' | 'LEFT' | 'RIGHT' | 'CLEAR_ALL',
) => {
  const value = questionAnswer.value
  const index = currentAnswerStringIndex.value

  switch (key) {
    case 'BACKSPACE': {
      if (index > 0) {
        questionAnswer.value = value.slice(0, index - 1) + value.slice(index)
        currentAnswerStringIndex.value = index - 1
      }
      break
    }
    case 'LEFT': {
      if (index > 0) {
        currentAnswerStringIndex.value = index - 1
      }
      break
    }
    case 'RIGHT': {
      if (index < value.length) {
        currentAnswerStringIndex.value = index + 1
      }
      break
    }
    case 'CLEAR_ALL': {
      questionAnswer.value = ''
      currentAnswerStringIndex.value = 0
      break
    }
  }
}

const onBlurHandler = () => {
  const currentQuestionAnswer = questionAnswer.value

  if (currentQuestionAnswer !== props.lastLoggedAnswer) {
    emit('logCurrentAnswer')
  }
}
</script>
