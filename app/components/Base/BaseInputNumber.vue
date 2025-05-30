<script lang="ts" setup>
const model = defineModel<number>({ required: true })

const {
  incrementIcon = 'prime:plus',
  decrementIcon = 'prime:minus',
} = defineProps<{
  incrementIcon?: string
  decrementIcon?: string
}>()

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
    button-layout="horizontal"
    :use-grouping="false"
    :allow-empty="false"
    pt:incrementButton:class="outline-hidden"
    pt:decrementButton:class="outline-hidden"
    @input="(e) => preventVKeyboard(e.originalEvent)"
  >
    <template #incrementicon>
      <Icon
        :name="incrementIcon"
        size="1.4em"
        class="pointer-events-none"
      />
    </template>
    <template #decrementicon>
      <Icon
        :name="decrementIcon"
        size="1.4em"
        class="pointer-events-none"
      />
    </template>
  </InputNumber>
</template>
