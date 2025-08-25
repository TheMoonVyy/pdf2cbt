<script setup lang="ts">
import type {
  PatternModeFormSectionData,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/json-config-to-form-data'
import { pagesTooltipContent, subjectEndTooltipContent } from '../tooltipContents'
import SearchArea from './SearchArea.vue'
import SimplePatternInput from './SimplePatternInput.vue'
import {
  SUBJECTS,
  PATTERN_MODE,
  AREA_BOUNDARY_NAMES,
} from '#layers/shared/shared/constants'

const props = defineProps<{
  subjectIdx: number
}>()

const { r$, form } = usePatternModeFormStore()

const subject = r$.subjects.$each[props.subjectIdx]!

const NEW_SECTION_TAB = 'new-section-tab'

const currentSelectedState = shallowReactive({
  tabIndex: 0,
})

function togglePatternType(obj: { type: PatternModeFormSectionData['pattern']['type'] }) {
  if (obj.type === 'text')
    obj.type = 'regex'
  else
    obj.type = 'text'
}
</script>

<template>
  <div class="space-y-2 w-dvw">
    <form @submit.prevent.stop="() => console.log(form)">
      <UiCard class="py-3 gap-4">
        <UiCardHeader>
          <UiCardTitle class="mx-auto text-xl">
            Subject Config
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <div class="flex gap-8 items-center justify-center px-4 pb-4">
            <FormLabel
              v-slot="{ id, handleBlur }"
              label="Subject Name"
              :field="subject.name"
            >
              <UiInput
                :id="id"
                v-model="subject.$value.name"
                class="text-center"
                @blur="handleBlur"
              />
            </FormLabel>
            <FormLabel
              v-slot="{ id, handleBlur }"
              label="Column Dividers"
              :field="subject.columnDividers"
            >
              <UiInput
                :id="id"
                v-model="subject.$value.columnDividers"
                class="text-center"
                @blur="handleBlur"
              />
            </FormLabel>
            <div class="flex gap-3 items-center">
              <UiLabel for="subject-has-sections-switch">
                Subject Has Sections
              </UiLabel>
              <UiSwitch
                id="subject-has-sections-switch"
                v-model="subject.$value.subjectHasSections"
              />
            </div>
          </div>
          <div class="flex justify-center gap-8">
            <!-- Subject Start Card -->

            <UiCard class="py-3">
              <UiCardHeader>
                <UiCardTitle class="mx-auto text-lg">
                  Subject Start
                  <span class="text-red-500">*</span>
                </UiCardTitle>
                <UiCardDescription>
                  Specify the pattern to find the start of the subject
                  and locations to search in
                </UiCardDescription>
              </UiCardHeader>
              <UiCardContent class="flex flex-col gap-5">
                <SimplePatternInput
                  v-model="subject.start.$value.pattern"
                  :pattern-value-field="subject.start.pattern.value"
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
                      :field="subject.start.searchIn.pages"
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
                          v-model="subject.$value.start.searchIn.pages"
                          class="text-center text-base!"
                          @blur="handleBlur"
                        />
                      </template>
                    </FormLabel>
                    <span class="text-base font-bold mt-3 mb-2">
                      Area Boundaries
                    </span>
                    <SearchArea
                      v-model="subject.$value.start.searchIn.area"
                      :fields="subject.start.searchIn.area"
                    />
                  </UiCardContent>
                </UiCard>
              </UiCardContent>
            </UiCard>

            <!-- Subject End Card -->

            <UiCard class="py-3">
              <UiCardHeader>
                <UiCardTitle class="flex items-center mx-auto text-lg gap-4">
                  <IconWithTooltip
                    :content="subjectEndTooltipContent"
                  />
                  <span class="text-lg font-bold">
                    Subject End (Optional)
                  </span>
                  <UiSwitch
                    v-model="subject.$value.end.required"
                    class="ml-2"
                  />
                </UiCardTitle>
                <UiCardDescription>
                  Specify the pattern and location to search in, to signal the end of the subject.<br>
                </UiCardDescription>
              </UiCardHeader>
              <UiCardContent class="flex flex-col gap-5">
                <SimplePatternInput
                  v-model="subject.end.$value.pattern"
                  :pattern-value-field="subject.end.pattern.value"
                  :disabled="!subject.$value.end.required"
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
                      :field="subject.end.searchIn.pages"
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
                          v-model="subject.$value.end.searchIn.pages"
                          class="text-center text-base!"
                          :disabled="!subject.$value.end.required"
                          @blur="handleBlur"
                        />
                      </template>
                    </FormLabel>
                    <span class="text-base font-bold mt-3 mb-2">
                      Area Boundaries
                    </span>
                    <SearchArea
                      v-model="subject.$value.end.searchIn.area"
                      :fields="subject.end.searchIn.area"
                      :disabled="!subject.$value.end.required"
                    />
                  </UiCardContent>
                </UiCard>
              </UiCardContent>
            </UiCard>
          </div>

          <!-- Sections -->
          <UiCard class="py-3">
            <UiCardHeader>
              <UiCardTitle class="mx-auto text-lg">
                {{ subject.$value.subjectHasSections ? "Sections" : "Questions" }} Config
                <span class="text-red-500">*</span>
              </UiCardTitle>
            </UiCardHeader>
            <UiCardContent class="flex flex-col gap-5">
              <UiTabs
                v-model="currentSelectedState.tabIndex"
              >
                <UiScrollArea
                  v-show="subject.$value.subjectHasSections"
                  class="w-full border"
                >
                  <BaseTabsListWithIndicator class="flex flex-nowrap gap-x-2 px-6 max-w-max">
                    <BaseTabsTriggerWithIndicator
                      v-for="(section, idx) in subject.sections.$each"
                      :key="section.$id"
                      :value="idx"
                      class="cursor-pointer p-2.5 text-base"
                    >
                      {{ section.$value.name }}
                    </BaseTabsTriggerWithIndicator>
                    <BaseTabsTriggerWithIndicator
                      :value="NEW_SECTION_TAB"
                      class="cursor-pointer p-2.5 text-base"
                    >
                      New Section
                    </BaseTabsTriggerWithIndicator>
                  </BaseTabsListWithIndicator>
                  <UiScrollBar orientation="horizontal" />
                </UiScrollArea>
                <UiTabsContent
                  v-for="(section, idx) in subject.sections.$each"
                  :key="section.$id"
                  :value="idx"
                >
                  <div
                    v-show="subject.$value.subjectHasSections"
                    class="flex gap-8 items-center justify-center my-5"
                  >
                    <FormLabel
                      v-slot="{ id, handleBlur }"
                      label="Section Name"
                      :field="section.name"
                    >
                      <UiInput
                        :id="id"
                        v-model="section.$value.name"
                        class="text-center"
                        @blur="handleBlur"
                      />
                    </FormLabel>
                    <SimplePatternInput
                      v-model="section.$value.pattern"
                      :pattern-value-field="section.pattern.value"
                    />
                    <FormLabel
                      v-slot="{ id }"
                      label="No. of Optional Questions"
                      :field="section.numOfOptionalQuestions"
                      :hide-errors="true"
                    >
                      <BaseInputNumber
                        :id="id"
                        v-model="section.$value.numOfOptionalQuestions"
                        :min="0"
                        :step="1"
                      />
                    </FormLabel>
                  </div>
                  <UiCard
                    v-show="subject.$value.subjectHasSections"
                    class="pt-2.5 gap-3"
                  >
                    <UiCardHeader>
                      <UiCardTitle class="mx-auto text-base">
                        Search In
                      </UiCardTitle>
                    </UiCardHeader>
                    <UiCardContent class="flex items-center justify-center gap-10">
                      <FormLabel
                        label="Pages"
                        :field="section.searchIn.pages"
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
                            v-model="section.$value.searchIn.pages"
                            class="text-center text-base!"
                            @blur="handleBlur"
                          />
                        </template>
                      </FormLabel>
                      <div class="flex flex-col gap-2">
                        <span class="text-base font-bold mx-auto">
                          Area Boundaries
                        </span>
                        <SearchArea
                          v-model="section.$value.searchIn.area"
                          :fields="section.searchIn.area"
                          class="grid-cols-4"
                        />
                      </div>
                    </UiCardContent>
                  </UiCard>
                  <UiCard
                    class="pt-2.5 gap-3"
                  >
                    <UiCardHeader>
                      <UiCardTitle class="mx-auto text-base">
                        Questions Config
                      </UiCardTitle>
                    </UiCardHeader>
                    <UiCardContent class="flex flex-col items-center pb-20">
                      <div class="flex items-center justify-center gap-10">
                        <div class="flex flex-col gap-8 items-center">
                          <FormLabel
                            label="Pages to search in"
                            :field="section.questions.pages"
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
                                v-model="section.$value.questions.pages"
                                class="text-center text-base!"
                                @blur="handleBlur"
                              />
                            </template>
                          </FormLabel>

                          <!-- Question Details -->

                          <PdfCropperPatternModeQuestionDetails
                            v-model="section.questions.details.$value"
                            :fields="section.questions.details"
                          />
                        </div>
                        <div class="flex flex-col items-center gap-5">
                          <UiCard class="pt-2.5 gap-3">
                            <UiCardHeader>
                              <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                                <span class="text-base font-bold text-center">
                                  For Top Coordinate<br>
                                  Look Up
                                </span>
                                <UiSwitch
                                  v-model="section.questions.forTopCoordinateLookUp.$value.required"
                                  class="ml-2"
                                />
                              </UiCardTitle>
                            </UiCardHeader>
                            <UiCardContent class="flex flex-col items-center gap-3 w-70">
                              <div class="grid grid-cols-2 gap-3">
                                <FormLabel
                                  v-slot="{ id }"
                                  label="By"
                                  :field="section.questions.forTopCoordinateLookUp.by"
                                >
                                  <BaseInputNumber
                                    :id="id"
                                    v-model="section.questions.forTopCoordinateLookUp.$value.by"
                                    :min="1"
                                    :step="1"
                                    :disabled="!section.questions.forTopCoordinateLookUp.$value.required"
                                  />
                                </FormLabel>
                                <FormLabel
                                  v-slot="{ id }"
                                  label="Chain By"
                                  :field="section.questions.forTopCoordinateLookUp.chainBy"
                                >
                                  <BaseInputNumber
                                    :id="id"
                                    v-model="section.questions.forTopCoordinateLookUp.$value.chainBy"
                                    :min="0"
                                    :step="1"
                                    :disabled="!section.questions.forTopCoordinateLookUp.$value.required"
                                  />
                                </FormLabel>
                              </div>
                              <div class="flex flex-col gap-2 items-center">
                                <FormLabel
                                  label="For"
                                  :field="section.questions.forTopCoordinateLookUp.for"
                                />
                                <UiCheckboxGroupRoot
                                  v-model="section.questions.forTopCoordinateLookUp.$value.for"
                                  class="grid grid-cols-3 gap-4"
                                >
                                  <div
                                    v-for="option in (['line', 'image', 'vector'] as const)"
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
                                        :disabled="!section.questions.forTopCoordinateLookUp.$value.required"
                                      />
                                    </BaseLabelWithId>
                                  </div>
                                </UiCheckboxGroupRoot>
                              </div>
                            </UiCardContent>
                          </UiCard>

                          <UiCard class="pt-2.5 gap-3">
                            <UiCardHeader>
                              <UiCardTitle class="mx-auto text-base text-center">
                                For Bottom Coordinate <br>
                                Use Bottom
                              </UiCardTitle>
                            </UiCardHeader>
                            <UiCardContent class="flex flex-col items-center gap-3 w-70">
                              <UiCheckboxGroupRoot
                                v-model="section.questions.forBottomCoordinateUseBottom.$value.value"
                                class="grid grid-cols-3 gap-4"
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

                          <UiCard class="pt-2.5 gap-3">
                            <UiCardHeader>
                              <UiCardTitle class="mx-auto text-base text-nowrap">
                                Obtained Question Number
                              </UiCardTitle>
                            </UiCardHeader>
                            <UiCardContent class="flex flex-col items-center gap-3 w-70">
                              <div class="flex gap-2 flex-row-reverse items-center text-nowrap">
                                <BaseLabelWithId
                                  v-slot="{ id }"
                                  label="When Duplicate:"
                                >
                                  <BaseSelect
                                    :id="id"
                                    v-model="section.questions.obtainedQuestionNum.$value.whenDuplicate"
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
                                    v-model="section.questions.obtainedQuestionNum.$value.nextQNumMustBeOneNumGreater"
                                  />
                                </BaseLabelWithId>
                              </div>
                            </UiCardContent>
                          </UiCard>
                        </div>
                        <div class="flex flex-col items-center gap-2.5">
                          <UiCard class="pt-2.5 gap-3">
                            <UiCardHeader>
                              <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                                <span class="text-base font-bold text-nowrap">
                                  Merge Split Questions
                                </span>
                                <UiSwitch
                                  v-model="section.questions.mergeQuestions.$value.required"
                                  class="ml-2"
                                />
                              </UiCardTitle>
                            </UiCardHeader>
                            <UiCardContent class="flex flex-col items-center gap-5 w-70">
                              <FormLabel
                                label="When Split By"
                                :field="section.questions.mergeQuestions.splitBy"
                              >
                                <UiCheckboxGroupRoot
                                  v-model="section.questions.mergeQuestions.$value.splitBy"
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
                                        :disabled="!section.questions.mergeQuestions.$value.required"
                                      />
                                    </BaseLabelWithId>
                                  </div>
                                </UiCheckboxGroupRoot>
                              </FormLabel>

                              <FormLabel
                                label="Merge Only If Contains Any Of"
                                :field="section.questions.mergeQuestions.mergeOnlyIfContainsAny"
                              >
                                <UiCheckboxGroupRoot
                                  v-model="section.questions.mergeQuestions.$value.mergeOnlyIfContainsAny"
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
                                        :disabled="!section.questions.mergeQuestions.$value.required"
                                      />
                                    </BaseLabelWithId>
                                  </div>
                                </UiCheckboxGroupRoot>
                              </FormLabel>
                            </UiCardContent>
                          </UiCard>
                          <UiCard class="py-3 gap-2">
                            <UiCardHeader>
                              <UiCardTitle class="flex items-center mx-auto text-base gap-3">
                                <span class="text-base font-bold text-center">
                                  Paragraph Questions<br>
                                  Common Part
                                </span>
                                <UiSwitch
                                  v-model="section.questions.paragraphQuestionsCommonPart.$value.required"
                                  class="ml-2"
                                />
                              </UiCardTitle>
                            </UiCardHeader>
                            <UiCardContent class="flex flex-col items-center gap-4 w-70">
                              <SimplePatternInput
                                v-model="section.questions.paragraphQuestionsCommonPart.$value.pattern"
                                :pattern-value-field="section.questions.paragraphQuestionsCommonPart.pattern.value"
                                :disabled="!section.questions.paragraphQuestionsCommonPart.$value.required"
                              />
                              <div class="flex flex-col gap-2">
                                <span class="text-base font-bold mx-auto">
                                  Search In (Area Boundaries)
                                </span>
                                <SearchArea
                                  v-model="section.questions.paragraphQuestionsCommonPart.$value.searchIn"
                                  :fields="section.questions.paragraphQuestionsCommonPart.searchIn"
                                  :disabled="!section.questions.paragraphQuestionsCommonPart.$value.required"
                                />
                              </div>
                            </UiCardContent>
                          </UiCard>
                        </div>
                      </div>
                      <UiCard
                        class="pt-2.5 gap-3"
                      >
                        <UiCardHeader>
                          <UiCardTitle class="mx-auto text-base">
                            Columns
                          </UiCardTitle>
                        </UiCardHeader>
                        <UiCardContent class="flex flex-col items-center gap-10 pb-20">
                          <UiCard
                            v-for="(column, columnIdx) in section.questions.columns.$each"
                            :key="column.$id"
                            class="py-3 gap-2"
                          >
                            <UiCardHeader>
                              <UiCardTitle class="mx-auto text-base">
                                Column {{ columnIdx + 1 }}
                              </UiCardTitle>
                            </UiCardHeader>
                            <UiCardContent class="flex flex-col items-center gap-4">
                              <div class="flex gap-5 justify-center">
                                <UiCard class="py-3 gap-2">
                                  <UiCardHeader>
                                    <UiCardTitle class="mx-auto text-base">
                                      Questions Start
                                    </UiCardTitle>
                                  </UiCardHeader>
                                  <UiCardContent class="flex flex-col items-center gap-4 w-70">
                                    <div class="flex items-end justify-center">
                                      <BaseButton
                                        class="rounded-r-none"
                                        variant="outline"
                                        size="icon"
                                        :icon-name="section.questions.paragraphQuestionsCommonPart.$value.pattern.type === 'regex'
                                          ? 'material-symbols:regular-expression'
                                          : 'my-icon:txt'"
                                        title="Toggle pattern type"
                                        icon-size="1.6rem"
                                        icon-class="text-green-400"
                                        :disabled="!section.questions.paragraphQuestionsCommonPart.$value.required"
                                        @click="togglePatternType(section.questions.paragraphQuestionsCommonPart.$value.pattern)"
                                      />
                                      <FormLabel
                                        v-slot="{ id, handleBlur }"
                                        :label="`${utilKeyToLabel(section.questions.paragraphQuestionsCommonPart.$value.pattern.type)} Pattern`"
                                        :field="section.questions.paragraphQuestionsCommonPart.pattern.value"
                                      >
                                        <UiInput
                                          :id="id"
                                          v-model="section.questions.paragraphQuestionsCommonPart.$value.pattern.value"
                                          class="rounded-l-none rounded-r-none"
                                          :disabled="!section.questions.paragraphQuestionsCommonPart.$value.required"
                                          @blur="handleBlur"
                                        />
                                      </FormLabel>
                                      <BaseButton
                                        class="rounded-l-none"
                                        variant="outline"
                                        size="icon"
                                        icon-name="material-symbols:match-case-rounded"
                                        title="Toggle case sensitivity"
                                        :icon-class="section.questions.paragraphQuestionsCommonPart.$value.pattern.isCaseSensitive
                                          ? 'text-green-400'
                                          : ''"
                                        icon-size="1.7rem"
                                        :disabled="!section.questions.paragraphQuestionsCommonPart.$value.required"
                                        @click="section.questions.paragraphQuestionsCommonPart.$value.pattern.isCaseSensitive = !section.questions.paragraphQuestionsCommonPart.$value.pattern.isCaseSensitive"
                                      />
                                    </div>
                                    <div class="flex flex-col gap-2">
                                      <span class="text-base font-bold mx-auto">
                                        Search In (Area Boundaries)
                                      </span>
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
                                      <span class="text-base font-bold text-center">
                                        Questions End
                                      </span>
                                      <UiSwitch
                                        v-model="column.end.$value.required"
                                        class="ml-2"
                                      />
                                    </UiCardTitle>
                                  </UiCardHeader>
                                  <UiCardContent class="flex flex-col items-center gap-4 w-70">
                                    <SimplePatternInput
                                      v-model="column.end.$value.pattern"
                                      :pattern-value-field="column.end.pattern.value"
                                      :disabled="!column.end.$value.required"
                                    />
                                    <div class="flex flex-col gap-2">
                                      <span class="text-base font-bold mx-auto">
                                        Search In (Area Boundaries)
                                      </span>
                                      <SearchArea
                                        v-model="column.end.$value.searchIn"
                                        :fields="column.end.searchIn"
                                      />
                                    </div>
                                  </UiCardContent>
                                </UiCard>
                              </div>
                              <UiCard class="py-3 gap-2">
                                <UiCardHeader>
                                  <UiCardTitle class="mx-auto text-base">
                                    Crop
                                  </UiCardTitle>
                                </UiCardHeader>
                                <UiCardContent class="flex flex-col gap-5 justify-center">
                                  <div class="flex gap-5 items-center">
                                    <UiCard class="py-3 gap-2">
                                      <UiCardHeader>
                                        <UiCardTitle class="mx-auto text-base">
                                          Within
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
                                    <UiCard class="py-3 gap-2">
                                      <UiCardHeader>
                                        <UiCardTitle class="mx-auto text-base">
                                          Exactly To
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
                                  <UiCard class="py-3 gap-2">
                                    <UiCardHeader>
                                      <UiCardTitle class="mx-auto text-base">
                                        Offset By
                                      </UiCardTitle>
                                    </UiCardHeader>
                                    <UiCardContent class="grid grid-cols-2 gap-4">
                                      <BaseFloatLabel
                                        v-for="(label, key) in AREA_BOUNDARY_NAMES"
                                        :key="key"
                                        v-slot="{ id }"
                                        class="w-full"
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
                </UiTabsContent>
              </UiTabs>
            </UiCardContent>
          </UiCard>
        </UiCardContent>
      </UiCard>
    </form>
  </div>
</template>
