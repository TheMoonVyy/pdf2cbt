<script setup lang="ts">
const props = defineProps<{
  testSectionsList: { name: string }[]
  currentSection: string
  questionStatusList: {
    key: QuestionStatus
    label: string
    colSpan2?: boolean
  }[]
  testSectionsSummary: TestSectionsSummary
}>()

const emit = defineEmits<{
  sectionChange: [sectionName: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const virtualItemRefs = ref<HTMLElement[]>([])

const sectionWidths = ref<number[]>([])
const pages = ref<typeof props.testSectionsList[]>([])
const currentPage = ref(0)

const { uiSettings } = useCbtSettings()

const visibleSections = computed(() => pages.value[currentPage.value] || [])

function measureWidths() {
  sectionWidths.value = virtualItemRefs.value
    .map(el => el.clientWidth)
}

function computePages() {
  if (!containerRef.value) return
  if (!sectionWidths.value.length) return

  const containerWidth = containerRef.value.clientWidth

  const newPages: typeof props.testSectionsList[] = []
  let currentItems: typeof props.testSectionsList = []
  let currentWidth = 0

  props.testSectionsList.forEach((section, index) => {
    const width = sectionWidths.value[index]!

    if (
      currentWidth + width > containerWidth
      && currentItems.length
    ) {
      newPages.push(currentItems)
      currentItems = []
      currentWidth = 0
    }

    currentItems.push(section)
    currentWidth += width
  })

  if (currentItems.length) {
    newPages.push(currentItems)
  }

  pages.value = newPages

  if (currentPage.value >= newPages.length) {
    currentPage.value = newPages.length - 1
  }

  if (currentPage.value < 0) {
    currentPage.value = 0
  }
}

function goLeft() {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

function goRight() {
  if (currentPage.value < pages.value.length - 1) {
    currentPage.value++
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick().then(() => {
    measureWidths()
    computePages()

    if (containerRef.value) {
      resizeObserver = new ResizeObserver(computePages)
      resizeObserver.observe(containerRef.value)
    }
  })
})

watch(() => props.testSectionsList,
  () => {
    measureWidths()
    computePages()
  },
  { deep: true, flush: 'post' },
)

onBeforeUnmount(() => {
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value)
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative"
  >
    <div
      class="flex items-center border-y-2 border-slate-400 w-full px-2"
      :style="{ height: `${uiSettings.mainLayout.sectionHeaderHeight}rem` }"
    >
      <BaseButton
        variant="link"
        size="icon"
        class="select-none text-slate-700 disabled:cursor-auto"
        icon-name="material-symbols:arrow-left"
        icon-size="2.5rem"
        :disabled="currentPage === 0"
        @click="goLeft"
      />

      <div class="flex whitespace-nowrap flex-1 overflow-hidden divide-x-2 h-full divide-slate-400">
        <template
          v-for="(sectionItem, index) in visibleSections"
          :key="sectionItem.name"
        >
          <div
            class="flex items-center gap-2 cursor-pointer"
            :class="{
              'primary-theme': sectionItem.name === currentSection,
              'border-slate-400 border-r-2!':
                index === visibleSections.length - 1,
            }"
            :data-id="'data-id_' + sectionItem.name"
            @click=" emit('sectionChange', sectionItem.name)"
          >
            <span class="pl-3 py-0.5">
              {{ sectionItem.name }}
            </span>

            <CbtInterfaceSectionSummaryTooltip
              :section-name="sectionItem.name"
              :question-status-list="questionStatusList"
              :ques-icons="uiSettings.questionPalette.quesIcons"
              :section-summary="testSectionsSummary.get(sectionItem.name)!"
              :data-id-selector="'data-id_' + sectionItem.name"
            />
          </div>
        </template>
      </div>

      <BaseButton
        variant="link"
        size="icon"
        class="select-none text-slate-700 disabled:cursor-auto"
        icon-name="material-symbols:arrow-right"
        icon-size="2.5rem"
        :disabled="currentPage === pages.length - 1"
        @click="goRight"
      />
    </div>

    <!-- using sections again to create virtual container to calculate each elem's width -->
    <div
      class="absolute invisible whitespace-nowrap pointer-events-none"
    >
      <div
        v-for="sectionItem in testSectionsList"
        :key="'virtual_' + sectionItem.name"
        ref="virtualItemRefs"
        class="flex items-center gap-2 -my-0.5 px-2"
      >
        <span class="pl-3 py-0.5">
          {{ sectionItem.name }}
        </span>

        <Icon
          ref="iconElem"
          name="my-icon:info"
          class="text-[1.4rem] mr-1"
        />
      </div>
    </div>
  </div>
</template>
