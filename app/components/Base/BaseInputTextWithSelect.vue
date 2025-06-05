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
} = defineProps<{
  label: string
  selectOptions: string[]
  placeholder?: string
  labelRootClass?: string
  selectClass?: string
  labelClass?: string
  inputClass?: string
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
        :class="inputClass"
        :disabled
        @blur="input = input.trim()"
      />
    </BaseFloatLabel>
    <UiSelect v-model="input">
      <UiSelectTrigger
        class="shrink-0 rounded-l-none border-l-0 focus-visible:ring-0 focus-visible:border-input"
        :class="selectClass"
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
