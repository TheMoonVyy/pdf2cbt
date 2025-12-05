<template>
  <header
    v-show="!isFullscreen"
    class="border"
  >
    <nav>
      <div class="flex w-full h-14 items-center">
        <span class="font-bold text-2xl sm:text-[1.76rem] md:text-[1.9rem] py-1.5 px-2">
          <NuxtLink
            to="/"
            class="text-green-500"
          >
            pdf2cbt
            <span class="text-cyan-500 text-sm sm:text-[.9rem] md:text-base">v{{ appVersion }}</span>
          </NuxtLink>
        </span>
        <div class="hidden min-[73.5rem]:flex items-center mx-auto">
          <template
            v-for="item in [pdfCropperItem, ...cbtItems]"
            :key="item.title"
          >
            <NuxtLink
              :to="item.href"
              class="outline-hidden rounded-sm shadow-xs transition-all
              focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border"
            >
              <template #default="{ isActive }">
                <div
                  class="flex gap-1.5 justify-center"
                  :class="[navigationMenuTriggerStyle(), 'h-full', isActive ? 'text-green-400' : '']"
                >
                  <Icon
                    :name="item.icon"
                    size="1.3rem"
                  />
                  <span class="text-lg font-bold text-nowrap">
                    {{ item.title }}
                  </span>
                </div>
              </template>
            </NuxtLink>
          </template>
        </div>
        <UiNavigationMenu class="hidden min-[43rem]:flex min-[73.5rem]:hidden mx-auto">
          <UiNavigationMenuList>
            <UiNavigationMenuItem
              v-for="item in menuItems"
              :key="item.title"
            >
              <template v-if="'content' in item">
                <UiNavigationMenuTrigger class="h-12 p-2 text-xl font-semibold">
                  <Icon
                    class="text-foreground"
                    :name="item.icon"
                    size="1.3rem"
                  />
                  <span class="ml-2">{{ item.title }}</span>
                </UiNavigationMenuTrigger>
                <UiNavigationMenuContent>
                  <ul
                    class="grid grid-cols-1 gap-2 p-2 w-64"
                  >
                    <li
                      v-for="contentItem in item.content"
                      :key="contentItem.title"
                    >
                      <NuxtLink
                        v-slot="{ isActive, href, navigate }"
                        :to="contentItem.href"
                        custom
                      >
                        <UiNavigationMenuLink
                          :active="isActive"
                          :href="href"
                          :class="navigationMenuTriggerStyle()"
                          class="w-full"
                          @click="navigate"
                        >
                          <div
                            class="flex items-center gap-2.5 p-1"
                            :class="isActive ? 'text-green-400' : ''"
                          >
                            <Icon
                              :name="contentItem.icon"
                              size="1.3rem"
                            />
                            <span class="text-lg font-bold text-nowrap">
                              {{ contentItem.title }}
                            </span>
                          </div>
                        </UiNavigationMenuLink>
                      </NuxtLink>
                    </li>
                  </ul>
                </UiNavigationMenuContent>
              </template>
              <NuxtLink
                v-else
                v-slot="{ isActive, href, navigate }"
                :to="item.href"
                custom
              >
                <UiNavigationMenuLink
                  :active="isActive"
                  :href="href"
                  :class="navigationMenuTriggerStyle()"
                  class="h-12"
                  @click="navigate"
                >
                  <div
                    class="flex items-center gap-2.5 p-1"
                    :class="isActive ? 'text-green-400' : ''"
                  >
                    <Icon
                      :name="item.icon"
                      size="1.3rem"
                    />
                    <span class="text-lg font-bold text-nowrap">
                      {{ item.title }}
                    </span>
                  </div>
                </UiNavigationMenuLink>
              </NuxtLink>
            </UiNavigationMenuItem>
          </UiNavigationMenuList>
        </UiNavigationMenu>
        <div class="flex gap-2.5 sm:gap-3 xl:gap-4 items-center h-14 ml-auto min-[43rem]:ml-2 pr-4 xl:pr-8">
          <NuxtLink
            to="https://github.com/TheMoonVyy/pdf2cbt"
            class="flex items-center justify-center"
            target="_blank"
            tabindex="-1"
          >
            <BaseButton
              variant="outline"
              size="icon"
              title="Github Repo"
              icon-name="prime:github"
              icon-size="1.6rem"
            />
          </NuxtLink>
          <UiPopover :open="showReleasesPopup || showDevPopup">
            <PopoverAnchor as-child>
              <NuxtLink
                :to="updatesIndicatorColorClass.includes('text-yellow')
                  ? '/updates?dev'
                  : '/updates'"
                class="flex items-center justify-center"
                tabindex="-1"
              >
                <BaseButton
                  variant="outline"
                  size="icon"
                  title="Releases and upcoming features updates"
                  icon-name="material-symbols:breaking-news-outline-rounded"
                  :class="updatesIndicatorColorClass"
                  icon-size="1.5rem"
                />
              </NuxtLink>
            </PopoverAnchor>
            <UiPopoverContent
              class="bg-[color-mix(in_srgb,_theme(colors.gray.900),_black_10%)] max-w-[96dvw]
              sm:max-w-sm min-w-fit w-auto lg:max-w-md text-white text-base px-2 py-1.5"
              avoid-collisions
              :collision-padding="16"
              side="bottom"
              @open-auto-focus.prevent
            >
              <div
                v-if="showReleasesPopup"
                class="flex items-center gap-2"
              >
                <span class="text-sm sm:text-lg">
                  <template v-if="isBuildForWebsite === 'true'">
                    See what's new in
                    <span class="text-green-400">
                      v{{ updatesLSState.releases.version }}
                    </span>
                  </template>
                  <template v-else>
                    <span class="text-green-400">
                      v{{ updatesLSState.releases.version }}
                    </span> is out!
                  </template>
                </span>
                <BaseButton
                  variant="ghost"
                  size="iconXs"
                  icon-name="mdi:close"
                  @click="() => {
                    updatesLSState.releases.showPopup = false
                    updatesLSState.releases.showIndicator = false
                  }"
                />
              </div>
              <div
                v-else-if="showDevPopup"
                class="flex items-center gap-2"
              >
                <span class="text-sm sm:text-lg">
                  See what's new in<br>
                  development updates.
                </span>
                <BaseButton
                  variant="ghost"
                  size="iconXs"
                  icon-name="mdi:close"
                  @click="() => {
                    updatesLSState.dev.showPopup = false
                    updatesLSState.dev.showIndicator = false
                  }"
                />
              </div>
              <PopoverArrow as-child>
                <svg
                  width="14"
                  height="7"
                  viewBox="0 0 12 6"
                  class="text-[color-mix(in_srgb,_theme(colors.gray.800),_black_10%)]"
                  preserveAspectRatio="none"
                  style="display: block;"
                >
                  <path
                    d="M0 0L6 6L12 0Z"
                    fill="currentColor"
                  />
                </svg>
              </PopoverArrow>
            </UiPopoverContent>
          </UiPopover>
          <BaseButton
            variant="outline"
            size="icon"
            title="Toggle Fullscreen"
            class="text-green-500 hover:text-green-600"
            icon-name="material-symbols:fullscreen"
            icon-size="1.5rem"
            @click="toggleFullscreen()"
          />
          <UiSheet>
            <UiSheetTrigger as-child>
              <div class="contents">
                <BaseButton
                  variant="outline"
                  size="icon"
                  title="Menu"
                  class="min-[43rem]:hidden"
                  icon-name="material-symbols:menu-rounded"
                />
                <BaseButton
                  variant="outline"
                  size="icon"
                  title="Menu"
                  class="hidden min-[43rem]:flex"

                  icon-name="line-md:cog"
                />
              </div>
            </UiSheetTrigger>
            <UiSheetContent side="right">
              <UiSheetHeader class="p-3">
                <UiSheetTitle class="mx-auto text-xl pb-0">
                  <span class="hidden min-[43rem]:inline-block">Settings</span>
                  <span class="min-[43rem]:hidden">Pages & Settings</span>
                </UiSheetTitle>
              </UiSheetHeader>
              <UiScrollArea class="[&>div]:pb-5">
                <ul
                  class="grid grid-cols-1 gap-2 p-2 min-[43rem]:hidden"
                >
                  <li
                    v-for="contentItem in [pdfCropperItem, ...cbtItems]"
                    :key="contentItem.title"
                  >
                    <UiSheetClose as-child>
                      <NuxtLink
                        v-slot="{ isActive, href, navigate }"
                        :to="contentItem.href"
                        custom
                      >
                        <UiNavigationMenuLink
                          :active="isActive"
                          :href="href"
                          :class="navigationMenuTriggerStyle()"
                          class="w-full"
                          @click="navigate"
                        >
                          <div
                            class="flex items-center gap-2.5 p-1"
                            :class="isActive ? 'text-green-400' : ''"
                          >
                            <Icon
                              :name="contentItem.icon"
                              size="1.3rem"
                            />
                            <span class="text-lg font-bold text-nowrap">
                              {{ contentItem.title }}
                            </span>
                          </div>
                        </UiNavigationMenuLink>
                      </NuxtLink>
                    </UiSheetClose>
                  </li>
                </ul>
                <UiCard class="py-3 ml-1 mr-2 gap-2">
                  <UiCardHeader>
                    <UiCardTitle class="text-center text-lg">
                      Notify Updates of:
                    </UiCardTitle>
                  </UiCardHeader>
                  <UiCardContent class="space-y-4 grid grid-cols-2 gap-5 sm:gap-15 px-4 sm:pl-6 sm:pr-8">
                    <div class="flex flex-col gap-3">
                      <span class="font-semibold sm:text-lg text-center">
                        Releases
                      </span>
                      <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between">
                          <UiLabel
                            for="releases-indicator"
                            class="sm:text-lg"
                          >
                            Indicator
                          </UiLabel>
                          <UiSwitch
                            id="releases-indicator"
                            v-model="appSettings.notify.releases.indicator"
                            @update:model-value="updatesSettingsSwitchHandler"
                          />
                        </div>
                        <div class="flex items-center justify-between">
                          <UiLabel
                            for="releases-popup"
                            class="sm:text-lg"
                          >
                            Popup
                          </UiLabel>
                          <UiSwitch
                            id="releases-popup"
                            v-model="appSettings.notify.releases.popup"
                            @update:model-value="updatesSettingsSwitchHandler"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-col gap-3">
                      <span class="font-semibold sm:text-lg text-center">
                        Development
                      </span>
                      <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between">
                          <UiLabel
                            for="dev-indicator"
                            class="sm:text-lg"
                          >
                            Indicator
                          </UiLabel>
                          <UiSwitch
                            id="dev-indicator"
                            v-model="appSettings.notify.dev.indicator"
                            @update:model-value="updatesSettingsSwitchHandler"
                          />
                        </div>
                        <div class="flex items-center justify-between">
                          <UiLabel
                            for="dev-popup"
                            class="sm:text-lg"
                          >
                            Popup
                          </UiLabel>
                          <UiSwitch
                            id="dev-popup"
                            v-model="appSettings.notify.dev.popup"
                            @update:model-value="updatesSettingsSwitchHandler"
                          />
                        </div>
                      </div>
                    </div>
                  </UiCardContent>
                </UiCard>
                <UiCard class="my-2 py-2 ml-1 mr-2 gap-2">
                  <UiCardHeader>
                    <UiCardTitle class="mx-auto text-lg">
                      Page Zoom Sizes (in %)
                    </UiCardTitle>
                  </UiCardHeader>
                  <UiCardContent class="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div
                      v-for="(_, pageSizeKey) in appSettings.pages"
                      :key="pageSizeKey"
                      class="flex flex-col items-center gap-1 last:odd:col-span-2"
                    >
                      <UiLabel
                        class="text-sm"
                        :for="pageSizeKey + 'PageSize'"
                      >
                        {{ utilKeyToLabel(pageSizeKey) }}
                      </UiLabel>
                      <BaseInputNumber
                        :id="pageSizeKey + 'PageSize'"
                        v-model="appSettings.pages[pageSizeKey].size"
                        :min="50"
                        :max="250"
                        :step="5"
                        input-class="text-sm"
                      />
                    </div>
                  </UiCardContent>
                </UiCard>
                <UiCard class="py-2 ml-1 mr-2 gap-2">
                  <UiCardHeader>
                    <UiCardTitle class="mx-auto text-lg">
                      Site Theme
                    </UiCardTitle>
                  </UiCardHeader>
                  <UiCardContent class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <BaseButton
                      v-for="(themeColorStyle, themeName) in themeVariants"
                      :key="themeName"
                      variant="outline"
                      :label="themeName"
                      class="gap-3 w-fit"
                      @click="colorMode = themeName"
                    >
                      <template #icon>
                        <span
                          class="size-4"
                          :style="{
                            backgroundColor: themeColorStyle,
                          }"
                        />
                      </template>
                    </BaseButton>
                  </UiCardContent>
                </UiCard>
              </UiScrollArea>
            </UiSheetContent>
          </UiSheet>
        </div>
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { navigationMenuTriggerStyle } from '#layers/shared/app/components/ui/navigation-menu'
import { UpdatesPage } from '#layers/shared/shared/enums'
import { PopoverArrow, PopoverAnchor } from 'reka-ui'

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

