<template>
  <ColorPicker
    v-slot="{ show }"
    v-model="throttledValue"
    @close="emit('close')"
  >
    <BaseButton
      variant="ghost"
      size="icon"
      title="Menu"
      class="rounded-md size-8"
      icon-name="my-icon:square"
      :icon-size="iconSize"
      icon-class="border border-input"
      :icon-style="{ color: value }"
      @click="(e) => { show(e); emit('show') }"
    />
  </ColorPicker>
</template>

<script lang="ts" setup>
const value = defineModel<string>({ required: true })

const {
  iconSize = '1.6rem',
  throttleInterval = 500,
} = defineProps<{
  iconSize?: string
  throttleInterval?: number
}>()

const throttledValue = refThrottled(value, throttleInterval)
watch(throttledValue, newValue => value.value = newValue)

const emit = defineEmits<{
  show: []
  close: []
}>()
</script>
