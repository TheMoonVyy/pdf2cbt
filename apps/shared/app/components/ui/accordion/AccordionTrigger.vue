<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { ChevronDown } from 'lucide-vue-next'
import {
  AccordionHeader,
  AccordionTrigger,
  type AccordionTriggerProps,
} from 'reka-ui'
import { cn } from '#layers/shared/app/lib/utils'

const props = defineProps<AccordionTriggerProps & { class?: HTMLAttributes['class'], titleClass?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class', 'titleClass')
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      data-slot="accordion-trigger"
      v-bind="delegatedProps"
      :class="
        cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all hover:outline outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          'group px-5 hover:cursor-pointer hover:no-underline',
          props.class,
        )
      "
    >
      <span
        :class="
          cn(
            'text-xl mx-auto font-semibold transition-colors duration-200 text-muted-foreground group-hover:text-foreground group-data-[state=open]:text-foreground',
            props.titleClass,
          )
        "
      >
        <slot />
      </span>
      <slot name="icon">
        <ChevronDown
          class="text-muted-foreground pointer-events-none size-5.5 shrink-0 translate-y-0.5 transition-transform duration-200"
        />
      </slot>
    </AccordionTrigger>
  </AccordionHeader>
</template>
