<template>
  <UiDialog
    v-model:open="showDialog"
  >
    <UiDialogContent class="flex px-4 flex-col min-w-full lg:min-w-5xl h-9/10">
      <UiDialogHeader class="h-fit">
        <UiDialogTitle>Bulk Edit Questions</UiDialogTitle>
        <UiDialogDescription class="text-center">
          Select subjects/sections/questions you want to bulk edit/set configurations for.
        </UiDialogDescription>
      </UiDialogHeader>
      <UiResizablePanelGroup
        direction="horizontal"
        class="rounded border border-t-0 h-full"
      >
        <UiResizablePanel
          :default-size="40"
          :min-size="30"
          :collapsible="false"
        >
          <UiScrollArea
            class="w-full h-full rounded border"
            type="auto"
          >
            <BaseTreeCheckbox
              v-if="showDialog && treeNodes.length"
              v-model="selectedTreeNodes"
              :disabled="isFormLoaded"
              class="p-4"
              :items="treeNodes"
            />
          </UiScrollArea>
        </UiResizablePanel>

        <UiResizableHandle :disabled="!allowResizingPanels" />

        <UiResizablePanel
          :default-size="60"
          :collapsible="false"
          :min-size="40"
        >
          <UiScrollArea
            class="h-full w-full rounded-md border p-4"
            type="auto"
          >
            <div class="flex flex-col gap-6 w-full">
              <div class="flex w-full gap-6 justify-center">
                <BaseButton
                  :label="isFormLoaded ? 'Unload Data': 'Load Data'"
                  :variant="isFormLoaded ? 'destructive': 'success'"
                  :disabled="!selectedTreeNodes || selectedTreeNodes.length === 0"
                  @click="() => isFormLoaded ? unloadFormData() : loadFormData()"
                />
                <BaseButton
                  label="Apply Changes"
                  variant="warn"
                  :disabled="!isThereAnyChangesInForm || messagesState.applyingChanges"
                  @click="applyChanges"
                />
              </div>

              <!-- messages -->
              <div
                v-show="messagesState.applyingChanges"
                class="text-cyan-500 font-bold text-center"
              >
                Applying changes...
              </div>
              <div
                v-show="messagesState.changesApplied"
                class="text-green-500 font-bold text-center"
              >
                Changes has been applied successfully.
              </div>
              <div v-show="messagesState.subjectOrSectionAlreadyExists">
                <p class="text-red-400 font-bold text-center mb-2">
                  Changes has not been applied!<br>
                  The Subject &amp; Section you are trying to change to already exists!
                </p>
                <p>
                  If you wish to change the current subject/section name to an already existing one,<br>
                  then the process is basically like how we rename files.<br>
                  If you don't know how then check the "Bulk Edit (including optional questions)" docs.
                </p>
              </div>

              <!-- form fields -->
              <template v-if="currentFormData && formData && !messagesState.applyingChanges">
                <div class="flex gap-8 px-2">
                  <BaseInputTextWithSelect
                    v-model="currentFormData.subject"
                    :select-options="SUBJECTS"
                    label="Subject Name"
                    :disabled="currentFormData.disableSubject"
                    label-root-class="grow"
                    input-class="h-10 text-[0.95rem]!"
                    :common-class="{
                      'border-green-500': formChangesState.subject,
                    }"
                    select-class="h-10!"
                    label-class="start-1/2! -translate-x-1/2 text-[0.85rem]"
                    placeholder="No Changes"
                  />
                  <BaseInputTextWithSelect
                    v-model="currentFormData.section"
                    :select-options="sections"
                    label="Section Name"
                    :disabled="currentFormData.disableSection"
                    label-root-class="grow"
                    :common-class="{
                      'border-green-500': formChangesState.section,
                    }"
                    input-class="h-10 text-[0.95rem]!"
                    select-class="h-10!"
                    label-class="start-1/2! -translate-x-1/2 text-[0.85rem]"
                    placeholder="No Changes"
                  />
                </div>
                <div class="flex gap-8 px-2">
                  <BaseFloatLabel
                    class="min-w-24 flex-1"
                    label="Question Type"
                    label-id="bulk_edit_question_type"
                    label-class="text-xs start-1/2! -translate-x-1/2"
                  >
                    <BaseSelect
                      id="bulk_edit_question_type"
                      v-model="currentFormData.questionType"
                      :options="questionTypeOptions"
                      :trigger-class="{
                        'border-green-500': formChangesState.questionType,
                      }"
                    />
                  </BaseFloatLabel>
                  <BaseFloatLabel
                    class="min-w-24 flex-1"
                    label="Answer Options"
                    label-id="bulk_edit_answer_options"
                    label-class="text-xs start-1/2! -translate-x-1/2"
                  >
                    <UiInput
                      id="bulk_edit_answer_options"
                      v-model="currentFormData.answerOptions"
                      class="text-center disabled:pointer-events-auto disabled:cursor-not-allowed"
                      type="text"
                      :class="{
                        'border-green-500': formChangesState.answerOptions,
                      }"
                      :disabled="currentFormData.questionType === 'nat'"
                      placeholder="No Changes"
                      @blur="currentFormData.answerOptions = currentFormData.answerOptions.trim()"
                    />
                  </BaseFloatLabel>
                </div>
                <div class="flex gap-3 flex-col">
                  <span class="mx-auto font-bold">Marking Scheme</span>
                  <div class="flex gap-8 px-2">
                    <BaseFloatLabel
                      class="w-full"
                      label="Correct"
                      label-id="bulk_edit_marks_correct"
                      label-class="start-1/2! -translate-x-1/2 text-xs"
                    >
                      <BaseInputNullableNumber
                        id="bulk_edit_marks_correct"
                        v-model="currentFormData.marks.cm"
                        :min="1"
                        :max="99"
                        :step-snapping="false"
                        :format-options="{ signDisplay: 'exceptZero' }"
                        :input-class="{
                          'border-green-500': formChangesState.marks.cm,
                        }"
                        size="small"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      class="w-full"
                      label="Partial"
                      label-id="bulk_edit_marks_partial"
                      label-class="start-1/2! -translate-x-1/2 text-xs"
                    >
                      <BaseInputNullableNumber
                        id="bulk_edit_marks_partial"
                        v-model="currentFormData.marks.pm"
                        :min="0"
                        :max="99"
                        :step-snapping="false"
                        :input-class="{
                          'border-green-500': formChangesState.marks.pm,
                        }"
                        :disabled="currentFormData.questionType === 'nat'
                          || currentFormData.questionType === 'msm'
                          || currentFormData.questionType === 'mcq'"
                        size="small"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      class="w-full"
                      label="Incorrect"
                      label-id="bulk_edit_marks_incorrect"
                      label-class="start-1/2! -translate-x-1/2 text-xs"
                    >
                      <BaseInputNullableNumber
                        id="bulk_edit_marks_incorrect"
                        v-model="currentFormData.marks.im"
                        :min="-99"
                        :max="0"
                        :step-snapping="false"
                        :input-class="{
                          'border-green-500': formChangesState.marks.im,
                        }"
                        size="small"
                      />
                    </BaseFloatLabel>
                  </div>
                </div>
                <div class="flex gap-4 lg:gap-10 px-2 items-end justify-center">
                  <div class="flex gap-2">
                    <BaseFloatLabel
                      class="w-full"
                      label="Optional Questions"
                      label-id="optional_questions_count"
                      label-class="start-1/2! -translate-x-1/2 text-xs"
                    >
                      <BaseInputNullableNumber
                        id="optional_questions_count"
                        v-model="currentFormData.optionalQuestionsCount"
                        :min="0"
                        :input-class="{
                          'border-green-500': formChangesState.optionalQuestionsCount,
                        }"
                        :disabled="currentFormData.optionalQuestionsCount === null"
                        size="small"
                      />
                    </BaseFloatLabel>
                  </div>
                  <div class="flex flex-col gap-3.5 mt-2 items-center">
                    <span class="mx-auto text-sm font-semibold">Answer Options Counter Type</span>
                    <div class="flex gap-3 lg:gap-6 justify-center">
                      <BaseFloatLabel
                        class="min-w-32 max-w-40"
                        :label="currentFormData.questionType === 'msm'
                          ? 'For MSM Rows'
                          : 'For MCQ & MSQ'
                        "
                        label-id="bulk_edit_counter_type_primary"
                        label-class="start-1/2! -translate-x-1/2 text-xs"
                      >
                        <BaseSelect
                          id="bulk_edit_counter_type_primary"
                          v-model="currentFormData.answerOptionsCounterTypePrimary"
                          :disabled="currentFormData.questionType === 'nat'"
                          :options="counterTypePrimaryOptions"
                          :trigger-class="{
                            'border-green-500': formChangesState.answerOptionsCounterTypePrimary,
                          }"
                        />
                      </BaseFloatLabel>
                      <BaseFloatLabel
                        class="min-w-32 max-w-40"
                        label="For MSM columns"
                        label-id="bulk_edit_counter_type_secondary"
                        label-class="start-1/2! -translate-x-1/2 text-xs"
                      >
                        <BaseSelect
                          id="bulk_edit_counter_type_secondary"
                          v-model="currentFormData.answerOptionsCounterTypeSecondary"
                          :options="counterTypeSecondaryOptions"
                          :disabled="currentFormData.questionType !== 'msm'"
                          :trigger-class="{
                            'border-green-500': formChangesState.answerOptionsCounterTypeSecondary,
                          }"
                        />
                      </BaseFloatLabel>
                    </div>
                  </div>
                </div>
                <UiCard class="py-2">
                  <UiCardHeader>
                    <UiCardTitle class="mx-auto text-base">
                      Cropped Region Coordinates Offset
                    </UiCardTitle>
                  </UiCardHeader>
                  <UiCardContent class="grid grid-cols-2 gap-4">
                    <BaseFloatLabel
                      class="w-full"
                      label="Left"
                      label-id="coords_left_offset"
                      label-class="start-1/2! -translate-x-1/2 text-xs"
                    >
                      <BaseInputNumber
                        id="coords_left_offset"
                        v-model="currentFormData.coordsOffset.l"
                        :input-class="{
                          'border-green-500': formChangesState.coordsOffset.l,
                        }"
                        :format-options="{ signDisplay: 'exceptZero' }"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      class="w-full"
                      label="Right"
                      label-id="coords_right_offset"
                      label-class="start-1/2! -translate-x-1/2 text-xs"
                    >
                      <BaseInputNumber
                        id="coords_right_offset"
                        v-model="currentFormData.coordsOffset.r"
                        :input-class="{
                          'border-green-500': formChangesState.coordsOffset.r,
                        }"
                        :format-options="{ signDisplay: 'exceptZero' }"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      class="w-full"
                      label="Top"
                      label-id="coords_top_offset"
                      label-class="start-1/2! -translate-x-1/2 text-xs"
                    >
                      <BaseInputNumber
                        id="coords_top_offset"
                        v-model="currentFormData.coordsOffset.t"
                        :input-class="{
                          'border-green-500': formChangesState.coordsOffset.t,
                        }"
                        :format-options="{ signDisplay: 'exceptZero' }"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      class="w-full"
                      label="Bottom"
                      label-id="coords_bottom_offset"
                      label-class="start-1/2! -translate-x-1/2 text-xs"
                    >
                      <BaseInputNumber
                        id="coords_bottom_offset"
                        v-model="currentFormData.coordsOffset.b"
                        :input-class="{
                          'border-green-500': formChangesState.coordsOffset.b,
                        }"
                        :format-options="{ signDisplay: 'exceptZero' }"
                      />
                    </BaseFloatLabel>
                  </UiCardContent>
                  <UiCardFooter class="block text-[0.9rem]">
                    Resize/Change the position of cropped regions by
                    applying offsets to its current boundaries (sides).<br>
                    Offsets are applied <strong>relative to region's existing coordinates</strong>.<br>
                    Offset can be positive or negative values.
                    <ul class="list-disc mt-1 ml-4 space-y-1">
                      <li>
                        For <strong>X-Axis (Left &amp; Right)</strong>, coordinate increases from left to right of page.
                      </li>
                      <li>
                        For <strong>Y-Axis (Top &amp; Bottom)</strong>, coordinate increases from top to bottom of page.
                      </li>
                    </ul>
                  </UiCardFooter>
                </UiCard>
              </template>
            </div>
          </UiScrollArea>
        </UiResizablePanel>
      </UiResizablePanelGroup>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import {
  SEPARATOR,
  QUESTION_TYPES_OPTIONS,
  ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT,
  SUBJECTS,
} from '#layers/shared/shared/constants'
import type { TreeNodeData } from '#layers/shared/app/components/Base/Tree'

