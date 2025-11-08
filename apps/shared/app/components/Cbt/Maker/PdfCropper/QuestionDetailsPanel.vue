<template>
  <UiAccordion
    :default-value="['1']"
    type="multiple"
    :unmount-on-hide="false"
    class="w-full border rounded-md mt-1"
  >
    <UiAccordionItem value="1">
      <UiAccordionTrigger
        :title-class="[
          'text-lg',
          {
            'dark:text-yellow-400 text-yellow-500': !isCurrentQuestionMainOverlay,
          },
        ]"
      >
        {{ questionDetailsHeader }}
      </UiAccordionTrigger>
      <UiAccordionContent class="mx-4">
        <div class="flex flex-col gap-4 w-full mt-2">
          <BaseInputTextWithSelect
            v-model="currentData.subject"
            :select-options="SUBJECTS"
            label="Subject Name"
            :disabled="!isPdfLoaded"
            label-root-class="grow"
            input-class="h-10 text-[0.95rem]!"
            select-class="h-10!"
            label-class="start-1/2! -translate-x-1/2 text-[0.85rem]"
            placeholder="Type/Select subject name"
          />
          <BaseInputTextWithSelect
            v-model="currentData.section"
            :select-options="sections"
            label="Section Name (Optional)"
            :disabled="!isPdfLoaded"
            label-root-class="grow"
            input-class="h-10 text-[0.95rem]!"
            select-class="h-10!"
            label-class="start-1/2! -translate-x-1/2 text-[0.85rem]"
            placeholder="Type/Select section name"
          />
          <BaseFloatLabel
            class="w-full"
            label="Question Number"
            label-id="question_num"
            label-class="start-1/2! -translate-x-1/2 text-[0.85rem]"
          >
            <BaseInputNumber
              id="question_num"
              v-model="currentData.que"
              :disabled="!props.isPdfLoaded"
              input-class="h-10! text-[0.95rem]!"
              :min="1"
              :max="9999"
              :step="1"
            />
          </BaseFloatLabel>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          <BaseFloatLabel
            class="min-w-24 flex-1"
            label="Question Type"
            label-id="question_type"
            label-class="text-xs start-1/2! -translate-x-1/2"
          >
            <BaseSelect
              id="question_type"
              v-model="currentData.type"
              :disabled="!props.isPdfLoaded || questionState.disableQueDataInput"
              :options="QUESTION_TYPES_OPTIONS"
            />
          </BaseFloatLabel>
          <BaseFloatLabel
            v-show="currentData.type !== 'nat'"
            class="min-w-24 flex-1"
            label="Answer Options"
            label-id="answer_options"
            label-class="text-xs start-1/2! -translate-x-1/2"
          >
            <UiInput
              id="answer_options"
              v-model="currentData.answerOptions"
              class="text-center"
              type="text"
              :disabled="!props.isPdfLoaded || questionState.disableQueDataInput"
              @blur="currentData.answerOptions = currentData.answerOptions.trim()"
            />
          </BaseFloatLabel>
        </div>
        <UiAccordion
          class="w-full"
          type="multiple"
        >
          <UiAccordionItem value="1">
            <UiAccordionTrigger title-class="text-lg">
              Marking Scheme
            </UiAccordionTrigger>
            <UiAccordionContent>
              <div class="flex flex-col gap-4 mt-2">
                <div class="flex gap-3">
                  <BaseFloatLabel
                    class="w-full"
                    label="Correct"
                    label-id="marks_correct"
                    label-class="start-1/2! -translate-x-1/2 text-xs"
                  >
                    <BaseInputNumber
                      id="marks_correct"
                      v-model="currentData.marks.cm"
                      :disabled="!props.isPdfLoaded || questionState.disableQueDataInput"
                      :min="1"
                      :max="99"
                      :format-options="{ signDisplay: 'exceptZero' }"
                      :step-snapping="false"
                      size="small"
                    />
                  </BaseFloatLabel>
                  <BaseFloatLabel
                    class="w-full"
                    label="Incorrect"
                    label-id="marks_incorrect"
                    label-class="start-1/2! -translate-x-1/2 text-xs"
                  >
                    <BaseInputNumber
                      id="marks_incorrect"
                      v-model="currentData.marks.im"
                      :disabled="!props.isPdfLoaded || questionState.disableQueDataInput"
                      :min="-99"
                      :max="0"
                      :step-snapping="false"
                      size="small"
                    />
                  </BaseFloatLabel>
                </div>
                <div
                  v-if="currentData.type === 'msq'"
                  class="flex gap-5 px-4"
                >
                  <BaseFloatLabel
                    class="w-full"
                    label="Partial"
                    label-id="marks_partial"
                    label-class="start-1/2! -translate-x-1/2 text-xs"
                  >
                    <BaseInputNumber
                      id="marks_partial"
                      v-model="currentData.marks.pm"
                      :disabled="!props.isPdfLoaded || questionState.disableQueDataInput"
                      :min="0"
                      :max="99"
                      :step-snapping="false"
                      :format-options="{ signDisplay: 'exceptZero' }"
                      size="small"
                    />
                  </BaseFloatLabel>
                  <IconWithTooltip
                    :content="partialMarkingTooltipContent"
                    icon-size="1.25rem"
                  />
                </div>
              </div>
            </UiAccordionContent>
          </UiAccordionItem>
          <UiAccordionItem value="2">
            <UiAccordionTrigger title-class="text-base">
              Test UI Settings (optional)
            </UiAccordionTrigger>
            <UiAccordionContent>
              <div class="flex flex-col gap-4 mt-2 items-center">
                <div class="flex gap-4 px-4 items-center justify-center">
                  <span>Answer Options Counter Type</span>
                  <IconWithTooltip
                    :content="answerOptionsCounterTypeTooltipContent"
                    icon-size="1.25rem"
                  />
                </div>
                <div class="flex gap-3 justify-center">
                  <BaseFloatLabel
                    class="min-w-32 max-w-40"
                    :label="currentData.type === 'msm'
                      ? 'For MSM Rows'
                      : 'For MCQ & MSQ'
                    "
                    label-id="answer_options_counter_type_primary"
                    label-class="start-1/2! -translate-x-1/2 text-xs"
                  >
                    <BaseSelect
                      id="answer_options_counter_type_primary"
                      v-model="currentData.answerOptionsCounterTypePrimary"
                      :disabled="!props.isPdfLoaded
                        || questionState.disableQueDataInput
                        || currentData.type === 'nat'"
                      :options="ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT"
                    />
                  </BaseFloatLabel>
                  <BaseFloatLabel
                    v-if="currentData.type === 'msm'"
                    class="min-w-32 max-w-40"
                    label="For MSM columns"
                    label-id="answer_options_counter_type_secondary"
                    label-class="start-1/2! -translate-x-1/2 text-xs"
                  >
                    <BaseSelect
                      id="answer_options_counter_type_secondary"
                      v-model="currentData.answerOptionsCounterTypeSecondary"
                      :options="ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT"
                      :disabled="!props.isPdfLoaded || questionState.disableQueDataInput"
                    />
                  </BaseFloatLabel>
                </div>
              </div>
            </UiAccordionContent>
          </UiAccordionItem>
        </UiAccordion>
      </UiAccordionContent>
    </UiAccordionItem>
    <UiAccordionItem value="2">
      <UiAccordionTrigger title-class="text-lg">
        Crop Coordinates
      </UiAccordionTrigger>
      <UiAccordionContent>
        <div class="grid grid-cols-2 col-span-3 gap-5 mt-2 pb-8 mx:2 sm:mx-6">
          <BaseFloatLabel
            class="w-full"
            label="Left"
            label-id="coords_left"
            label-class="start-1/2! -translate-x-1/2 text-xs"
          >
            <BaseInputNumber
              v-model="currentData.pdfData.l"
              :min="0"
              :max="currentData.pdfData.r"
              :disabled="!isPdfLoaded"
              input-class="w-full"
            />
          </BaseFloatLabel>
          <BaseFloatLabel
            class="w-full"
            label="Right"
            label-id="coords_right"
            label-class="start-1/2! -translate-x-1/2 text-xs"
          >
            <BaseInputNumber
              v-model="currentData.pdfData.r"
              :min="currentData.pdfData.l"
              :max="pageWidth"
              :disabled="!isPdfLoaded"
              input-class="w-full"
            />
          </BaseFloatLabel>
          <BaseFloatLabel
            class="w-full"
            label="Top"
            label-id="coords_top"
            label-class="start-1/2! -translate-x-1/2 text-xs"
          >
            <BaseInputNumber
              v-model="currentData.pdfData.t"
              :min="0"
              :max="currentData.pdfData.b"
              :disabled="!isPdfLoaded"
              input-class="w-full"
            />
          </BaseFloatLabel>
          <BaseFloatLabel
            class="w-full"
            label="Bottom"
            label-id="coords_bottom"
            label-class="start-1/2! -translate-x-1/2 text-xs"
          >
            <BaseInputNumber
              v-model="currentData.pdfData.b"
              :min="currentData.pdfData.t"
              :max="pageHeight"
              :disabled="!isPdfLoaded"
              input-class="w-full"
            />
          </BaseFloatLabel>
        </div>
      </UiAccordionContent>
    </UiAccordionItem>
  </UiAccordion>
