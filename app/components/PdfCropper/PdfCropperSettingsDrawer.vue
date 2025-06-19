<template>
  <UiSheet v-model:open="advanceSettingsVisible">
    <UiSheetContent
      side="left"
      class="w-full sm:w-96"
      disable-outside-pointer-events
      @pointer-down-outside="sheetPreventCloseOnOutsideClick"
    >
      <UiSheetHeader class="p-3 pb-1">
        <UiSheetTitle class="mx-auto text-2xl">
          Settings
        </UiSheetTitle>
      </UiSheetHeader>
      <UiScrollArea
        class="h-full w-full min-h-0"
      >
        <UiCard
          v-for="(settingsItems, panelName, index) in settingsContent"
          :key="panelName"
          class="w-full py-2"
        >
          <UiCardHeader>
            <UiCardTitle class="flex items-center mx-auto gap-5">
              <h3 class="text-lg font-bold mx-auto">
                {{ panelName }}
              </h3>
              <IconWithTooltip
                v-if="panelHeaderTooltipContent[panelName]"
                :tooltip-content="panelHeaderTooltipContent[panelName]"
              />
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent
            class="flex flex-col gap-5 px-8"
            :class="{
              'pb-10': index + 1 === Object.keys(settingsContent).length,
            }"
          >
            <template
              v-for="item in settingsItems"
              :key="item.model"
            >
              <div
                v-if="item.type === 'inputNumber'"
                class="grid grid-cols-5 gap-5"
              >
                <BaseFloatLabel
                  class="w-full col-span-4"
                  :label="item.label"
                  :label-id="item.labelId"
                  label-class="text-xs start-1/2! -translate-x-1/2"
                >
                  <BaseInputNumber
                    v-model="(settings.general[item.model] as number)"
                    :min="item.min"
                    :max="item.max"
                    :step="item.step"
                    :label-id="item.labelId"
                  />
                </BaseFloatLabel>
                <IconWithTooltip
                  v-if="tooltipContent[item.model]"
                  class="justify-center w-fit"
                  :tooltip-content="tooltipContent[item.model]"
                />
              </div>
              <div
                v-else-if="item.type === 'select'"
                class="grid grid-cols-4 gap-5"
              >
                <div class="flex flex-row-reverse items-center gap-3 col-span-3">
                  <UiSwitch
                    :id="item.labelId"
                    class="cursor-pointer"
                  />
                  <UiLabel
                    :for="item.labelId"
                    class="text-[1.05rem] font-semibold cursor-pointer"
                  >
                    {{ item.label }}
                  </UiLabel>
                </div>
                <IconWithTooltip
                  v-if="tooltipContent[item.model]"
                  class="justify-center w-fit"
                  :tooltip-content="tooltipContent[item.model]"
                />
              </div>
              <div
                v-else-if="item.type === 'colorPicker'"
                class="grid grid-cols-5 gap-3"
              >
                <BaseFloatLabel
                  class="w-full col-span-3"
                  :label="item.label"
                  :label-id="item.labelId"
                  label-class="text-xs start-1/2! -translate-x-1/2"
                >
                  <UiInput
                    :id="item.labelId"
                    v-model="(settings.general[item.model] as string)"
                    class="text-center"
                    readonly
                  />
                </BaseFloatLabel>
                <div class="flex items-center justify-center">
                  <BaseColorPicker
                    v-model="(settings.general[item.model] as string)"
                    :with-alpha="!!item.withAlpha"
                    @show="showColorPicker"
                    @close="ColorPickerClosedHandler"
                  />
                </div>
                <IconWithTooltip
                  v-if="tooltipContent[item.model]"
                  class="justify-center w-fit  ml-1"
                  :tooltip-content="tooltipContent[item.model]"
                />
                <div v-else />
              </div>
            </template>
          </UiCardContent>
        </UiCard>
      </UiScrollArea>
    </UiSheetContent>
  </UiSheet>
</template>

<script setup lang="ts">
type ToolTipContent = {
  [key in keyof Partial<PdfCropperSettings['general']>]: string
}

type SettingsBase = {
  model: keyof PdfCropperSettings['general']
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
  withAlpha?: boolean
}

type SelectTypeSettings = SettingsBase & {
  type: 'select'
  options: { name: string, value: boolean }[]
}

type SettingsContent = {
  [panelTitle: string]: (InputNumberTypeSettings | ColorPickerTypeSettings | SelectTypeSettings)[]
}

const advanceSettingsVisible = defineModel<boolean>('advanceSettingsVisible', { required: true })

const settings = usePdfCropperLocalStorageSettings()

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
      withAlpha: true,
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

const isColorPickerOpen = shallowRef(false)

const showColorPicker = () => {
  isColorPickerOpen.value = true
}

const ColorPickerClosedHandler = () => {
  isColorPickerOpen.value = false
}

const sheetPreventCloseOnOutsideClick = (e: CustomEvent) => {
  if (isColorPickerOpen.value) {
    e.preventDefault()
  }
}
</script>
