<script setup lang="ts">
import type { PaginationLastProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '#layers/shared/app/components/ui/button'
import { reactiveOmit } from '@vueuse/core'
import { ChevronsRightIcon } from 'lucide-vue-next'
import { PaginationLast, useForwardProps } from 'reka-ui'
import { cn } from '#layers/shared/app/lib/utils'
import { buttonVariants } from '#layers/shared/app/components/ui/button'

const props = withDefaults(defineProps<PaginationLastProps & {
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
  <PaginationLast
    data-slot="pagination-last"
    :class="cn(buttonVariants({ variant: 'ghost', size }), 'gap-1 px-2.5 sm:pr-2.5', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <span
        v-if="showLabel"
        class="hidden sm:block"
      >Last</span>
      <ChevronsRightIcon />
    </slot>
  </PaginationLast>
</template>
