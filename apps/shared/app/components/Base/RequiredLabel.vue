<template>
  <UiLabel class="gap-0">
    <slot />
    <span
      v-if="required"
      class="text-red-500"
    >*</span>
  </UiLabel>
</template>

<script lang="ts" setup>
const { required = true } = defineProps<{
  required?: boolean
}>()
</script>
