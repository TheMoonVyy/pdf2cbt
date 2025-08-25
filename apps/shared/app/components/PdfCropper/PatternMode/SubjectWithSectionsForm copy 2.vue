<script setup lang="ts">
import { useForm, useFieldArray, useSetFieldValue } from 'vee-validate'
import {
  type PatternModeSubjectWithSectionsConfigJson,
  type PatternModeSectionConfigJson,
  subjectWithSectionsSchema,
} from '#layers/shared/shared/schema/pdf-cropper-pattern-mode'
import Label from './LabelWithErrorTooltip.vue'
import SearchArea from './SearchArea.vue'
import { pagesTooltipContent, subjectEndTooltipContent } from './tooltipContents'

const { values, handleSubmit, setValues } = useForm<PatternModeSubjectWithSectionsConfigJson>({
  validationSchema: subjectWithSectionsSchema,
  initialValues: {
    name: '',
    start: {
      pattern: {
        type: 'text',
        value: '',
        isCaseSensitive: true,
      },
      searchIn: {
        pages: '1-L',
        area: {
          l: '0',
          r: '100%',
          t: '0',
          b: '100%',
        },
      },
    },
    columnDividers: '',
  },
})

const sectionsFieldArray = useFieldArray<PatternModeSectionConfigJson>('sections')

const onSubmit = handleSubmit((values) => {
  console.log('Form submitted!', values)
})

const NEW_SECTION_TAB = 'new-section-tab'

const currentSelectedState = shallowReactive({
  tab: NEW_SECTION_TAB,
})

watchEffect(() => console.log(values))

function getToggledPatternMode<
  T extends PatternModeSectionConfigJson['pattern']['type'],
  U = T extends 'regex' ? 'text' : 'regex',
>(
  type: T,
): U {
  if (type === 'regex') return 'text' as U
  return 'regex' as U
}
</script>

