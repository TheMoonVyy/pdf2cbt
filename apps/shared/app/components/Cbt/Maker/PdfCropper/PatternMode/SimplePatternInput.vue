<template>
  <div class="flex items-end justify-center w-full">
    <BaseButton
      class="rounded-r-none shrink-0"
      variant="outline"
      size="icon"
      :icon-name="pattern.type === 'regex'
        ? 'material-symbols:regular-expression'
        : 'my-icon:txt'"
      title="Toggle pattern type"
      icon-size="1.6rem"
      icon-class="text-green-400"
      :disabled="disabled"
      @click="togglePatternType"
    />
    <FormLabel
      v-if="patternValueField"
      v-slot="{ id, handleBlur }"
      :label="`${labelPrefix} ${utilKeyToLabel(pattern.type)} Pattern`"
      :field="patternValueField"
      class="grow shrink-0"
    >
      <UiInput
        :id="id"
        v-model="pattern.value"
        class="rounded-l-none rounded-r-none"
        :disabled="disabled"
        @blur="handleBlur"
      />
    </FormLabel>
    <UiInput
      v-else
      v-model="pattern.value"
      :disabled="disabled"
      class="rounded-l-none rounded-r-none"
    />
    <BaseButton
      class="rounded-l-none shrink-0"
      variant="outline"
      size="icon"
      icon-name="material-symbols:match-case-rounded"
      title="Toggle case sensitivity"
      :icon-class="pattern.isCaseSensitive
        ? 'text-green-400'
        : ''"
      icon-size="1.7rem"
      :disabled="disabled"
      @click="pattern.isCaseSensitive = !pattern.isCaseSensitive"
    />
  </div>
</template>

<script lang="ts" setup>
import type {
  PatternModeFormSectionData,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/json-config-to-form-data'
import type {
  FieldProp,
} from '#layers/shared/app/src/form-validation/regle.global.config'

const pattern = defineModel<PatternModeFormSectionData['pattern']>({ required: true })
const {
  patternValueField,
  disabled = false,
  labelPrefix = '',
} = defineProps<{
  patternValueField?: FieldProp
  disabled?: boolean
  labelPrefix?: string
}>()

const togglePatternType = () => {
  if (pattern.value.type === 'text')
    pattern.value.type = 'regex'
  else
    pattern.value.type = 'text'
}
</script>
