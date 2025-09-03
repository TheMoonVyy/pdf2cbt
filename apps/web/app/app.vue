<template>
  <Toaster
    class="pointer-events-auto"
    close-button
    rich-colors
    offset="80px"
    theme="dark"
    :duration="10000"
    :position="toastPosition"
  />
  <div
    id="app-root"
    class="max-h-dvh min-h-dvh w-full flex flex-col overflow-hidden"
  >
    <NuxtLoadingIndicator
      :throttle="100"
      color="#32cd32"
    />
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
import { Toaster } from '#layers/shared/app/components/ui/sonner'

if (import.meta.server) {
  defineOgImageComponent('OgImage')
}

const toastPosition = useToastPosition()

const showBackupWebsiteNotice = shallowRef(false)

// migrate old settings in localStorage
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
  const _isBackupWebsite = useRuntimeConfig().public.isBackupWebsite as string | boolean
  const isBackupWebsite = _isBackupWebsite === 'true' || _isBackupWebsite === true
  if (isBackupWebsite) {
    if (!localStorage.getItem(MiscConsts.BackupNoticeDismissedKey)) {
      showBackupWebsiteNotice.value = true
    }
  }

  checkAndMigratePdfCropperSettings()
  checkAndMigrateCbtResultsSettings()
})
</script>