<template>
  <div class="space-y-2">
    <form @submit.prevent="onSubmit">
      <UiCard class="py-3 gap-4">
        <UiCardHeader>
          <UiCardTitle class="mx-auto text-xl">
            Subject Config
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <div class="flex gap-8 items-center justify-center px-4 pb-4">
            <UiFormField
              v-slot="{ componentField }"
              name="name"
            >
              <UiFormItem>
                <Label required>
                  Subject Name
                </Label>
                <UiFormControl>
                  <UiInput
                    class="text-center"
                    v-bind="componentField"
                  />
                </UiFormControl>
              </UiFormItem>
            </UiFormField>
            <UiFormField
              v-slot="{ componentField }"
              name="columnDividers"
            >
              <UiFormItem>
                <Label>Column Dividers</Label>
                <UiFormControl>
                  <UiInput
                    class="text-center"
                    v-bind="componentField"
                  />
                </UiFormControl>
              </UiFormItem>
            </UiFormField>
          </div>
          <div class="flex">
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
                <div class="flex items-end justify-center">
                  <UiFormField
                    v-slot="{ value, setValue }"
                    name="start.pattern.type"
                    :validate-on-value-update="false"
                  >
                    <UiFormItem>
                      <UiFormControl>
                        <BaseButton
                          class="rounded-r-none"
                          variant="outline"
                          size="icon"
                          :icon-name="value === 'regex'
                            ? 'material-symbols:regular-expression'
                            : 'my-icon:txt'"
                          title="Toggle pattern type"
                          icon-size="1.6rem"
                          icon-class="text-green-400"
                          @click="setValue(getToggledPatternMode(value), false)"
                        />
                      </UiFormControl>
                    </UiFormItem>
                  </UiFormField>
                  <UiFormField
                    v-slot="{ componentField }"
                    name="start.pattern.value"
                  >
                    <UiFormItem>
                      <UiFormLabel required>
                        {{ utilKeyToLabel(values.start.pattern.type) }} Pattern
                      </UiFormLabel>
                      <UiFormControl>
                        <UiInput
                          class="rounded-l-none rounded-r-none"
                          v-bind="componentField"
                        />
                      </UiFormControl>
                    </UiFormItem>
                  </UiFormField>
                  <UiFormField
                    v-slot="{ value, handleChange }"
                    name="start.pattern.isCaseSensitive"
                    :validate-on-value-update="false"
                    :validate-on-change="false"
                    :validate-on-input="false"
                    :validate-on-blur="false"
                    :validate-on-mount="false"
                    :validate-on-model-update="false"
                  >
                    <BaseButton
                      class="rounded-l-none"
                      variant="outline"
                      size="icon"
                      icon-name="material-symbols:match-case-rounded"
                      title="Toggle case sensitivity"
                      :icon-class="value ? 'text-green-400' : ''"
                      icon-size="1.7rem"
                      @click="handleChange(!value, false)"
                    />
                  </UiFormField>
                </div>
                <UiCard class="pt-2.5 gap-3">
                  <UiCardHeader>
                    <UiCardTitle class="mx-auto text-base">
                      Search In
                    </UiCardTitle>
                  </UiCardHeader>
                  <UiCardContent class="flex flex-col items-center">
                    <UiFormField
                      v-slot="{ componentField }"
                      name="start.searchIn.pages"
                    >
                      <UiFormItem class="max-w-48">
                        <Label required>
                          <template #default>
                            Pages
                          </template>
                          <template #leftToLabel>
                            <IconWithTooltip
                              icon-class="mr-1"
                              icon-size="1rem"
                              :content="pagesTooltipContent"
                            />
                          </template>
                        </Label>
                        <UiFormControl>
                          <UiInput
                            class="text-center"
                            v-bind="componentField"
                          />
                        </UiFormControl>
                      </UiFormItem>
                    </UiFormField>
                    <span class="text-base font-bold mt-3 mb-2">
                      Area Boundaries
                    </span>
                    <SearchArea path="start.searchIn.area" />
                  </UiCardContent>
                </UiCard>
              </UiCardContent>
            </UiCard>

            <!-- Subject End Card -->

            <UiCard class="py-3">
              <UiCardHeader>
                <UiCardTitle class="flex items-center mx-auto text-lg gap-4">
                  <span class="text-lg font-bold mx-auto">
                    Subject End (Optional)
                  </span>
                  <IconWithTooltip
                    :content="subjectEndTooltipContent"
                  />
                </UiCardTitle>
                <UiCardDescription>
                  Specify the pattern and location to search in, to signal the end of the subject.
                </UiCardDescription>
              </UiCardHeader>
              <UiCardContent class="flex flex-col gap-5">
                <div class="flex items-end justify-center">
                  <UiFormField
                    v-slot="{ value, setValue }"
                    name="end.pattern.type"
                    :validate-on-value-update="false"
                  >
                    <BaseButton
                      class="rounded-r-none"
                      variant="outline"
                      size="icon"
                      :icon-name="value === 'regex'
                        ? 'material-symbols:regular-expression'
                        : 'my-icon:txt'"
                      title="Toggle pattern type"
                      icon-size="1.6rem"
                      icon-class="text-green-400"
                      @click="setValue(getToggledPatternMode(value), false)"
                    />
                  </UiFormField>
                  <UiFormField
                    v-slot="{ componentField }"
                    name="end.pattern.value"
                  >
                    <UiFormItem>
                      <UiFormLabel required>
                        {{ utilKeyToLabel(values.end?.pattern?.type || '') }} Pattern
                      </UiFormLabel>
                      <UiFormControl>
                        <UiInput
                          class="rounded-l-none rounded-r-none"
                          v-bind="componentField"
                        />
                      </UiFormControl>
                    </UiFormItem>
                  </UiFormField>
                  <UiFormField
                    v-slot="{ value, setValue }"
                    name="end.pattern.isCaseSensitive"
                    :validate-on-value-update="false"
                  >
                    <BaseButton
                      class="rounded-l-none"
                      variant="outline"
                      size="icon"
                      icon-name="material-symbols:match-case-rounded"
                      title="Toggle case sensitivity"
                      :icon-class="value ? 'text-green-400' : ''"
                      icon-size="1.7rem"
                      @click="setValue(!value, false)"
                    />
                  </UiFormField>
                </div>
                <UiCard class="pt-2.5 gap-3">
                  <UiCardHeader>
                    <UiCardTitle class="mx-auto text-base">
                      Search In
                    </UiCardTitle>
                  </UiCardHeader>
                  <UiCardContent class="flex flex-col items-center">
                    <UiFormField
                      v-slot="{ componentField }"
                      name="end.searchIn.pages"
                    >
                      <UiFormItem class="max-w-48">
                        <Label required>
                          <template #default>
                            Pages
                          </template>
                          <template #leftToLabel>
                            <IconWithTooltip
                              icon-class="mr-1"
                              icon-size="1rem"
                              :content="pagesTooltipContent"
                            />
                          </template>
                        </Label>
                        <UiFormControl>
                          <UiInput
                            class="text-center"
                            v-bind="componentField"
                            :disabled="!values.end?.pattern?.value?.trim()"
                          />
                        </UiFormControl>
                      </UiFormItem>
                    </UiFormField>
                    <span class="text-base font-bold mt-3 mb-2">
                      Area Boundaries
                    </span>
                    <SearchArea
                      path="end.searchIn.area"
                      :disabled="!values.end?.pattern?.value?.trim()"
                    />
                  </UiCardContent>
                </UiCard>
              </UiCardContent>
            </UiCard>
          </div>
        </UiCardContent>
      </UiCard>
      <UiTabs
        v-model="currentSelectedState.tab"
        class="border-b border-border"
      >
        <UiScrollArea class="w-full border-b">
          <BaseTabsListWithIndicator class="flex flex-nowrap gap-x-2 px-6 max-w-max">
            <BaseTabsTriggerWithIndicator
              v-for="section in sectionsFieldArray.fields.value"
              :key="section.key"
              :value="section.value.name"
              class="cursor-pointer p-2.5 text-base"
            >
              {{ section.value.name }}
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
        <UiTabsContent value="">
          h
        </UiTabsContent>
      </UiTabs>
    </form>
  </div>
</template>
