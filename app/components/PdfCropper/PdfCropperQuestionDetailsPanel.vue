<template>
  <Panel
    :header="questionDetailsHeader"
    toggleable
    class="w-full"
    pt:content:class="px-4"
  >
    <div class="flex w-full mt-2 bg-surface-950 border border-surface-700 rounded-md">
      <BaseFloatLabel
        label="Subject Name"
        label-id="subject_name"
        class="flex grow"
      >
        <InputText
          id="subject_name"
          v-model="currentData.subject"
          fluid
          :maxlength="30"
          :disabled="!isPdfLoaded"
          @blur="() => currentData.subject = currentData.subject.trim()"
        />
      </BaseFloatLabel>
      <span class="flex items-center px-2 w-16 justify-center border-l border-surface-700 bg-surface-900 text-surface-300">
        {{ currentData.subject?.length }}/30
      </span>
    </div>
    <div class="flex w-full mt-4 bg-surface-950 border border-surface-700 rounded-md">
      <BaseFloatLabel
        label="Section Name (Optional)"
        label-id="section_name"
        class="flex grow"
      >
        <InputText
          id="section_name"
          v-model="currentData.section"
          fluid
          :maxlength="40"
          :disabled="!isPdfLoaded"
          @blur="() => currentData.section = currentData.section.trim()"
        />
      </BaseFloatLabel>
      <span class="flex items-center px-2 w-16 justify-center border-l border-surface-700 bg-surface-900 text-surface-300">
        {{ currentData.section?.length }}/40
      </span>
    </div>
    <BaseFloatLabel
      class="w-full mt-4"
      label="Question Number"
      label-id="question_num"
      label-class="start-1/2! -translate-x-1/2"
    >
      <BaseInputNumber
        v-model="currentData.que"
        :disabled="!props.isPdfLoaded"
        :min="1"
        :max="9999"
        label-id="question_num"
        :step="1"
      />
    </BaseFloatLabel>
    <div class="flex flex-wrap gap-2 mt-4">
      <BaseFloatLabel
        class="min-w-24 flex-1"
        label="Question Type"
        label-id="question_type"
        label-class="text-xs"
      >
        <Select
          v-model="currentData.type"
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
        v-show="currentData.type !== 'nat'"
        class="min-w-24 flex-1"
        label="Answer Options"
        label-id="answer_options"
        label-class="text-xs"
      >
        <InputNumber
          v-model="currentData.options"
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
            v-model="currentData.marks.cm"
            :disabled="!props.isPdfLoaded"
            :min="1"
            :max="99"
            prefix="+"
            size="small"
            label-id="marks_correct"
          />
        </BaseFloatLabel>
        <div
          v-if="currentData.type === 'msq'"
          class="flex gap-3"
        >
          <IconWithTooltip
            :tooltip-content="tooltipContent.partialMarking"
            icon-class="text-2xl"
          />
          <BaseFloatLabel
            class="w-full"
            label="Partial"
            label-id="marks_partial"
            label-class="start-1/2! -translate-x-1/2 text-xs"
          >
            <BaseInputNumber
              v-model="currentData.marks.pm"
              :disabled="!props.isPdfLoaded"
              :min="0"
              :max="99"
              prefix="+"
              size="small"
              label-id="marks_partial"
            />
          </BaseFloatLabel>
        </div>
        <BaseFloatLabel
          class="w-full"
          label="Incorrect"
          label-id="marks_incorrect"
          label-class="start-1/2! -translate-x-1/2 text-xs"
        >
          <BaseInputNumber
            v-model="currentData.marks.im"
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
import { IMAGE_FILE_NAME_OF_ZIP_SEPARATOR } from '#shared/constants'

const currentData = defineModel<PdfCroppedOverlayData>({ required: true })

const props = defineProps<{
  overlayDatas: Map<string, PdfCroppedOverlayData>
  isPdfLoaded: boolean
}>()

const questionDetailsHeader = computed(() => {
  const id = currentData.value.id
  const subject = currentData.value.subject
  const section = currentData.value.section
  const que = currentData.value.que

  const newID = `${section || subject}${IMAGE_FILE_NAME_OF_ZIP_SEPARATOR}${que}`
  const imgLength = props.overlayDatas.get(newID)?.pdfData.length
  let imgNum = imgLength || 1

  if (id !== newID && imgLength !== undefined) {
    imgNum = imgLength + 1
  }

  const imgNumStr = imgNum > 1
    ? `(${imgNum}) `
    : ''

  return `Question Details [ #${que} ${imgNumStr}]`
})

const optionItems = {
  questionType: [
    { name: 'MCQ', value: 'mcq', tooltip: 'Multiple Choice Question' },
    { name: 'MSQ', value: 'msq', tooltip: 'Multiple Select Question' },
    { name: 'NAT', value: 'nat', tooltip: 'Numerial Answer Type' },
  ],
}

const tooltipContent = {
  partialMarking:
    'If you want JEE Advanced format then use +1 as partial marking.\n'
    + 'While JEE Advanced format looks complex, the logic for partial marking in a nutshell is:\n'
    + 'marks awarded = no. of partically correct answer * 1\n\n'
    + 'Look at the their format properly,\n'
    + 'if you notice you get +1 for each partially correct answer when the case is of "partially correct answers"',
}
</script>
