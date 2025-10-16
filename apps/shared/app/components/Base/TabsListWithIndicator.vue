<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { TabsList, TabsIndicator } from 'reka-ui'
import type { TabsListProps } from 'reka-ui'
import { cn } from '#layers/shared/app/lib/utils'

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'], indicatorClass?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class', 'indicatorClass')
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    v-bind="delegatedProps"
    :class="cn('relative group', props.class)"
  >
    <TabsIndicator
      :class="cn(
        `absolute transition-[translate,width] duration-200 shadow-xs [[data-orientation=horizontal]_&]:left-0 [[data-orientation=horizontal]_&]:w-(--reka-tabs-indicator-size) [[data-orientation=horizontal]_&]:translate-x-(--reka-tabs-indicator-position) [[data-orientation=horizontal]_&]:inset-y-1 [[data-orientation=vertical]_&]:top-0 [[data-orientation=vertical]_&]:h-(--reka-tabs-indicator-size) [[data-orientation=vertical]_&]:translate-y-(--reka-tabs-indicator-position) [[data-orientation=vertical]_&]:inset-x-1`,
        `group-has-data-[slot=tabs-trigger]:border-b-[1.5px] border-green-500`,
        props.indicatorClass,
      )"
    />
    <slot />
  </TabsList>
</template>
