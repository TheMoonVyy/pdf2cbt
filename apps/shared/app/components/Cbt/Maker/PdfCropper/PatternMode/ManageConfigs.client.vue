<template>
  <UiDialog
    v-model:open="showDialog"
  >
    <UiDialogContent class="w-full sm:w-fit sm:max-w-full">
      <UiDialogHeader>
        <UiDialogTitle>
          Manage Pattern Configs
        </UiDialogTitle>
        <UiDialogDescription class="text-center">
          Select pattern config(s) to export/delete.
          Select only 1 to rename it.
        </UiDialogDescription>
      </UiDialogHeader>
      <div class="flex flex-col items-center justify-center gap-5">
        <div class="flex gap-5 items-center">
          <!-- Import Button -->
          <BaseSimpleFileUpload
            class="flex flex-col"
            accept="application/json,.json"
            label="Import"
            invalid-file-type-message="Please select a valid JSON file containing Configs."
            :icon-name="isLoading ? 'line-md:loading-twotone-loop' : 'prime:download'"
            @upload="importConfigs"
          />
          <!-- Export Button -->
          <BaseButton
            class="col-span-2 sm:col-span-1"
            label="Export"
            variant="help"
            icon-name="prime:upload"
            :disabled="selectedIds.size === 0"
            @click="exportConfigs"
          />
          <BaseButton
            label="Delete"
            variant="destructive"
            icon-name="material-symbols:edit-square-outline"
            :disabled="!selectedIds.size"
            @click="showDeleteConfirm = true"
          />
          <BaseButton
            label="Rename"
            variant="warn"
            icon-name="material-symbols:edit-square-outline"
            :disabled="selectedIds.size !== 1"
            @click="showRenameInput"
          />
        </div>
      </div>

      <!-- Rename Config Name -->
      <div
        v-if="renameState.showRenameInput"
        class="flex items-center gap-5 my-3"
      >
        <UiInput
          v-model="renameState.newName"
          class="grow sm:w-64 sm:grow-0"
          label="Config Name"
          placeholder="Enter new config name"
        />
        <BaseButton
          label="Rename"
          variant="success"
          :disabled="!renameState.newName.trim() || renameState.newName.trim() === renameState.oldName.trim()"
          @click="renameConfig"
        />
        <BaseButton
          label="Dismiss"
          variant="destructive"
          @click="renameState.showRenameInput = false"
        />
      </div>

      <!-- Confirm Delete -->
      <div
        v-if="showDeleteConfirm"
        class="flex flex-col gap-2 items-center my-3"
      >
        <p class="text-center">
          Are you sure you want to delete
          <strong>{{ selectedIds.size }}</strong>
          config(s)?
        </p>
        <div
          v-if="showDeleteConfirm"
          class="flex items-center gap-5 justify-center"
        >
          <BaseButton
            label="Yes, Delete"
            variant="warn"
            @click="deleteConfigs"
          />
          <BaseButton
            label="Cancel"
            variant="success"
            @click="showDeleteConfirm = false"
          />
        </div>
      </div>

      <UiScrollArea
        class="max-h-[50dvh] px-6"
        type="auto"
      >
        <div class="flex flex-col w-full my-2 gap-1.5">
          <p class="hidden last:block text-center text-lg w-full my-2">
            No pattern configs found in your database.
          </p>
          <div
            v-for="config in [...configs.values()].reverse()"
            :key="config.id"
            class="p-1.5 border border-border rounded-sm
              hover:bg-green-500/10 cursor-pointer select-none text-base text-center"
            :class="selectedIds.has(config.id)
              ? 'bg-green-500/30 hover:bg-green-500/30 shadow-lg'
              : ''"
            @click="toggleSelection(config.id)"
          >
            {{ config.name }}
          </div>
        </div>
      </UiScrollArea>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
const showDialog = defineModel<boolean>({ required: true })

const configs = defineModel<Map<number, PatternModeUserConfig>>('configs', { required: true })
const selectedIds = ref<Set<number>>(new Set())
const isLoading = shallowRef(false)
const showDeleteConfirm = shallowRef(false)

const renameState = shallowReactive({
  oldName: '',
  newName: '',
  showRenameInput: false,
  id: 0,
})

const db = useDB()

function toggleSelection(id: number) {
  if (selectedIds.value.has(id))
    selectedIds.value.delete(id)
  else
    selectedIds.value.add(id)
}

async function importConfigs(file: File) {
  isLoading.value = true

  try {
    const jsonData = await utilParseJsonFile(file)

    if (Array.isArray(jsonData)) {
      const { configNames } = await db.bulkAddPatternModeConfigs(jsonData)
      configNames.forEach(conf => configs.value.set(conf.id, conf))
    }
    else {
      const addedConfig = await db.addPatternModeConfig(jsonData)
      configs.value.set(addedConfig.id, addedConfig)
    }
  }
  catch (e) {
    console.error('Error importing configs', e)
  }
  finally {
    isLoading.value = false
  }
}

async function exportConfigs() {
  const ids = utilCloneJson(Array.from(selectedIds.value))
  const configsToExport = await db.bulkGetPatternModeConfigs(ids)

  const dataStr = JSON.stringify(configsToExport, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  utilSaveFile('pattern-cropper-configs.json', blob)
}

function renameConfig() {
  const newName = renameState.newName.trim()
  const oldName = renameState.oldName.trim()
  if (!newName || !oldName || newName === oldName)
    return

  const id = renameState.id
  db.renamePatternModeConfig(id, newName)
    .then(() => {
      const config = configs.value.get(id)
      if (config)
        config.name = newName

      renameState.showRenameInput = false
      renameState.newName = ''
      renameState.oldName = ''
    })
}

function showRenameInput() {
  const id = Array.from(selectedIds.value)[0]
  if (!id || selectedIds.value.size !== 1 || !configs.value.has(id)) {
    renameState.showRenameInput = false
    renameState.newName = ''
    renameState.oldName = ''
    return
  }
  renameState.id = id
  const selectedConfig = configs.value.get(id)!

  renameState.newName = selectedConfig.name
  renameState.oldName = selectedConfig.name
  renameState.showRenameInput = true
}

function deleteConfigs() {
  if (selectedIds.value.size === 0) {
    showDeleteConfirm.value = false
    return
  }
  const ids = [...selectedIds.value]

  db.removePatternModeConfigs(ids)
    .then(() => {
      ids.forEach(id => configs.value.delete(id))
      selectedIds.value.clear()
      showDeleteConfirm.value = false
    })
}
</script>
