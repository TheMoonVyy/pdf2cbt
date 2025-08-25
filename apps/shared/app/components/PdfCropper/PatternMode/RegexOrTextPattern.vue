<script setup lang="ts">
import type { RegexOrTextPattern } from '#layers/shared/app/composables/usePatternSchema'

const props = defineProps<{
  modelValue: RegexOrTextPattern
  name: string
  errors?: Record<string, string | undefined>
}>()

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})
</script>

<template>
  <div class="p-4 border rounded-md">
    <h3 class="text-lg font-semibold mb-2">
      {{ name }}
    </h3>
    <div class="space-y-2">
      <div>
        <UiLabel
          for="pattern"
        >
          Pattern
        </UiLabel>
        <UiInput
          id="pattern"
          v-model="model.pattern"
        />
        <span
          v-if="errors?.pattern"
          class="text-red-500 text-sm"
        >{{ errors.pattern }}</span>
      </div>
      <div class="flex items-center space-x-2">
        <UiCheckbox
          id="is_regex"
          v-model="model.is_regex"
        />
        <UiLabel for="is_regex">
          Is Regex
        </UiLabel>
      </div>
      <div class="flex items-center space-x-2">
        <UiCheckbox
          id="is_case_sensitive"
          v-model="model.is_case_sensitive"
        />
        <UiLabel for="is_case_sensitive">
          Is Case Sensitive
        </UiLabel>
      </div>
    </div>
  </div>
</template>
