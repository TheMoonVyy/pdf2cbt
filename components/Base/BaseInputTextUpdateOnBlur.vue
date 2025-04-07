<template>
  <template v-if="trimText">
    <InputText
      v-model.trim="localValue"
      @blur="onBlurHandler()"
    />
  </template>
  <template v-else>
    <InputText
      v-model="localValue"
      @blur="onBlurHandler()"
    />
  </template>
</template>

<script lang="ts" setup>
/* A wrapper for InputText that will update modelValue on blur if value has changed */

const originalValue = defineModel<string>({ required: true })

const props = defineProps<{
  trim?: boolean
}>()

const trimText = props.trim ? true : false

const localValue = shallowRef(originalValue.value)

let isLocalChange = false
watch(originalValue, (newValue) => {
  if (isLocalChange) {
    isLocalChange = false
    return
  }

  localValue.value = newValue
})

const onBlurHandler = () => {
  const newValue = localValue.value
  if (newValue !== originalValue.value) {
    isLocalChange = true
    originalValue.value = newValue
  }
}
</script>

<style>

</style>
