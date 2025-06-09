<template>
  <Panel
    :header="questionDetailsHeader"
    toggleable
    class="w-full"
    :pt:title:class="['mx-auto', isCurrentQuestionMainOverlay ? '' : 'text-cyan-400']"
    pt:content:class="px-4"
  >
    <div class="flex w-full mt-2 bg-surface-950 border border-surface-700 rounded-md">
      <BaseFloatLabel
        label="Subject Name"
        label-id="subject_name"
        class="grow"
      >
        <Select
          v-model="currentData.subject"
          editable
          fluid
          :disabled="!isPdfLoaded"
          :options="subjects"
          placeholder="Enter/Select subject name"
          @blur="() => currentData.subject = currentData.subject.trim()"
        />
      </BaseFloatLabel>
    </div>
    <div class="flex w-full mt-4 bg-surface-950 border border-surface-700 rounded-md">
      <BaseFloatLabel
        label="Section Name (Optional)"
        label-id="section_name"
        class="grow"
      >
        <Select
          v-model="currentData.section"
          editable
          fluid
          :disabled="!isPdfLoaded"
          :options="sections"
          placeholder="Enter/Select section name or leave it blank"
          @blur="() => currentData.section = currentData.section.trim()"
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
          :disabled="!props.isPdfLoaded || questionState.disableQueDataInput"
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
          :disabled="!props.isPdfLoaded || questionState.disableQueDataInput"
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
            :disabled="!props.isPdfLoaded || questionState.disableQueDataInput"
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
              :disabled="!props.isPdfLoaded || questionState.disableQueDataInput"
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
            :disabled="!props.isPdfLoaded || questionState.disableQueDataInput"
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
import { Constants } from '#shared/enums'

const currentData = defineModel<PdfCroppedOverlayData>({ required: true })

const props = defineProps<{
  overlayDatas: Map<string, PdfCroppedOverlayData>
  overlaysPerQuestionData: PdfCropperOverlaysPerQuestion
  isCurrentQuestionMainOverlay: boolean
  isPdfLoaded: boolean
}>()

const ID_SEPARATOR = Constants.separator

const questionState = computed(() => {
  const id = currentData.value.id
  const subject = currentData.value.subject
  const section = currentData.value.section
  const que = currentData.value.que
  const imgNum = currentData.value.imgNum

  const newQueId = `${section || subject}${ID_SEPARATOR}${que}`
  const newId = newQueId + ID_SEPARATOR + imgNum

  const data = {
    que,
    imgNumToShow: 0,
    disableQueDataInput: false,
  }

  if (newId === id) {
    data.imgNumToShow = imgNum
    if (imgNum > 1) data.disableQueDataInput = true
  }
  else {
    const imgCount = props.overlaysPerQuestionData.get(newQueId) ?? 0
    data.imgNumToShow = imgCount + 1
  }

  return data
})

const questionDetailsHeader = computed(() => {
  const imgNum = questionState.value.imgNumToShow
  const que = questionState.value.que

  const imgNumStr = imgNum > 1
    ? `(${imgNum}) `
    : ''

  return `Question Details [ #${que} ${imgNumStr}]`
})

const subjects = [
  'Physics', 'Chemistry', 'Mathematics',
  'Biology', 'English', 'Logical Reasoning', 'English & LR',
]

const sections = computed(() => {
  const subject = currentData.value.subject

  const subjectList: string[] = []
  const sectionsList: string[] = []

  if (subject) {
    subjectList.push(subject)
  }
  else {
    subjectList.push(...subjects.slice(0, 3))
  }

  for (const subjectName of subjectList) {
    for (const n of utilRange(1, 5)) {
      sectionsList.push(`${subjectName} Section ${n}`)
    }
  }

  return sectionsList
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
