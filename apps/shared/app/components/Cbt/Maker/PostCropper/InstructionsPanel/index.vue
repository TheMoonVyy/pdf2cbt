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

const { uiSettings } = useCbtSettings()

const instructionsTemplateData = shallowRef<CbtInstructionsTemplateData | null>(null)

function prepareInstructionsTemplateData() {
  const pdfCropperData = utilTransformOverlaysToOutputPdfCropperDataFormat(
    overlays.value,
    pagesImgData,
  )

  const icons = useCbtInterfaceIcons()

  instructionsTemplateData.value = utilGetParsedInstructionsDataForTemplate(
    pdfCropperData,
    instructionsData,
    'Mock Test',
    180,
    uiSettings.value,
    icons.value,
  )

  instructionsData
    .testInstructions
    .imgLinksFootNotes = utilGetIconUrlFootNotesForInstructionsTemplate(
      icons.value,
    )
}

onBeforeMount(() => {
  prepareInstructionsTemplateData()
})
</script>

<template>
  <UiTabs
    default-value="section"
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
      <CbtMakerPostCropperInstructionsPanelSectionsInstructions
        v-if="instructionsTemplateData"
        :instructions-template-data="instructionsTemplateData"
      />
    </UiTabsContent>
  </UiTabs>
</template>
