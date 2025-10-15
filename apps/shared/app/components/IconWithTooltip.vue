<script setup lang="ts">
import { PopoverArrow } from 'reka-ui'

interface Props {
  contentClass?: ClassValue
  iconClass?: ClassValue
  content?: string | VNode | (() => VNode)
  iconName?: string
  iconSize?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

const {
  content,
  contentClass,
  iconClass,
  iconSize = '1.125rem',
  iconName = 'my-icon:info',
  side = 'top',

} = defineProps<Props>()

const toRenderFn = (val?: string | VNode | (() => VNode)) => {
  if (typeof val === 'string') {
    return () => h('div', val.split('\n').map(line => h('p', line)))
  }
  else if (typeof val === 'function') {
    return val
  }
  else if (val) {
    return () => val
  }
  return null
}

// small timer so it doesn't flicker when moving between trigger <--> content
let hideTimer: ReturnType<typeof setTimeout> | null = null

function openTooltip() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  showTooltip.value = true
}

function delayedClose() {
  hideTimer = setTimeout(
    () => {
      showTooltip.value = false
      hideTimer = null
    },
    100,
  )
}

const renderContent = computed(() => toRenderFn(content))
const showTooltip = shallowRef(false)
</script>

<template>
  <UiPopover v-model:open="showTooltip">
    <UiPopoverTrigger as-child>
      <Icon
        tabindex="-1"
        class="focus-visible:outline-hidden"
        :name="iconName"
        :size="iconSize"
        :class="iconClass"
        @mouseenter="openTooltip"
        @mouseleave="delayedClose"
      />
    </UiPopoverTrigger>

    <UiPopoverContent
      class="bg-[color-mix(in_srgb,_theme(colors.gray.900),_black_10%)] max-w-[96dvw] sm:max-w-sm min-w-fit w-auto lg:max-w-md text-white text-base px-2 py-1.5"
      :class="contentClass"
      avoid-collisions
      :collision-padding="16"
      :side="side"
      @mouseenter="openTooltip"
      @mouseleave="delayedClose"
      @open-auto-focus.prevent
    >
      <UiScrollArea
        type="auto"
        class="max-h-84 min-h-0"
        viewport-class="pr-0.5 [&>div]:max-h-84 [&>div]:pl-2 [&>div]:pr-4"
      >
        <slot>
          <template v-if="renderContent">
            <component :is="renderContent" />
          </template>
        </slot>
      </UiScrollArea>
      <PopoverArrow as-child>
        <ArrowSvgForOverlays />
      </PopoverArrow>
    </UiPopoverContent>
  </UiPopover>
</template>

<style scoped>
p {
  margin-left: 0;
  margin-right: 0;
}
</style>
