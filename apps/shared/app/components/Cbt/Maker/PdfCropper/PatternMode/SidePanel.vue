<template>
  <div class="flex flex-col gap-3 w-full -mx-4">
    <UiCard class="py-3 gap-2 grow">
      <UiCardHeader>
        <UiCardTitle class="mx-auto text-lg">
          Pattern Config
        </UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="flex flex-col gap-5 justify-center grow px-2">
        <UiCombobox
          v-model="selectedPatternModeConfig"
          class="max-w-full"
          by="id"
          :disabled="isConfigLoaded"
        >
          <UiComboboxAnchor as-child>
            <UiComboboxTrigger as-child>
              <BaseButton
                :label="selectedPatternModeConfig?.name ?? 'Select Pattern Config'"
                variant="outline"
                class="flex-row-reverse justify-between w-full"
                label-class="text-ellipsis overflow-hidden"
                icon-name="material-symbols:keyboard-arrow-down-rounded"
                icon-size="1.5rem"
              />
            </UiComboboxTrigger>
          </UiComboboxAnchor>
          <ComboboxContent>
            <UiComboboxList class="w-full max-w-lg">
              <div class="flex items-center w-full [&>div]:data-[slot=command-input-wrapper]:w-full">
                <UiComboboxInput
                  class="pl-2 grow focus-visible:ring-0 border-0 border-b rounded-none h-10"
                  placeholder="Search for pattern config..."
                />
              </div>

              <UiComboboxEmpty>
                No config found with that name.
              </UiComboboxEmpty>

              <UiScrollArea
                viewport-class="[&>div]:max-h-64"
                type="auto"
              >
                <UiComboboxGroup>
                  <UiComboboxItem
                    v-for="config in configsList"
                    :key="config.id"
                    :value="config"
                    class="cursor-pointer"
                  >
                    <span
                      :class="{
                        'text-yellow-400': config.id <= 0,
                      }"
                    >
                      {{ config.name }}
                    </span>

                    <UiComboboxItemIndicator class="flex items-center justify-center">
                      <Icon
                        name="material-symbols:check-rounded"
                        class="ml-auto h-4 w-4"
                        size="1rem"
                      />
                    </UiComboboxItemIndicator>
                  </UiComboboxItem>
                </UiComboboxGroup>
              </UiScrollArea>
            </UiComboboxList>
          </ComboboxContent>
        </UiCombobox>
        <div class="flex gap-3 items-center justify-center">
          <BaseButton
            label="Manage DB"
            variant="help"
            :disabled="isConfigLoaded"
            @click="showManageDbDialog = true"
          />
          <BaseButton
            :label="isConfigLoaded ? 'Unload Config' : 'Load Config'"
            :variant="isConfigLoaded ? 'destructive' : 'success'"
            :disabled="!selectedPatternModeConfig && !patternModeConfigJson"
            @click="loadOrUnloadConfig"
          />
        </div>
        <div
          v-if="isConfigLoaded"
          class="flex flex-col gap-1.5 items-center"
        >
          <BaseButton
            v-if="!showPatternModeEditConfigPanel"
            label="Edit Config"
            variant="warn"
            :disabled="!isConfigLoaded || !isPdfLoaded"
            @click="editConfigHandler"
          />
          <template v-else>
            <span class="mx-auto text-center font-bold -mt-2">Edits</span>
            <div class="flex gap-3 items-center justify-center">
              <BaseButton
                label="Discard"
                variant="destructive"
                @click="discardEdits"
              />
              <BaseButton
                v-if="showPatternModeEditConfigPanel && (selectedPatternModeConfig?.id || 0) >= 0"
                label="Save"
                variant="warn"
                :disabled="isConfigInvalid"
                @click="saveConfig(false)"
              />
              <BaseButton
                label="Save As"
                variant="success"
                :disabled="isConfigInvalid"
                @click="showSaveAsDialog"
              />
            </div>
            <span
              v-if="saveStatus"
              class="mx-auto text-center"
            >
              {{ saveStatus }}
            </span>
          </template>
        </div>
        <div class="flex flex-col gap-3 items-center justify-center">
          <BaseButton
            label="Run Cropper"
            variant="success"
            :disabled="isConfigInvalid || !isPdfLoaded"
            @click="runCropperBtnHandler"
          />
        </div>
      </UiCardContent>
    </UiCard>
    <UiDialog v-model:open="saveAsState.showDialog">
      <UiDialogContent>
        <UiDialogHeader>
          <UiDialogTitle class="mx-auto">
            Save Pattern Config As
          </UiDialogTitle>
        </UiDialogHeader>
        <div class="flex flex-col items-center justify-center gap-2">
          <span class="text-center">
            Config Name
          </span>
          <UiInput
            v-model="saveAsState.name"
            class="max-w-xs"
          />
        </div>
        <div class="flex justify-center my-3 gap-5">
          <BaseButton
            label="Save"
            variant="success"
            :disabled="!saveAsState.name.trim()"
            @click="saveConfig(true)"
          />
          <BaseButton
            label="Go Back"
            variant="destructive"
            @click="saveAsState.showDialog = false"
          />
        </div>
      </UiDialogContent>
    </UiDialog>
    <UiDialog v-model:open="showRunCropperWarningDialog">
      <UiDialogContent>
        <UiDialogHeader>
          <UiDialogTitle class="mx-auto">
            (Warning) Existing cropped regions are found!
          </UiDialogTitle>
        </UiDialogHeader>
        <p>
          There already are some cropped regions.<br>
          By running pattern based cropper, all existing cropped regions will be deleted.
        </p>
        <div class="flex justify-center my-3 gap-5">
          <BaseButton
            label="Run Cropper"
            variant="warn"
            @click="emitParsedConfigToPdfRenderer"
          />
          <BaseButton
            label="Go Back"
            variant="success"
            @click="showRunCropperWarningDialog = false"
          />
        </div>
      </UiDialogContent>
    </UiDialog>
    <ManageConfigs
      v-model="showManageDbDialog"
      v-model:configs="userConfigs"
    />
  </div>
