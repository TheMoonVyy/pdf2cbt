<script lang="ts" setup>
import { instructionsDataKey } from '../../keys'

const { instructionsTemplateData } = defineProps<{
  instructionsTemplateData: CbtInstructionsTemplateData
}>()

const instructionsData = inject(instructionsDataKey)!

const sections = computed(() => {
  const data = new Map<string, {
    subject: string
    tplData: CbtInstructionsTemplateSectionData
  }>()

  for (const subject of instructionsTemplateData.subjects) {
    for (const section of subject.sections) {
      data.set(section.name, {
        subject: subject.name,
        tplData: section,
      })
    }
  }

  return data
})

// using computed to reduce instructions data to sections
// while it is computed property (which is read-only)
// but the section instruction data is writable
// and that data is in sync with instructionsData object
const sectionsInstData = computed(() => {
  const data: Record<string,
    CbtMakerInternalInstructionsData['additionalData'][string]['sections'][string]['instructions']
  > = {}

  for (const subjectData of Object.values(instructionsData.additionalData)) {
    for (const [section, sectionData] of Object.entries(subjectData.sections)) {
      data[section] = sectionData.instructions
    }
  }

  return data
})
</script>

<template>
  <UiCard class="w-full py-2 rounded-t-none">
    <UiCardHeader>
      <UiCardDescription class="text-center text-base">
        Instructions to show on 1st question of each section (or subject if no sections exists).<br>
        Generally used for marking scheme & question type info (especially in JEE Advanced).
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="flex flex-col gap-10">
      <UiCard
        v-for="[section, sectionData] in sections.entries()"
        :key="section"
        class="flex flex-col gap-3 pt-3 pb-0 has-data-cbt-section-instructions:rounded-b-none"
      >
        <UiCardHeader>
          <UiCardTitle class="text-center text-xl">
            {{ sectionData.tplData.name }}
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="flex flex-col gap-5 px-0">
          <CbtMakerSectionsInstructionsInputDropDown
            v-model="sectionsInstData[section]!.type"
            class="mb-7"
            :question-type="sectionData.tplData.questionType"
          />
          <CbtSectionInstructionsPanel
            v-if="sectionsInstData[section]?.type !== 'none'"
            :instructions="sectionsInstData[section]!"
            :template-data="sectionData.tplData"
          />
        </UiCardContent>
      </UiCard>
    </UiCardContent>
  </UiCard>
</template>
