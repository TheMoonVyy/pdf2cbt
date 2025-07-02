<template>
  <ColorPicker
    v-slot="{ show }"
    v-model="throttledValue"
    @close="emit('close')"
  >
    <BaseButton
      variant="ghost"
      size="icon"
      :title
      class="rounded-md size-8"
      icon-name="my-icon:square"
      :icon-size="iconSize"
      icon-class="border border-input"
      :icon-style="{ color: value }"
      @click="(e: MouseEvent) => { show(e); emit('show') }"
    />
  </ColorPicker>
</template>

<script lang="ts" setup>
const value = defineModel<string>({ required: true })

const {
  iconSize = '1.6rem',
  throttleInterval = 500,
  title = 'Change Color',
} = defineProps<{
  iconSize?: string
  throttleInterval?: number
  title?: string
}>()

const throttledValue = refThrottled(value, throttleInterval)
watch(throttledValue, newValue => value.value = newValue)

const emit = defineEmits<{
  show: []
  close: []
}>()
</script>
