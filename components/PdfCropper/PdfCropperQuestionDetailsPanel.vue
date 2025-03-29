<template>
  <Panel
    :header="`Question Details ( #${currentQuestionData.questionNum} )`"
    toggleable
    class="w-full"
    pt:content:class="px-4"
  >
    <div class="flex w-full mt-2 bg-surface-950 border border-surface-700 rounded-md">
      <BaseFloatLabel
        label="Subject Name"
        label-id="subject_name"
      >
        <InputText
          id="subject_name"
          v-model.trim="currentQuestionData.subjectName"
          :maxlength="20"
          :disabled="!isPdfLoaded"
        />
      </BaseFloatLabel>
      <span class="flex items-center justify-center grow border-l border-surface-700 bg-surface-900 text-surface-300">
        {{ currentQuestionData.subjectName?.length }}/20
      </span>
    </div>
    <div class="flex w-full mt-4 bg-surface-950 border border-surface-700 rounded-md">
      <BaseFloatLabel
        label="Section Name"
        label-id="section_name"
      >
        <InputText
          id="section_name"
          v-model.trim="currentQuestionData.sectionName"
          :maxlength="30"
          :disabled="!isPdfLoaded"
        />
      </BaseFloatLabel>
      <span class="flex items-center justify-center grow border-l border-surface-700 bg-surface-900 text-surface-300">
        {{ currentQuestionData.sectionName?.length }}/30
      </span>
    </div>
    <div class="flex flex-wrap gap-2 mt-4">
      <BaseFloatLabel
        class="min-w-24 flex-1"
        label="Question Type"
        label-id="question_type"
        label-class="text-xs"
      >
        <Select
          v-model="currentQuestionData.questionType"
          :disabled="!props.isPdfLoaded"
          label-id="question_type"
          :options="optionItems.questionType"
          option-label="name"
          option-value="value"
          :fluid="true"
          size="small"
        >
          <template #option="slotProps">
            <div
              v-tooltip="{ value: slotProps.option.tooltip, showDelay: 400, hideDelay: 200 }"
              class="flex items-center select-none"
            >
              <div>{{ slotProps.option.name }}</div>
            </div>
          </template>
        </Select>
      </BaseFloatLabel>
      <BaseFloatLabel
        class="min-w-24 flex-1"
        label="Answer Options"
        label-id="answer_options"
        label-class="text-xs"
      >
        <InputNumber
          v-model="currentQuestionData.totalOptions"
          :disabled="!props.isPdfLoaded"
          :min="1"
          :max="9"
          :fluid="true"
          label-id="answer_options"
          size="small"
          show-buttons
          :step="1"
        />
      </BaseFloatLabel>
    </div>
    <BaseFloatLabel
      class="w-full mt-4"
      label="Question Number"
      label-id="question_num"
      label-class="start-1/2! -translate-x-1/2"
    >
      <BaseInputNumber
        v-model="currentQuestionData.questionNum"
        :disabled="!props.isPdfLoaded"
        :min="1"
        :max="99"
        label-id="question_num"
        :step="1"
      />
    </BaseFloatLabel>
    <Panel
      header="Marking Scheme"
      toggleable
      pt:root:class="w-full mt-3"
    >
      <div class="flex flex-col gap-4 mt-2">
        <BaseFloatLabel
          class="w-full"
          label="Correct"
          label-id="marks_correct"
          label-class="start-1/2! -translate-x-1/2 text-xs"
        >
          <BaseInputNumber
            v-model="currentQuestionData.correctMarks"
            :disabled="!props.isPdfLoaded"
            :min="1"
            :max="99"
            prefix="+"
            size="small"
            label-id="marks_correct"
          />
        </BaseFloatLabel>
        <BaseFloatLabel
          v-if="currentQuestionData.questionType === 'msq'"
          class="w-full"
          label="Partial"
          label-id="marks_partial"
          label-class="start-1/2! -translate-x-1/2 text-xs"
        >
          <BaseInputNumber
            v-model="currentQuestionData.partialMarks"
            :disabled="!props.isPdfLoaded"
            :min="0"
            :max="99"
            prefix="+"
            size="small"
            label-id="marks_partial"
          />
        </BaseFloatLabel>
        <BaseFloatLabel
          class="w-full"
          label="Incorrect"
          label-id="marks_incorrect"
          label-class="start-1/2! -translate-x-1/2 text-xs"
        >
          <BaseInputNumber
            v-model="currentQuestionData.incorrectMarks"
            :disabled="!props.isPdfLoaded"
            :min="-99"
            :max="0"
            size="small"
            label-id="marks_incorrect"
          />
        </BaseFloatLabel>
      </div>
    </Panel>
  </Panel>
</template>

<script setup lang="ts">
import type { CurrentQuestionData } from '~/src/types'

const currentQuestionData = defineModel<CurrentQuestionData>({ required: true })
const props = defineProps({
  isPdfLoaded: {
    type: Boolean,
    required: true,
  },
})

const optionItems = reactive({
  questionType: [
    { name: 'MCQ', value: 'mcq', tooltip: 'Multiple Choice Question' },
    { name: 'MSQ', value: 'msq', tooltip: 'Multiple Select Question' },
    { name: 'NAT', value: 'nat', tooltip: 'Numerial Answer Type' },
  ],
})
</script>
