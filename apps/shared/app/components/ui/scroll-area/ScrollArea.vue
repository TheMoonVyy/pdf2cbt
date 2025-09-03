<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  type ScrollAreaRootProps,
  ScrollAreaViewport,
} from 'reka-ui'
import ScrollBar from './ScrollBar.vue'
import { cn } from '#layers/shared/app/lib/utils'

const props = defineProps<ScrollAreaRootProps & {
  class?: HTMLAttributes['class']
  viewportClass?: HTMLAttributes['class']
  scrollBarClass?: HTMLAttributes['class']
}>()

const delegatedProps = reactiveOmit(props, 'class', 'viewportClass', 'scrollBarClass')

const scrollAreaRootRef = useTemplateRef<InstanceType<typeof ScrollAreaRoot>>('scrollArea')

// Expose ScrollAreaRoot's methods to parent
defineExpose({
  scrollTopLeft: () => { scrollAreaRootRef.value?.scrollTopLeft() },
  scrollTop: () => { scrollAreaRootRef.value?.scrollTop() },
})
</script>

<template>
  <ScrollAreaRoot
    ref="scrollArea"
    data-slot="scroll-area"
    v-bind="delegatedProps"
    :class="cn('relative min-h-0', props.class)"
  >
    <ScrollAreaViewport
      data-slot="scroll-area-viewport"
      :class="cn(
        'focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1',
        props.viewportClass,
      )"
    >
      <slot />
    </ScrollAreaViewport>
    <ScrollBar :class="props.scrollBarClass" />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