type OverlayQuestionData = {
  [imgNum: string]: PdfCroppedOverlayData
}

type OverlaySubjectsData = GenericSubjectsTree<OverlayQuestionData>

type QuestionBaseOverlayData = Omit<PdfCroppedOverlayData, 'pdfData' | 'id' | 'imgNum'>
  & Partial<Pick<PdfCroppedOverlayData, 'pdfData' | 'id' | 'imgNum'>>

type DetailsSubjectType = { type: 'subject', subject: string }
type DetailsSectionType = { type: 'section', subject: string, section: string }
type DetailsQuestionType = {
  type: 'question'
  subject: string
  section: string
  question: string
  imgIds: string[]
}
type Details = DetailsSubjectType | DetailsSectionType | DetailsQuestionType

interface ExtendedTreeNodeData extends TreeNodeData {
  details: Details
  children?: ExtendedTreeNodeData[]
}

interface SubjectNodeData extends TreeNodeData {
  details: DetailsSubjectType
}
interface SectionNodeData extends TreeNodeData {
  details: DetailsSectionType
}
interface QuestionNodeData extends TreeNodeData {
  details: DetailsQuestionType
}

type FormData = {
  disableSubject: boolean
  disableSection: boolean
  subject: string
  section: string
  questionType: QuestionType | 'no-changes'
  answerOptions: string
  marks: {
    cm: number | null
    pm: number | null
    im: number | null
  }
  optionalQuestionsCount: number | null
  answerOptionsCounterTypePrimary: string | 'no-changes'
  answerOptionsCounterTypeSecondary: string | 'no-changes'
  coordsOffset: {
    l: number
    r: number
    t: number
    b: number
  }
}

