<script setup lang="ts">
import { TreeRoot, TreeItem } from 'reka-ui'
import type { TreeNodeData } from '.'

const { items, disabled } = defineProps<{
  items: TreeNodeData[]
  disabled?: boolean
}>()

const selectedTreeNodesData = defineModel<TreeNodeData[] | undefined>({ required: true })
</script>

<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    v-model="selectedTreeNodesData"
    :items="items"
    :get-key="(item) => item.id"
    :propagate-select="true"
    :bubble-select="true"
    :disabled="disabled"
    :multiple="true"
  >
    <TreeItem
      v-for="item in flattenItems"
      :key="item._id"
      v-bind="item.bind"
      v-slot="slot"
      :style="{
        paddingLeft: `${item.level - 0.7}rem`,
      }"
      class="group my-0.5 select-none focus-visible:outline-hidden px-0.5"
      @keydown="disabled && $event.stopImmediatePropagation()"
      @click.capture="disabled && $event.stopImmediatePropagation()"
    >
      <div
        class="flex items-center gap-1.5 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer
          group-focus-visible:ring-2 group-focus-visible:ring-ring"
        :class="{
          'pl-6': !item.hasChildren,
          'cursor-not-allowed!': disabled,
          'bg-green-400 dark:bg-emerald-400/15': slot.isSelected,
          'bg-orange-400 dark:bg-orange-500/15': slot.isIndeterminate,
        }"
        @click.stop="slot.handleSelect"
      >
        <BaseButton
          v-if="item.hasChildren"
          icon-name="material-symbols:keyboard-arrow-down-rounded"
          :icon-class="slot.isExpanded ? '' : 'rotate-270'"
          size="iconSm"
          icon-size="1.6rem"
          variant="ghost"
          tabindex="-1"
          :class="disabled ? '' : 'hover:text-yellow-500'"
          :disabled="disabled"
          @click.stop="slot.handleToggle"
        />
        <BaseButton
          :icon-name="
            slot.isSelected
              ? 'material-symbols:check-box-rounded'
              : slot.isIndeterminate
                ? 'material-symbols:indeterminate-check-box'
                : 'material-symbols:check-box-outline-blank'
          "
          :icon-class="{
            'text-orange-500': slot.isIndeterminate,
            'text-green-500': slot.isSelected,
          }"
          size="iconSm"
          variant="ghost"
          :disabled="disabled"
          tabindex="-1"
        />

        <div class="font-medium">
          {{ item.value.label }}
        </div>
      </div>
    </TreeItem>
  </TreeRoot>
</template>