const themeVariants = {
  blue: 'hsl(217.2 91.2% 59.8%)',
  slate: 'hsl(215.3 19.3% 34.5%)',
  neutral: 'hsl(0 0% 32.2%)',
}

const CHECK_UPDATES_INTERVAL = 30 * 60 * 1000 // 30 minutes

let checkForUpdatesSetTimeoutId: ReturnType<typeof setTimeout> | null = null

const appSettings = useAppSettings()
const updatesLSState = useUpdatesLocalStorageState()

const publicRuntimeConfig = useRuntimeConfig().public
const isBuildForWebsite = publicRuntimeConfig.isBuildForWebsite
const appVersion = publicRuntimeConfig.projectVersion

const themeWriteableComputedRef = computed({
  get: () => appSettings.value.theme,
  set: val => appSettings.value.theme = val,
})

const colorMode = useColorMode<keyof typeof themeVariants>({
  attribute: 'data-theme-variant',
  modes: Object.fromEntries(Object.keys(themeVariants).map(v => [v, v])),
  storageRef: themeWriteableComputedRef,
  initialValue: 'blue',
})

const pdfCropperItem = {
  title: 'PDF Cropper',
  href: '/pdf-cropper',
  icon: 'material-symbols:crop-rounded',
}

const cbtItems = [
  {
    title: 'Test Interface',
    href: '/cbt/interface',
    icon: 'line-md:computer',
  },
  {
    title: 'Test Results',
    href: '/cbt/results',
    icon: 'material-symbols:bar-chart-4-bars-rounded',
  },
  {
    title: 'Generate Answer Key',
    href: '/cbt/generate-answer-key',
    icon: 'mdi:script-text-key-outline',
  },
]

