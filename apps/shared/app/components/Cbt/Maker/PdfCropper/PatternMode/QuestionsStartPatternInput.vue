<template>
  <div
    class="flex flex-col gap-4 items-center w-full group"
    :data-error="!!errors?.length"
  >
    <div class="flex gap-3 items-center">
      <BaseButton
        class="shrink-0"
        variant="outline"
        size="icon"
        :icon-name="pattern.type === 'regex'
          ? 'material-symbols:regular-expression'
          : 'my-icon:txt'"
        title="Toggle pattern type"
        icon-size="1.6rem"
        icon-class="text-green-400"
        @click="togglePatternType"
      />
      <BaseButton
        class="shrink-0"
        variant="outline"
        size="icon"
        icon-name="material-symbols:match-case-rounded"
        title="Toggle case sensitivity"
        :icon-class="pattern.isCaseSensitive
          ? 'text-green-400'
          : ''"
        icon-size="1.7rem"
        @click="pattern.isCaseSensitive = !pattern.isCaseSensitive"
      />
      <div class="flex items-center justify-center gap-2">
        <slot name="infoTooltip" />
        <UiLabel
          class="group-data-[error=true]:text-destructive gap-0"
          :for="pattern.type === 'regex' ? Q_START_REGEX_ID : ''"
        >
          {{ utilKeyToLabel(pattern.type) }} Pattern
          <span class="text-red-500">*</span>
        </UiLabel>
        <IconWithTooltip
          v-if="errors?.length && pattern.type === 'regex'"
          icon-name="material-symbols:error-outline-rounded"
          icon-class="text-red-400 hover:cursor-pointer"
          icon-size="1rem"
        >
          <p
            class="text-destructive text-base whitespace-pre-line"
          >
            {{ errors.join('\n') }}
          </p>
        </IconWithTooltip>
        <div
          v-else
          class="size-4"
        />
      </div>
      <BaseButton
        v-show="pattern.type !== 'regex'"
        class="shrink-0"
        variant="outline"
        size="icon"
        icon-name="my-icon:optionalzero"
        title="Make leading zeroes optional in range"
        :icon-class="pattern.isLeadingZeroesOptional
          ? 'text-green-400'
          : ''"
        icon-size="1.7rem"
        @click="pattern.isLeadingZeroesOptional = !pattern.isLeadingZeroesOptional"
      />
      <UiPopover>
        <UiPopoverTrigger as-child>
          <BaseButton
            v-show="pattern.type === 'regex'"
            class="shrink-0"
            variant="outline"
            size="icon"
            icon-name="my-icon:fx"
            title="Helpers for Regex Format"
            icon-size="1.7rem"
          />
        </UiPopoverTrigger>
        <UiPopoverContent class="flex flex-col w-full sm:w-84 p-0.5">
          <UiScrollArea
            viewport-class="[&>div]:flex [&>div]:flex-col [&>div]:py-2.5 [&>div]:px-4
              max-h-96 [&>div]:divide-border [&>div]:divide-y-2"
          >
            <div class="flex flex-col gap-3.5 pb-4">
              <span class="mx-auto">
                Q. Num Range to Regex converter
              </span>
              <div class="flex gap-3 items-center">
                <BaseFloatLabel
                  v-slot="{ id }"
                  class="grow"
                  label="Q. Num Range"
                  label-class="start-1/2! -translate-x-1/2"
                >
                  <UiInput
                    :id="id"
                    v-model="regexHelpersState.qNumRangeText"
                    class="text-center"
                    ignore-error
                  />
                </BaseFloatLabel>
                <BaseButton
                  class="shrink-0"
                  variant="outline"
                  size="icon"
                  icon-name="my-icon:optionalzero"
                  title="Make leading zeroes optional in range"
                  :icon-class="regexHelpersState.isLeadingZeroesOptional
                    ? 'text-green-400'
                    : ''"
                  icon-size="1.7rem"
                  @click="regexHelpersState.isLeadingZeroesOptional = !regexHelpersState.isLeadingZeroesOptional"
                />
              </div>
              <div class="flex gap-3 items-center">
                <BaseFloatLabel
                  v-slot="{ id }"
                  class="grow"
                  label="Regex Format"
                  label-class="start-1/2! -translate-x-1/2"
                >
                  <UiInput
                    :id="id"
                    class="text-center bg-muted/50"
                    :model-value="regexHelperNumRangeText"
                    readonly
                    ignore-error
                    @blur="fields.prefix?.$touch()"
                  />
                </BaseFloatLabel>
                <BaseCopyToClipboardButton :text="regexHelperNumRangeText" />
              </div>
            </div>
            <div
              v-for="(commonPattern, patternName) in questionStartRegexPatterns"
              :key="patternName"
              class="flex flex-col gap-2 pb-4 pt-1"
            >
              <span class="mx-auto">
                regex pattern for <strong>{{ patternName }}</strong>
              </span>
              <div class="flex gap-3 items-center">
                <UiInput
                  :model-value="commonPattern"
                  readonly
                  class="text-center bg-muted/50"
                  ignore-error
                  @blur="fields.prefix?.$touch()"
                />
                <BaseCopyToClipboardButton :text="commonPattern" />
              </div>
            </div>
            <div class="flex flex-col gap-2 pt-1">
              <span class="mx-auto">
                character list for "<strong>-</strong>" like characters
              </span>
              <div class="flex gap-3 items-center">
                <UiInput
                  :model-value="commonRegexPatterns.minus"
                  readonly
                  class="text-center bg-muted/50"
                  ignore-error
                  @blur="fields.prefix?.$touch()"
                />
                <BaseCopyToClipboardButton :text="commonRegexPatterns.minus" />
              </div>
            </div>
          </UiScrollArea>
        </UiPopoverContent>
      </UiPopover>
    </div>
    <div class="grid grid-cols-3 gap-2 w-full">
      <template v-if="pattern.type === 'regex'">
        <UiInput
          :id="Q_START_REGEX_ID"
          v-model="pattern.value"
          class="col-span-3"
          @blur="fields.value?.$touch()"
        />
      </template>
      <template v-else>
        <div class="flex flex-col-reverse gap-2">
          <BaseLabelWithId
            v-slot="{ id }"
            label="Prefix"
          >
            <UiInput
              :id="id"
              v-model="pattern.prefix"
              ignore-error
              @blur="fields.prefix?.$touch()"
            />
          </BaseLabelWithId>
        </div>
        <FormLabel
          :id="Q_NUM_RANGE_ID"
          v-slot="{ id, handleBlur }"
          label="Q. Range"
          :field="fields.questionRange"
          class="grow shrink-0"
        >
          <UiInput
            :id="id"
            v-model="pattern.questionRange"
            class="text-center"
            @blur="handleBlur"
          />
        </FormLabel>
        <div class="flex flex-col-reverse gap-2">
          <BaseLabelWithId
            v-slot="{ id }"
            label="Suffix"
          >
            <UiInput
              :id="id"
              v-model="pattern.suffix"
              ignore-error
              @blur="fields.suffix?.$touch()"
            />
          </BaseLabelWithId>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  PatternModeFormQuestionsData,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/json-config-to-form-data'
