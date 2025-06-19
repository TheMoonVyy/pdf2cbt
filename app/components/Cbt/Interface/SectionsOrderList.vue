<template>
  <div
    ref="orderListElem"
    class="contents"
  >
    <OrderList
      v-model="value"
      v-model:selection="selectedItems"
      data-key="name"
      scroll-height="20rem"
      breakpoint="575px"
    >
      <template #option="{ option }">
        {{ option.name }}
      </template>
    </OrderList>
  </div>
</template>

<script lang="ts" setup>
import OrderList from 'primevue/orderlist'

const value = defineModel<TestSectionListItem[]>({
  type: Array,
  required: true,
})

const orderListELem = useTemplateRef('orderListElem')
const selectedItems = ref<TestSectionListItem[]>([])

onClickOutside(orderListELem, () => {
  if (selectedItems.value.length) selectedItems.value.length = 0
})
</script>