const menuItems = [
  pdfCropperItem,
  {
    title: 'CBT',
    icon: 'line-md:computer',
    content: cbtItems,
  },
]

const updatesIndicatorColorClass = computed(() => {
  if (
    appSettings.value.notify.releases.indicator
    && updatesLSState.value.releases.showIndicator
  ) {
    return 'text-[lime] hover:text-[lime]'
  }
  else if (
    appSettings.value.notify.dev.indicator
    && updatesLSState.value.dev.showIndicator
  ) {
    return 'text-yellow-400 hover:text-yellow-400'
  }

  return ''
})

const updatesSettingsSwitchHandler = (val: boolean) => {
  if (!val) return

  if (checkForUpdatesSetTimeoutId !== null)
    clearTimeout(checkForUpdatesSetTimeoutId)

  checkForUpdates()
}

const notifySettings = appSettings.value.notify

const showReleasesPopup = computed(() =>
  notifySettings.releases.popup && updatesLSState.value.releases.showPopup,
)

const showDevPopup = computed(() =>
  notifySettings.dev.popup && updatesLSState.value.dev.showPopup,
)

function notifyOfReleaseUpdate(newVersion: string) {
  const releasesState = updatesLSState.value.releases
  releasesState.version = newVersion

  if (notifySettings.releases.indicator)
    releasesState.showIndicator = true

  if (notifySettings.releases.popup)
    releasesState.showPopup = true
}

