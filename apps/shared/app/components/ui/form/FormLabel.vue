<script lang="ts" setup>
import type { LabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '#layers/shared/app/lib/utils'
import { Label } from '../label'
import { useFormField } from './useFormField'

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'], required?: boolean }>()

const { error, formItemId } = useFormField()
</script>

<template>
  <Label
    data-slot="form-label"
    :data-error="!!error"
    :class="cn(
      'data-[error=true]:text-destructive',
      'gap-0',
      props.class,
    )"
    :for="formItemId"
  >
    <slot />
    <span
      v-if="props.required"
      class="text-red-500"
    >*</span>
  </Label>
</template>
