<script setup lang="ts">
import type {
  FieldProp,
} from '#layers/shared/app/src/form-validation/regle.global.config'
import { AREA_BOUNDARY_NAMES } from '#layers/shared/shared/constants'

type TSearchArea<T> = Record<keyof typeof AREA_BOUNDARY_NAMES, T>

const { fields, disabled } = defineProps<{
  fields: TSearchArea<FieldProp>
  disabled?: boolean
}>()
const searchArea = defineModel<TSearchArea<string>>({ required: true })
</script>

<template>
  <div
    class="grid grid-cols-2 gap-3 space-y-2"
  >
    <FormLabel
      v-for="(label, key) in AREA_BOUNDARY_NAMES"
      :key="key"
      v-slot="{ id }"
      :label="label"
      :field="fields?.[key]"
    >
      <UiInput
        :id="id"
        v-model="searchArea[key]"
        class="text-center max-w-32"
        :disabled="disabled"
      />
    </FormLabel>
  </div>
</template>
