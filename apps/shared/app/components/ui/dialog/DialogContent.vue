<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,

  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
import DialogOverlay from './DialogOverlay.vue'
import { cn } from '#layers/shared/app/lib/utils'

const props = defineProps<DialogContentProps & { class?: HTMLAttributes['class'], nonClosable?: boolean }>()
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'nonClosable')

const preventClosingIfNonClosable = computed(() => {
  if (!props.nonClosable) return {}

  return {
    interactOutside: (event: Event) => event.preventDefault(),
    escapeKeyDown: (event: Event) => event.preventDefault(),
  }
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal to="#app-root">
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="forwarded"
      :aria-describedby="undefined"
      :class="
        cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          props.class,
        )"
      v-on="preventClosingIfNonClosable"
      @interact-outside="e => {
        if ((e.target as HTMLElement)?.closest('[data-sonner-toaster]'))
          return e.preventDefault()
      }"
    >
      <slot />

      <DialogClose
        v-if="!props.nonClosable"
        class="ring-offset-background cursor-pointer focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-md opacity-80 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5"
      >
        <X />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