import {
  getQuestionStartRegexRangePattern,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/parsed-config-for-cropper'
import type { FieldProp } from '#layers/shared/app/src/form-validation/regle.global.config'
import { questionRangeRegex } from '#layers/shared/shared/regexes'

const pattern = defineModel<PatternModeFormQuestionsData['columns'][number]['start']['pattern']>({
  required: true,
})

type Fields = {
  [K in keyof PatternModeFormQuestionsData['columns'][number]['start']['pattern']]: FieldProp
}
const props = defineProps<{ fields: Fields }>()

const Q_NUM_RANGE_ID = 'questions-start-pattern-question-range'
const Q_START_REGEX_ID = 'questions-start-pattern-regex'

const commonRegexPatterns = {
  minus: '[-‐‒–—―﹣－]',
  qsp: {
    '"1."': '^\\s*(\\d+)\\.(?!\\d)',
    '"1)" and "1 )"': '^\\s*(?!\\()\\s?(\\d+)\\s?\\)',
    '"1)." and "1 )."': '^\\s*(?!\\()\\s?(\\d+)\\s?\\)\\.',
    '"Q1" and "Q 1"': '^\\s*Q\\s?(\\d+)',
    '"Q1." and "Q 1."': '^\\s*Q\\s?(\\d+)\\.?',
    '"Q.1", and "Q. 1"': '^\\s*Q\\.\\s?(\\d+)',
  },
} as const

const errors = computed(() => {
  if (pattern.value.type === 'regex') {
    return props.fields.value?.$errors
  }
  else {
    return props.fields.questionRange?.$errors
  }
})

const regexHelpersState = reactive({
  isLeadingZeroesOptional: false,
  qNumRangeText: '',
})

const regexHelperNumRangeText = computed(() => {
  const rangeText = regexHelpersState.qNumRangeText.trim()
  if (!rangeText) return ''

  const match = rangeText.match(questionRangeRegex)
  if (!match) return ''

  const { start, end } = match?.groups || {}
  if (!start || !end) return ''

  return getQuestionStartRegexRangePattern({
    range: rangeText,
    isLeadingZeroesOptional: regexHelpersState.isLeadingZeroesOptional,
  })
})

const questionStartRegexPatterns = computed(() => {
  const patterns: Record<string, string> = {}
  const rangeText = regexHelperNumRangeText.value.trim()
  if (!rangeText)
    return commonRegexPatterns.qsp

  for (const [name, pattern] of Object.entries(commonRegexPatterns.qsp)) {
    patterns[name] = pattern.replace('(\\d+)', rangeText)
  }

  return patterns
})

function togglePatternType() {
  if (pattern.value.type === 'text')
    pattern.value.type = 'regex'
  else
    pattern.value.type = 'text'
}
</script>
