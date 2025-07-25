<template>
  <UiDialog
    v-model:open="showDialog"
  >
    <UiDialogContent class="sm:min-w-fit px-3">
      <UiDialogHeader>
        <UiDialogTitle>
          {{ dialogLabel }}
        </UiDialogTitle>
      </UiDialogHeader>
      <UiScrollArea
        class="max-h-[80dvh] px-6"
        type="auto"
      >
        <div class="flex w-full my-3">
          <BaseButton
            :label="dialogLabel"
            class="ml-5 mx-auto"
            variant="warn"
            :disabled="!selectedNodes || selectedNodes.length === 0"
            @click="processData()"
          />
        </div>
        <BaseTreeCheckbox
          v-model="selectedNodes"
          :items="treeData"
        />
      </UiScrollArea>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import type { TreeNodeData } from '#layers/shared/app/components/Base/Tree'

const selectedNodes = ref<TreeNodeData[] | undefined>(undefined)

const showDialog = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  processed: [type: string, data: Record<string, unknown>]
}>()

const props = defineProps<{
  type: string
  data: Record<string, unknown>
}>()

const mainData = props.data

const convertObjToTree = <T extends Record<string, unknown>>(obj: T, parentId = ''): TreeNodeData[] => {
  return Object.entries(obj).map(([key, value]) => {
    const id = parentId ? `${parentId}.${key}` : key
    const label = utilKeyToLabel(key)

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return {
        id,
        label,
        children: convertObjToTree(value as Record<string, unknown>, id),
      }
    }
    else {
      return {
        id,
        label: `${label}: ${
          typeof value === 'string' && value.length > 20
            ? JSON.stringify(value.slice(0, 20) + '...')
            : JSON.stringify(value)}`,
      }
    }
  })
}

function getSelectedTreeNodesIds(treeNodes: TreeNodeData[], selectedIds = new Map<string, string>()) {
  for (const node of treeNodes) {
    const { id, children } = node

    if (!selectedIds.has(id))
      selectedIds.set(id, id)

    if (children && children.length > 0) {
      getSelectedTreeNodesIds(children, selectedIds)
    }
  }

  return selectedIds
}

function getSelectedData() {
  const selectedIds = getSelectedTreeNodesIds(selectedNodes.value!)

  function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown) {
    const keys = path.split('.')
    let current = obj

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value
      }
      else {
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {}
        }
        current = current[key] as Record<string, unknown>
      }
    })
  }

  function extractData(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.')
    let current: unknown = obj

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key]
      }
      else {
        return undefined // structure is not valid
      }
    }

    return current
  }

  const selectedData: Record<string, unknown> = {}
  for (const id of selectedIds.values()) {
    const value = extractData(mainData, id)
    if (value)
      setNestedValue(selectedData, id, value)
  }

  return selectedData
}

const processData = () => {
  const data = getSelectedData()
  emit('processed', props.type, data)
}

const dialogLabel = utilKeyToLabel(props.type) + ' Settings'

const treeData = convertObjToTree(mainData)
</script>
