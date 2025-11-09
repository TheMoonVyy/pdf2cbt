<template>
  <div class="flex flex-col grow min-h-0 border-t-2">
    <UiSidebarProvider style="--sidebar-width: 11.5rem;">
      <div class="relative min-w-0 flex flex-row w-full grow">
        <UiSidebar>
          <UiSidebarContent class="pt-5 px-2 overflow-visible">
            <UiSidebarMenuItem>
              <UiSidebarMenuButton
                class="cursor-pointer py-4 data-[active=true]:text-green-500 hover:data-[active=true]:text-green-500"
                :is-active="selectedMenu === 'dev'"
                as="span"
                @click="selectMenu('dev')"
              >
                <Icon
                  name="mdi:dev-to"
                  class="text-yellow-400"
                  size="1.4rem"
                />
                <span class="text-base font-semibold">Development</span>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>
            <UiSidebarMenuItem>
              <UiSidebarMenuButton
                class="cursor-pointer py-4 data-[active=true]:text-green-500 hover:data-[active=true]:text-green-500"
                :is-active="selectedMenu === 'releases'"
                as="span"
                @click="selectMenu('releases')"
              >
                <Icon
                  name="material-symbols:release-alert-outline-rounded"
                  class="text-green-400"
                  size="1.4rem"
                />
                <span class="text-base font-semibold">Releases</span>
              </UiSidebarMenuButton>
              <UiSidebarMenuSub
                v-if="releasesData"
                class="gap-2.5 mr-0.5 mt-2 pl-2! pb-6! pr-0! overflow-auto min-h-0 h-[calc(100dvh-10rem)]"
              >
                <UiSidebarMenuSubItem
                  v-for="version in releasesData.keys()"
                  :key="version"
                >
                  <UiSidebarMenuSubButton
                    class="cursor-pointer py-4 pl-8 data-[active=true]:text-green-500 hover:data-[active=true]:text-green-500"
                    :is-active="releasesState.currentRelease?.version === version"
                    as="span"
                    @click="selectReleasesSubMenu(version)"
                  >
                    <span class="text-base font-semibold">v{{ version }}</span>
                  </UiSidebarMenuSubButton>
                </UiSidebarMenuSubItem>
              </UiSidebarMenuSub>
            </UiSidebarMenuItem>
          </UiSidebarContent>
        </UiSidebar>
        <main>
          <UiSidebarTrigger />
          <slot />
        </main>
        <div class="grow flex flex-col items-center">
          <UiScrollArea class="h-[calc(100dvh-2.5rem)] w-full">
            <h1 class="text-center text-xl font-bold mt-2">
              {{ selectedMenu === 'releases' ? 'Release Updates' : 'Development Updates' }}
            </h1>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-if="!isLoading"
              class="prose [.hr]:my-0.5! prose-neutral
                dark:prose-invert dark:text-white prose-a:text-sky-400
                max-w-none pr-2 pt-6 pb-15 sm:px-8 lg:px-14
                data-[selected-menu=releases]:[&>h2]:sm:text-3xl!
                data-[selected-menu=releases]:[&>h2]:lg:w-[calc(((100%-12rem)*0.7))]!
                [&>h2]:mx-auto
                data-[selected-menu=releases]:[&>h2]:text-xl"
              :data-selected-menu="selectedMenu"
              v-html="renderedMarkdown"
            />
          </UiScrollArea>
        </div>
      </div>
    </UiSidebarProvider>
  </div>
</template>

<script lang="ts" setup>
import { UpdatesPage } from '#layers/shared/shared/enums'

type ReleasesDataItem = {
  version: string
  date: string
  prevVersion?: string
}

const selectedMenu = ref<'releases' | 'dev'>('releases')
const renderedMarkdown = shallowRef('')
const isLoading = ref(true)

const versionRegex = /^v?(\d+)[.-](\d+)[.-](\d+)$/

const releasesData: Map<string, ReleasesDataItem> = await getReleasesData()
const releasesVersions = [...releasesData.keys()] // sorted by latest to oldest

const cache: {
  [versionOrDev: string]: string // md rendered string
} = {}

const releasesState = shallowReactive({
  currentRelease: null as ReleasesDataItem | null,
})

const md = utilMd()

const updatesLSState = useUpdatesLocalStorageState()

const releaseTitle = computed(() => {
  const currentRelease = releasesState.currentRelease
  if (!currentRelease) return ''
  const { version, date, prevVersion } = currentRelease

  const releaseLink = `https://github.com/TheMoonVyy/pdf2cbt/releases/tag/v${version}`
  const prefix = `## ::${date}::{.sm:text-lg!}  ::[v${version}](${releaseLink})::{.version-span}`
  const compare = prevVersion
    ? `  ::[${prevVersion}...${version}](https://github.com/TheMoonVyy/pdf2cbt/compare/v${prevVersion}...v${version})::`
    : ''
  const suffix = '\n---\n'

  return prefix + compare + suffix
})

