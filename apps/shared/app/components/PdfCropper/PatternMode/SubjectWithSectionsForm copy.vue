<script setup lang="ts">
import { useForm, useFieldArray } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import {
  type PatternModeSubjectWithSectionsConfigJson,
  type PatternModeSectionConfigJson,
  subjectWithSectionsSchema,
} from '#layers/shared/shared/schema/pdf-cropper-pattern-mode'

const { values } = useForm<PatternModeSubjectWithSectionsConfigJson>({
  validationSchema: toTypedSchema(subjectWithSectionsSchema),
})

const sectionsFieldArray = useFieldArray<PatternModeSectionConfigJson>('sections')

const subjectNames = computed(() => Object.keys(values.subjects))

const SETTINGS_TAB = 'settings-tab'
const NEW_SUBJECT_TAB = 'new-subject-tab'

const currentSelectedState = shallowReactive({
  tab: SETTINGS_TAB,
})
</script>

<template>
  <div class="space-y-2">
    <UiTabs
      v-model="currentSelectedState.tab"
      class="border-b border-border"
    >
      <UiScrollArea class="w-full border-b">
        <BaseTabsListWithIndicator class="flex flex-nowrap gap-x-2 px-6 max-w-max">
          <BaseTabsTriggerWithIndicator
            :value="SETTINGS_TAB"
            class="cursor-pointer p-2.5 text-base"
            as-child
          >
            <BaseButton
              variant="help"
              title="Settings"
              icon-name="line-md:cog-filled"
              icon-size="1.2rem"
              @click="currentSelectedState.tab = SETTINGS_TAB"
            />
          </BaseTabsTriggerWithIndicator>
          <BaseTabsTriggerWithIndicator
            v-for="subjectName in subjectNames"
            :key="subjectName"
            :value="subjectName"
            class="cursor-pointer p-2.5 text-base"
          >
            {{ subjectName }}
          </BaseTabsTriggerWithIndicator>
          <BaseTabsTriggerWithIndicator
            :value="NEW_SUBJECT_TAB"
            class="cursor-pointer p-2.5 text-base"
          >
            New Subject
          </BaseTabsTriggerWithIndicator>
        </BaseTabsListWithIndicator>
        <UiScrollBar orientation="horizontal" />
      </UiScrollArea>
      <UiTabsContent value="">
        h
      </UiTabsContent>
    </UiTabs>
    <div>
      <UiLabel class="gap-0">
        Search Area
        <span class="text-red-500">*</span>
      </UiLabel>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="(label, key) in fields"
          :key="key"
          class="flex flex-col items-center gap-1.5"
        >
          <div class="flex items-center gap-1">
            <UiLabel class="gap-0">
              {{ label }}
              <span class="text-red-500">*</span>
            </UiLabel>
            <IconWithTooltip
              v-if="fieldErrors.some(e => e.startsWith(`${key}:`))"
              icon-name="material-symbols:error-outline-rounded"
              icon-class="text-red-500 hover:cursor-pointer"
            >
              <p class="whitespace-pre-line text-red-400 text-base font-semibold">
                {{ fieldErrors.filter(e => e.startsWith(`${key}:`)).map(e => e.substring(key.length + 1)).join('\n') }}
              </p>
            </IconWithTooltip>
          </div>
          <UiInput
            v-model.number="searchArea[key]"
            class="w-full"
            @focus="handleFocus"
            @blur="handleBlur"
          />
        </div>
      </div>
    </div>
  </div>
</template>
