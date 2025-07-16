<script lang="ts" setup>
const model = defineModel<number | null>({ required: true })

// using writeable computed property
// to prevent model value from being assigned undefined
const computedModel = computed({
  get: () => model.value,
  set: (val) => {
    if (typeof val !== 'number')
      val = null
    model.value = val
  },
})

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
  inputClass?: ClassValue
  labelId?: string
  withoutButtons?: boolean
  id?: string
}>()
</script>

<template>
  <UiNumberField
    :id="id || (labelId || undefined)"
    v-model="computedModel"
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
