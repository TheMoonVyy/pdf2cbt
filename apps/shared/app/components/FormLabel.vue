<script lang="ts" setup>
import type { LabelProps } from 'reka-ui'
import { cn } from '#layers/shared/app/lib/utils'
import type {
  FieldProp,
} from '#layers/shared/app/src/form-validation/regle.global.config'

type Props = LabelProps & {
  label: string
  labelClass?: ClassValue
  iconClass?: ClassValue
  iconName?: string
  id?: string
  field: FieldProp
  hideErrors?: boolean
}

const {
  label,
  labelClass,
  iconClass = 'text-red-400 hover:cursor-pointer',
  iconName = 'material-symbols:error-outline-rounded',
  field,
  hideErrors = false,
  id,
} = defineProps<Props>()

const fieldId = id || useId()
</script>

<template>
  <div
    class="flex flex-col items-center gap-1.5 group"
    :data-error="!!field?.$errors?.length"
  >
    <div class="flex items-center justify-center gap-1">
      <slot name="leftToLabel" />
      <UiLabel
        :class="cn(
          'group-data-[error=true]:text-destructive',
          'gap-0',
          labelClass,
        )"
        :for="fieldId"
      >
        {{ label }}
        <span
          v-if="field?.$isRequired"
          class="text-red-500"
        >*</span>
      </UiLabel>
      <IconWithTooltip
        v-if="field?.$errors?.length && !hideErrors"
        :icon-name="iconName"
        :icon-class="iconClass"
        icon-size="1rem"
      >
        <p
          class="text-destructive text-base whitespace-pre-line"
        >
          {{ field.$errors.join('\n') }}
        </p>
      </IconWithTooltip>
      <slot name="rightToLabel" />
    </div>
    <slot
      :id="fieldId"
      :handle-blur="field?.$touch"
    />
  </div>
</template>