async function getReleasesData() {
  const data = new Map<string, ReleasesDataItem>()

  try {
    const res = await fetch(`${UpdatesPage.ReleasesContentBaseUrl}/releases.json?t=` + Date.now())
    if (!res.ok)
      throw new Error(`Failed to fetch releases data: ${res.status} - ${res.statusText}`)

    const releasesJsonData = await res.json() as Omit<ReleasesDataItem, 'prevVersion'>[]
    if (!Array.isArray(releasesJsonData) || releasesJsonData.length === 0) {
      console.error(releasesJsonData)
      throw Error('Releases List is empty or not in valid format')
    }

    const dataEntries: ReleasesDataItem[] = []

    let prevVersion = null as string | null
    for (const { version, date } of releasesJsonData) {
      dataEntries.push({ version, date, prevVersion: prevVersion ?? undefined })
      prevVersion = version
    }

    dataEntries
      .reverse() // order it by latest to oldest
      .forEach(entry => data.set(entry.version, entry))
  }
  catch (err) {
    console.error(`${err}`)
  }

  return data
}

async function fetchMarkdownFile(url: string) {
  isLoading.value = true

  const data = { mdRawString: '', success: false }
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error('Failed to fetch markdown file:', url, res.status, res.statusText)
      throw new Error(res.status + '')
    }
    data.mdRawString = await res.text()
    data.success = true
  }
  catch (err) {
    console.error('Error fetching markdown file:', url, err)
    const msg = (err as { message?: string }).message || err
    data.mdRawString = `## Error loading content (${msg})`
  }

  isLoading.value = false
  return data
}

async function selectMenu(menu: 'releases' | 'dev') {
  selectedMenu.value = menu
  if (menu === 'dev') {
    updatesLSState.value.dev.showIndicator = false
    updatesLSState.value.dev.showPopup = false

    releasesState.currentRelease = null
    const existingData = cache['dev']
    if (existingData) {
      renderedMarkdown.value = existingData
    }
    else {
      const data = await fetchMarkdownFile(UpdatesPage.DevContentBaseUrl + '/content.md')
      const renderedMd = md.render(data.mdRawString)
      renderedMarkdown.value = renderedMd
      if (data.success)
        cache['dev'] = renderedMd
    }
  }
  else {
    updatesLSState.value.releases.showIndicator = false
    updatesLSState.value.releases.showPopup = false

    selectReleasesSubMenu()
  }
}

async function selectReleasesSubMenu(version?: string) {
  const resolvedVersion = version ?? releasesVersions[0]

  if (!resolvedVersion) {
    releasesState.currentRelease = null
    isLoading.value = false
    renderedMarkdown.value = md.render('## No release notes available right now.')
    return
  }

  releasesState.currentRelease = releasesData.get(resolvedVersion) ?? null
  const existingData = cache[resolvedVersion]
  if (existingData) {
    renderedMarkdown.value = existingData
  }
  else {
    const match = resolvedVersion.match(versionRegex)
    const [, major, minor, patch] = match ?? []
    if (major === undefined || minor === undefined || patch === undefined) return

    const title = releaseTitle.value
    renderedMarkdown.value = md.render(title + 'Loading...')

    const data = await fetchMarkdownFile(`${UpdatesPage.ReleasesContentBaseUrl}/v${major}-${minor}-${patch}.md`)

    const renderedMd = md.render(title + data.mdRawString)
    renderedMarkdown.value = renderedMd
    if (data.success)
      cache[resolvedVersion] = renderedMd
  }
}

onMounted(() => {
  const route = useRoute()
  // Prefer version param if both exist
  const versionParam = route.query.release
    || route.query.version
    || route.query.v

  if (versionParam && typeof versionParam === 'string') {
    const match = versionParam.match(versionRegex)
    if (match) {
      const version = `${match[1]}.${match[2]}.${match[3]}`
      if (releasesData.has(version)) {
        selectedMenu.value = 'releases'
        selectReleasesSubMenu(version)
        return
      }
    }
  }

  const devFlag = 'dev' in route.query
  if (devFlag) {
    selectMenu('dev')
    return
  }

  selectMenu('releases')
})
</script>

<style>
[data-selected-menu] h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0rem;
}

[data-selected-menu] hr {
  margin-bottom: 1rem;
  margin-top: 1rem;
}

[data-selected-menu="releases"] h2 {
  justify-content: space-between !important;
}

[data-selected-menu="releases"] h2 span > span {
  font-size: 1rem;
  font-weight: normal;
  text-wrap: nowrap;
}

[data-selected-menu="releases"] .version-span > a {
  color: var(--color-green-400);
}
</style>
