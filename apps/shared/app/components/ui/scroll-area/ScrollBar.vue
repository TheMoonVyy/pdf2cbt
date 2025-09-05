<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { ScrollAreaScrollbar, type ScrollAreaScrollbarProps, ScrollAreaThumb } from 'reka-ui'
import { cn } from '#layers/shared/app/lib/utils'

const props = withDefaults(defineProps<ScrollAreaScrollbarProps & { class?: HTMLAttributes['class'], thumbAreaClass?: HTMLAttributes['class'] }>(), {
  orientation: 'vertical',
})

let suppressNextClick = false

function onPointerDown() {
  suppressNextClick = true
  window.addEventListener('click', suppressClickOnce, true)
}

function suppressClickOnce(e: MouseEvent) {
  if (suppressNextClick) {
    e.stopImmediatePropagation()
    e.preventDefault()
    suppressNextClick = false
    window.removeEventListener('click', suppressClickOnce, true)
  }
}

const delegatedProps = reactiveOmit(props, 'class', 'thumbAreaClass')
</script>

<template>
  <ScrollAreaScrollbar
    data-slot="scroll-area-scrollbar"
    v-bind="delegatedProps"
    :class="
      cn('flex touch-none bg-gray-300 dark:bg-foreground/20 p-px transition-colors select-none',
         orientation === 'vertical'
           && 'h-full w-2.5 border-l border-l-transparent',
         orientation === 'horizontal'
           && 'h-2.5 flex-col border-t border-t-transparent',
         props.class)"
    @pointerdown="onPointerDown"
  >
    <ScrollAreaThumb
      data-slot="scroll-area-thumb"
      :class="cn(
        'bg-gray-600 dark:bg-foreground/70 relative flex-1 rounded-full',
        props.thumbAreaClass,
      )"
    />
  </ScrollAreaScrollbar>
</template>
