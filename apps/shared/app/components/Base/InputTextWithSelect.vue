<script setup lang="ts">
const {
  placeholder = 'Type or select...',
  selectOptions,
  label,
  labelRootClass,
  labelClass,
  selectClass,
  inputClass,
  disabled = false,
  commonClass = '',
  id = useId(),
  onBlur,
} = defineProps<{
  id?: string
  label?: string
  selectOptions: string[] | (() => string[])
  placeholder?: string
  labelRootClass?: ClassValue
  selectClass?: string
  labelClass?: string
  inputClass?: string
  commonClass?: ClassValue
  disabled?: boolean
  onBlur?: ((e: unknown) => void)
}>()

const input = defineModel<string>({ required: true })

const onBlurCallback = (e: unknown) => {
  input.value = input.value.trim()
  if (onBlur) onBlur(e)
}

const options = computed(() => {
  if (typeof selectOptions === 'function') {
    return selectOptions()
  }

  return selectOptions
})
</script>

<template>
  <div class="flex flex-row w-full">
    <BaseFloatLabel
      v-if="label"
      :label
      :class="labelRootClass"
      :label-class="labelClass"
    >
      <UiInput
        :id
        v-model="input"
        :placeholder
        variant="outline"
        class="rounded-r-none text-center"
        :class="[commonClass, inputClass]"
        :disabled
        @blur="onBlurCallback"
      />
    </BaseFloatLabel>
    <UiInput
      v-else
      :id
      v-model="input"
      :placeholder
      variant="outline"
      class="rounded-r-none text-center"
      :class="[commonClass, inputClass]"
      :disabled
      @blur="onBlurCallback"
    />
    <UiSelect v-model="input">
      <UiSelectTrigger
        class="shrink-0 rounded-l-none border-l-0 focus-visible:ring-0 focus-visible:border-input"
        :class="[commonClass, selectClass]"
        :aria-label="label"
        :disabled
      />
      <UiSelectContent>
        <UiSelectGroup>
          <UiSelectItem
            v-for="(option, index) in options"
            :key="index"
            :value="option"
          >
            {{ option }}
          </UiSelectItem>
        </UiSelectGroup>
      </UiSelectContent>
    </UiSelect>
  </div>
</template>
