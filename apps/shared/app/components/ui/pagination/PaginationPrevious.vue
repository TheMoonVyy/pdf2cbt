<script setup lang="ts">
import type { PaginationPrevProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '#layers/shared/app/components/ui/button'
import { reactiveOmit } from '@vueuse/core'
import { ChevronLeftIcon } from 'lucide-vue-next'
import { PaginationPrev, useForwardProps } from 'reka-ui'
import { cn } from '#layers/shared/app/lib/utils'
import { buttonVariants } from '#layers/shared/app/components/ui/button'

const props = withDefaults(defineProps<PaginationPrevProps & {
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  showLabel?: boolean
}>(), {
  size: 'default',
})

const delegatedProps = reactiveOmit(props, 'class', 'size', 'showLabel')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationPrev
    data-slot="pagination-previous"
    :class="cn(buttonVariants({ variant: 'ghost', size }), 'gap-1 px-2.5 sm:pr-2.5', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <ChevronLeftIcon />
      <span
        v-if="showLabel"
        class="hidden sm:block"
      >Previous</span>
    </slot>
  </PaginationPrev>
</template>
