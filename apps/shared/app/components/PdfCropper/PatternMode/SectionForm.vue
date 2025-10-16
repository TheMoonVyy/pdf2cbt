<script setup lang="ts">
import {
  pagesTooltipContent,
  searchInAreaTooltipContent,
  obtainedQuestionNumberTooltipContent,
  forTopCoordinateLookupTooltipContent,
  forBottomCoordinateUseBottomTooltipContent,
  paragraphQuestionsTooltipContent,
  paraCommonPartStartTooltipContent,
  paraCommonPartEndTooltipContent,
  cropTooltipContent,
  paraCommonPartCropExactlyToTooltipContent,
  cropOffsetByTooltipContent,
  questionsCropExactlyToTooltipContent,
  columnsTooltipContent,
  questionsStartPatternTooltipContent,
  questionsEndTooltipContent,
  questionsCropWithinTooltipContent,
} from '../tooltipContents'
import SearchArea from './SearchArea.vue'
import SimplePatternInput from './SimplePatternInput.vue'
import QuestionsStartPatternInput from './QuestionsStartPatternInput.vue'
import {
  PATTERN_MODE,
  AREA_BOUNDARY_NAMES,
} from '#layers/shared/shared/constants'
import {
  minValue,
  required,
  requiredIf,
  maxValue,
  withMessage,
  decimal,
  applyIf,
} from '@regle/rules'
import {
  pagesRule,
  absOrRelativeCoordRule,
  answerOptionsRule,
} from '#layers/shared/app/src/form-validation/custom-rules/rules'
import { useCustomRegle } from '#layers/shared/app/src/form-validation/regle.global.config'
import type {
  PatternModeFormQuestionsData,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/json-config-to-form-data'

const props = defineProps<{
  subjectId: string | number
  sectionId: string | number
  subjectHasSections: boolean
  sectionNamesForSelect: string[]
}>()

const sectionsFormStatus = defineModel<PatternModeFormStatus[string]['sections']>({ required: true })

const { form } = usePatternModeFormData()

const sectionFormData = ref(form.value!.subjects[props.subjectId]!.sections[props.sectionId]!)

const { r$ } = useCustomRegle(sectionFormData, () => {
  const isSubjectHasSections = () => props.subjectHasSections

  const isParaRequired = () =>
    sectionFormData.value.questions.paragraphQuestions.start.required

  const isParaEndRequired = () =>
    sectionFormData.value.questions.paragraphQuestions.start.required
    && sectionFormData.value.questions.paragraphQuestions.end.required

  const isTopCoordLookUpRequired = () =>
    sectionFormData.value.questions.forTopCoordinateLookUp.required

  const isMergeQuestionsRequired = () =>
    sectionFormData.value.questions.mergeQuestions?.required

  return {
    name: { required: requiredIf(isSubjectHasSections) },
    pattern: {
      value: { required: requiredIf(isSubjectHasSections) },
    },
    searchIn: {
      pages: { required: requiredIf(isSubjectHasSections), pagesRule },
      area: {
        l: { required: requiredIf(isSubjectHasSections), absOrRelativeCoordRule },
        r: { required: requiredIf(isSubjectHasSections), absOrRelativeCoordRule },
        t: { required: requiredIf(isSubjectHasSections), absOrRelativeCoordRule },
        b: { required: requiredIf(isSubjectHasSections), absOrRelativeCoordRule },
      },
    },
    numOfOptionalQuestions: { minValue: minValue(0) },
    questions: {
      pages: { required, pagesRule },
      details: {
        type: { required },
        answerOptions: {
          required: requiredIf(() => sectionFormData.value.questions.details.type !== 'nat'),
          answerOptionsRule: answerOptionsRule(() => sectionFormData.value.questions.details.type),
        },
        marks: {
          cm: { required, minValue: minValue(0) },
          im: { required, maxValue: maxValue(0) },
          pm: { required: requiredIf(() => sectionFormData.value.questions.details.type === 'msq') },
        },
      },
      forTopCoordinateLookUp: {
        by: {
          required: requiredIf(isTopCoordLookUpRequired),
          minValue: applyIf(isTopCoordLookUpRequired, minValue(1)),
        },
        chainBy: { minValue: minValue(0) },
        for: {
          required: withMessage(
            requiredIf(isTopCoordLookUpRequired),
            'At least one option must be selected',
          ),
        },
      },
      mergeQuestions: {
        splitBy: {
          required: withMessage(
            requiredIf(isMergeQuestionsRequired),
            'At least one option must be selected',
          ),
        },
      },
      paragraphQuestions: {
        start: {
          pattern: {
            value: { required: requiredIf(isParaRequired) },
          },
          searchIn: {
            l: { required: requiredIf(isParaRequired), absOrRelativeCoordRule },
            r: { required: requiredIf(isParaRequired), absOrRelativeCoordRule },
            t: { required: requiredIf(isParaRequired), absOrRelativeCoordRule },
            b: { required: requiredIf(isParaRequired), absOrRelativeCoordRule },
          },
        },
        end: {
          pattern: {
            value: { required: requiredIf(isParaEndRequired) },
          },
          searchIn: {
            l: { required: requiredIf(isParaEndRequired), absOrRelativeCoordRule },
            r: { required: requiredIf(isParaEndRequired), absOrRelativeCoordRule },
            t: { required: requiredIf(isParaEndRequired), absOrRelativeCoordRule },
            b: { required: requiredIf(isParaEndRequired), absOrRelativeCoordRule },
          },
        },
        crop: {
          exactlyTo: {
            l: { absOrRelativeCoordRule: applyIf(isParaRequired, absOrRelativeCoordRule) },
            r: { absOrRelativeCoordRule: applyIf(isParaRequired, absOrRelativeCoordRule) },
          },
          offsetBy: {
            l: { decimal: applyIf(isParaRequired, decimal) },
            r: { decimal: applyIf(isParaRequired, decimal) },
            t: { decimal: applyIf(isParaRequired, decimal) },
            b: { decimal: applyIf(isParaRequired, decimal) },
          },
        },
      },

      columns: {
        $deepCompare: false,
        $each: (column: Ref<PatternModeFormQuestionsData['columns'][number]>) => {
          const isColumnRequired = () => !column.value.isRemoved
          const isColumnEndRequired = () =>
            column.value.end.required && !column.value.isRemoved
          const isQuestionStartPatternTypeRegex = () =>
            column.value.start.pattern.type === 'regex' && !column.value.isRemoved
          const isQuestionStartPatternTypeText = () =>
            column.value.start.pattern.type === 'text' && !column.value.isRemoved

          return {
            start: {
              pattern: {
                value: { required: requiredIf(isQuestionStartPatternTypeRegex) },
                questionRange: { required: requiredIf(isQuestionStartPatternTypeText) },
              },
              searchIn: {
                l: {
                  required: requiredIf(isColumnRequired),
                  absOrRelativeCoordRule: applyIf(isColumnRequired, absOrRelativeCoordRule),
                },
                r: {
                  required: requiredIf(isColumnRequired),
                  absOrRelativeCoordRule: applyIf(isColumnRequired, absOrRelativeCoordRule),
                },
                t: {
                  required: requiredIf(isColumnRequired),
                  absOrRelativeCoordRule: applyIf(isColumnRequired, absOrRelativeCoordRule),
                },
                b: {
                  required: requiredIf(isColumnRequired),
                  absOrRelativeCoordRule: applyIf(isColumnRequired, absOrRelativeCoordRule),
                },
              },
            },
            end: {
              pattern: {
                value: { required: requiredIf(isColumnEndRequired) },
              },
              searchIn: {
                l: {
                  required: requiredIf(isColumnEndRequired),
                  absOrRelativeCoordRule: applyIf(isColumnEndRequired, absOrRelativeCoordRule),
                },
                r: {
                  required: requiredIf(isColumnEndRequired),
                  absOrRelativeCoordRule: applyIf(isColumnEndRequired, absOrRelativeCoordRule),
                },
                t: {
                  required: requiredIf(isColumnEndRequired),
                  absOrRelativeCoordRule: applyIf(isColumnEndRequired, absOrRelativeCoordRule),
                },
                b: {
                  required: requiredIf(isColumnEndRequired),
                  absOrRelativeCoordRule: applyIf(isColumnEndRequired, absOrRelativeCoordRule),
                },
              },
            },
            crop: {
              within: {
                t: {
                  required: requiredIf(isColumnRequired),
                  absOrRelativeCoordRule: applyIf(isColumnRequired, absOrRelativeCoordRule),
                },
                b: {
                  required: requiredIf(isColumnRequired),
                  absOrRelativeCoordRule: applyIf(isColumnRequired, absOrRelativeCoordRule),
                },
              },
              exactlyTo: {
                l: {
                  absOrRelativeCoordRule: applyIf(isColumnRequired, absOrRelativeCoordRule),
                },
                r: {
                  required: requiredIf(isColumnRequired),
                  absOrRelativeCoordRule: applyIf(isColumnRequired, absOrRelativeCoordRule),
                },
              },
              offsetBy: {
                l: { decimal: applyIf(isColumnRequired, decimal) },
                r: { decimal: applyIf(isColumnRequired, decimal) },
                t: { decimal: applyIf(isColumnRequired, decimal) },
                b: { decimal: applyIf(isColumnRequired, decimal) },
              },
            },
          }
        },
      },
    },
  }
})

const sectionStatus = computed(() => r$.$ready)
const _ = sectionStatus.value // trigger computed getter

sectionsFormStatus.value[props.sectionId] = sectionStatus

onBeforeMount(() => r$.$validate())

onBeforeUnmount(() => {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete sectionsFormStatus.value[props.sectionId]
})
</script>

<template>
  <div
    v-show="props.subjectHasSections"
    class="flex gap-12 items-end justify-center my-5"
  >
    <FormLabel
      v-slot="{ id, handleBlur }"
      label="Section Name"
      :field="r$.name"
    >
      <BaseInputTextWithSelect
        :id="id"
        v-model="r$.$value.name"
        :select-options="props.sectionNamesForSelect"
        label-root-class="grow"
        input-class="h-10 text-[0.95rem]! max-w-64"
        select-class="h-10!"
        label-class="start-1/2! -translate-x-1/2 text-[0.85rem]"
        placeholder="Type/Select section name"
        :on-blur="handleBlur"
      />
    </FormLabel>
    <FormLabel
      v-slot="{ id }"
      label-class="text-center"
      label="No. of Optional Questions"
      :field="r$.numOfOptionalQuestions"
      :hide-errors="true"
    >
      <BaseInputNumber
        :id="id"
        v-model="r$.$value.numOfOptionalQuestions"
        class="w-32"
        :min="0"
        :step="1"
      />
    </FormLabel>
  </div>

  <!-- Section Start -->
  <UiCard
    v-show="props.subjectHasSections"
    class="py-3 max-w-md mx-auto"
  >
    <UiCardHeader>
      <UiCardTitle class="mx-auto text-lg">
        Section Start
        <span class="text-red-500">*</span>
      </UiCardTitle>
      <UiCardDescription class="text-center">
        Specify the section start pattern and location to search in,
        to signal the start of the section of this subject.
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="flex flex-col gap-5">
      <SimplePatternInput
        v-model="r$.$value.pattern"
        :pattern-value-field="r$.pattern.value"
      />
      <UiCard class="pt-2.5 gap-3">
        <UiCardHeader>
          <UiCardTitle class="mx-auto text-base">
            Search In
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="flex flex-col items-center">
          <FormLabel
            label="Pages"
            :field="r$.searchIn.pages"
            class="max-w-48"
          >
            <template #leftToLabel>
              <IconWithTooltip
                icon-class="mr-1"
                icon-size="1rem"
                :content="pagesTooltipContent"
              />
            </template>
            <template #default="{ id, handleBlur }">
              <UiInput
                :id="id"
                v-model="r$.$value.searchIn.pages"
                class="text-center text-base!"
                @blur="handleBlur"
              />
            </template>
          </FormLabel>
          <div class="flex gap-3 mt-3 mb-2 items-center">
            <IconWithTooltip :content="searchInAreaTooltipContent" />
            <span class="text-base font-bold">
              Area Boundaries
            </span>
          </div>
          <SearchArea
            v-model="r$.$value.searchIn.area"
            :fields="r$.searchIn.area"
          />
        </UiCardContent>
      </UiCard>
    </UiCardContent>
  </UiCard>

  <!-- Questions Config -->
  <UiCard
    class="pt-2.5 pb-2 gap-3"
    :class="props.subjectHasSections ? 'mt-5' : 'p-0 border-0 gap-0'"
  >
    <UiCardHeader v-show="props.subjectHasSections">
      <UiCardTitle class="mx-auto text-xl">
        Questions Config
        <span class="text-red-500">*</span>
      </UiCardTitle>
    </UiCardHeader>
    <UiCardContent class="flex flex-col items-center">
      <div class="flex flex-col gap-4 items-center">
        <FormLabel
          label="Pages to search in"
          :field="r$.questions.pages"
          class="w-60"
        >
          <template #leftToLabel>
            <IconWithTooltip
              icon-class="mr-1"
              icon-size="1rem"
              :content="pagesTooltipContent"
            />
          </template>
          <template #default="{ id, handleBlur }">
            <UiInput
              :id="id"
              v-model="r$.$value.questions.pages"
              class="text-center text-base!"
              @blur="handleBlur"
            />
          </template>
        </FormLabel>

        <div class="flex items-end justify-center gap-4">
          <!-- Question Details -->
          <PdfCropperPatternModeQuestionDetails
            v-model="r$.questions.details.$value"
            :fields="r$.questions.details"
          />

          <div class="flex flex-col items-center gap-4">
            <div class="flex gap-4">
              <UiCard class="pt-2.5 gap-5">
                <UiCardHeader class="px-2">
                  <UiCardTitle class="flex items-center text-base mx-auto text-nowrap gap-2">
                    <IconWithTooltip
                      :content="obtainedQuestionNumberTooltipContent"
                    />
                    <span class="font-bold">
                      Obtained Question Number
                    </span>
                  </UiCardTitle>
                </UiCardHeader>
                <UiCardContent class="flex flex-col items-center gap-4 w-70">
                  <div class="flex gap-2 flex-row-reverse items-center text-nowrap">
                    <BaseLabelWithId
                      v-slot="{ id }"
                      label="When Duplicate:"
                    >
                      <BaseSelect
                        :id="id"
                        v-model="r$.questions.obtainedQuestionNum.$value.whenDuplicate"
                        :options="PATTERN_MODE.obtainedQNum"
                      />
                    </BaseLabelWithId>
                  </div>
                  <div class="flex gap-3 items-center *:hover:cursor-pointer">
                    <BaseLabelWithId
                      v-slot="{ id }"
                      label="Next Q. Num Must Be One Num Greater than current"
                      class="text-sm"
                    >
                      <UiCheckbox
                        :id="id"
                        v-model="r$.questions.obtainedQuestionNum.$value.nextQNumMustBeOneNumGreater"
                      />
                    </BaseLabelWithId>
                  </div>
                </UiCardContent>
              </UiCard>
              <UiCard class="pt-2.5 gap-3">
                <UiCardHeader>
                  <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                    <span class="text-base font-bold text-nowrap">
                      Merge Split Questions
                    </span>
                    <UiSwitch
                      v-model="r$.questions.mergeQuestions.$value.required"
                      class="ml-2"
                    />
                  </UiCardTitle>
                </UiCardHeader>
                <UiCardContent class="flex flex-col items-center gap-5 w-70">
                  <FormLabel
                    label="When Split By"
                    :field="r$.questions.mergeQuestions.splitBy"
                  >
                    <UiCheckboxGroupRoot
                      v-model="r$.questions.mergeQuestions.$value.splitBy"
                      class="grid grid-cols-2 gap-4 mt-2"
                    >
                      <div
                        v-for="option in PATTERN_MODE.splitBy"
                        :key="option"
                        class="flex gap-1.5 items-center *:hover:cursor-pointer"
                      >
                        <BaseLabelWithId
                          v-slot="{ id }"
                          :label="utilKeyToLabel(option)"
                        >
                          <UiCheckbox
                            :id="id"
                            :value="option"
                            :disabled="!r$.questions.mergeQuestions.$value.required"
                          />
                        </BaseLabelWithId>
                      </div>
                    </UiCheckboxGroupRoot>
                  </FormLabel>

                  <FormLabel
                    label="Merge Only If Contains Any Of"
                    :field="r$.questions.mergeQuestions.mergeOnlyIfContainsAny"
                  >
                    <UiCheckboxGroupRoot
                      v-model="r$.questions.mergeQuestions.$value.mergeOnlyIfContainsAny"
                      class="grid grid-cols-3 gap-4 mt-2"
                    >
                      <div
                        v-for="option in PATTERN_MODE.pdfElems"
                        :key="option"
                        class="flex gap-1.5 items-center *:hover:cursor-pointer"
                      >
                        <BaseLabelWithId
                          v-slot="{ id }"
                          :label="utilKeyToLabel(option)"
                        >
                          <UiCheckbox
                            :id="id"
                            :value="option"
                            :disabled="!r$.questions.mergeQuestions.$value.required"
                          />
                        </BaseLabelWithId>
                      </div>
                    </UiCheckboxGroupRoot>
                  </FormLabel>
                </UiCardContent>
              </UiCard>
            </div>
            <div class="flex gap-4">
              <UiCard class="pt-2.5 gap-3">
                <UiCardHeader class="px-3">
                  <UiCardTitle class="flex items-center mx-auto text-base gap-4">
                    <IconWithTooltip
                      :content="forTopCoordinateLookupTooltipContent"
                    />
                    <span class="text-base font-bold text-center text-nowrap">
                      For Top Coordinate<br>
                      Look Up
                    </span>
                    <UiSwitch
                      v-model="r$.questions.forTopCoordinateLookUp.$value.required"
                      class="ml-2"
                    />
                  </UiCardTitle>
                </UiCardHeader>
                <UiCardContent class="flex flex-col items-center gap-2 w-70">
                  <div class="grid grid-cols-2 gap-3">
                    <FormLabel
                      v-slot="{ id }"
                      label="By"
                      :field="r$.questions.forTopCoordinateLookUp.by"
                    >
                      <BaseInputNumber
                        :id="id"
                        v-model="r$.questions.forTopCoordinateLookUp.$value.by"
                        :min="1"
                        :step="1"
                        :disabled="!r$.questions.forTopCoordinateLookUp.$value.required"
                      />
                    </FormLabel>
                    <FormLabel
                      v-slot="{ id }"
                      label="Chain By"
                      :field="r$.questions.forTopCoordinateLookUp.chainBy"
                    >
                      <BaseInputNumber
                        :id="id"
                        v-model="r$.questions.forTopCoordinateLookUp.$value.chainBy"
                        :min="0"
                        :step="1"
                        :disabled="!r$.questions.forTopCoordinateLookUp.$value.required"
                      />
                    </FormLabel>
                  </div>
                  <div class="flex flex-col gap-3.5 items-center">
                    <FormLabel
                      label="For"
                      :field="r$.questions.forTopCoordinateLookUp.for"
                    />
                    <UiCheckboxGroupRoot
                      v-model="r$.questions.forTopCoordinateLookUp.$value.for"
                      class="flex flex-row gap-5"
                    >
                      <div
                        v-for="option in PATTERN_MODE.pdfElems"
                        :key="option"
                        class="flex gap-1.5 items-center w-fit *:hover:cursor-pointer"
                      >
                        <BaseLabelWithId
                          v-slot="{ id }"
                          :label="utilKeyToLabel(option)"
                        >
                          <UiCheckbox
                            :id="id"
                            :value="option"
                            :disabled="!r$.questions.forTopCoordinateLookUp.$value.required"
                          />
                        </BaseLabelWithId>
                      </div>
                    </UiCheckboxGroupRoot>
                  </div>
                </UiCardContent>
              </UiCard>

              <UiCard class="pt-2.5 gap-5">
                <UiCardHeader>
                  <UiCardTitle class="flex items-center text-base mx-auto text-nowrap gap-5">
                    <IconWithTooltip
                      :content="forBottomCoordinateUseBottomTooltipContent"
                    />
                    <span class="font-bold text-center">
                      For Bottom Coordinate <br>
                      Use Bottom
                    </span>
                  </UiCardTitle>
                </UiCardHeader>
                <UiCardContent class="flex flex-col items-center gap-3 w-70">
                  <UiCheckboxGroupRoot
                    v-model="r$.questions.forBottomCoordinateUseBottom.$value.value"
                    class="grid grid-cols-1 gap-6"
                  >
                    <div
                      v-for="option in PATTERN_MODE.pdfElems"
                      :key="option"
                      class="flex gap-1.5 items-center *:hover:cursor-pointer"
                    >
                      <BaseLabelWithId
                        v-slot="{ id }"
                        :label="utilKeyToLabel(option)"
                      >
                        <UiCheckbox
                          :id="id"
                          :value="option"
                        />
                      </BaseLabelWithId>
                    </div>
                  </UiCheckboxGroupRoot>
                </UiCardContent>
              </UiCard>
            </div>
          </div>
        </div>
      </div>

      <UiCard class="py-3 gap-2 mt-6">
        <UiCardHeader>
          <UiCardTitle class="flex items-center mx-auto text-base gap-3">
            <IconWithTooltip
              :content="paragraphQuestionsTooltipContent"
            />
            <span class="font-bold text-center">
              Paragraph Questions
            </span>
            <UiSwitch
              v-model="r$.questions.paragraphQuestions.start.$value.required"
              class="ml-2"
            />
          </UiCardTitle>
        </UiCardHeader>

        <UiCardContent class="flex flex-col items-center gap-4">
          <div class="grid grid-cols-2 gap-5 justify-center w-full">
            <UiCard class="py-3 gap-2 w-full">
              <UiCardHeader>
                <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                  <IconWithTooltip
                    :content="paraCommonPartStartTooltipContent"
                  />
                  <span class="font-bold text-center">
                    Common Part Start
                  </span>
                </UiCardTitle>
              </UiCardHeader>
              <UiCardContent class="flex flex-col items-center gap-4">
                <SimplePatternInput
                  v-model="r$.questions.paragraphQuestions.start.$value.pattern"
                  :pattern-value-field="r$.questions.paragraphQuestions.start.pattern.value"
                  :disabled="!r$.questions.paragraphQuestions.start.$value.required"
                />
                <div class="flex flex-col gap-2">
                  <div class="flex gap-3 mt-3 mb-2 items-center mx-auto">
                    <IconWithTooltip :content="searchInAreaTooltipContent" />
                    <span class="text-base font-bold">
                      Search In (Area Boundaries)
                    </span>
                  </div>
                  <SearchArea
                    v-model="r$.questions.paragraphQuestions.start.$value.searchIn"
                    :fields="r$.questions.paragraphQuestions.start.searchIn"
                    :disabled="!r$.questions.paragraphQuestions.start.$value.required"
                  />
                </div>
              </UiCardContent>
            </UiCard>
            <UiCard class="py-3 gap-2">
              <UiCardHeader>
                <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                  <IconWithTooltip
                    :content="paraCommonPartEndTooltipContent"
                  />
                  <span class="font-bold text-center">
                    Common Part End
                  </span>
                  <UiSwitch
                    v-model="r$.questions.paragraphQuestions.end.$value.required"
                    :disabled="!r$.questions.paragraphQuestions.start.$value.required"
                    class="ml-2"
                  />
                </UiCardTitle>
              </UiCardHeader>
              <UiCardContent class="flex flex-col items-center gap-5">
                <SimplePatternInput
                  v-model="r$.questions.paragraphQuestions.end.$value.pattern"
                  :pattern-value-field="r$.questions.paragraphQuestions.end.pattern.value"
                  :disabled="!r$.questions.paragraphQuestions.end.$value.required
                    || !r$.questions.paragraphQuestions.start.$value.required"
                />
                <div class="flex flex-col gap-2">
                  <div class="flex gap-3 mt-3 mb-2 items-center mx-auto">
                    <IconWithTooltip :content="searchInAreaTooltipContent" />
                    <span class="text-base font-bold">
                      Search In (Area Boundaries)
                    </span>
                  </div>
                  <SearchArea
                    v-model="r$.questions.paragraphQuestions.end.$value.searchIn"
                    :fields="r$.questions.paragraphQuestions.end.searchIn"
                    :disabled="!r$.questions.paragraphQuestions.end.$value.required
                      || !r$.questions.paragraphQuestions.start.$value.required"
                  />
                </div>
              </UiCardContent>
            </UiCard>
          </div>
          <UiCard class="py-3 gap-2">
            <UiCardHeader>
              <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                <IconWithTooltip
                  :content="cropTooltipContent"
                />
                <span class="font-bold text-center">
                  Crop
                </span>
              </UiCardTitle>
            </UiCardHeader>
            <UiCardContent class="flex flex-row gap-8">
              <div class="flex flex-col gap-8 items-center justify-center">
                <UiCard class="py-3 gap-2 max-w-xs">
                  <UiCardHeader>
                    <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                      <IconWithTooltip
                        :content="paraCommonPartCropExactlyToTooltipContent"
                      />
                      <span class="font-bold text-center">
                        Exactly To
                      </span>
                    </UiCardTitle>
                  </UiCardHeader>
                  <UiCardContent class="flex flex-row gap-5 justify-center">
                    <div
                      class="grid grid-cols-2 gap-3 space-y-2"
                    >
                      <FormLabel
                        v-slot="{ id }"
                        label="Left"
                        :field="r$.questions.paragraphQuestions.crop.exactlyTo.l"
                      >
                        <UiInput
                          :id="id"
                          v-model="r$.questions.paragraphQuestions.crop.exactlyTo.$value.l"
                          class="text-center max-w-28"
                          :disabled="!r$.questions.paragraphQuestions.start.$value.required"
                        />
                      </FormLabel>
                      <FormLabel
                        v-slot="{ id }"
                        label="Right"
                        :field="r$.questions.paragraphQuestions.crop.exactlyTo.r"
                      >
                        <UiInput
                          :id="id"
                          v-model="r$.questions.paragraphQuestions.crop.exactlyTo.$value.r"
                          class="text-center max-w-28"
                          :disabled="!r$.questions.paragraphQuestions.start.$value.required"
                        />
                      </FormLabel>
                    </div>
                  </UiCardContent>
                </UiCard>
              </div>
              <UiCard class="py-3 gap-4 max-w-xs">
                <UiCardHeader>
                  <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                    <IconWithTooltip
                      :content="cropOffsetByTooltipContent"
                    />
                    <span class="font-bold text-center">
                      Offset By
                    </span>
                  </UiCardTitle>
                </UiCardHeader>
                <UiCardContent class="grid grid-cols-2 items-center gap-6 w-76">
                  <BaseFloatLabel
                    v-for="(label, key) in AREA_BOUNDARY_NAMES"
                    :key="key"
                    v-slot="{ id }"
                    class="w-32"
                    :label="label"
                    label-class="start-1/2! -translate-x-1/2 text-xs"
                  >
                    <BaseInputNumber
                      :id="id"
                      v-model="r$.questions.paragraphQuestions.crop.offsetBy.$value[key]"
                      :format-options="{ signDisplay: 'exceptZero' }"
                      :disabled="!r$.questions.paragraphQuestions.start.$value.required"
                    />
                  </BaseFloatLabel>
                </UiCardContent>
              </UiCard>
            </UiCardContent>
          </UiCard>
        </UiCardContent>
      </UiCard>

      <UiCard class="pt-2.5 pb-2 gap-3 w-full mt-6">
        <UiCardHeader>
          <UiCardTitle class="flex items-center mx-auto text-base gap-3">
            <IconWithTooltip
              :content="columnsTooltipContent"
            />
            <span class="font-bold text-center">
              Columns
            </span>
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="flex flex-col items-center gap-10">
          <UiCard
            v-for="(column, idx) in r$.questions.columns.$each"
            v-show="!column.$value.isRemoved"
            :key="idx"
            class="py-3 gap-2 w-full"
          >
            <UiCardHeader>
              <UiCardTitle class="mx-auto text-base">
                Column {{ idx + 1 }}
              </UiCardTitle>
              <UiCardDescription class="text-center">
                Specify the questions start and end details for questions in this column.
              </UiCardDescription>
            </UiCardHeader>
            <UiCardContent class="flex flex-col items-center gap-4">
              <div class="grid grid-cols-2 gap-5 justify-center w-full">
                <UiCard class="py-3 gap-2 w-full">
                  <UiCardHeader>
                    <UiCardTitle class="mx-auto text-base">
                      Questions Start
                    </UiCardTitle>
                    <UiCardDescription class="text-center">
                      Specify the questions start pattern and location to search in.
                    </UiCardDescription>
                  </UiCardHeader>
                  <UiCardContent class="flex flex-col items-center gap-4">
                    <QuestionsStartPatternInput
                      v-model="column.start.$value.pattern"
                      :fields="column.start.pattern"
                    >
                      <template #infoTooltip>
                        <IconWithTooltip
                          :content="questionsStartPatternTooltipContent"
                        />
                      </template>
                    </QuestionsStartPatternInput>
                    <div class="flex flex-col gap-2">
                      <div class="flex gap-3 mt-3 mb-2 items-center mx-auto">
                        <IconWithTooltip :content="searchInAreaTooltipContent" />
                        <span class="text-base font-bold">
                          Search In (Area Boundaries)
                        </span>
                      </div>
                      <SearchArea
                        v-model="column.start.$value.searchIn"
                        :fields="column.start.searchIn"
                      />
                    </div>
                  </UiCardContent>
                </UiCard>
                <UiCard class="py-3 gap-2">
                  <UiCardHeader>
                    <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                      <IconWithTooltip
                        :content="questionsEndTooltipContent"
                      />
                      <span class="text-base font-bold text-center">
                        Questions End
                      </span>
                      <UiSwitch
                        v-model="column.end.$value.required"
                        class="ml-2"
                      />
                    </UiCardTitle>
                    <UiCardDescription class="text-center">
                      [Optional] Specify the questions end pattern and location to search in.
                    </UiCardDescription>
                  </UiCardHeader>
                  <UiCardContent class="flex flex-col items-center gap-4 pt-5">
                    <SimplePatternInput
                      v-model="column.end.$value.pattern"
                      :pattern-value-field="column.end.pattern.value"
                      :disabled="!column.end.$value.required"
                    />
                    <div class="flex flex-col gap-2">
                      <div class="flex gap-3 mt-3 mb-2 items-center mx-auto">
                        <IconWithTooltip :content="searchInAreaTooltipContent" />
                        <span class="text-base font-bold">
                          Search In (Area Boundaries)
                        </span>
                      </div>
                      <SearchArea
                        v-model="column.end.$value.searchIn"
                        :fields="column.end.searchIn"
                        :disabled="!column.end.$value.required"
                      />
                    </div>
                  </UiCardContent>
                </UiCard>
              </div>
              <UiCard class="py-3 gap-2">
                <UiCardHeader>
                  <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                    <IconWithTooltip
                      :content="cropTooltipContent"
                    />
                    <span class="font-bold text-center">
                      Crop
                    </span>
                  </UiCardTitle>
                </UiCardHeader>
                <UiCardContent class="flex flex-row gap-8">
                  <div class="flex flex-col gap-8 items-center justify-center">
                    <UiCard class="py-3 gap-2 max-w-xs">
                      <UiCardHeader>
                        <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                          <IconWithTooltip
                            :content="questionsCropWithinTooltipContent"
                          />
                          <span class="font-bold text-center">
                            Within
                          </span>
                        </UiCardTitle>
                      </UiCardHeader>
                      <UiCardContent class="flex flex-row gap-5 justify-center">
                        <div
                          class="grid grid-cols-2 gap-3 space-y-2"
                        >
                          <FormLabel
                            v-slot="{ id }"
                            label="Top"
                            :field="column.crop.within.t"
                          >
                            <UiInput
                              :id="id"
                              v-model="column.crop.within.$value.t"
                              class="text-center max-w-32"
                            />
                          </FormLabel>
                          <FormLabel
                            v-slot="{ id }"
                            label="Bottom"
                            :field="column.crop.within.b"
                          >
                            <UiInput
                              :id="id"
                              v-model="column.crop.within.$value.b"
                              class="text-center max-w-32"
                            />
                          </FormLabel>
                        </div>
                      </UiCardContent>
                    </UiCard>
                    <UiCard class="py-3 gap-2 max-w-xs">
                      <UiCardHeader>
                        <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                          <IconWithTooltip
                            :content="questionsCropExactlyToTooltipContent"
                          />
                          <span class="font-bold text-center">
                            Exactly To
                          </span>
                        </UiCardTitle>
                      </UiCardHeader>
                      <UiCardContent class="flex flex-row gap-5 justify-center">
                        <div
                          class="grid grid-cols-2 gap-3 space-y-2"
                        >
                          <FormLabel
                            v-slot="{ id }"
                            label="Left"
                            :field="column.crop.exactlyTo.l"
                          >
                            <UiInput
                              :id="id"
                              v-model="column.crop.exactlyTo.$value.l"
                              class="text-center max-w-32"
                            />
                          </FormLabel>
                          <FormLabel
                            v-slot="{ id }"
                            label="Right"
                            :field="column.crop.exactlyTo.r"
                          >
                            <UiInput
                              :id="id"
                              v-model="column.crop.exactlyTo.$value.r"
                              class="text-center max-w-32"
                            />
                          </FormLabel>
                        </div>
                      </UiCardContent>
                    </UiCard>
                  </div>
                  <UiCard class="py-3 gap-4 max-w-xs">
                    <UiCardHeader>
                      <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                        <IconWithTooltip
                          :content="cropOffsetByTooltipContent"
                        />
                        <span class="font-bold text-center">
                          Offset By
                        </span>
                      </UiCardTitle>
                    </UiCardHeader>
                    <UiCardContent class="flex flex-col items-center gap-6 w-64">
                      <BaseFloatLabel
                        v-for="(label, key) in AREA_BOUNDARY_NAMES"
                        :key="key"
                        v-slot="{ id }"
                        class="w-32"
                        :label="label"
                        label-class="start-1/2! -translate-x-1/2 text-xs"
                      >
                        <BaseInputNumber
                          :id="id"
                          v-model="column.crop.offsetBy.$value[key]"
                          :format-options="{ signDisplay: 'exceptZero' }"
                        />
                      </BaseFloatLabel>
                    </UiCardContent>
                  </UiCard>
                </UiCardContent>
              </UiCard>
            </UiCardContent>
          </UiCard>
        </UiCardContent>
      </UiCard>
    </UiCardContent>
  </UiCard>
</template>