</template>

<script setup lang="ts">
import {
  QUESTION_TYPES_OPTIONS,
  SEPARATOR,
  ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT,
  SUBJECTS,
} from '#layers/shared/shared/constants'
import {
  partialMarkingTooltipContent,
  answerOptionsCounterTypeTooltipContent,
} from './tooltipContents'

const currentData = defineModel<PdfCroppedOverlayData>({ required: true })

const props = defineProps<{
  overlayDatas: Map<string, PdfCroppedOverlayData>
  overlaysPerQuestionData: PdfCropperOverlaysPerQuestion
  isCurrentQuestionMainOverlay: boolean
  isPdfLoaded: boolean
  pageHeight: number
  pageWidth: number
}>()

const questionState = computed(() => {
  const id = currentData.value.id
  const subject = currentData.value.subject
  const section = currentData.value.section
  const que = currentData.value.que
  const imgNum = currentData.value.imgNum

  const newQueId = `${section || subject}${SEPARATOR}${que}`
  const newId = newQueId + SEPARATOR + imgNum

  const data = {
    que,
    imgNumToShow: 0,
    imgCount: 0,
    disableQueDataInput: false,
  }

  const imgCount = props.overlaysPerQuestionData.get(newQueId) ?? 0
  if (newId === id) {
    data.imgNumToShow = imgNum
    if (imgNum > 1) data.disableQueDataInput = true
  }
  else {
    data.imgNumToShow = imgCount + 1
  }
  data.imgCount = imgCount

  return data
})

const questionDetailsHeader = computed(() => {
  const imgNum = questionState.value.imgNumToShow
  const imgCount = questionState.value.imgCount
  const que = questionState.value.que

  const imgNumStr = (imgNum > 1 || imgCount > 1)
    ? `(${imgNum}) `
    : ''

  return `Question Details [ #${que} ${imgNumStr}]`
})

const sections = computed(() => {
  const subject = currentData.value.subject

  const subjectList: string[] = []
  const sectionsList: string[] = []

  if (subject) {
    subjectList.push(subject)
  }
  else {
    subjectList.push(...SUBJECTS.slice(0, 3))
  }

  for (const subjectName of subjectList) {
    for (const n of utilRange(1, 5)) {
      sectionsList.push(`${subjectName} Section ${n}`)
    }
  }

  return sectionsList
})
</script>
