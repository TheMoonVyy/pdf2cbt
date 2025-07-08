<script setup lang="ts">
import type { ButtonVariants } from '../ui/button'

const {
  variant = 'success',
  size,
  label,
  labelClass = 'text-base',
  iconName,
  iconSize = '1.4rem',
  iconClass,
  iconStyle,
} = defineProps<{
  variant?: ButtonVariants['variant']
  label?: string
  labelClass?: string | string[]
  iconName?: string
  iconSize?: string
  iconClass?: string | string[] | Record<string, boolean | undefined>
  iconStyle?: unknown
  size?: ButtonVariants['size']
}>()
</script>

<template>
  <UiButton
    class="flex items-center disabled:cursor-not-allowed disabled:pointer-events-auto"
    :size
    :variant
  >
    <slot name="icon">
      <Icon
        v-if="iconName"
        :name="iconName"
        :size="iconSize"
        :class="iconClass"
        :style="iconStyle"
      />
    </slot>
    <span
      v-if="label"
      :class="labelClass"
    >{{ label }}</span>
  </UiButton>
</template>
