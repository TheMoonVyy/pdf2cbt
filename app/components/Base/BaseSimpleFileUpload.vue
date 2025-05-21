<template>
  <FileUpload
    v-if="showFileUploader"
    auto
    custom-upload
    :pt:header:class="'flex flex-col items-center ' + (fluid ? 'w-full ' : '') + headerClass"
    pt:content:class="hidden has-data-[pc-name=pcmessage]:flex has-data-[pc-name=pcmessage]:mt-3"
    @uploader="(e) => uploadHandler(e.files)"
  >
    <template #header="scope">
      <BaseButton
        :label="label"
        :disabled="disabled"
        :severity="severity"
        :class="buttonClass"
        :fluid="fluid"
        @click="scope.chooseCallback()"
      >
        <template #icon>
          <Icon
            :name="iconName"
            :size="iconSize"
          />
        </template>
      </BaseButton>
    </template>
  </FileUpload>
</template>

<script lang="ts" setup>
const {
  label = 'Select File',
  iconName = 'prime:plus',
  iconSize = '1.4rem',
  disabled = false,
  fluid = false,
  buttonClass = '',
  severity,
  headerClass = '',

} = defineProps<{
  label?: string
  iconName?: string
  iconSize?: string
  disabled?: boolean
  fluid?: boolean
  buttonClass?: string
  headerClass?: string
  severity?: 'warn' | 'help' | 'danger'
}>()

const emit = defineEmits<{
  upload: [files: File]
}>()

const showFileUploader = shallowRef(true)

const uploadHandler = async (files: File | File[]) => {
  const file = Array.isArray(files) ? files[0] : files
  if (file) {
    showFileUploader.value = false
    await nextTick()
    emit('upload', file)
    showFileUploader.value = true
  }
}
</script>

<style>

</style>
