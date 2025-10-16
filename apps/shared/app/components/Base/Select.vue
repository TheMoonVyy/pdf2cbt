<template>
  <UiSelect v-model="intervalValue">
    <UiSelectTrigger
      :id="id"
      class="w-full"
      :class="triggerClass"
      :size
    >
      <UiSelectValue class="mx-auto" />
    </UiSelectTrigger>
    <UiSelectContent>
      <UiSelectGroup>
        <template
          v-for="option in selectOptions"
          :key="typeof option === 'string' ? option : option.value"
        >
          <UiSelectItem
            v-if="typeof option === 'string'"
            :value="option"
          >
            {{ option }}
          </UiSelectItem>
          <UiSelectItem
            v-else
            :value="option.value"
          >
            {{ option.name }}
          </UiSelectItem>
        </template>
      </UiSelectGroup>
    </UiSelectContent>
  </UiSelect>
</template>

<script lang="ts" setup>
import type { AcceptableValue } from 'reka-ui'

type SelectOptionWithMaybeBoolean = { value: AcceptableValue | boolean, name: string } | string
type SelectOption = { value: AcceptableValue, name: string } | string

const props = defineProps<{
  id?: string
  options: SelectOptionWithMaybeBoolean[] | readonly SelectOptionWithMaybeBoolean[]
  triggerClass?: ClassValue
  size?: 'sm' | 'default' | 'base' | 'lg'
}>()

const model = defineModel<AcceptableValue | boolean>({ required: true })

const intervalValue = computed<AcceptableValue>({
  get: () => {
    const val = model.value
    if (typeof val === 'boolean') {
      return Number(val)
    }

    return val
  },
  set: (newVal) => {
    const oldVal = model.value
    if (typeof oldVal === 'boolean') {
      model.value = !!newVal
    }
    else {
      model.value = newVal
    }
  },
})

const selectOptions = computed(() => {
  const newOptions: SelectOption[] = []
  for (const option of props.options) {
    if (typeof option === 'object' && typeof option.value === 'boolean') {
      newOptions.push({ ...option, value: Number(option.value) })
    }
    else {
      newOptions.push(option as SelectOption)
    }
  }

  return newOptions
})
</script>
