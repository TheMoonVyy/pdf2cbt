<template>
  <Dialog
    v-model:visible="visibility"
    :header="dialogLabel"
    :modal="true"
    :closable="true"
    :draggable="false"
    maximizable
    pt:root:class="mx-auto"
    pt:title:class="p-0 mx-auto"
    pt:content:class="p-0"
    pt:header:class="gap-4"
  >
    <div class="flex mb-3">
      <BaseButton
        :label="dialogLabel"
        class="ml-5"
        variant="warn"
        :disabled="!Object.keys(selectionKeys).length"
        @click="processData()"
      />
    </div>
    <div class="mb-2 flex gap-2">
      <Tree
        v-model:selection-keys="selectionKeys"
        :value="treeData"
        selection-mode="checkbox"
      />
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import Dialog from '@/src/volt/Dialog.vue'
import Tree from '@/src/volt/Tree.vue'

type TreeNode = {
  key: string
  label: string
  children?: TreeNode[]
}
type SelectionKeys = Record<string, { checked?: boolean, partialChecked?: boolean }>

const selectionKeys = shallowRef<SelectionKeys>({})

const visibility = defineModel<boolean>('visibility', {
  default: true,
})

const emit = defineEmits<{
  processed: [type: string, data: Record<string, unknown>]
}>()

const props = defineProps<{
  type: string
  data: Record<string, unknown>
}>()

const mainData = props.data

const convertObjToTree = <T extends Record<string, unknown>>(obj: T, parentKey = ''): TreeNode[] => {
  return Object.entries(obj).map(([key, value]) => {
    const nodeKey = parentKey ? `${parentKey}.${key}` : key
    const label = utilKeyToLabel(key)

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return {
        key: nodeKey,
        label,
        children: convertObjToTree(value as Record<string, unknown>, nodeKey),
      }
    }
    else {
      return {
        key: nodeKey,
        label: `${label}: ${
          typeof value === 'string' && value.length > 20
            ? JSON.stringify(value.slice(0, 20) + '...')
            : JSON.stringify(value)}`,
      }
    }
  })
}

function getSelectedData() {
  const selectedKeys = Object.keys(selectionKeys.value).filter(
    key => selectionKeys.value[key]?.checked,
  )

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
  selectedKeys.forEach((key) => {
    const value = extractData(mainData, key)
    if (value !== undefined) {
      setNestedValue(selectedData, key, value)
    }
  })

  return selectedData
}

const processData = () => {
  const data = getSelectedData()
  emit('processed', props.type, data)
}

const dialogLabel = utilKeyToLabel(props.type) + ' Settings'

const treeData = convertObjToTree(mainData)
</script>
