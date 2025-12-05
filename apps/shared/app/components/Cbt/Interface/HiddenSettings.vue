<template>
  <UiSheet v-model:open="hiddenSettingsVisibility">
    <UiSheetContent
      side="right"
    >
      <UiSheetHeader class="p-3 pb-1">
        <UiSheetTitle class="mx-auto text-2xl">
          Settings
        </UiSheetTitle>
      </UiSheetHeader>
      <UiScrollArea
        class="h-full w-full"
      >
        <UiCard
          class="w-full py-2"
        >
          <UiCardHeader>
            <UiCardTitle class="text-base mx-auto">
              Question Img Max Width (%)
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <div
              class="flex flex-col items-center gap-3"
            >
              <UiLabel
                for="ques_img_max_width_qp_opened"
                class="text-center"
              >
                When Question Palette Opened
              </UiLabel>
              <BaseInputNumber
                id="ques_img_max_width_qp_opened"
                v-model="uiSettings.questionPanel.questionImgMaxWidth.maxWidthWhenQuestionPaletteOpened"
                :min="10"
                :max="100"
                :step="5"
              />
            </div>
            <div
              class="flex flex-col items-center mt-5 gap-3"
            >
              <UiLabel
                for="ques_img_max_width_qp_closed"
                class="text-center"
              >
                When Question Palette Closed
              </UiLabel>
              <BaseInputNumber
                id="ques_img_max_width_qp_closed"
                v-model="uiSettings.questionPanel.questionImgMaxWidth.maxWidthWhenQuestionPaletteClosed"
                :min="10"
                :max="100"
                :step="5"
              />
            </div>
          </UiCardContent>
        </UiCard>
        <UiCard
          class="w-full py-2"
        >
          <UiCardHeader>
            <UiCardTitle class="text-base mx-auto">
              Main Layout
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <div
              class="flex flex-col items-center gap-3"
            >
              <UiLabel
                for="test-interface-zoom-size"
                class="text-center"
              >
                Page Zoom Size (in %)
              </UiLabel>
              <BaseInputNumber
                id="test-interface-zoom-size"
                v-model="appSettings.pages.testInterface.size"
                :min="50"
                :max="250"
                :step="5"
              />
            </div>
          </UiCardContent>
        </UiCard>
        <div
          v-if="testSettings.showPauseBtn"
          class="flex mt-6 justify-center w-full"
        >
          <BaseButton
            label="Pause Test"
            :disabled="testStatus !== 'ongoing'"
            variant="help"
            icon-name="mdi:stopwatch-pause-outline"
            @click="emitPauseCountdown"
          />
        </div>
      </UiScrollArea>
    </UiSheetContent>
  </UiSheet>
</template>

<script setup lang="ts">
const hiddenSettingsVisibility = defineModel<boolean>({ required: true })

defineProps<{
  testStatus: CurrentTestState['testStatus']
}>()

const emit = defineEmits(['pauseTest'])

const { uiSettings, testSettings } = useCbtSettings()
const appSettings = useAppSettings()

const emitPauseCountdown = () => {
  emit('pauseTest')
  hiddenSettingsVisibility.value = false
}
</script>
