<script setup lang="ts">
import {
  pagesTooltipContent,
  subjectEndTooltipContent,
  searchInAreaTooltipContent,
  columnDividersTooltipContent,
} from '../tooltipContents'
import SearchArea from './SearchArea.vue'
import SimplePatternInput from './SimplePatternInput.vue'
import SectionForm from './SectionForm.vue'
import NewSubjectOrSectionPanel from './NewSubjectOrSectionPanel.client.vue'
import {
  SUBJECTS,
} from '#layers/shared/shared/constants'
import {
  required,
  requiredIf,
} from '@regle/rules'
import { useCustomRegle } from '#layers/shared/app/src/form-validation/regle.global.config'
import {
  pagesRule,
  absOrRelativeCoordRule,
  columnDividersRule,
} from '#layers/shared/app/src/form-validation/custom-rules/rules'
import { absOrRelativeCoordinateRegex } from '#layers/shared/shared/regexes'
import type {
  PatternModeSectionConfigJson,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/config-schema'
import {
  getSectionData,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/json-config-to-form-data'

const props = defineProps<{
  subjectId: number | string
}>()

const formStatus = defineModel<PatternModeFormStatus>({ required: true })

const { form } = usePatternModeFormData()

const subjectFormData = ref(form.value!.subjects[props.subjectId]!)

const NEW_SECTION_TAB = 'new-section-tab'

const currentSectionTab = shallowRef<number | string>(0)

const { r$ } = useCustomRegle(subjectFormData, () => {
  const isSubjectEndRequired = () => subjectFormData.value.end.required

  return {
    name: { required },
    columnDividers: { columnDividersRule },
    start: {
      pattern: {
        value: { required },
      },
      searchIn: {
        pages: { required, pagesRule },
        area: {
          l: { required, absOrRelativeCoordRule },
          r: { required, absOrRelativeCoordRule },
          t: { required, absOrRelativeCoordRule },
          b: { required, absOrRelativeCoordRule },
        },
      },
    },
    end: {
      pattern: {
        value: { required: requiredIf(isSubjectEndRequired) },
      },
      searchIn: {
        pages: { required: requiredIf(isSubjectEndRequired), pagesRule },
        area: {
          l: { required: requiredIf(isSubjectEndRequired), absOrRelativeCoordRule },
          r: { required: requiredIf(isSubjectEndRequired), absOrRelativeCoordRule },
          t: { required: requiredIf(isSubjectEndRequired), absOrRelativeCoordRule },
          b: { required: requiredIf(isSubjectEndRequired), absOrRelativeCoordRule },
        },
      },
    },
  }
})

const sectionToRemove = shallowRef<string | number | null | undefined>(null)

const showRemoveSectionDialog = computed({
  get: () => !!sectionToRemove.value,
  set: (val) => {
    if (!val) sectionToRemove.value = null
  },
})

function getSectionNames(subjectName: string) {
  const subjectList: string[] = []
  const sectionsList: string[] = []

  if (subjectName) {
    subjectList.push(subjectName)
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
}

function removeSection() {
  const secId = sectionToRemove.value
  sectionToRemove.value = null

  if (!secId) return

  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete subjectFormData.value.sections[secId]

  const totalRemaining = Object.keys(subjectFormData.value.sections).length
  if (totalRemaining === 0) {
    currentSectionTab.value = NEW_SECTION_TAB
  }
  else if (typeof currentSectionTab.value === 'number'
    && currentSectionTab.value >= totalRemaining) {
    currentSectionTab.value = totalRemaining - 1
  }
}

const sectionsStatus = reactive<Record<string, ComputedRef<boolean>>>({})

const subjectFormStatus = reactive({
  sections: sectionsStatus,
  isReady: computed(
    () => r$.$ready && Object.values(sectionsStatus).every(v => !!toValue(v)),
  ) as unknown as boolean,
})

formStatus.value[props.subjectId] = subjectFormStatus

// watch for columnDividers,
// to add new columns or set isRemoved value for columns of all sections in subject
watchDebounced(
  () => subjectFormData.value.columnDividers,
  (newValue) => {
    const coords = newValue
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (!coords.every(s => absOrRelativeCoordinateRegex.test(s)))
      return

    const columnsRequiredCount = coords.length + 1
    const sections = Object.values(subjectFormData.value.sections)

    for (const section of sections) {
      const columns = section.questions.columns
      const columnsCount = columns.length

      if (columnsCount < columnsRequiredCount) {
        columns.forEach(column => column.isRemoved = false)

        const newColumn = utilCloneJson(columns.at(-1)!)

        for (let count = columnsCount; count < columnsRequiredCount; count++) {
          columns.push(structuredClone(newColumn))
        }
      }
      else {
        for (let i = 0; i < columnsCount; i++) {
          const column = columns[i]
          if (column) {
            column.isRemoved = (i + 1) > columnsRequiredCount
          }
        }
      }
    }
  },
  { debounce: 1000 },
)

function addSection(name: string, data: PatternModeSectionConfigJson) {
  const section = getSectionData(name, data)
  subjectFormData.value.sections[section.id] = section
}

function addNewSectionFromCurrentConfig(subjectIdx: number, sectionIdx: number) {
  const subject = Object.values(form.value!.subjects)[subjectIdx]
  try {
    if (!subject?.sections)
      throw Error('Invalid subject index')
    const section = Object.values(subject.sections)[sectionIdx]
    if (!section)
      throw Error('Invalid section index')

    const newSection = utilCloneJson(section)
    const newSecId = Date.now() + Math.random()
    newSection.id = newSecId

    subjectFormData.value.sections[newSecId] = newSection
  }
  catch (err) {
    console.error('Error adding new section from current config:', err)
  }
}

onBeforeMount(() => r$.$validate())

onBeforeUnmount(() => {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete formStatus.value[props.subjectId]
})
</script>

<template>
  <div class="space-y-2 grow">
    <UiDialog v-model:open="showRemoveSectionDialog">
      <UiDialogContent>
        <UiDialogHeader>
          <UiDialogTitle class="mx-auto">
            Remove Section
          </UiDialogTitle>
        </UiDialogHeader>
        <p class="text-center text-lg mb-2">
          Are you sure you want to remove this section?
        </p>
        <div class="flex justify-center my-3 gap-5">
          <BaseButton
            label="Yes"
            variant="warn"
            @click="removeSection"
          />
          <BaseButton
            label="No"
            @click="sectionToRemove = null"
          />
        </div>
      </UiDialogContent>
    </UiDialog>

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
            :field="r$.name"
          >
            <BaseInputTextWithSelect
              :id="id"
              v-model="r$.$value.name"
              :select-options="SUBJECTS"
              label-root-class="grow"
              input-class="h-10 text-[0.95rem]!"
              select-class="h-10!"
              label-class="start-1/2! -translate-x-1/2 text-[0.85rem]"
              placeholder="Type/Select subject name"
              :on-blur="handleBlur"
            />
          </FormLabel>
          <FormLabel
            label="Column Dividers"
            :field="r$.columnDividers"
          >
            <template #leftToLabel>
              <IconWithTooltip
                icon-class="mr-1"
                icon-size="1rem"
                :content="columnDividersTooltipContent"
              />
            </template>
            <template #default="{ id, handleBlur }">
              <UiInput
                :id="id"
                v-model="r$.$value.columnDividers"
                class="text-center"
                @blur="handleBlur"
              />
            </template>
          </FormLabel>
          <div class="flex gap-3 items-center">
            <UiLabel for="subject-has-sections-switch">
              Subject Has Sections
            </UiLabel>
            <UiSwitch
              id="subject-has-sections-switch"
              v-model="r$.$value.subjectHasSections"
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
              <UiCardDescription class="text-center">
                Specify the subject start pattern and location to search in,
                to signal the start of the subject.
              </UiCardDescription>
            </UiCardHeader>
            <UiCardContent class="flex flex-col gap-5">
              <SimplePatternInput
                v-model="r$.start.$value.pattern"
                :pattern-value-field="r$.start.pattern.value"
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
                    :field="r$.start.searchIn.pages"
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
                        v-model="r$.$value.start.searchIn.pages"
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
                    v-model="r$.$value.start.searchIn.area"
                    :fields="r$.start.searchIn.area"
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
                  Subject End
                </span>
                <UiSwitch
                  v-model="r$.$value.end.required"
                  class="ml-2"
                />
              </UiCardTitle>
              <UiCardDescription class="text-center">
                [Optional] Specify the subject end pattern and location to search in,
                to signal the end of the subject.<br>
              </UiCardDescription>
            </UiCardHeader>
            <UiCardContent class="flex flex-col gap-5">
              <SimplePatternInput
                v-model="r$.end.$value.pattern"
                :pattern-value-field="r$.end.pattern.value"
                :disabled="!r$.$value.end.required"
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
                    :field="r$.end.searchIn.pages"
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
                        v-model="r$.$value.end.searchIn.pages"
                        class="text-center text-base!"
                        :disabled="!r$.$value.end.required"
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
                    v-model="r$.$value.end.searchIn.area"
                    :fields="r$.end.searchIn.area"
                    :disabled="!r$.$value.end.required"
                  />
                </UiCardContent>
              </UiCard>
            </UiCardContent>
          </UiCard>
        </div>

        <!-- Sections -->
        <UiCard class="py-3 mt-6">
          <UiCardHeader>
            <UiCardTitle class="mx-auto text-xl">
              {{ r$.$value.subjectHasSections ? "Sections" : "Questions" }} Config
              <span class="text-red-500">*</span>
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="flex flex-col gap-5 px-3">
            <UiTabs
              v-model="currentSectionTab"
              :unmount-on-hide="false"
            >
              <UiScrollArea
                v-show="r$.$value.subjectHasSections"
                viewport-class="pb-3"
                type="auto"
                class="w-full border"
              >
                <BaseTabsListWithIndicator
                  class="flex flex-nowrap gap-x-2 px-6 max-w-max items-center"
                  indicator-class="border-yellow-500"
                >
                  <BaseTabsTriggerWithIndicator
                    v-for="(section, idx) in Object.values(subjectFormData.sections)"
                    :key="section.id"
                    :value="idx"
                    class="text-[1.05rem]"
                    as-child
                  >
                    <BaseTabsTriggerLabelWithDeleteBtn
                      :label="section.name || 'Unnamed Section'"
                      :title-class="toValue(subjectFormStatus.sections[section.id])
                        ? 'text-green-500! dark:text-green-500!'
                        : 'text-red-400! dark:text-red-400!'"
                      :required="idx === 0 && Object.values(subjectFormData.sections).length === 1"
                      @remove="sectionToRemove = section.id"
                    />
                  </BaseTabsTriggerWithIndicator>
                  <BaseTabsTriggerWithIndicator
                    :value="NEW_SECTION_TAB"
                    class="p-0 dark:text-black"
                    as-child
                  >
                    <BaseButton
                      variant="success"
                      size="iconSm"
                      title="Add New Section"
                      icon-name="line-md:plus"
                      icon-size="1.3rem"
                    />
                  </BaseTabsTriggerWithIndicator>
                </BaseTabsListWithIndicator>
                <UiScrollBar orientation="horizontal" />
              </UiScrollArea>
              <UiTabsContent
                v-for="(section, idx) in Object.values(subjectFormData.sections)"
                :key="section.id"
                :value="idx"
              >
                <SectionForm
                  v-model="subjectFormStatus.sections"
                  :section-names-for-select="getSectionNames(subjectFormData.name)"
                  :subject-id="props.subjectId"
                  :section-id="section.id"
                  :subject-has-sections="subjectFormData.subjectHasSections"
                />
              </UiTabsContent>
              <UiTabsContent
                :value="NEW_SECTION_TAB"
                class="w-full max-w-xl mx-auto pb-4 mt-2 flex flex-col items-center gap-4"
              >
                <span class="text-xl font-bold mx-auto">
                  Add New Section
                </span>
                <NewSubjectOrSectionPanel
                  v-if="currentSectionTab === NEW_SECTION_TAB"
                  panel-for="section"
                  @add-new-section="addSection"
                  @add-current-config-section="addNewSectionFromCurrentConfig"
                />
              </UiTabsContent>
            </UiTabs>
          </UiCardContent>
        </UiCard>
      </UiCardContent>
    </UiCard>
  </div>
</template>
