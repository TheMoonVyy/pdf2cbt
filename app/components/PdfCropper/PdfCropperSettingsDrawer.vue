<template>
  <div class="card flex justify-center">
    <Drawer
      v-model:visible="advanceSettingsVisible"
      header="Settings"
      pt:header:class="p-3"
      pt:content:class="px-0"
    >
      <Panel
        v-for="(settingsItems, panelName) in settingsContent"
        :key="panelName"
        toggleable
        class="w-full"
        pt:content:class="px-2"
      >
        <template #header>
          <div class="grow flex justify-between items-center mr-3 sm:mr-5">
            <h3 class="text-xl font-bold mx-auto">
              {{ panelName }}
            </h3>
            <IconWithTooltip
              v-if="panelHeaderTooltipContent[panelName]"
              :tooltip-content="panelHeaderTooltipContent[panelName]"
            />
          </div>
        </template>
        <template
          v-for="item in settingsItems"
          :key="item.model"
        >
          <div
            v-if="item.type === 'inputNumber'"
            class="grid grid-cols-4 mt-4 gap-5"
          >
            <BaseFloatLabel
              class="w-full col-start-1 col-span-3"
              :label="item.label"
              :label-id="item.labelId"
              label-class="text-xs"
            >
              <InputNumber
                v-model="(settings[item.model] as number)"
                :min="item.min"
                :max="item.max"
                :step="item.step"
                :fluid="true"
                :label-id="item.labelId"
                show-buttons
              />
            </BaseFloatLabel>
            <IconWithTooltip
              v-if="tooltipContent[item.model]"
              :tooltip-content="tooltipContent[item.model]"
            />
          </div>
          <div
            v-else-if="item.type === 'select'"
            class="grid grid-cols-4 mt-4 gap-5"
          >
            <BaseFloatLabel
              class="w-full col-start-1 col-span-3"
              :label="item.label"
              :label-id="item.labelId"
              label-class="text-xs"
            >
              <Select
                v-model="settings[item.model]"
                :label-id="item.labelId"
                :options="item.options"
                option-label="name"
                option-value="value"
                :fluid="true"
              />
            </BaseFloatLabel>
            <IconWithTooltip
              v-if="tooltipContent[item.model]"
              :tooltip-content="tooltipContent[item.model]"
            />
          </div>
          <div
            v-else-if="item.type === 'colorPicker'"
            class="grid grid-cols-5 mt-4"
          >
            <BaseFloatLabel
              class="w-full"
              :label="item.label"
              :label-id="item.labelId"
              label-class="text-xs text-nowrap"
            >
              <InputText
                v-model="(settings[item.model] as string)"
                :label-id="item.labelId"
                class="text-center"
                size="small"
                readonly
                pt:root:class="pr-0!"
              />
            </BaseFloatLabel>
            <div class="card flex w-full col-start-4 col-span-1 items-center justify-center">
              <ColorPicker
                v-model="(settings[item.model] as string)"
                class="caret-transparent"
                format="hex"
              />
            </div>
            <IconWithTooltip
              v-if="tooltipContent[item.model]"
              :tooltip-content="tooltipContent[item.model]"
            />
            <div v-else />
          </div>
        </template>
      </Panel>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
const settings = defineModel<PdfCropperSettings>('settings', { required: true })
const advanceSettingsVisible = defineModel<boolean>('advanceSettingsVisible', { required: true })

type ToolTipContent = {
  [key in keyof Partial<PdfCropperSettings>]: string
}

type SettingsBase = {
  model: keyof PdfCropperSettings
  labelId: string
  label: string
}

type InputNumberTypeSettings = SettingsBase & {
  type: 'inputNumber'
  min: number
  max: number
  step: number
}

type ColorPickerTypeSettings = SettingsBase & {
  type: 'colorPicker'
}

type SelectTypeSettings = SettingsBase & {
  type: 'select'
  options: { name: string, value: unknown }[]
}

