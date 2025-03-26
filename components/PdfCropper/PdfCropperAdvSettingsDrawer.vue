<template>
  <div class="card flex justify-center">
    <Drawer
      v-model:visible="advanceSettingsVisible"
      header="Advance Settings"
      :pt="{ content: 'px-0', header: 'p-3' }"
    >
      <Panel
        header="Colors"
        toggleable
        class="w-full"
        :pt="{ content: 'px-2' }"
      >
        <div class="grid grid-cols-5 mt-4 gap-2">
          <FloatLabel
            class="w-full col-start-1 col-span-3"
            variant="on"
          >
            <InputText
              v-model="settings.pageBGColor"
              type="text"
              label-id="page_bg_color"
              disabled
              :fluid="true"
              size="small"
            />
            <label for="page_bg_color">PDF Background Color</label>
          </FloatLabel>
          <div class="card flex w-full col-start-4 col-span-1 items-center justify-center">
            <ColorPicker
              v-model="settings.pageBGColor"
              class="caret-transparent"
              format="hex"
            />
          </div>
          <IconWithTooltip :tooltip-content="tooltipContent.pageBGColor" />
        </div>
        <div class="grid grid-cols-5 mt-4 gap-2">
          <FloatLabel
            class="w-full col-start-1 col-span-3"
            variant="on"
          >
            <InputText
              v-model="settings.cropSelectionGuideColor"
              type="text"
              label-id="crop_selection_guide_color"
              disabled
              :fluid="true"
              size="small"
            />
            <label for="crop_selection_guide_color">Crop Selection Guide Color</label>
          </FloatLabel>
          <div class="card flex w-full col-start-4 col-span-1 items-center justify-center">
            <ColorPicker
              v-model="settings.cropSelectionGuideColor"
              class="caret-transparent"
              format="hex"
            />
          </div>
          <IconWithTooltip :tooltip-content="tooltipContent.cropSelectionGuideColor" />
        </div>
        <div class="grid grid-cols-5 mt-4 gap-2">
          <FloatLabel
            class="w-full col-start-1 col-span-3"
            variant="on"
          >
            <InputText
              v-model="settings.cropSelectedRegionColor"
              type="text"
              label-id="crop_selected_region_color"
              disabled
              :fluid="true"
              size="small"
            />
            <label for="crop_selected_region_color">Crop Selected Region Color</label>
          </FloatLabel>
          <div class="card flex w-full col-start-4 col-span-1 items-center justify-center">
            <ColorPicker
              v-model="settings.cropSelectedRegionColor"
              class="caret-transparent"
              format="hex"
            />
          </div>
          <IconWithTooltip :tooltip-content="tooltipContent.cropSelectedRegionColor" />
        </div>
        <div class="grid grid-cols-5 mt-4 gap-2">
          <FloatLabel
            class="w-full col-start-1 col-span-3"
            variant="on"
          >
            <InputText
              v-model="settings.cropSelectionSkipColor"
              type="text"
              label-id="crop_selection_skip_color"
              disabled
              :fluid="true"
              size="small"
            />
            <label for="crop_selection_skip_color">Crop Skip Selection Color</label>
          </FloatLabel>
          <div class="card flex w-full col-start-4 col-span-1 items-center justify-center">
            <ColorPicker
              v-model="settings.cropSelectionSkipColor"
              class="caret-transparent"
              format="hex"
            />
          </div>
          <IconWithTooltip :tooltip-content="tooltipContent.cropSelectionSkipColor" />
        </div>
      </Panel>
      <Panel
        header="Rendering & Input"
        toggleable
        class="w-full"
        :pt="{ content: 'px-2' }"
      >
        <div class="grid grid-cols-4 mt-4 gap-2">
          <FloatLabel
            class="w-full col-start-1 col-span-3"
            variant="on"
          >
            <InputNumber
              v-model="settings.qualityFactor"
              :min="0.1"
              :max="5"
              :step="0.1"
              :fluid="true"
              label-id="quality_factor"
              show-buttons
            />
            <label for="quality_factor">PDF Viewer Quality</label>
          </FloatLabel>
          <IconWithTooltip :tooltip-content="tooltipContent.qualityFactor" />
        </div>
        <div class="grid grid-cols-4 mt-4 gap-2">
          <FloatLabel
            class="w-full col-start-1 col-span-3"
            variant="on"
          >
            <InputNumber
              v-model="settings.selectionThrottleInterval"
              :min="0"
              :max="500"
              :step="1"
              :fluid="true"
              label-id="selection_throttle_interval"
              show-buttons
            />
            <label for="selection_throttle_interval">Selection Update Interval (ms)</label>
          </FloatLabel>
          <IconWithTooltip :tooltip-content="tooltipContent.selectionThrottleInterval" />
        </div>
        <div class="grid grid-cols-4 mt-4 gap-2">
          <FloatLabel
            class="w-full col-start-1 col-span-3"
            variant="on"
          >
            <InputNumber
              v-model="settings.minCropDimension"
              :min="0"
              :max="50"
              :step="1"
              :fluid="true"
              label-id="min_crop_dimension"
              show-buttons
            />
            <label for="min_crop_dimension">Minimum Crop Dimension</label>
          </FloatLabel>
          <IconWithTooltip :tooltip-content="tooltipContent.minCropDimension" />
        </div>
      </Panel>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
const settings = defineModel('settings', {
  type: Object,
  required: true,
})
const advanceSettingsVisible = defineModel('advanceSettingsVisible', {
  type: Boolean,
  required: true,
})

const tooltipContent = {
  pageBGColor:
    'Background color of the PDF viewer. This change is only for visual purposes while cropping the PDF and does not apply to the CBT.',
  cropSelectionGuideColor:
    'Color of Crop Selection Guide (line/box). Crop Selection Guide is the line/box you see when you move the mouse around (or touch on touch screen) on the pdf viewer, it\'s only purpose is to provide a visual guide to set the crop coordinates.',
  cropSelectedRegionColor:
    'Color of the selected crop region. This is the final selection that determines the area to be cropped and saved.',
  cropSelectionSkipColor:
    '(Only for Line Mode) Color of the Crop Selection Guide when the next selection needs to be skipped in Line Cropper Mode. This indicates that the next Y coordinate will be skipped, allowing you to \'jump\' over parts like section/subject names or any content you don\'t want included in the question.',
  qualityFactor:
    'Quality (sharpness) of the rendered PDF. Higher values make the page clearer and sharper but increases resource usage (rendering time, processing, memory, etc.). Lower values make the page blurrier and reduces resource consumption.',
  selectionThrottleInterval:
    'Time interval (in milliseconds) for updating (redrawing) the Selection Guide. Lower values make the Selection Guide smoother and more responsive but may increase processing load. Higher values reduce update frequency, improving performance but making the Selection Guide feel less responsive.',
  minCropDimension:
    'Minimum allowed width and height (in same units as coordinates section) for a valid crop selection. Ensures that the selected crop area is not too small, preventing accidental or invalid selections.',
}
</script>
