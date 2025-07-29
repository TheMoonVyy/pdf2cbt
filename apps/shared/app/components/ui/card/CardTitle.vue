<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '#layers/shared/app/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <p
    data-slot="card-title"
    :class="cn('leading-none font-semibold m-0', props.class)"
  >
    <slot />
  </p>
</template>
