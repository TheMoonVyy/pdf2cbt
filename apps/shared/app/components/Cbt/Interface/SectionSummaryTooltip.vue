<template>
  <Icon
    ref="iconElem"
    name="my-icon:info"
    class="text-[1.4rem] mr-1"
    :class="props.iconClass || ''"
    @pointerenter="toggleTooltip(true)"
    @pointerleave="toggleTooltip(false)"
    @click.stop="toggleTooltip(true)"
  />
  <div
    ref="tooltipContentElem"
    class="flex-col fixed gap-1 p-1 pr-2 z-1000 rounded-xs shadow-lg whitespace-nowrap secondary-theme"
    :class="showTooltipContent ? 'flex' : 'hidden'"
  >
    <span
      class="block font-bold text-base p-0.5 content-center text-nowrap border-b-2 border-slate-300"
    >
      {{ props.sectionName }}
    </span>
    <template
      v-for="questionStatusItem in props.questionStatusList"
      :key="questionStatusItem.key"
    >
      <div class="flex flex-row gap-2">
        <span
          class="flex shrink-0 bg-image"
          :class="questionStatusItem.key"
          :style="{ fontSize: `${props.quesIcons[questionStatusItem.key].summaryIconSize * 0.9}rem` }"
        >
          <span
            class="flex justify-center items-center text-base w-full h-full"
            :style="{ fontSize: `${props.quesIcons[questionStatusItem.key].summaryNumberTextFontSize * 0.925}rem` }"
          >
            {{ props.sectionSummary?.value?.[questionStatusItem.key] ?? props.totalSummary?.[questionStatusItem.key] }}
          </span>
        </span>
        <span
          class="block content-center text-nowrap font-bold"
          :style="{ fontSize: `${props.quesIcons[questionStatusItem.key].summaryLabelFontSize * 0.85}rem` }"
        >
          {{ questionStatusItem.label }}
        </span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
interface QuestionStatusList {
  key: QuestionStatus
  label: string
  colSpan2?: boolean
}

interface Props {
  sectionName: string
  questionStatusList: QuestionStatusList[]
  quesIcons: QuesIcons
  dataIdSelector: string
  sectionSummary?: ComputedRef<TestSectionSummary>
  totalSummary?: TestSectionSummary
  iconClass?: string
}

const props = defineProps<Props>()

const showTooltipContent = shallowRef(false)

const iconELem = useTemplateRef<HTMLElement>('iconElem')
const tooltipContentElem = useTemplateRef('tooltipContentElem')

const toggleTooltip = (show: boolean) => {
  if (show) {
    const el = document.querySelector(`[data-id="${props.dataIdSelector}"]`) as HTMLDivElement | null

    if (!el) return
    const rect = el.getBoundingClientRect()
    const { width, bottom, left } = rect

    const x = Math.floor(width * 0.15) + left
    const y = bottom
    tooltipContentElem.value!.style.left = x + 'px'
    tooltipContentElem.value!.style.top = y + 'px'

    showTooltipContent.value = true
  }
  else {
    showTooltipContent.value = false
  }
}

onClickOutside(iconELem, () => toggleTooltip(false))
</script>
