<template>
  <div
    ref="imageContainerElem"
    class="flex flex-col grow h-full overflow-auto pl-3 pt-1.5 pb-12"
  >
    <template
      v-for="(urls, queId) in currentQuestionImgUrls"
    >
      <img
        v-for="(url, index) in urls"
        :key="index"
        :src="url"
        draggable="false"
        :style="{
          width: currentQuestionImgWidths?.[queId]?.[index] + 'px',
          objectFit: 'contain',
        }"
        @load="(e) => handleImageLoad(e, queId, index)"
      >
    </template>
    <CbtInterfaceAnswerOptionsDiv
      v-show="currentQuestionDetails.questionType === 'mcq' || currentQuestionDetails.questionType === 'msq'"
      v-model="currentQuestionMcqOrMsqAnswer"
      :question-type="currentQuestionDetails.questionType"
      :total-options="currentQuestionDetails.answerOptions"
      :answer-options-counter-type="currentQuestionDetails.answerOptionsCounterType"
      class="ml-5 mt-1"
      @update:model-value="logCurrentAnswer"
    />
    <CbtInterfaceMsmAnswerOptionsDiv
      v-show="currentQuestionDetails.questionType === 'msm'"
      v-model="currentQuestionMsmAnswer"
      :question-type="currentQuestionDetails.questionType"
      :total-options="currentQuestionDetails.answerOptions"
      :answer-options-counter-type="currentQuestionDetails.answerOptionsCounterType"
      class="ml-5 mt-1"
      @log-current-answer="logCurrentAnswer"
      @answer-changed="currentQuestionMsmAnswer = $event"
    />
    <CbtInterfaceAnswerNumericDiv
      v-show="currentQuestionDetails.questionType === 'nat'"
      v-model="currentQuestionNatAnswer"
      :current-que-id="currentQuestionDetails.currentQueId"
      :question-type="currentQuestionDetails.questionType"
      :last-logged-answer="lastLoggedAnswer"
      class="ml-5 mt-2"
      @log-current-answer="logCurrentAnswer"
    />
  </div>
</template>

<script lang="ts" setup>
type QuestionsImgWidths = {
  [questionNum: string | number]: {
    [imageIndex: number | string]: number
  }
}

const props = defineProps<{
  isQuestionPalleteCollapsed: boolean
  cropperSectionsData: CropperSectionsData
}>()

const imageContainerElem = useTemplateRef('imageContainerElem')
const { width: containerWidth } = useElementSize(imageContainerElem)

const { testQuestionsData, currentTestState, testQuestionsUrls, lastLoggedAnswer } = useCbtTestData()

const { uiSettings } = useCbtSettings()

const questionsImgWidths = reactive<QuestionsImgWidths>({})

const questionImgMaxSize = computed(() => {
  if (props.isQuestionPalleteCollapsed) {
    return uiSettings.value.questionPanel.questionImgMaxWidth.maxWidthWhenQuestionPaletteClosed
  }
  else {
    return uiSettings.value.questionPanel.questionImgMaxWidth.maxWidthWhenQuestionPaletteOpened
  }
})

const currentQuestionImgUrls = computed(() => {
  const queId = currentTestState.value.queId

  const questionImgs = testQuestionsUrls.value?.[queId]
  if (questionImgs) {
    return { [queId]: questionImgs }
  }
  else {
    return { [queId]: [] }
  }
})

const currentQuestionImgWidths = computed(() => {
  const queId = currentTestState.value.queId
  const queImgsWidths = questionsImgWidths[queId]
  const queImgsUrls = currentQuestionImgUrls.value[queId]
  const maxPercent = questionImgMaxSize.value

  if (
    !queImgsWidths
    || !queImgsUrls
    || queImgsUrls.length === 0
    || Object.keys(queImgsWidths).length !== queImgsUrls.length
    || containerWidth.value === 0
  ) {
    return {}
  }

  const maxOriginalWidth = Math.max(...Object.values(queImgsWidths))
  const maxAllowedWidth = (containerWidth.value * maxPercent) / 100
  const globalScale = maxAllowedWidth / maxOriginalWidth

  const scaled: QuestionsImgWidths = {
    [queId]: {},
  }

  for (const [index, w] of Object.entries(queImgsWidths)) {
    scaled[queId]![index] = Math.floor(w * globalScale)
  }

  return scaled
})

const currentQuestionDetails = computed(() => {
  const currentQueId = currentTestState.value.queId

  const currentQuestion = testQuestionsData.value.get(currentQueId)!
  const questionType = currentQuestion.type
  const answerOptions = currentQuestion.answerOptions || '4'
  const { answerOptionsCounterType } = props.cropperSectionsData[currentQuestion.section]?.[currentQuestion.que] ?? {}

  return {
    questionType,
    answerOptions,
    currentQueId,
    answerOptionsCounterType,
  }
})

const currentQuestionMsmAnswer = computed({
  get: () => {
    if (currentQuestionDetails.value.questionType === 'msm') {
      const buffAnswer = currentTestState.value.currentAnswerBuffer
      if (buffAnswer)
        return buffAnswer as QuestionMsmAnswerType

      return getNewMsmAnswerObject(currentQuestionDetails.value.answerOptions)
    }
    return {} as QuestionMsmAnswerType
  },
  set: (newVal) => {
    const isNoneSelected = Object.values(newVal).every(arr => arr.length === 0)
    currentTestState.value.currentAnswerBuffer = isNoneSelected ? null : newVal
  },
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

const currentQuestionMcqOrMsqAnswer = computed({
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

const handleImageLoad = (e: Event, queId: string | number, imgindex: number) => {
  const w = questionsImgWidths?.[queId]?.[imgindex]

  if (typeof w === 'number' && w > 0) {
    return
  }

  questionsImgWidths[queId] ??= {}

  const img = e.target as HTMLImageElement | null
  if (img) {
    questionsImgWidths[queId]![imgindex] = img.naturalWidth || 0
  }
}

const testLogger = useCbtLogger()

const logCurrentAnswer = () => {
  const currentAnswer = currentTestState.value.currentAnswerBuffer
  testLogger.currentAnswer(currentAnswer)
}

function getNewMsmAnswerObject(answerOption: string) {
  const rows = parseInt(answerOption || '4')

  const answerObj: QuestionMsmAnswerType = {}
  utilRange(1, rows + 1)
    .forEach(r => answerObj[r] = [])

  return answerObj
}
</script>
