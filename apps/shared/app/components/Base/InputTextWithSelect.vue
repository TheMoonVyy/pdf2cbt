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
} = defineProps<{
  label: string
  selectOptions: string[]
  placeholder?: string
  labelRootClass?: ClassValue
  selectClass?: string
  labelClass?: string
  inputClass?: string
  commonClass?: ClassValue
  disabled?: boolean
}>()

const input = defineModel<string>({ required: true })
</script>

<template>
  <div class="flex flex-row w-full">
    <BaseFloatLabel
      :label
      :class="labelRootClass"
      :label-class="labelClass"
    >
      <UiInput
        v-model="input"
        :placeholder
        variant="outline"
        class="rounded-r-none"
        :class="[commonClass, inputClass]"
        :disabled
        @blur="input = input.trim()"
      />
    </BaseFloatLabel>
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
            v-for="(option, index) in selectOptions"
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
