<script lang="ts" setup>
import { cropperOverlayDatasKey } from '../keys'

type SubjectsListItem = {
  id: number
  name: string
  sections: {
    id: number
    name: string
    overlayIds: string[]
  }[]
}

const currentStep = defineModel<number>('currentStep', { required: true })

const overlayDatas = inject(cropperOverlayDatasKey)!

const originalSubjectsList = getSubjectsListData()
const subjectsList = ref<SubjectsListItem[]>(structuredClone(originalSubjectsList))

const sectionsListData = reactive({
  subjectId: 0,
  items: [] as SubjectsListItem['sections'],
})

const subjectsOrderListElem = useTemplateRef('subjectsOrderListElem')

const isListOrderChanged = computed(() => {
  for (let i = 0; i < originalSubjectsList.length; i++) {
    const originalSubject = originalSubjectsList[i]!
    const currentSubject = subjectsList.value[i]!

    if (originalSubject.id !== currentSubject.id) {
      return true
    }

    for (let j = 0; j < originalSubject.sections.length; j++) {
      if (originalSubject.sections[j]?.id !== currentSubject.sections[j]?.id) {
        return true
      }
    }
  }

  return false
})

const selectedSubjectItemIds = computed(
  () => subjectsOrderListElem.value?.selectedItemsIds ?? [],
)

watch(selectedSubjectItemIds, () => {
  if (selectedSubjectItemIds.value.length === 1) {
    const newSubjectId = selectedSubjectItemIds.value[0]!

    if (sectionsListData.subjectId === newSubjectId) return

    const item = subjectsList.value.find(v => v.id === newSubjectId)

    if (item?.sections?.some(sec => sec.name !== item.name)) {
      sectionsListData.subjectId = newSubjectId
      sectionsListData.items = item.sections
      return
    }
  }

  sectionsListData.subjectId = 0
  sectionsListData.items = []
})

function getSubjectsListData() {
  type SectionsMap = Map<string, string[]>
  const subjects = new Map<string, SectionsMap>()

  for (const overlay of overlayDatas.value.values()) {
    const { subject, section, id } = overlay

    let sections: SectionsMap | null = null
    if (subjects.has(subject)) {
      sections = subjects.get(subject)!
    }
    else {
      sections = new Map()
      sections.set(section, [])
      subjects.set(subject, sections)
    }

    if (sections.has(section))
      sections.get(section)!.push(id)
    else
      sections.set(section, [id])
  }

  const subjectListItems: SubjectsListItem[] = []

  let subjectId = 1
  for (const [subject, sections] of subjects.entries()) {
    const sectionsListItems: SubjectsListItem['sections'] = []

    let sectionId = 1
    for (const [section, overlayIds] of sections.entries()) {
      sectionsListItems.push({
        id: sectionId,
        name: section,
        overlayIds,
      })
      sectionId++
    }

    subjectListItems.push({
      id: subjectId,
      name: subject,
      sections: sectionsListItems,
    })
    subjectId++
  }

  return subjectListItems
}

function applyChanges() {
  const newMap: typeof overlayDatas.value = new Map()

  for (const subject of subjectsList.value) {
    for (const section of subject.sections) {
      for (const overlayId of section.overlayIds) {
        const overlay = overlayDatas.value.get(overlayId)
        if (overlay)
          newMap.set(overlayId, overlay)
      }
    }
  }

  overlayDatas.value = newMap
  currentStep.value++
}
</script>

<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle class="text-center text-lg">
        Sort Subjects and/or Sections (Optional)
      </UiCardTitle>
      <UiCardDescription class="text-center">
        You can sort the order of subjects and/or sections.<br>
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="flex flex-col gap-8 items-center p-4 min-w-full ">
      <div class="grid grid-cols-2 gap-10 min-w-full md:min-w-2xl lg:min-w-3xl">
        <div class="flex flex-col gap-4 items-center">
          <UiLabel class="pl-10">
            Sort Subjects
          </UiLabel>
          <CbtOrderList
            ref="subjectsOrderListElem"
            v-model="subjectsList"
            list-container-class="min-w-48"
            scroll-container-class="[&>div]:max-h-200"
            allow-one-only-selection-to-persist
          />
        </div>
        <div class="flex flex-col gap-4 items-center">
          <UiLabel class="pl-10">
            Sort Sections
          </UiLabel>
          <CbtOrderList
            v-model="sectionsListData.items"
            scroll-container-class="[&>div]:max-h-200"
            list-container-class="min-w-48"
          />
        </div>
      </div>
      <div>
        <BaseButton
          variant="warn"
          icon-name="material-symbols:check-circle-outline"
          label="Apply Changes & Next"
          icon-size="1.4rem"
          :disabled="!isListOrderChanged"
          @click="applyChanges"
        />
      </div>
    </UiCardContent>
  </UiCard>
</template>
