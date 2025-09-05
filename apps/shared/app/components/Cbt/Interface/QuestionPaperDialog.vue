<script lang="ts" setup>
type QuestionData = Pick<TestSessionQuestionData, 'queId' | 'section' | 'secQueId'> & {
  imgUrls: string[]
  queNumToShow: number
}

const showDialog = defineModel<boolean>({ required: true })
const imgWidthSize = defineModel<number>('imgWidthSize', { required: true })

const props = defineProps<{
  questionsNumberingOrderType: CurrentTestState['questionsNumberingOrderType']
}>()

function getQuestionsImageData(): QuestionData[] {
  const result: QuestionData[] = []
  const { testQuestionsData, testQuestionsUrls } = useCbtTestData()
  const questionImgUrls = testQuestionsUrls.value

  for (const question of testQuestionsData.value.values()) {
    const { queId, que, secQueId, section } = question
    const imgUrls = questionImgUrls[queId] ?? []

    let queNumToShow: number
    if (props.questionsNumberingOrderType === 'cumulative') {
      queNumToShow = queId
    }
    else if (props.questionsNumberingOrderType === 'section-wise') {
      queNumToShow = secQueId
    }
    else {
      queNumToShow = que
    }
    result.push({ queNumToShow, queId, secQueId, section, imgUrls })
  }

  return result
}

const questionsData = ref<QuestionData[]>(getQuestionsImageData())

useEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    showDialog.value = false
  }
})

const ZOOM_PERCENT_DELTA = 5

function resizeImage(type: 'increase' | 'decrease') {
  switch (type) {
    case 'increase':
      if (imgWidthSize.value < 100)
        imgWidthSize.value += ZOOM_PERCENT_DELTA
      break
    case 'decrease':
      if (imgWidthSize.value > 20)
        imgWidthSize.value -= ZOOM_PERCENT_DELTA
      break
  }
}
</script>

<template>
  <div
    class="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-1000"
    :style="{
      '--img-width-size': imgWidthSize + '%',
    }"
    @click.self="showDialog = false"
  >
    <div class="flex flex-col bg-white rounded-xl w-[90dvw] h-[90dvh]">
      <!-- Header -->
      <div class="sticky top-0 z-10 py-2 px-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-gray-400">
        <div></div> <!-- Empty placeholder for left spacing -->
        <h2 class="text-2xl font-bold text-center">
          Question Paper
        </h2>
        <div class="flex justify-end gap-2">
          <BaseButton
            variant="help"
            size="iconMd"
            title="Increase Image Size"
            icon-name="mdi:file-image-plus"
            icon-class="text-black"
            :disabled="imgWidthSize >= 100"
            @click="resizeImage('increase')"
          />
          <BaseButton
            variant="help"
            size="iconMd"
            title="Decrease Image Size"
            icon-name="mdi:file-image-minus"
            icon-class="text-black"
            :disabled="imgWidthSize <= 20"
            @click="resizeImage('decrease')"
          />
          <BaseButton
            variant="destructive"
            size="iconMd"
            title="Close"
            icon-name="prime:times-circle"
            @click="showDialog = false"
          />
        </div>
      </div>

      <!-- Content -->
      <UiScrollArea
        type="auto"
        class="w-full h-full"
        viewport-class="[&>div]:px-8"
        scroll-bar-class="w-3 mr-0.5"
      >
        <h2 class="text-red-600 mb-4 text-center">
          Note that the timer is ticking while you read the Question Paper.<br>
          Close this page to return to answering the questions.
        </h2>

        <div
          v-for="question in questionsData"
          :key="question.queId"
          class="mb-4 w-(--img-width-size) mx-auto"
        >
          <div
            v-if="question.secQueId === 1"
            class="font-semibold text-blue-700 text-xl text-center"
          >
            {{ question.section }}
          </div>
          <div class="mb-1 text-blue-700 text-lg font-bold">
            Question No. {{ question.queNumToShow }}
          </div>
          <div class="rounded border-2">
            <img
              v-for="(imgUrl, index) in question.imgUrls"
              :key="index"
              :src="imgUrl"
              :alt="'Question Image ' + (index + 1)"
              class="max-w-full"
            >
          </div>
        </div>
      </UiScrollArea>
    </div>
  </div>
</template>
