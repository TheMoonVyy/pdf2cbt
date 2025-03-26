<template>
  <Panel
    :header="`Question Details ( #${currentQuestionData.questionNum} )`"
    toggleable
    class="w-full"
    :pt="{ content: 'px-4' }"
  >
    <InputGroup>
      <FloatLabel variant="on">
        <InputText
          id="subject_name"
          v-model.trim="currentQuestionData.subjectName"
          :maxlength="20"
          :disabled="!props.isPdfLoaded"
        />
        <label for="subject_name">Subject Name</label>
      </FloatLabel>
      <InputGroupAddon>{{ currentQuestionData.subjectName?.length }}/20</InputGroupAddon>
    </InputGroup>
    <InputGroup class="mt-4">
      <FloatLabel variant="on">
        <InputText
          id="section_name"
          v-model="currentQuestionData.sectionName"
          :maxlength="30"
          :disabled="!props.isPdfLoaded"
        />
        <label for="section_name">Section Name</label>
      </FloatLabel>
      <InputGroupAddon>{{ currentQuestionData.sectionName?.length }}/30</InputGroupAddon>
    </InputGroup>
    <div class="flex flex-wrap gap-3 mt-4">
      <FloatLabel
        class="min-w-24 flex-1"
        variant="on"
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
        <label for="question_type">Question Type</label>
      </FloatLabel>
      <FloatLabel
        class="min-w-24 flex-1"
        variant="on"
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
        <label for="answer_options">Answer Options</label>
      </FloatLabel>
    </div>
    <FloatLabel
      class="w-full mt-4"
      variant="on"
    >
      <InputNumber
        v-model="currentQuestionData.questionNum"
        :disabled="!props.isPdfLoaded"
        :min="1"
        :max="99"
        :fluid="true"
        label-id="question_num"
        size="small"
        show-buttons
        :step="1"
      />
      <label for="question_num">Question Num</label>
    </FloatLabel>
    <Panel
      header="Marking Scheme"
      toggleable
      class="w-full mt-4"
    >
      <div class="flex flex-col gap-2">
        <FloatLabel
          class="w-full"
          variant="on"
        >
          <InputNumber
            v-model="currentQuestionData.correctMarks"
            :disabled="!props.isPdfLoaded"
            :min="1"
            :max="99"
            prefix="+"
            :fluid="true"
            label-id="marks_correct"
            size="small"
            show-buttons
            :step="1"
          />
          <label for="marks_correct">Correct</label>
        </FloatLabel>

        <FloatLabel
          v-if="currentQuestionData.questionType === 'msq'"
          class="w-full"
          variant="on"
        >
          <InputNumber
            v-model="currentQuestionData.partialMarks"
            :disabled="!props.isPdfLoaded"
            :min="0"
            :max="99"
            prefix="+"
            :fluid="true"
            label-id="marks_partial"
            size="small"
            show-buttons
            :step="1"
          />
          <label for="marks_partial">Partial</label>
        </FloatLabel>

        <FloatLabel
          class="w-full"
          variant="on"
        >
          <InputNumber
            v-model="currentQuestionData.incorrectMarks"
            :disabled="!props.isPdfLoaded"
            :min="-99"
            :max="0"
            :fluid="true"
            label-id="marks_incorrect"
            size="small"
            show-buttons
            :step="1"
          />
          <label for="marks_incorrect">Incorrect</label>
        </FloatLabel>
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
