<template>
  <div class="relative group">
    <slot :id="labelId" />
    <label
      :for="labelId"
      class="absolute start-3 top-0 -translate-y-1/2 text-sm text-surface-50 font-bold
        transition-all duration-200 ease-in-out before:absolute before:top-0
        before:left-0 before:w-full before:h-1/2 before:bg-background before:-z-10
        after:absolute after:bottom-0 after:left-0 after:w-full after:h-1/2
        after:bg-background group-has-[input[disabled]]:after:disabled:opacity-50
        after:-z-10 text-nowrap"
      :class="labelClass"
      data-slot="float-label"
      :data-required="Boolean(required)"
    >
      <span>{{ label }}</span>
    </label>
  </div>
</template>

<script lang="ts" setup>
const { labelId = useId() } = defineProps<{
  label: string
  labelId?: string
  labelClass?: string
  required?: boolean
}>()
</script>

<style>
label[data-slot="float-label"][data-required="true"] span::after {
  content: "*";
  color: var(--color-red-500);
}
</style>
