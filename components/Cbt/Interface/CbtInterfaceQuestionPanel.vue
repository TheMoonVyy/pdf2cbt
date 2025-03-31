<template>
  <div class="flex flex-col grow h-full overflow-auto pl-3 pt-1.5">
    <img
      v-for="(url, index) in currentQuestionImgUrls"
      :key="index"
      :src="url"
      draggable="false"
    >
    <CbtInterfaceAnswerOptionsDiv
      v-model="currentQuestionOptionsAnswer"
      :question-type="currentQuestionDetails.questionType"
      :total-options="currentQuestionDetails.totalOptions"
      class="ml-4 mt-1"
      :class="{
        hidden: currentQuestionDetails.questionType === 'nat',
      }"
      @update:model-value="logCurrentAnswer()"
    />
    <CbtInterfaceAnswerNumericDiv
      v-model="currentQuestionNatAnswer"
      :current-que-id="currentQuestionDetails.currentQueId"
      :question-type="currentQuestionDetails.questionType"
      :last-logged-answer="lastLoggedAnswer"
      :class="{
        hidden: currentQuestionDetails.questionType !== 'nat',
      }"
      @log-current-answer="logCurrentAnswer()"
    />
  </div>
</template>

<script lang="ts" setup>
const { testQuestionsData, currentTestState, testSectionsImgUrls, lastLoggedAnswer } = useCbtTestData()

const currentQuestionImgUrls = computed(() => {
  const section = currentTestState.value.section
  const question = currentTestState.value.question

  const questionImgs = testSectionsImgUrls.value?.[section]?.[question]
  if (questionImgs) {
    return questionImgs
  }
  else {
    return []
  }
})

const currentQuestionDetails = computed(() => {
  const currentQueId = currentTestState.value.queId

  const currentQuestion = testQuestionsData.value.get(currentQueId)!
  const questionType = currentQuestion.type
  const totalOptions = currentQuestion.totalOptions ?? 4

  return {
    questionType,
    totalOptions,
    currentQueId,
  }
})

const currentQuestionNatAnswer = computed({
  get: (): string => {
    if (currentQuestionDetails.value.questionType === 'nat') {
      return (currentTestState.value.currentAnswerBuffer ?? '') as string
    }
    return ''
  },
  set: (newValue) => {
    currentTestState.value.currentAnswerBuffer = newValue === '' ? null : newValue
  },
})

const currentQuestionOptionsAnswer = computed({
  get: () => {
    const questionType = currentQuestionDetails.value.questionType

    if (questionType === 'mcq') {
      return currentTestState.value.currentAnswerBuffer ?? ''
    }
    else if (questionType === 'msq') {
      return currentTestState.value.currentAnswerBuffer ?? []
    }

    return ''
  },
  set: (value) => {
    const questionType = currentQuestionDetails.value.questionType

    if (questionType === 'msq') {
      if (Array.isArray(value) && value.length > 0) {
        currentTestState.value.currentAnswerBuffer = value
      }
      else {
        currentTestState.value.currentAnswerBuffer = null
      }
    }
    else {
      currentTestState.value.currentAnswerBuffer = value === '' ? null : value
    }
  },
})

const testLogger = useCbtLogger()

const logCurrentAnswer = () => {
  const currentAnswer = currentTestState.value.currentAnswerBuffer
  testLogger.currentAnswer(currentAnswer)
}
</script>
