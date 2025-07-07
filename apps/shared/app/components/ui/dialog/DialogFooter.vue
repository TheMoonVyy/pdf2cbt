<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '#layers/shared/app/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="cn('flex flex-col-reverse gap-2 sm:flex-row sm:gap-6 sm:justify-center', props.class)"
  >
    <slot />
  </div>
</template>
