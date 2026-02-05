<script lang="ts" setup>
// import {
//   SEPARATOR,
//   MIME_TYPE,
// } from '#layers/shared/shared/constants'
import {
  cropperOverlayDatasKey,
  instructionsDataKey,
  pagesImgDataKey,
} from '../../keys'

const overlays = inject(cropperOverlayDatasKey)!
const pagesImgData = inject(pagesImgDataKey)!
const instructionsData = inject(instructionsDataKey)!

const instructionsTemplateData = shallowRef<CbtInstructionsTemplateData | null>(null)

function prepareInstructionsTemplateData() {
  const pdfCropperData = utilTransformOverlaysToOutputPdfCropperDataFormat(
    overlays.value,
    pagesImgData,
  )

  instructionsTemplateData.value = utilGetParsedInstructionsDataForTemplate(
    pdfCropperData,
    instructionsData,
    'Mock Test',
    180,
  )

  instructionsData
    .testInstructions
    .imgLinksFootNotes = utilGetIconUrlFootNotesForInstructionsTemplate(
      instructionsTemplateData.value.icons,
    )
}

onBeforeMount(() => {
  prepareInstructionsTemplateData()
})
</script>

<template>
  <UiTabs
    default-value="test"
    class="mt-4 w-9/10! gap-0 max-w-4xl"
  >
    <UiTabsList class="w-full flex justify-center h-12 rounded-b-none">
      <UiTabsTrigger
        class="text-xl cursor-pointer data-[state=active]:bg-green-600/60"
        value="test"
      >
        Test Instructions
      </UiTabsTrigger>
      <UiTabsTrigger
        class="text-xl cursor-pointer data-[state=active]:bg-green-600/60"
        value="section"
      >
        Section-wise Instructions
      </UiTabsTrigger>
    </UiTabsList>
    <UiTabsContent
      value="test"
    >
      <CbtMakerPostCropperInstructionsPanelTestInstructions
        v-if="instructionsTemplateData"
        :instructions-template-data="instructionsTemplateData"
      />
    </UiTabsContent>
    <UiTabsContent value="section">
      <UiCard class="w-full py-2 rounded-t-none">
        <UiCardHeader>
          <UiCardDescription class="text-center text-base">
            Intructions to show on 1st question of each section (or subject if no sections exists).<br>
            Generally used for marking scheme & question type info (especially in JEE Advanced).
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          s
        </UiCardContent>
      </UiCard>
    </UiTabsContent>
  </UiTabs>
</template>
