<template>
  <div class="card flex justify-center">
    <Drawer
      v-model:visible="hiddenSettingsVisibility"
      header="Settings"
      position="right"
      pt:header:class="p-3"
      pt:content:class="px-0 flex flex-col"
    >
      <Panel
        header="Question Img Max Width (%)"
        toggleable
        class="w-full"
        pt:content:class="px-4"
      >
        <div
          class="grid grid-cols-1 mt-4 gap-3"
        >
          <label
            for="ques_img_max_width_qp_opened"
            class="text-center"
          >
            When Question Palette Opened
          </label>
          <BaseInputNumber
            v-model="uiSettings.questionPanel.questionImgMaxWidth.maxWidthWhenQuestionPaletteOpened"
            :min="10"
            :max="100"
            :step="5"
            label-id="ques_img_max_width_qp_opened"
          />
        </div>
        <div
          class="grid grid-cols-1 mt-4 gap-3"
        >
          <label
            for="ques_img_max_width_qp_closed"
            class="text-center"
          >
            When Question Palette Closed
          </label>
          <BaseInputNumber
            v-model="uiSettings.questionPanel.questionImgMaxWidth.maxWidthWhenQuestionPaletteClosed"
            :min="10"
            :max="100"
            :step="5"
            label-id="ques_img_max_width_qp_closed"
          />
        </div>
      </Panel>
      <div
        v-if="testSettings.showPauseBtn"
        class="flex mx-auto mt-6"
      >
        <BaseButton
          class="col-span-2 sm:col-span-1"
          label="Pause Test"
          :fluid="false"
          :disabled="testStatus !== 'ongoing'"
          severity="help"
          @click="emitPauseCountdown"
        >
          <template #icon>
            <Icon
              name="mdi:stopwatch-pause-outline"
              size="1.4rem"
            />
          </template>
        </BaseButton>
      </div>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import type { CurrentTestState } from '~/src/types'

const hiddenSettingsVisibility = defineModel<boolean>({ required: true })

defineProps<{
  testStatus: CurrentTestState['testStatus']
}>()

const emit = defineEmits(['pauseTest'])

const { uiSettings, testSettings } = useCbtSettings()

const emitPauseCountdown = () => {
  emit('pauseTest')
  hiddenSettingsVisibility.value = false
}
</script>
