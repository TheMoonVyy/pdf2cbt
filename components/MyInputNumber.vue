<script lang="ts" setup>
const model = defineModel<number>({ required: true })

const {
  pt,
  buttonLayout = 'horizontal',
} = defineProps<{
  pt?: object
  buttonLayout?: 'horizontal' | 'vertical'
}>()

const mergedPt = {
  ...(pt || {}),
  // Apply "text-center" only if buttonLayout is "horizontal"
  ...(buttonLayout === 'horizontal'
    ? {
        pcInputText: { root: 'text-center' },
        incrementButton: 'outline-hidden',
        decrementButton: 'outline-hidden',
      }
    : {}),
}

// hack to prevent vkeyboard from popping up
//  when clicked/tapped on inc/dec buttons in touch screens
const preventVKeyboard = (e: Event) => {
  const el = e.target as HTMLElement
  if (el) {
    el.blur()
    el.focus()
  }
}
</script>

<template>
  <InputNumber
    v-model="model"
    :fluid="true"
    show-buttons
    :button-layout="buttonLayout"
    :allow-empty="false"
    :pt="mergedPt"
    @input="(e) => preventVKeyboard(e.originalEvent)"
  >
    <template #incrementicon>
      <Icon
        name="prime:plus"
        size="1.4em"
        class="pointer-events-none"
      />
    </template>
    <template #decrementicon>
      <Icon
        name="prime:minus"
        size="1.4em"
        class="pointer-events-none"
      />
    </template>
  </InputNumber>
</template>
