<script setup lang="ts"> // eslint-disable-line
import PrimeButton from 'primevue/button'
import DefaultButton from '~/src/volt/Button.vue'
import DangerButton from '~/src/volt/DangerButton.vue'
import WarnButton from '~/src/custom-volt/WarnButton.vue'
import HelpButton from '~/src/custom-volt/HelpButton.vue'

type SeverityType = 'warn' | 'danger' | 'help'

const props = defineProps<{
  severity?: SeverityType
  unstyled?: boolean
}>()

const slots = useSlots()

const severityMap: Record<SeverityType, unknown> = {
  warn: WarnButton,
  danger: DangerButton,
  help: HelpButton,
}

const buttonComponent = computed(() => {
  if (props.unstyled) return PrimeButton
  if (props.severity && severityMap[props.severity]) {
    return severityMap[props.severity]
  }
  return DefaultButton
})
</script>

<template>
  <component
    :is="buttonComponent"
    v-bind="$attrs"
  >
    <template
      v-for="(_, name) in slots"
      #[name]="slotProps"
    >
      <slot
        :name="name"
        v-bind="slotProps"
      />
    </template>
  </component>
</template>
