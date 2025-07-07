<template>
  <div class="max-h-dvh min-h-dvh w-full flex flex-col overflow-hidden">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <LazyMiscBackupWebsiteNotice
      v-if="showBackupWebsiteNotice"
      v-model="showBackupWebsiteNotice"
    />
  </div>
</template>

<script setup lang="ts">
import { MiscConsts, DeprecatedLocalStorageKeys } from '#layers/shared/shared/enums'

const showBackupWebsiteNotice = shallowRef(false)

function checkAndMigratePdfCropperSettings() {
  const oldSettingsString = localStorage.getItem(DeprecatedLocalStorageKeys.PDfCropperOldSettings)
  if (!oldSettingsString) return
  localStorage.removeItem(DeprecatedLocalStorageKeys.PDfCropperOldSettings)

  const oldSettings = JSON.parse(oldSettingsString) as Partial<PdfCropperSettings['general']>
  if (!oldSettings) return

  const settings = usePdfCropperLocalStorageSettings()
  const generalSettings = utilCloneJson(settings.value.general)

  utilSelectiveMergeObj(generalSettings, oldSettings)

  const colorKeys = [
    'pageBGColor',
    'cropSelectedRegionColor',
    'cropSelectionGuideColor',
    'cropSelectionSkipColor',
  ] as const

  for (const key of colorKeys) {
    if (key in generalSettings) {
      const colorValue = generalSettings[key]
      if (colorValue) {
        generalSettings[key] = utilEnsureHashInHexColor(colorValue)
      }
    }
  }
  settings.value.general = generalSettings
}

function checkAndMigrateCbtResultsSettings() {
  const imgBgColor = localStorage.getItem(DeprecatedLocalStorageKeys.ResultsQuestionPanelImgBgColor)
  const drawerWidth = localStorage.getItem(DeprecatedLocalStorageKeys.ResultsQuestionPanelWidth)

  if (!imgBgColor && !drawerWidth) return

  localStorage.removeItem(DeprecatedLocalStorageKeys.ResultsQuestionPanelImgBgColor)
  localStorage.removeItem(DeprecatedLocalStorageKeys.ResultsQuestionPanelWidth)

  const quePreview: Partial<CbtResultsSettings['quePreview']> = {}

  if (imgBgColor) {
    quePreview.imgBgColor = utilEnsureHashInHexColor(imgBgColor)
  }

  if (drawerWidth) {
    const drawerWidthInInt = parseInt(drawerWidth)
    if (drawerWidthInInt) {
      quePreview.drawerWidth = drawerWidthInInt
    }
  }

  const settings = useCbtResultsLocalStorageSettings()

  utilSelectiveMergeObj(settings.value.quePreview, quePreview)
}

onMounted(() => {
  const config = useRuntimeConfig()
  if (config.public.isBackupWebsite) {
    if (!localStorage.getItem(MiscConsts.BackupNoticeDismissedKey)) {
      showBackupWebsiteNotice.value = true
    }
  }

  checkAndMigratePdfCropperSettings()
  checkAndMigrateCbtResultsSettings()
})
</script>
