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
import type { ButtonVariants } from '#layers/shared/app/components/ui/button'

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
  invalidFileTypeMessage = 'Please Select Valid File',
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
  invalidFileTypeMessage?: string
}>()

const emit = defineEmits<{
  upload: [file: File]
}>()

const inputElem = useTemplateRef('inputElem')

const { $toast } = useNuxtApp()

const isUploadedFileAcceptable = (file: File): boolean => {
  if (!accept) return true

  const rules = accept.toLowerCase().split(',').map(rule => rule.trim())
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()

  return rules.some((rule) => {
    if (rule.startsWith('.')) {
      return fileName.endsWith(rule)
    }
    else if (rule.endsWith('/*')) {
      const typeGroup = rule.slice(0, -1)
      return fileType.startsWith(typeGroup)
    }

    return fileType === rule
  })
}

const uploadHandler = async () => {
  const file = inputElem.value?.files?.item(0)

  if (file) {
    if (isUploadedFileAcceptable(file)) {
      emit('upload', file)
    }
    else {
      $toast.error('Invalid File', {
        description: `${file.name} is  invalid. ${invalidFileTypeMessage}`,
      })
    }
  }
}
</script>
