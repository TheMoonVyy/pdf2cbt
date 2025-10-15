<template>
  <div class="flex gap-1 items-center p-2.5 cursor-pointer">
    <span
      :class="titleClass"
    >{{ label }}</span>
    <BaseButton
      v-if="!required"
      class="shrink-0"
      variant="outline"
      size="iconXs"
      icon-name="material-symbols:delete"
      title="Remove"
      icon-size="1rem"
      icon-class="text-red-400"
      @click="emit('remove')"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ label: string, titleClass?: ClassValue, required?: boolean }>()

const emit = defineEmits<{ remove: [] }>()
</script>
