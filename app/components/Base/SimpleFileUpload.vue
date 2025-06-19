<template>
  <div class="flex items-center">
    <input
      ref="inputElem"
      class="hidden"
      type="file"
      :accept
      @change="uploadHandler"
    >
    <BaseButton
      :label
      :label-class
      :disabled
      :class="buttonClass"
      :variant
      :size
      :icon-name
      :icon-size
      @click="inputElem?.click()"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ButtonVariants } from '@/components/ui/button'

const {
  accept = undefined,
  label = 'Select File',
  labelClass = 'text-base',
  iconName = 'line-md:plus',
  iconSize = '1.5rem',
  disabled = false,
  buttonClass = 'px-3',
  variant = 'success',
  size,
} = defineProps<{
  accept?: string
  label?: string
  labelClass?: string
  iconName?: string
  iconSize?: string
  disabled?: boolean
  buttonClass?: string
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
}>()

const emit = defineEmits<{
  upload: [file: File]
}>()

const inputElem = useTemplateRef('inputElem')

const uploadHandler = async () => {
  const file = inputElem.value?.files?.item(0)

  if (file) {
    emit('upload', file)
  }
}
</script>
