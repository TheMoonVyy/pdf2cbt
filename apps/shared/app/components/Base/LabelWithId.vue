<template>
  <slot :id="id" />
  <UiLabel
    :for="id"
    :class="classValue"
  >
    {{ label }}
  </UiLabel>
</template>

<script lang="ts" setup>
import type { HtmlHTMLAttributes } from 'vue'

const {
  id = useId(),
  label,
  class: classValue,
} = defineProps<{
  id?: string
  label: string
  class?: HtmlHTMLAttributes['class']
}>()
</script>
