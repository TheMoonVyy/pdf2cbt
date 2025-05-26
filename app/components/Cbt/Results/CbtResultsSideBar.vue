<template>
  <div>
    <!-- Backdrop (for screens lower than sm) -->
    <div
      class="fixed inset-0 bg-black/30 z-20 sm:hidden"
      :class="{ hidden: !isShowSidebar }"
      @click="toggleSideBar"
    />
    <div
      class="absolute top-3 left-2 z-40 sm:absolute"
      :class="{ fixed: isShowSidebar, hidden: !showButton }"
    >
      <BaseButton
        variant="outlined"
        rounded
        raised
        @click="toggleSideBar()"
      >
        <template #icon>
          <Icon
            :name="isShowSidebar ? 'material-symbols:close-rounded' : 'material-symbols:menu-rounded'"
            class="text-3xl"
          />
        </template>
      </BaseButton>
    </div>

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 h-full w-44 text-white z-30 transform transition-transform duration-300
        [background:color-mix(in_srgb,var(--color-neutral-900),white_3%)]"
      :class="isShowSidebar ? 'sm:static block sm:z-auto translate-x-0' : '-translate-x-full'"
    >
      <nav class="px-1 pt-14 divide-y divide-green-400 divide-dashed">
        <div
          class="py-2 rounded select-none flex flex-col
             has-data-selected:[&>.flex-row]:text-green-500
             has-data-selected:[&>.flex-row]:font-bold
             has-data-selected:[&>.flex-row]:[background:color-mix(in_srgb,var(--color-green-900),var(--color-neutral-800)_96%)]
             not-has-data-selected:[&>.flex-row]:hover:font-bold"
        >
          <div
            tabindex="0"
            class="flex flex-row rounded items-center gap-3 cursor-pointer px-2 mb-1 py-1.5 transition-all"
            @click="select(ResultsPagePanels.Summary)"
          >
            <Icon
              name="mdi:chart-bar"
              size="1.2rem"
              class="text-lg"
            />
            <span class="text-nowrap">Test Results</span>
          </div>

          <div
            v-for="item in testResultsSideNavData"
            :key="item.name"
            tabindex="0"
            class="cursor-pointer ml-4 py-1.75 rounded text-sm select-none flex items-center gap-2 text-nowrap transition-all
              data-[selected=true]:[background:color-mix(in_srgb,var(--color-green-900),var(--color-neutral-800)_90%)]
              data-[selected=true]:text-green-500
              data-[selected=true]:font-bold
              data-[selected=false]:hover:text-white
              data-[selected=false]:hover:font-bold"
            :data-selected="selected === item.name"
            @click="select(item.name)"
          >
            <Icon
              :name="item.icon"
              size="1.2rem"
              class="text-base"
            />
            <span>{{ utilKeyToLabel(item.name) }}</span>
          </div>
        </div>

        <div
          tabindex="0"
          class="cursor-pointer p-2 rounded select-none flex items-center gap-2 transition-all
            data-[selected=true]:[background:color-mix(in_srgb,var(--color-green-900),var(--color-neutral-800)_90%)]
            data-[selected=true]:text-green-500
            data-[selected=true]:font-bold
            data-[selected=false]:hover:text-white
            data-[selected=false]:hover:font-bold"
          :data-selected="selected === ResultsPagePanels.MyTests"
          @click="select(ResultsPagePanels.MyTests)"
        >
          <Icon
            name="mdi:clipboard-text-outline"
            size="1.2rem"
            class="text-lg"
          />
          <span>My Tests</span>
        </div>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ResultsPagePanels } from '#shared/enums'

const props = defineProps<{
  isSmOrAbove: boolean
  scrollOnTop: boolean
  scrollOnBottom: boolean
}>()

const selected = defineModel<ResultsPagePanels>({ required: true })

const sidebarState = shallowReactive({
  userChangedState: false,
  showSidebar: true,
})

const isShowSidebar = computed(() => {
  if (sidebarState.userChangedState) {
    return sidebarState.showSidebar
  }
  else {
    return props.isSmOrAbove
  }
})

// if isShowSideBar is true, then show the toggle button
// else show the toggle button when scroll is at top-most or bottom-most scroll point
const showButton = computed(() => {
  return isShowSidebar.value || props.scrollOnTop || props.scrollOnBottom
})

const testResultsSideNavData = [
  { name: ResultsPagePanels.Summary, icon: 'material-symbols:full-coverage-outline-rounded' },
  { name: ResultsPagePanels.Detailed, icon: 'mdi:book-open-page-variant' },
]

const select = (label: ResultsPagePanels) => {
  selected.value = label
  if (!props.isSmOrAbove) toggleSideBar()
}

const toggleSideBar = async () => {
  // as initial value is true and side bar is shown for SmOrAbove, boolean can just be flipped
  if (sidebarState.userChangedState || props.isSmOrAbove) {
    sidebarState.showSidebar = !isShowSidebar.value
    sidebarState.userChangedState = true
  }
  else {
    // this is when screen is below sm,
    sidebarState.showSidebar = false // set to false first
    sidebarState.userChangedState = true
    await nextTick() // wait for vue to update
    sidebarState.showSidebar = true // set back true, trigging the computed "isShowSidebar"
  }
}
</script>
