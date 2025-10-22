<script setup lang="ts">
import SimplePatternInput from './SimplePatternInput.vue'
import SubjectForm from './SubjectForm.vue'
import NewSubjectOrSectionPanel from './NewSubjectOrSectionPanel.client.vue'
import type {
  PatternModeSubjectConfigJson,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/config-schema'
import {
  getSubjectData,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/json-config-to-form-data'
import {
  yCoordinateGroupingRangeForLineTooltipContent,
  calculateCharacterBoundariesPreciselyTooltipContent,
} from '../tooltipContents'

const { form } = usePatternModeFormData()

const formStatus = reactive<PatternModeFormStatus>({})

const subjectToRemove = shallowRef<string | number | null | undefined>(null)

const NEW_SUBJECT_TAB = 'new-subject'

const SETTINGS_TAB = 'settings-config'

const currentTab = shallowRef<string | number>(0)

const isLinesToIgnoreAllFilled = computed(() =>
  form.value!.settings.linesToIgnore
    .every(pattern => !!pattern.value.trim()),
)
const { isFullscreen } = useFullscreen()

const isFormReady = computed(() => Object.values(formStatus).every(s => s.isReady))

defineExpose({
  isFormReady,
})

// Always keep an empty pattern object at the end of the list
watch(isLinesToIgnoreAllFilled,
  (newVal) => {
    if (!newVal) return

    const lastPattern = form.value!.settings.linesToIgnore.at(-1) ?? {
      type: 'text',
      value: '',
      isCaseSensitive: true,
    }

    form.value!.settings.linesToIgnore.push({
      ...lastPattern,
      value: '',
    })
  },
  { immediate: true },
)

const currentConfigNamesData = computed(() => {
  const configNamesData: PatternModeBuiltInConfig['subjects'] = {}

  for (const subject of Object.values(form.value!.subjects)) {
    const subjectName = subject.name.trim() || 'Unnamed Subject'
    if (subject.subjectHasSections) {
      configNamesData[subjectName] = Object.values(subject.sections)
        .map(s => s.name.trim() || 'Unnamed Section')
    }
    else {
      configNamesData[subjectName] = null
    }
  }
  return configNamesData
})

provide('currentConfigNamesData', currentConfigNamesData)

const showRemoveSubjectDialog = computed({
  get: () => !!subjectToRemove.value,
  set: (val) => {
    if (!val) subjectToRemove.value = null
  },
})

function removeSubject() {
  const subId = subjectToRemove.value
  subjectToRemove.value = null

  if (!subId) return

  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete form.value!.subjects[subId]

  const totalRemaining = Object.keys(form.value!.subjects).length
  if (totalRemaining === 0) {
    currentTab.value = NEW_SUBJECT_TAB
  }
  else if (typeof currentTab.value === 'number'
    && currentTab.value >= totalRemaining) {
    currentTab.value = totalRemaining - 1
  }
}

function addSubject(name: string, data: PatternModeSubjectConfigJson) {
  const subject = getSubjectData(name, data)
  form.value!.subjects[subject.id] = subject
}

function addNewSubjectFromCurrentConfig(subjectIdx: number) {
  const subject = Object.values(form.value!.subjects)[subjectIdx]
  try {
    if (!subject)
      throw Error('Invalid subject index')

    const newSubject = utilCloneJson(subject)
    const newId = Date.now() + Math.random()
    newSubject.id = newId

    const sections: typeof newSubject.sections = {}
    for (const section of Object.values(newSubject.sections)) {
      const newSecId = Date.now() + Math.random()
      section.id = newSecId
      sections[newSecId] = section
    }
    newSubject.sections = sections
    form.value!.subjects[newId] = newSubject
  }
  catch (err) {
    console.error('Error adding new subject from current config:', err)
  }
}
</script>

<template>
  <div class="flex w-full">
    <UiTabs
      v-model="currentTab"
      :unmount-on-hide="false"
      class="w-full"
    >
      <UiScrollArea class="w-full border border-t-0">
        <BaseTabsListWithIndicator
          class="flex flex-nowrap gap-x-2 px-6 max-w-max items-center"
          indicator-class="border-yellow-500"
        >
          <BaseTabsTriggerWithIndicator
            :value="SETTINGS_TAB"
            class="p-0 dark:text-black"
            as-child
          >
            <BaseButton
              variant="help"
              size="iconSm"
              title="Settings"
              icon-name="line-md:cog-filled"
              icon-size="1.3rem"
              @click="currentTab = SETTINGS_TAB"
            />
          </BaseTabsTriggerWithIndicator>
          <BaseTabsTriggerWithIndicator
            v-for="(subject, idx) in Object.values(form!.subjects)"
            :key="subject.id"
            :value="idx"
            class="text-[1.05rem]"
            as-child
          >
            <BaseTabsTriggerLabelWithDeleteBtn
              :label="subject.name || 'Unnamed Subject'"
              :title-class="toValue(formStatus[subject.id]?.isReady)
                ? 'text-green-500! dark:text-green-500!'
                : 'text-red-400! dark:text-red-400!'"
              :required="idx === 0 && Object.values(form!.subjects).length === 1"
              @remove="subjectToRemove = subject.id"
            />
          </BaseTabsTriggerWithIndicator>
          <BaseTabsTriggerWithIndicator
            :value="NEW_SUBJECT_TAB"
            class="p-0 dark:text-black"
            as-child
          >
            <BaseButton
              variant="success"
              size="iconSm"
              title="Add New Subject"
              icon-name="line-md:plus"
              icon-size="1.3rem"
            />
          </BaseTabsTriggerWithIndicator>
        </BaseTabsListWithIndicator>
        <UiScrollBar orientation="horizontal" />
      </UiScrollArea>
      <div
        class="max-h-[calc(100dvh-6.5rem)] w-full overflow-auto"
        :class="isFullscreen ? 'max-h-dvh' : ''"
      >
        <UiTabsContent
          :value="SETTINGS_TAB"
          class="max-w-xl mx-auto pb-4"
        >
          <UiCard class="py-3 gap-3">
            <UiCardHeader>
              <UiCardTitle class="mx-auto text-lg">
                PDF-level Settings Config
              </UiCardTitle>
            </UiCardHeader>
            <UiCardContent class="flex flex-col gap-5 items-center">
              <div class="flex items-center gap-3">
                <UiLabel
                  class="text-lg cursor-pointer"
                  for="ignore-elements-outside-page-switch"
                >
                  Ignore Elements Going Outside Pdf Pages:
                </UiLabel>
                <UiSwitch
                  id="ignore-elements-outside-page-switch"
                  v-model="form!.settings.ignoreElementsGoingOutsidePage"
                />
              </div>
              <div class="flex items-center gap-3">
                <IconWithTooltip :content="calculateCharacterBoundariesPreciselyTooltipContent" />
                <UiLabel
                  class="text-lg cursor-pointer"
                  for="accurate-bbox"
                >
                  Calculate Character Boundaries Precisely:
                </UiLabel>
                <UiSwitch
                  id="accurate-bbox"
                  v-model="form!.settings.calculateCharacterBoundariesPrecisely"
                />
              </div>
              <div class="flex items-center gap-3">
                <IconWithTooltip :content="yCoordinateGroupingRangeForLineTooltipContent" />
                <UiLabel
                  class="text-lg"
                  for="y-coordinate-grouping-range-switch"
                >
                  Y Coordinate Grouping Range For Line:
                </UiLabel>
                <BaseInputNumber
                  id="y-coordinate-grouping-range-switch"
                  v-model="form!.settings.yCoordinateGroupingRangeForLine"
                  class="w-28"
                  :min="3"
                  :step-snapping="false"
                />
              </div>
              <UiCard class="py-3 gap-3 w-full">
                <UiCardHeader>
                  <UiCardTitle class="mx-auto text-base">
                    Lines To Ignore
                  </UiCardTitle>
                  <UiCardDescription class="mx-auto">
                    Will ignore lines containing given text/regex patterns
                  </UiCardDescription>
                </UiCardHeader>
                <UiCardContent class="flex flex-col gap-3 items-center w-full">
                  <SimplePatternInput
                    v-for="(_, idx) in form!.settings.linesToIgnore"
                    :key="idx"
                    v-model="form!.settings.linesToIgnore[idx]!"
                  />
                </UiCardContent>
              </UiCard>
            </UiCardContent>
          </UiCard>
        </UiTabsContent>
        <UiTabsContent
          v-for="(subject, idx) in Object.values(form!.subjects)"
          :key="subject.id"
          :value="idx"
        >
          <SubjectForm
            v-model="formStatus"
            :subject-id="subject.id"
          />
        </UiTabsContent>
        <UiTabsContent
          :value="NEW_SUBJECT_TAB"
          class="max-w-xl mx-auto pb-4 mt-2 flex flex-col items-center gap-4"
        >
          <span class="text-xl font-bold mx-auto">
            Add New Subject
          </span>
          <NewSubjectOrSectionPanel
            v-if="currentTab === NEW_SUBJECT_TAB"
            panel-for="subject"
            @add-new-subject="addSubject"
            @add-current-config-subject="addNewSubjectFromCurrentConfig"
          />
        </UiTabsContent>
      </div>
    </UiTabs>

    <UiDialog v-model:open="showRemoveSubjectDialog">
      <UiDialogContent>
        <UiDialogHeader>
          <UiDialogTitle class="mx-auto">
            Remove Subject
          </UiDialogTitle>
        </UiDialogHeader>
        <p class="text-center text-lg mb-2">
          Are you sure you want to remove this subject?
        </p>
        <div class="flex justify-center my-3 gap-5">
          <BaseButton
            label="Yes"
            variant="warn"
            @click="removeSubject"
          />
          <BaseButton
            label="No"
            @click="subjectToRemove = null"
          />
        </div>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>
