<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '#layers/shared/app/lib/utils'
import { Separator } from '#layers/shared/app/components/ui/separator'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <Separator
    data-slot="sidebar-separator"
    data-sidebar="separator"
    :class="cn('bg-sidebar-border mx-2 w-auto', props.class)"
  >
    <slot />
  </Separator>
</template>
