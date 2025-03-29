<template>
  <div class="card flex justify-center">
    <Drawer
      v-model:visible="advanceSettingsVisible"
      header="Advance Settings"
      pt:header:class="p-3"
      pt:content:class="px-0"
    >
      <Panel
        header="Colors"
        toggleable
        class="w-full"
        pt:content:class="px-2"
      >
        <div class="grid grid-cols-5 mt-4 gap-2">
          <BaseFloatLabel
            class="w-full col-start-1 col-span-3"
            label="PDF Background Color"
            label-id="page_bg_color"
            label-class="text-xs"
          >
            <InputText
              v-model="settings.pageBGColor"
              label-id="page_bg_color"
              size="small"
              readonly
              pt:root:class="pr-0!"
            />
          </BaseFloatLabel>
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
          <BaseFloatLabel
            class="w-full col-start-1 col-span-3"
            label="Crop Selection Guide Color"
            label-id="crop_selection_guide_color"
            label-class="text-xs"
          >
            <InputText
              v-model="settings.cropSelectionGuideColor"
              label-id="crop_selection_guide_color"
              readonly
              size="small"
              pt:root:class="pr-0!"
            />
          </BaseFloatLabel>
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
          <BaseFloatLabel
            class="w-full col-start-1 col-span-3"
            label="Crop Selected Region Color"
            label-id="crop_selected_region_color"
            label-class="text-xs"
          >
            <InputText
              v-model="settings.cropSelectedRegionColor"
              label-id="crop_selected_region_color"
              readonly
              size="small"
              pt:root:class="pr-0!"
            />
          </BaseFloatLabel>
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
          <BaseFloatLabel
            class="w-full col-start-1 col-span-3"
            label="Crop Skip Selection Color"
            label-id="crop_selection_skip_color"
            label-class="text-xs"
          >
            <InputText
              v-model="settings.cropSelectionSkipColor"
              label-id="crop_selection_skip_color"
              readonly
              size="small"
              pt:root:class="pr-0!"
            />
          </BaseFloatLabel>
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
        pt:content:class="px-2"
      >
        <div
          v-for="(item, index) in inputSettings"
          :key="index"
          class="grid grid-cols-4 mt-4 gap-3"
        >
          <BaseFloatLabel
            class="w-full col-start-1 col-span-3"
            :label="item.label"
            :label-id="item.labelId"
            label-class="text-xs"
          >
            <InputNumber
              v-model="settings[item.model]"
              :min="item.min"
              :max="item.max"
              :step="item.step"
              :fluid="true"
              :label-id="item.labelId"
              show-buttons
            />
          </BaseFloatLabel>
          <IconWithTooltip :tooltip-content="tooltipContent[item.model]" />
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

type ToolTipContent = {
  [name: string]: string
}

const tooltipContent: ToolTipContent = {
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

const inputSettings = [
  {
    model: 'qualityFactor',
    min: 0.1,
    max: 5,
    step: 0.1,
    labelId: 'quality_factor',
    label: 'PDF Viewer Quality',
  },
  {
    model: 'selectionThrottleInterval',
    min: 0,
    max: 500,
    step: 1,
    labelId: 'selection_throttle_interval',
    label: 'Selection Update Interval (ms)',
  },
  {
    model: 'minCropDimension',
    min: 0,
    max: 50,
    step: 1,
    labelId: 'min_crop_dimension',
    label: 'Minimum Crop Dimension',
  },
]
</script>
