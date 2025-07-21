<script setup lang="ts">
import { ListboxContent, ListboxItem, ListboxRoot } from 'reka-ui'

const items = defineModel<TestSectionListItem[]>({ required: true })

const containerElem = useTemplateRef('container')

const selectedItemsIds = ref<number[]>([])

onClickOutside(containerElem, () => {
  if (selectedItemsIds.value.length)
    selectedItemsIds.value.length = 0
})

const disableButtons = computed(() => {
  return items.value.length <= 1
    || selectedItemsIds.value.length === 0
    || items.value.length === selectedItemsIds.value.length
})

function moveTop() {
  const allItems = items.value
  const selectedIndexes = getSelectedItemsIdsWithIndices()

  let start = 0
  const itemsToInsert: TestSectionListItem[] = []
  const indicesToRemove: number[] = []

  for (const idx of selectedIndexes) {
    if (idx === start)
      start++
    else {
      itemsToInsert.push(allItems[idx]!)
      indicesToRemove.push(idx)
    }
  }

  // Remove from end to avoid index shifting
  for (const idx of indicesToRemove.reverse()) {
    allItems.splice(idx, 1)
  }

  if (itemsToInsert.length > 0) {
    allItems.splice(start, 0, ...itemsToInsert)
  }
}

function moveBottom() {
  const allItems = items.value
  const reversedSelectedIndexes = getSelectedItemsIdsWithIndices().reverse()

  const itemsToInsert: TestSectionListItem[] = []

  for (const idx of reversedSelectedIndexes) {
    itemsToInsert.push(...allItems.splice(idx, 1))
  }

  allItems.splice(allItems.length, 0, ...itemsToInsert.reverse())
}

function moveUp() {
  const allItems = items.value

  if (selectedItemsIds.value.length === 1) {
    const id = selectedItemsIds.value[0]
    if (typeof id !== 'undefined') {
      const idx = allItems.findIndex(item => item.id === id)
      if (idx > 0) {
        const tmp = allItems[idx]
        allItems[idx] = allItems[idx - 1]!
        allItems[idx - 1] = tmp!
      }
    }
  }
  else {
    const selectedIndexes = getSelectedItemsIdsWithIndices()
    const selectedIndexesSet = new Set(selectedIndexes)

    for (const idx of selectedIndexes) {
      const prevIdx = idx - 1

      if (idx <= 0 || selectedIndexesSet.has(prevIdx))
        continue

      const temp = allItems[idx]!
      allItems[idx] = allItems[prevIdx]!
      allItems[prevIdx] = temp

      selectedIndexesSet.delete(idx)
      selectedIndexesSet.add(prevIdx)
    }
  }
}

function moveDown() {
  const allItems = items.value
  const selectedIds = selectedItemsIds.value

  if (selectedIds.length === 1) {
    const id = selectedIds[0]
    if (typeof id !== 'undefined') {
      const idx = allItems.findIndex(item => item.id === id)
      if (idx < allItems.length - 1) {
        const tmp = allItems[idx]
        allItems[idx] = allItems[idx + 1]!
        allItems[idx + 1] = tmp!
      }
    }
  }
  else {
    const selectedIndexes = getSelectedItemsIdsWithIndices().reverse()
    const maxIndex = allItems.length - 1

    const selectedIndexesSet = new Set(selectedIndexes)
    for (const idx of selectedIndexes) {
      const nextIdx = idx + 1
      if (idx >= maxIndex || selectedIndexesSet.has(nextIdx))
        continue

      const temp = allItems[idx]!
      allItems[idx] = allItems[nextIdx]!
      allItems[nextIdx] = temp

      selectedIndexesSet.delete(idx)
      selectedIndexesSet.add(nextIdx)
    }
  }
}

function getSelectedItemsIdsWithIndices() {
  const selectedIds = new Set(selectedItemsIds.value)
  const allItems = items.value

  const selectedIndexes: number[] = []
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i]
    if (item && selectedIds.has(item.id))
      selectedIndexes.push(i)
  }

  return selectedIndexes
}
</script>

<template>
  <div
    ref="container"
    class="flex gap-3.5 justify-center w-fit mx-auto"
  >
    <div class="flex flex-col gap-2.5 items-center mt-2">
      <BaseButton
        variant="outline"
        size="icon"
        icon-name="line-md:arrow-close-up"
        icon-size="1.3rem"
        :disabled="disableButtons"
        @click="moveTop"
      />
      <BaseButton
        variant="outline"
        size="icon"
        icon-name="line-md:arrow-up"
        icon-size="1.3rem"
        :disabled="disableButtons"
        @click="moveUp"
      />
      <BaseButton
        variant="outline"
        size="icon"
        icon-name="line-md:arrow-down"
        icon-size="1.3rem"
        :disabled="disableButtons"
        @click="moveDown"
      />
      <BaseButton
        variant="outline"
        size="icon"
        icon-name="line-md:arrow-close-down"
        icon-size="1.3rem"
        :disabled="disableButtons"
        @click="moveBottom"
      />
    </div>
    <div class="rounded-sm bg-neutral-950/30 border-input border max-w-56">
      <UiScrollArea class="[&>div]:max-h-80">
        <ListboxRoot
          v-model="selectedItemsIds"
          multiple
        >
          <ListboxContent
            class="list-none m-0 p-1 outline-none flex flex-col gap-[2px] text-white select-none"
            data-slot="order-list"
          >
            <ListboxItem
              v-for="item in items"
              :key="item.id"
              class="flex items-center cursor-pointer relative overflow-hidden px-3 py-2 border-none rounded-sm
            hover:bg-accent/50 focus:bg-accent/50 data-[state=checked]:bg-emerald-400/25
            data-[state=checked]:hover:bg-emerald-400/35
            transition-colors duration-200 outline-hidden focus-within:border border-input"
              :value="item.id"
            >
              {{ item.name }}
            </ListboxItem>
          </ListboxContent>
        </ListboxRoot>
      </UiScrollArea>
    </div>
  </div>
</template>