type SettingsContent = {
  [panelTitle: string]: (InputNumberTypeSettings | ColorPickerTypeSettings | SelectTypeSettings)[]
}

const settingsContent: SettingsContent = {
  'General Settings': [
    {
      type: 'inputNumber',
      model: 'qualityFactor',
      min: 0.1,
      max: 5,
      step: 0.1,
      label: 'PDF Viewer Quality',
      labelId: useId(),
    },
    {
      type: 'colorPicker',
      model: 'pageBGColor',
      label: 'PDF Background Color',
      labelId: useId(),
    },
    {
      type: 'inputNumber',
      model: 'minCropDimension',
      min: 0,
      max: 500,
      step: 1,
      labelId: useId(),
      label: 'Minimum Crop Dimension',
    },
    {
      type: 'inputNumber',
      model: 'moveOnKeyPressDistance',
      min: 1,
      max: 500,
      step: 1,
      labelId: useId(),
      label: 'Key Press Move Distance',
    },
  ],
  'Crop Selection': [
    {
      type: 'colorPicker',
      model: 'cropSelectionGuideColor',
      label: 'Color',
      labelId: useId(),
    },
    {
      type: 'inputNumber',
      model: 'cropSelectionBgOpacity',
      min: 0,
      max: 100,
      step: 1,
      label: 'BG Color Opacity (%)',
      labelId: useId(),
    },
    {
      type: 'colorPicker',
      model: 'cropSelectionSkipColor',
      label: 'Line Skip Color',
      labelId: useId(),
    },
    {
      type: 'inputNumber',
      model: 'selectionThrottleInterval',
      min: 0,
      max: 5000,
      step: 1,
      label: 'Selection Refresh Interval (ms)',
      labelId: useId(),
    },
  ],
  'Cropped Region': [
    {
      type: 'colorPicker',
      model: 'cropSelectedRegionColor',
      label: 'Color',
      labelId: useId(),
    },
    {
      type: 'inputNumber',
      model: 'cropSelectedRegionBgOpacity',
      min: 0,
      max: 100,
      step: 1,
      label: 'BG Color Opacity (%)',
      labelId: useId(),
    },
    {
      type: 'select',
      model: 'showQuestionDetailsOnOverlay',
      options: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
      label: 'Show Ques. Details',
      labelId: useId(),
    },
    {
      type: 'select',
      model: 'blurCroppedRegion',
      options: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
      label: 'Apply Blur',
      labelId: useId(),
    },
    {
      type: 'inputNumber',
      model: 'blurIntensity',
      min: 0.1,
      max: 10,
      step: 0.1,
      label: 'Blur Intensity',
      labelId: useId(),
    },
  ],
}

const panelHeaderTooltipContent: Record<string, string> = {
  'Crop Selection':
    'Crop Selection is the line/box you see when you are trying to crop, or on edit panel when you select a cropped region',
  'Cropped Region':
    'Cropped Region is the region/box that appears when a region is cropped, this region is also the preview of what regions will be in final output file',
}

const tooltipContent: ToolTipContent = {
  moveOnKeyPressDistance:
    'Distance Line/Region needs to move/resize by when using arrow keys of keyboard',
  pageBGColor:
    'Background color of the PDF viewer. This change is only for visual purposes while cropping the PDF and does not apply to the CBT.',
  qualityFactor:
    'Quality (sharpness) of the rendered PDF. Higher values make the page clearer and sharper but increases resource usage (rendering time, processing, memory, etc.). Lower values make the page blurrier and reduces resource consumption.',
  selectionThrottleInterval:
    'Time interval (in milliseconds) for updating (redrawing) the Selection Guide. Lower values make the Selection Guide smoother and more responsive but may increase processing load. Higher values reduce update frequency, improving performance but making the Selection Guide feel less responsive.',
  minCropDimension:
    'Minimum allowed width and height (in same units as coordinates section) for a valid crop selection. Ensures that the selected crop area is not too small, preventing accidental or invalid selections.',
}
</script>
