<script lang="ts" setup>
import {
  instructionsDataKey,
} from '../../keys'

const { instructionsTemplateData } = defineProps<{
  instructionsTemplateData: CbtInstructionsTemplateData
}>()

const instructionsData = inject(instructionsDataKey)!

const selectOptions: {
  name: string
  value: CbtMakerInternalInstructionsData['testInstructions']['type']
}[] = [
  { name: 'Default', value: 'default' },
  { name: 'COMEDK', value: 'comedk' },
]

const parsedTestInstructions = computed<CbtParsedTestInstructions>(() => {
  const imgLinksFootNotes = instructionsData.testInstructions.imgLinksFootNotes || ''

  return useGetCbtTestInstructionsContent(
    instructionsData.testInstructions.type,
    instructionsTemplateData,
    imgLinksFootNotes,
  )
})
</script>

<template>
  <UiCard class="w-full py-2 rounded-t-none">
    <UiCardHeader>
      <UiCardDescription class="text-center text-base">
        Test intructions to show before the test starts.<br>
        Choose the instructions format to show for this test.
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="px-0 flex flex-col gap-10">
      <div class="flex gap-4 mx-auto">
        <UiLabel
          class="text-lg text-nowrap"
          for="test_instructions_format"
        >
          Test Instructions Format:
        </UiLabel>
        <BaseSelect
          id="test_instructions_format"
          v-model="instructionsData.testInstructions.type"
          size="base"
          :options="selectOptions"
        />
      </div>
      <div class="flex flex-col gap-3">
        <h2 class="text-center text-lg">
          PREVIEW:
        </h2>
        <CbtTestInstructionsPanel
          v-if="parsedTestInstructions?.pages.length"
          :parsed-test-instructions="parsedTestInstructions"
        />
      </div>
    </UiCardContent>
  </UiCard>
</template>
