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
import {
  MiscConsts,
  DeprecatedLocalStorageKeys,
} from '#layers/shared/shared/enums'
import { PAGE_NAMES_MAP } from '#layers/shared/shared/constants'
import { Toaster } from '#layers/shared/app/components/ui/sonner'

if (import.meta.server) {
  defineOgImageComponent('OgImage')
}

const toastPosition = useToastPosition()

const showBackupWebsiteNotice = shallowRef(false)

const appSettings = useAppSettings()
const updatesLSState = useUpdatesLocalStorageState()
const route = useRoute()

const pageSizeCssVar = useCssVar('--app-page-size', null, { initialValue: '100' })

const currentPageSize = computed(() => {
  const pageName = PAGE_NAMES_MAP[route.name as keyof typeof PAGE_NAMES_MAP]

  return appSettings.value.pages[pageName]?.size || 100
})

watch(currentPageSize,
  newSize => pageSizeCssVar.value = newSize + '',
  { immediate: true },
)

// migrate mainLayout ui settings of test interface to appSettings

// migrate old settings in localStorage

function checkAndMigrateThemeSettings() {
  const oldSetting = localStorage.getItem(DeprecatedLocalStorageKeys.AppThemeVariant)
  if (oldSetting) {
    appSettings.value.theme = oldSetting as 'blue'
    localStorage.removeItem(DeprecatedLocalStorageKeys.AppThemeVariant)
  }
}

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

function checkAndMigrateTestInterfaceMainLayoutSizeSettings() {
  if (utilCompareVersion(
    updatesLSState.value.releases.version,
    '>=',
    '1.30.0',
  )) return

  const db = useDB()
  db.getSettings()
    .then((s) => {
      if (!s?.uiSettings.mainLayout) return

      if ('size' in s.uiSettings.mainLayout) {
        const sizeInPx = s.uiSettings.mainLayout.size
        if (typeof sizeInPx === 'number') {
          appSettings.value.pages.testInterface.size = Math.round((sizeInPx / 16) * 100)
        }
        delete s.uiSettings.mainLayout.size
        db.replaceSettings(utilCloneJson(s))
      }
    })
}

onMounted(() => {
  const _isBackupWebsite = useRuntimeConfig().public.isBackupWebsite as string | boolean
  const isBackupWebsite = _isBackupWebsite === 'true' || _isBackupWebsite === true
  if (isBackupWebsite && !localStorage.getItem(MiscConsts.BackupNoticeDismissedKey))
    showBackupWebsiteNotice.value = true

  checkAndMigrateThemeSettings()
  checkAndMigratePdfCropperSettings()
  checkAndMigrateCbtResultsSettings()
  checkAndMigrateTestInterfaceMainLayoutSizeSettings()
})
</script>
