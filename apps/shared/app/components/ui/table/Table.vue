<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '#layers/shared/app/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="table-container"
    class="relative h-full overflow-auto"
  >
    <table
      data-slot="table"
      :class="cn('caption-bottom text-sm', props.class)"
    >
      <slot />
    </table>
  </div>
</template>