type OptionalQuestions = NonNullable<PdfCropperJsonOutput['testConfig']['optionalQuestions']>

const showDialog = defineModel<boolean>({ required: true })

const optionalQuestions = defineModel<OptionalQuestions>('optionalQuestions', { required: true })
const overlayDatas = defineModel<Map<string, PdfCroppedOverlayData>>('overlayDatas', { required: true })
const { pagesDimensions, allowResizingPanels } = defineProps<{
  pagesDimensions: {
    [pageNum: number]: { width: number, height: number }
  }
  allowResizingPanels: boolean
}>()

const messagesState = shallowReactive({
  applyingChanges: false,
  changesApplied: false,
  subjectOrSectionAlreadyExists: false,
})

const sections = computed(() => {
  const subject = currentFormData.value?.subject

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

const overlaySubjectsData = shallowRef<OverlaySubjectsData>({})

const treeNodes = shallowRef<ExtendedTreeNodeData[]>([])
const selectedTreeNodes = shallowRef<ExtendedTreeNodeData[] | undefined>(undefined)

const currentFormData = ref<FormData | null>(null)
const formData = shallowRef<FormData | null>(null)

const isFormLoaded = computed(() => Boolean(formData.value && currentFormData.value))

const formChangesState = reactive({
  subject: computed(() => {
    if (!isFormLoaded.value)
      return false
    return !currentFormData.value!.disableSubject
      && currentFormData.value!.subject.trim()
      && currentFormData.value!.subject.trim() !== formData.value!.subject
  }),
  section: computed(() => {
    if (!isFormLoaded.value)
      return false
    return !currentFormData.value!.disableSection
      && currentFormData.value!.section.trim()
      && currentFormData.value!.section.trim() !== formData.value!.section
  }),
  questionType: computed(() => {
    if (!isFormLoaded.value)
      return false
    return currentFormData.value!.questionType !== formData.value!.questionType
  }),
  answerOptions: computed(() => {
    if (!isFormLoaded.value)
      return false
    return currentFormData.value!.answerOptions.trim() !== formData.value!.answerOptions
      && currentFormData.value!.questionType !== 'nat'
  }),
  optionalQuestionsCount: computed(() => {
    if (!isFormLoaded.value)
      return false
    return currentFormData.value!.optionalQuestionsCount !== formData.value!.optionalQuestionsCount
  }),
  answerOptionsCounterTypePrimary: computed(() => {
    if (!isFormLoaded.value)
      return false
    const a = currentFormData.value!.answerOptionsCounterTypePrimary
    const b = formData.value!.answerOptionsCounterTypePrimary
    return a !== b
  }),
  answerOptionsCounterTypeSecondary: computed(() => {
    if (!isFormLoaded.value)
      return false
    const a = currentFormData.value!.answerOptionsCounterTypeSecondary
    const b = formData.value!.answerOptionsCounterTypeSecondary
    return a !== b
  }),
  marks: {
    cm: computed(() => {
      if (!isFormLoaded.value)
        return false
      return currentFormData.value!.marks.cm !== formData.value!.marks.cm
    }),
    pm: computed(() => {
      if (!isFormLoaded.value)
        return false
      return currentFormData.value!.marks.pm !== formData.value!.marks.pm
        && currentFormData.value!.questionType !== 'nat'
        && currentFormData.value!.questionType !== 'msm'
    }),
    im: computed(() => {
      if (!isFormLoaded.value)
        return false
      return currentFormData.value!.marks.im !== formData.value!.marks.im
    }),
  },
  coordsOffset: {
    l: computed(() => !!currentFormData.value?.coordsOffset.l),
    r: computed(() => !!currentFormData.value?.coordsOffset.r),
    t: computed(() => !!currentFormData.value?.coordsOffset.t),
    b: computed(() => !!currentFormData.value?.coordsOffset.b),
  },
})

const isThereAnyChangesInForm = computed<boolean>(() => {
  for (const maybeBoolean of Object.values(formChangesState)) {
    if (typeof maybeBoolean === 'object') {
      for (const bool of Object.values(maybeBoolean)) {
        if (bool)
          return true
      }
    }
    else if (maybeBoolean)
      return true
  }

  return false
})

const selectComponentsOptionsWithNoChanges = {
  counterType: [{ name: 'No Changes', value: 'no-changes' }].concat(ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT),
  questionType: [{ name: 'No Changes', value: 'no-changes' }].concat(QUESTION_TYPES_OPTIONS),
}

const questionTypeOptions = computed(() => {
  if (formData.value?.questionType !== 'no-changes')
    return QUESTION_TYPES_OPTIONS
  return selectComponentsOptionsWithNoChanges.questionType
})

const counterTypePrimaryOptions = computed(() => {
  if (formData.value?.answerOptionsCounterTypePrimary !== 'no-changes')
    return ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT

  return selectComponentsOptionsWithNoChanges.counterType
})

const counterTypeSecondaryOptions = computed(() => {
  if (formData.value?.answerOptionsCounterTypeSecondary !== 'no-changes')
    return ANSWER_OPTIONS_COUNTER_TYPES_WITH_DEFAULT

  return selectComponentsOptionsWithNoChanges.counterType
})

watch(
  showDialog,
  (isShow) => {
    if (isShow) {
      loadOverlaySubjectsData()
      loadOverlaySubjectsDataToTreeNodesData()
    }
    else { // clean up
      cleanupDatas()
    }
  },
  { flush: 'pre' },
)

function cleanupDatas() {
  formData.value = null
  currentFormData.value = null
  selectedTreeNodes.value = undefined
  overlaySubjectsData.value = {}
  treeNodes.value = []

  messagesState.applyingChanges = false
  messagesState.changesApplied = false
  messagesState.subjectOrSectionAlreadyExists = false
}

function loadOverlaySubjectsData() {
  const newData: OverlaySubjectsData = {}
  for (const overlay of overlayDatas.value.values()) {
    const { subject, section: sec, que, imgNum } = overlay
    const section = sec || subject

    newData[subject] ??= {}
    newData[subject][section] ??= {}
    newData[subject][section][que] ??= {}
    newData[subject][section][que][imgNum] = overlay
  }
  overlaySubjectsData.value = newData
}

function loadOverlaySubjectsDataToTreeNodesData(data = overlaySubjectsData.value) {
  const newTreeNodes: ExtendedTreeNodeData[] = []

  for (const [subject, subjectData] of Object.entries(data)) {
    const subjectChildren: NonNullable<ExtendedTreeNodeData['children']> = []

    for (const [section, sectionData] of Object.entries(subjectData)) {
      const isSubjectWithNoSections = subject === section

      const sectionId = subject + SEPARATOR + section

      const questionsParent = isSubjectWithNoSections
        ? subjectChildren
        : []

      for (const [question, questionData] of Object.entries(sectionData)) {
        const imgIds = Object.values(questionData).map(img => img.id)

        const questionNode: ExtendedTreeNodeData = {
          id: sectionId + SEPARATOR + question,
          label: question,
          details: {
            type: 'question',
            imgIds,
            subject,
            section,
            question,
          },
        }

        questionsParent.push(questionNode)
      }

      if (!isSubjectWithNoSections) {
        const sectionNode: ExtendedTreeNodeData = {
          id: sectionId,
          label: section,
          children: questionsParent,
          details: {
            type: 'section',
            subject,
            section,
          },
        }
        subjectChildren.push(sectionNode)
      }
    }

    const subjectNode: ExtendedTreeNodeData = {
      id: subject,
      label: subject,
      children: subjectChildren,
      details: {
        type: 'subject',
        subject,
      },
    }

    newTreeNodes.push(subjectNode)
  }

  treeNodes.value = newTreeNodes
}

function unloadFormData() {
  selectedTreeNodes.value = []
  currentFormData.value = null
  formData.value = null
}

function loadFormData() {
  const maybeNodes = selectedTreeNodes.value
  if (!maybeNodes) return

  messagesState.applyingChanges = false
  messagesState.changesApplied = false
  messagesState.subjectOrSectionAlreadyExists = false

  const nodes = Array.isArray(maybeNodes) ? maybeNodes : [maybeNodes]

  const subjectNodes: SubjectNodeData[] = []
  const sectionNodes: SectionNodeData[] = []

  const structuredData: Record<string, Record<string, number>> = {}

  let questionType: QuestionType | boolean = true
  let answerOptions: string | boolean = true
  const marks = {
    cm: true as number | boolean,
    pm: true as number | boolean,
    im: true as number | boolean,
  }
  let counterTypePrimary: string | boolean = true
  let counterTypeSecondary: string | boolean = true

  for (const node of nodes) {
    if (node.details.type === 'question') {
      const questionFirstImgId = node.details.imgIds[0]!
      const overlay = overlayDatas.value.get(questionFirstImgId)

      if (!overlay) continue

      const { subject, section } = overlay
      structuredData[subject] ??= {}
      structuredData[subject][section] ??= 0
      structuredData[subject][section]++

      if (questionType) {
        if (questionType === true)
          questionType = overlay.type
        else if (questionType !== overlay.type)
          questionType = false
      }

      if (answerOptions) {
        if (answerOptions === true)
          answerOptions = overlay.answerOptions
        else if (answerOptions !== overlay.answerOptions)
          answerOptions = false
      }

      for (const marksTypeName of ['cm', 'im', 'pm'] as const) {
        const previousVal = marks[marksTypeName]
        const currentVal = overlay.marks[marksTypeName]

        if (marksTypeName === 'pm' && overlay.type !== 'msq')
          continue

        if (typeof previousVal === 'number' || previousVal) {
          if (previousVal === true)
            marks[marksTypeName] = currentVal
          else if (previousVal !== currentVal)
            marks[marksTypeName] = false
        }
      }

      if (counterTypePrimary) {
        const val = overlay.answerOptionsCounterTypePrimary
        if (counterTypePrimary === true)
          counterTypePrimary = val
        else if (counterTypePrimary !== val)
          counterTypePrimary = false
      }

      if (counterTypeSecondary && overlay.type === 'msm') {
        const val = overlay.answerOptionsCounterTypeSecondary
        if (counterTypeSecondary === true)
          counterTypeSecondary = val
        else if (counterTypeSecondary !== val)
          counterTypeSecondary = false
      }
    }
    else if (node.details.type === 'subject') {
      subjectNodes.push(node as SubjectNodeData)
    }
    else {
      sectionNodes.push(node as SectionNodeData)
    }
  }

  const disableSection = sectionNodes.length !== 1
    || Object.values(structuredData).map(Object.keys).flat().length !== 1

  const disableSubject = disableSection
    && (subjectNodes.length !== 1 || Object.keys(structuredData).length !== 1)

  const section = disableSection
    ? ''
    : (sectionNodes[0]!.details.section || '')

  const subject = section
    ? sectionNodes[0]!.details.subject
    : disableSubject
      ? ''
      : (subjectNodes[0]?.details.subject || '')

  const _formData: FormData = {
    disableSubject,
    disableSection,
    subject,
    section,
    questionType: typeof questionType === 'string' ? questionType : 'no-changes',
    answerOptions: typeof answerOptions === 'string' ? answerOptions : '',
    marks: {
      cm: typeof marks.cm === 'number' ? marks.cm : null,
      pm: typeof marks.pm === 'number' ? marks.pm : null,
      im: typeof marks.im === 'number' ? marks.im : null,
    },
    optionalQuestionsCount: 0,
    coordsOffset: { l: 0, r: 0, t: 0, b: 0 },
    answerOptionsCounterTypePrimary: typeof counterTypePrimary === 'string'
      ? counterTypePrimary
      : 'no-changes',
    answerOptionsCounterTypeSecondary: typeof counterTypeSecondary === 'string'
      ? counterTypeSecondary
      : 'no-changes',
  }

  if (section && subject && !disableSection) {
    const existingOptionalQuestionsCount = optionalQuestions.value
      .find(obj => obj.subject === subject && obj.section === section)
      ?.count

    if (existingOptionalQuestionsCount)
      _formData.optionalQuestionsCount = existingOptionalQuestionsCount
  }
  else
    _formData.optionalQuestionsCount = null

  formData.value = _formData
  currentFormData.value = structuredClone(_formData)
}

function checkIfSubjectAndSectionToRenameAlreadyExists() {
  if (!formData.value || !currentFormData.value)
    return false

  if (formChangesState.subject || formChangesState.section) {
    if (formData.value.disableSection) {
      const newSubject = currentFormData.value.subject.trim()
      if (newSubject in overlaySubjectsData.value)
        return true
    }
    else {
      const oldSubject = formData.value.subject
      const oldSection = formData.value.section
      const newSubject = currentFormData.value.subject.trim() || oldSubject
      const newSection = currentFormData.value.section.trim() || oldSection

      const subjectData = overlaySubjectsData.value[newSubject]
      if (subjectData && newSection in subjectData)
        return true
    }
  }

  return false
}

async function applyChanges() {
  if (checkIfSubjectAndSectionToRenameAlreadyExists()) {
    messagesState.subjectOrSectionAlreadyExists = true
    return
  }

  const maybeNodes = selectedTreeNodes.value
  if (!maybeNodes) return

  messagesState.applyingChanges = true
  await nextTick()

  const nodes = Array.isArray(maybeNodes) ? maybeNodes : [maybeNodes]
  const qNodes = nodes.filter(node => node.details.type === 'question') as QuestionNodeData[]

  const currFormData = utilCloneJson(currentFormData.value!)
  const formsChanges = utilCloneJson(formChangesState)

  for (const qNode of qNodes) {
    const imgIds = qNode.details.imgIds
    const firstImgId = imgIds.length > 0 ? utilCloneJson(imgIds[0]!) : null
    if (!firstImgId)
      continue

    const qBaseOverlay: QuestionBaseOverlayData = utilCloneJson(
      overlayDatas.value.get(firstImgId)!,
    )
    delete qBaseOverlay.pdfData
    delete qBaseOverlay.id
    delete qBaseOverlay.imgNum

    const queId = qBaseOverlay.queId

    if (formsChanges.questionType && currFormData.questionType !== 'no-changes') {
      qBaseOverlay.type = currFormData.questionType

      if (qBaseOverlay.type === 'nat') {
        qBaseOverlay.answerOptions = '4'
        qBaseOverlay.answerOptionsCounterTypePrimary = 'default'
        qBaseOverlay.answerOptionsCounterTypeSecondary = 'default'
      }
    }

    if (formsChanges.answerOptionsCounterTypePrimary
      && currFormData.answerOptionsCounterTypePrimary !== 'no-changes') {
      if (qBaseOverlay.type === 'nat') {
        qBaseOverlay.answerOptionsCounterTypePrimary = 'default'
      }
      else {
        qBaseOverlay.answerOptionsCounterTypePrimary = currFormData.answerOptionsCounterTypePrimary
      }
    }

    if (formsChanges.answerOptionsCounterTypeSecondary
      && currFormData.answerOptionsCounterTypeSecondary !== 'no-changes') {
      if (qBaseOverlay.type !== 'msm') {
        qBaseOverlay.answerOptionsCounterTypeSecondary = 'default'
      }
      else {
        qBaseOverlay.answerOptionsCounterTypeSecondary = currFormData.answerOptionsCounterTypeSecondary
      }
    }

    if (formsChanges.answerOptions && currFormData.answerOptions.trim()) {
      qBaseOverlay.answerOptions = qBaseOverlay.type === 'nat'
        ? '4'
        : currFormData.answerOptions.trim()
    }

    if (formsChanges.marks.cm && typeof currFormData.marks.cm === 'number') {
      qBaseOverlay.marks.cm = currFormData.marks.cm
    }

    if (formsChanges.marks.im && typeof currFormData.marks.im === 'number') {
      qBaseOverlay.marks.im = currFormData.marks.im
    }

    if (formsChanges.marks.pm
      && typeof currFormData.marks.pm === 'number'
      && qBaseOverlay.type === 'msq'
    ) {
      qBaseOverlay.marks.pm = currFormData.marks.pm
    }

    if (formsChanges.subject || formsChanges.section) {
      const subject = currFormData.subject.trim() || qBaseOverlay.subject
      const section = currFormData.section.trim() || qBaseOverlay.section
      const newQueId = `${section || subject}${SEPARATOR}${qBaseOverlay.que}`
      qBaseOverlay.subject = subject
      qBaseOverlay.section = section
      qBaseOverlay.queId = newQueId
    }

    for (const imgId of imgIds) {
      const imgoverlay = overlayDatas.value.get(imgId)
      if (!imgoverlay)
        continue

      const coordsOffset = currFormData.coordsOffset
      const pageDims = pagesDimensions![imgoverlay.pdfData.page]!

      for (const coord of ['l', 'r', 't', 'b'] as const) {
        if (formsChanges.coordsOffset[coord] && coordsOffset[coord]) {
          let max = pageDims.width
          if (coord === 't' || coord === 'b')
            max = pageDims.height

          const val = imgoverlay.pdfData[coord] + coordsOffset[coord]
          imgoverlay.pdfData[coord] = utilClampNumber(val, 0, max)
        }
      }

      Object.assign(imgoverlay, structuredClone(qBaseOverlay))

      if (queId !== qBaseOverlay.queId) {
        overlayDatas.value.delete(imgId)
        const newImgId = `${qBaseOverlay.queId}${SEPARATOR}${imgoverlay.imgNum}`
        imgoverlay.id = newImgId
        overlayDatas.value.set(newImgId, imgoverlay)
      }
    }
  }

  if (formsChanges.optionalQuestionsCount || formsChanges.subject || formsChanges.section) {
    const { subject: ogSubject, section: ogSection } = formData.value!
    const newCount = currFormData.optionalQuestionsCount
    const existingDataIndex = optionalQuestions.value
      .findIndex(obj => obj.subject === ogSubject && obj.section === ogSection)

    const subject = currFormData.subject.trim() || ogSubject
    const section = currFormData.section.trim()
      || (ogSection === ogSubject ? subject : ogSection)

    if (existingDataIndex >= 0) {
      const optionalQuestionsItem = optionalQuestions.value[existingDataIndex]!
      optionalQuestionsItem.subject = subject
      optionalQuestionsItem.section = section

      if (formsChanges.optionalQuestionsCount) {
        if (newCount)
          optionalQuestionsItem.count = newCount
        else {
          optionalQuestions.value.splice(existingDataIndex, 1)
        }
      }
    }
    else if (newCount) {
      optionalQuestions.value.push({ subject, section, count: newCount })
    }
  }

  if (formsChanges.subject || formsChanges.section) {
    cleanupDatas()
    await nextTick()
    loadOverlaySubjectsData()
    loadOverlaySubjectsDataToTreeNodesData()
  }
  else {
    currentFormData.value = null
    formData.value = null
  }

  messagesState.applyingChanges = false
  messagesState.changesApplied = true
}
</script>