function notifyOfDevUpdate(newVersion: string) {
  const devState = updatesLSState.value.dev
  devState.version = newVersion

  if (notifySettings.dev.indicator)
    devState.showIndicator = true

  if (notifySettings.dev.popup)
    devState.showPopup = true
}

async function checkForUpdates() {
  if (
    (
      isBuildForWebsite === 'true'
      || (!notifySettings.releases.indicator && !notifySettings.releases.popup)
    )
    && !notifySettings.dev.popup
    && !notifySettings.dev.indicator
  ) {
    // stop checking for updates as all swtches are off
    if (checkForUpdatesSetTimeoutId)
      clearTimeout(checkForUpdatesSetTimeoutId)

    checkForUpdatesSetTimeoutId = null
    return
  }

  try {
    // first check for releases
    if (isBuildForWebsite !== 'true' // is not website build ==> local build
      && (notifySettings.releases.indicator || notifySettings.releases.popup)
    ) {
      // use release-please manifest file to get the latest release version
      const res = await fetch(
        UpdatesPage.ReleasesContentBaseUrl + '/../.release-please-manifest.json?t=' + Date.now(),
      )
      if (!res.ok)
        throw Error('Releases check returned status code: ' + res.status)
      const fetchedVersion = (await res.json() || {})['.']

      if (fetchedVersion
        && utilCompareVersion(fetchedVersion, '>', updatesLSState.value.releases.version)
      ) {
        notifyOfReleaseUpdate(fetchedVersion)
      }
    }

    if (notifySettings.dev.indicator || notifySettings.dev.popup) {
      const res = await fetch(
        UpdatesPage.DevContentBaseUrl + '/version.txt?t=' + Date.now(),
      )
      if (!res.ok)
        throw Error('Dev Updates check returned status code: ' + res.status)

      const fetchedVersion = parseInt(await res.text() || '0')
      if (fetchedVersion > parseInt(updatesLSState.value.dev.version)) {
        notifyOfDevUpdate(fetchedVersion + '')
      }
    }
  }
  catch (err) {
    console.error('Error while checking for updates:', err)
  }

  checkForUpdatesSetTimeoutId = setTimeout(checkForUpdates, CHECK_UPDATES_INTERVAL)
}

onMounted(() => {
  setTimeout(
    () => {
      // for website build, appVersion is the latest version, no need to poll for updates
      if (isBuildForWebsite === 'true'
        && (notifySettings.releases.indicator || notifySettings.releases.popup)
        && utilCompareVersion(appVersion, '>', updatesLSState.value.releases.version)
      ) {
        notifyOfReleaseUpdate(appVersion)
      }

      triggerRef(updatesLSState)
      triggerRef(appSettings)

      checkForUpdates()
    },
    300,
  )
})
</script>
