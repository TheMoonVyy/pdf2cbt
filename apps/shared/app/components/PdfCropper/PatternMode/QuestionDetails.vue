<script lang="ts" setup>
import {
  QUESTION_TYPES_OPTIONS,
  ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT,
} from '#layers/shared/shared/constants'
import type {
  PatternModeFormQuestionDetails,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/json-config-to-form-data'
import {
  partialMarkingTooltipContent,
  answerOptionsCounterTypeTooltipContent,
} from '../tooltipContents'
import type { FieldProp } from '#layers/shared/app/src/form-validation/regle.global.config'

type DeeplySetRecordValue<U extends object, V> = {
  [K in keyof U]: U[K] extends object ? DeeplySetRecordValue<U[K], V> : V
}

type Fields = DeeplySetRecordValue<PatternModeFormQuestionDetails, FieldProp>

defineProps<{ fields: Fields }>()

const details = defineModel<PatternModeFormQuestionDetails>({ required: true })
</script>

<template>
  <UiCard
    class="pt-2.5 gap-2 h-[26.3rem]"
  >
    <UiCardHeader>
      <UiCardTitle class="mx-auto text-base">
        Question Details
      </UiCardTitle>
    </UiCardHeader>
    <UiCardContent class="flex flex-col items-center w-2xs px-3 gap-2.5">
      <FormLabel
        v-slot="{ id }"
        label="Question Type"
        :field="fields.type"
        :hide-errors="true"
      >
        <BaseSelect
          :id="id"
          v-model="details.type"
          :options="QUESTION_TYPES_OPTIONS"
        />
      </FormLabel>
      <FormLabel
        v-show="details.type !== 'nat'"
        v-slot="{ id }"
        label="Answer Options"
        :field="fields.answerOptions"
      >
        <UiInput
          :id="id"
          v-model="details.answerOptions"
          class="text-center"
        />
      </FormLabel>
      <div class="flex flex-col gap-2">
        <span class="text-lg text-center">Marking Scheme</span>
        <div class="flex flex-col gap-4 mt-2">
          <div class="flex gap-3">
            <BaseFloatLabel
              v-slot="{ id }"
              class="w-full"
              label="Correct"
              label-class="start-1/2! -translate-x-1/2 text-xs"
              required
            >
              <BaseInputNumber
                :id="id"
                v-model="details.marks.cm"
                :label="details.type === 'msm' ? 'Correct (per row)': 'Correct'"
                :min="1"
                :max="99"
                :format-options="{ signDisplay: 'exceptZero' }"
                size="small"
              />
            </BaseFloatLabel>
            <BaseFloatLabel
              v-slot="{ id }"
              class="w-full"
              label="Incorrect"
              label-class="start-1/2! -translate-x-1/2 text-xs"
              required
            >
              <BaseInputNumber
                :id="id"
                v-model="details.marks.im"
                :min="-99"
                :max="0"
                size="small"
              />
            </BaseFloatLabel>
          </div>
          <div
            v-if="details.type === 'msq'"
            class="flex gap-5 px-4 items-center"
          >
            <BaseFloatLabel
              v-slot="{ id }"
              class="w-full"
              label="Partial"
              label-class="start-1/2! -translate-x-1/2 text-xs"
              required
            >
              <BaseInputNumber
                :id="id"
                v-model="details.marks.pm"
                :min="0"
                :max="99"
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
      </div>
      <div class="flex flex-col gap-4 mt-2 items-center">
        <div class="flex gap-4 px-4 items-center justify-center">
          <span class="text-sm text-nowrap">Answer Options Counter Type</span>
          <IconWithTooltip
            :content="answerOptionsCounterTypeTooltipContent"
            icon-size="1.15rem"
          />
        </div>
        <div class="flex gap-3 justify-center">
          <BaseFloatLabel
            v-slot="{ id }"
            class="min-w-32 max-w-40"
            :label="details.type === 'msm'
              ? 'For MSM Rows'
              : 'For MCQ & MSQ'
            "
            label-class="start-1/2! -translate-x-1/2 text-xs"
          >
            <BaseSelect
              :id="id"
              v-model="details.answerOptionsCounterTypePrimary"
              :options="ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT"
            />
          </BaseFloatLabel>
          <BaseFloatLabel
            v-show="details.type === 'msm'"
            v-slot="{ id }"
            class="min-w-32 max-w-40"
            label="For MSM columns"
            label-class="start-1/2! -translate-x-1/2 text-xs"
          >
            <BaseSelect
              :id="id"
              v-model="details.answerOptionsCounterTypeSecondary"
              :options="ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT"
            />
          </BaseFloatLabel>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>