</template>

<script lang="ts" setup>
import type {
  PatternModeConfigJson,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/config-schema'
import {
  getConfigJsonFromFormData,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/form-data-to-config-json'
import { builtInConfigs } from './built-in-configs'
import {
  getPatternModeParsedConfig,
  getPageNumsFromParsedConfig,
  type PatternModeParsedConfig,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/parsed-config-for-cropper'
import type { PatternBasedCropFn } from '#layers/shared/app/src/worker/text-pattern-based-crop.worker'
import { wrap as comlinkWrap } from 'comlink'
import patternBasedCropperWorker from '#layers/shared/app/src/worker/text-pattern-based-crop.worker?worker'
import ManageConfigs from './ManageConfigs.client.vue'
import { ComboboxContent } from 'reka-ui'
import {
  cropperOverlayDatasKey,
  overlaysPerQuestionDataKey,
  pagesImgDataKey,
} from '../../keys'
import type { InputPdfCropperData } from '#layers/shared/app/utils/utilPdfCropperDataToInternalData'

type ConfigsListItem = MakePropertyOptional<PatternModeBuiltInConfig, 'url'>

const props = defineProps<{
  isFormReady: boolean
  totalPages: number
  isPdfLoaded: boolean
}>()

const emit = defineEmits<{
  loadPdfPatternModeData: [pageNums: number[], settings: PatternModeParsedConfig['settings']]
}>()

const showPatternModeEditConfigPanel = defineModel<boolean>({ required: true })

const additionalData = defineModel<CbtMakerInternalInstructionsData['additionalData']>(
  'additionalData',
  { required: true },
)

const currentMode = defineModel<PdfCropperCurrentMode>('currentMode', { required: true })

const cropperOverlayDatas = inject(cropperOverlayDatasKey)!

const overlaysPerQuestionData = inject(overlaysPerQuestionDataKey)!

const pagesImgData = inject(pagesImgDataKey)!

let patternBasedCrop: ReturnType<typeof comlinkWrap<PatternBasedCropFn>> | null = null

const initWorker = () => {
  patternBasedCrop ??= comlinkWrap<PatternBasedCropFn>(new patternBasedCropperWorker())
  return patternBasedCrop
}

const userConfigs = reactive<Map<number, PatternModeUserConfig>>(new Map())

const configsList = computed(
  () => {
    const d = (builtInConfigs as ConfigsListItem[])
      .concat([...userConfigs.values()].reverse())
    return d
  },
)

const showManageDbDialog = shallowRef(false)

const db = useDB()

let parsedConfigData: PatternModeParsedConfig | null = null

const selectedPatternModeConfig = shallowRef<ConfigsListItem>()
const patternModeConfigJson = shallowRef<PatternModeConfigJson | null>(null)

const isConfigLoaded = computed(
  () => Boolean(patternModeConfigJson.value && selectedPatternModeConfig.value),
)

const { form } = usePatternModeFormData()

const saveAsState = shallowReactive({
  name: '',
  showDialog: false,
})

const showRunCropperWarningDialog = shallowRef(false)

const saveStatus = shallowRef<'Saving...' | 'Saved successfully.' | 'Failed To Save!' | null>(null)

const isConfigInvalid = computed(() =>
  !isConfigLoaded.value || (showPatternModeEditConfigPanel.value && !props.isFormReady),
)

async function loadOrUnloadConfig() {
  showPatternModeEditConfigPanel.value = false

  if (patternModeConfigJson.value) {
    patternModeConfigJson.value = null
    form.value = null
    return
  }

  const config = selectedPatternModeConfig.value
  if (!config) return

  try {
    if (config.id < 0 && config.url) {
      const res = await fetch(config.url)

      if (!res.ok)
        throw Error(`status code: ${res.status}`)

      const data = await res.json()
      patternModeConfigJson.value = data?.patternModeConfig ?? null
    }
    else {
      const dbConfig = await db.getPatternModeConfig(config.id)
      patternModeConfigJson.value = dbConfig?.data?.patternModeConfig ?? null
    }
  }
  catch (err) {
    console.error(`Failed to load "${config.name}" pattern config`, err)
  }
}

function editConfigHandler() {
  if (!patternModeConfigJson.value) return

  showPatternModeEditConfigPanel.value = true
  nextTick()
    .then(() => setTimeout(() => usePatternModeFormData(patternModeConfigJson.value), 250))
}

function discardEdits() {
  form.value = null
  showPatternModeEditConfigPanel.value = false
}

function showSaveAsDialog() {
  const name = selectedPatternModeConfig.value?.name
  if (name)
    saveAsState.name = name?.trim()

  saveAsState.showDialog = true
}

async function saveConfig(isSaveAs: boolean = false) {
  const id = selectedPatternModeConfig.value?.id
  saveAsState.showDialog = false

  if (!showPatternModeEditConfigPanel.value || !form.value || !id) return

  try {
    saveStatus.value = 'Saving...'
    const jsonDataToSave = utilCloneJson(getConfigJsonFromFormData(toValue(form)!))
    patternModeConfigJson.value = jsonDataToSave

    const subjects = Object.fromEntries(
      Object.entries(jsonDataToSave.subjects)
        .map(([subjectName, subjectConfig]) => ([
          subjectName,
          'sections' in subjectConfig && subjectConfig.sections
            ? Object.keys(subjectConfig.sections)
            : null,
        ])),
    )

    if (isSaveAs) {
      const name = saveAsState.name.trim()
      const newConfig = await db.addPatternModeConfig({
        name,
        subjects,
        data: { patternModeConfig: jsonDataToSave },
      })
      userConfigs.set(newConfig.id, newConfig)
      await nextTick()
      selectedPatternModeConfig.value = newConfig
    }
    else {
      await db.replacePatternModeConfig({
        id,
        subjects,
        data: { patternModeConfig: jsonDataToSave },
      })
    }
    saveStatus.value = 'Saved successfully.'
  }
  catch (err) {
    console.error('Error saving pattern config to DB', err)
    saveStatus.value = 'Failed To Save!'
  }
  finally {
    setTimeout(() => saveStatus.value = null, 750)
  }
}

function runCropperBtnHandler() {
  if (cropperOverlayDatas.value.size > 0) {
    showRunCropperWarningDialog.value = true
    return
  }

  emitParsedConfigToPdfRenderer()
}

function emitParsedConfigToPdfRenderer() {
  showRunCropperWarningDialog.value = false

  const configJson = showPatternModeEditConfigPanel.value
    ? getConfigJsonFromFormData(toValue(form)!)
    : patternModeConfigJson.value!

  parsedConfigData = getPatternModeParsedConfig(configJson, props.totalPages)
  const pageNums = getPageNumsFromParsedConfig(parsedConfigData)

  const { settings } = parsedConfigData
  emit('loadPdfPatternModeData', pageNums, settings)
}

async function runCropper(patternModeRawDataForCropper: PdfPagesPatternModeData) {
  if (!parsedConfigData) return

  const patternBasedCropper = initWorker()

  const { subjects: subjectsConfig } = parsedConfigData

  const newCropperOverlays = await patternBasedCropper(
    subjectsConfig,
    patternModeRawDataForCropper,
    utilCloneJson(pagesImgData),
  )

  const overlays = cropperOverlayDatas.value
  overlaysPerQuestionData.clear()
  overlays.clear()

  const newCropperSubjectsData: InputPdfCropperData = {}
  for (const overlayData of newCropperOverlays.values()) {
    const { subject, section: rawSection, que } = overlayData
    const section = rawSection || subject

    newCropperSubjectsData[subject] ??= {}
    newCropperSubjectsData[subject][section] ??= {}
    newCropperSubjectsData[subject][section][que] ??= {
      ...overlayData,
      pdfData: [],
    }
    newCropperSubjectsData[subject][section][que]
      .pdfData.push(overlayData.pdfData)
  }

  utilPdfCropperDataToInternalData(
    newCropperSubjectsData,
    pagesImgData,
    overlays,
    overlaysPerQuestionData,
  )

  for (const [subjectName, subjectConf] of Object.entries(subjectsConfig)) {
    additionalData.value[subjectName] ??= { sections: {} }
    const sections = additionalData.value[subjectName].sections

    for (const [sectionName, sectionConf] of Object.entries(subjectConf.sections)) {
      const optionalQuestions = sectionConf.numOfOptionalQuestions || 0
      const instructions = sectionConf.instructions || { type: 'none' }
      if (!sections[sectionName]) {
        sections[sectionName] = { optionalQuestions, instructions }
      }
      else {
        const sec = sections[sectionName]
        sec.instructions = instructions
        sec.optionalQuestions = optionalQuestions
      }
    }
  }

  currentMode.value = 'edit'
}

defineExpose({
  runCropper,
})

onMounted(() => {
  db.getAllPatternModeConfigNames()
    .then(configs => configs.forEach(conf => userConfigs.set(conf.id, conf)),
    )
})
</script>
