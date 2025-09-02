<script lang="ts" setup>
import { ref } from 'vue'
import BaseButton from '@/components/Base/Button.vue'

interface QuestionData {
  questionID: number
  questionNo: number
  questionImgBlobUrl: string
  section: string
  sectionQueId: number
}

function getQuestionsImageData(): QuestionData[] {
  const result: QuestionData[] = []
  const { testQuestionsData, testQuestionsUrls } = useCbtTestData()

  testQuestionsData.value.forEach((questionData) => {
    const { queId, que, secQueId, section } = questionData
    const questionImgUrls = testQuestionsUrls.value
    result.push({
      questionID: queId,
      questionNo: que,
      questionImgBlobUrl: questionImgUrls[queId]?.values().next().value ?? '',
      section: section,
      sectionQueId: secQueId
    })
  })

  return result
}

const emit = defineEmits(['close'])
const questionsData = ref<QuestionData[]>(getQuestionsImageData())

function close() {
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <!-- Header -->
      <div class="modal-header">
        <h2 class="title">Question Paper</h2>
        <BaseButton
          label="Close"
          variant="destructive"
          icon-name="prime:times-circle"
          size="sm"
          @click="close"
        />
      </div>

      <!-- Content -->
      <div class="modal-body">
        <h2 class="text-red-500 mb-4">
          Note that the timer is ticking while you read the Question Paper. Close
          this page to return to answering the questions.
        </h2>

        <div
          v-for="questionData in questionsData"
          :key="questionData.questionID"
          class="mb-4"
        >
          <div v-if="questionData.sectionQueId === 1" class="font-semibold text-blue-600">
            {{ questionData.section }}
          </div>
          <div class="mb-1">Question No. {{ questionData.questionNo }}</div>
          <img
            :src="questionData.questionImgBlobUrl"
            alt="Question Image"
            class="w-full max-w-full rounded border"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  min-width: 300px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  position: sticky;
  top: 0;
  z-index: 10;

  background: white;
  padding: 0.5rem 1.25rem;
  border-bottom: 1px solid #ddd;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
}

.modal-body {
  overflow-y: auto;
  padding: 1.25rem;
  flex-grow: 1;
}
</style>