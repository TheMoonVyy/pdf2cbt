<template>
  <div
    :class="rootClass"
    class="flex items-center"
  >
    <Icon
      v-if="position === 'top'"
      v-tooltip.focus.top="{ value: tooltipContent, autoHide: false, escape }"
      tabindex="-1"
      class="focus-visible:outline-hidden"
      :name="iconName"
      :class="iconClass"
      @pointerenter="focus"
      @pointerleave="unfocus"
    />
    <Icon
      v-else-if="position === 'bottom'"
      v-tooltip.focus.bottom="{ value: tooltipContent, autoHide: false, escape }"
      tabindex="-1"
      class="focus-visible:outline-hidden"
      :name="iconName"
      :class="iconClass"
      @pointerenter="focus"
      @pointerleave="unfocus"
    />
    <Icon
      v-else-if="position === 'left'"
      v-tooltip.focus.left="{ value: tooltipContent, autoHide: false, escape }"
      tabindex="-1"
      class="focus-visible:outline-hidden"
      :name="iconName"
      :class="iconClass"
      @pointerenter="focus"
      @pointerleave="unfocus"
    />
    <Icon
      v-else
      v-tooltip.focus.right="{ value: tooltipContent, autoHide: false, escape }"
      tabindex="-1"
      class="focus-visible:outline-hidden"
      :name="iconName"
      :class="iconClass"
      @pointerenter="focus"
      @pointerleave="unfocus"
    />
  </div>
</template>

<script lang="ts" setup>
interface IconWithTooltipProps {
  rootClass?: string
  iconClass?: string
  tooltipContent?: string
  iconName?: string
  position?: 'right' | 'left' | 'top' | 'bottom'
  escape?: boolean
}

const {
  rootClass = '',
  iconClass = 'text-2xl',
  tooltipContent = '',
  iconName = 'my-icon:info',
  position = 'right',
  escape = true,
} = defineProps<IconWithTooltipProps>()

const focus = (e: PointerEvent) => {
  (e.target as HTMLElement).focus()
}

const unfocus = (e: PointerEvent) => {
  (e.target as HTMLElement).blur()
}
</script>
