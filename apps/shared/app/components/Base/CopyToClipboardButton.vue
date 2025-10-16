<template>
  <BaseButton
    class="shrink-0"
    variant="outline"
    size="icon"
    :icon-name="status === 'success'
      ? 'mdi:clipboard-check-outline'
      : status === 'failed'
        ? 'mdi:clipboard-alert-outline'
        : 'mdi:clipboard-text-outline'"
    title="Copy to clipboard"
    :icon-class="status === 'success'
      ? 'text-green-400'
      : status === 'failed'
        ? 'text-red-400'
        : ''"
    icon-size="1.7rem"
    @click="copyToClipboard"
  />
</template>

<script lang="ts" setup>
const status = shallowRef<null | 'success' | 'failed'>(null)

const { text, duration = 750 } = defineProps<{
  text: string
  duration?: number
}>()

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(text)
    status.value = 'success'
    setTimeout(() => status.value = null, duration)
  }
  catch {
    status.value = 'failed'
    setTimeout(() => status.value = null, duration)
  }
}
</script>
