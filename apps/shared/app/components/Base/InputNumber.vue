<script lang="ts" setup>
const model = defineModel<number>({ required: true })

const {
  incrementIcon = 'line-md:plus',
  decrementIcon = 'line-md:minus',
  inputClass = '',
  labelId = '',
  id = '',
  withoutButtons = false,
} = defineProps<{
  incrementIcon?: string
  decrementIcon?: string
  inputClass?: string
  labelId?: string
  withoutButtons?: boolean
  id?: string
}>()
</script>

<template>
  <UiNumberField
    :id="id || (labelId || undefined)"
    v-model="model"
  >
    <UiNumberFieldContent>
      <UiNumberFieldDecrement
        v-if="!withoutButtons"
        class="cursor-pointer flex justify-center"
      >
        <Icon
          size="1.2rem"
          :name="decrementIcon"
        />
      </UiNumberFieldDecrement>
      <UiNumberFieldInput :class="inputClass" />
      <UiNumberFieldIncrement
        v-if="!withoutButtons"
        class="cursor-pointer flex justify-center"
      >
        <Icon
          size="1.2rem"
          :name="incrementIcon"
        />
      </UiNumberFieldIncrement>
    </UiNumberFieldContent>
  </UiNumberField>
</template>
