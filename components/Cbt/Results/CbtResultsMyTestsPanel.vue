<template>
  <div class="flex flex-row justify-center flex-wrap pb-30 gap-6 py-4 px-2 sm:px-4 md:px-8">
    <div
      v-if="testResultOverviews.length === 0"
      class="text-center w-full my-10"
    >
      <h2
        v-if="!isDataNotFoundInDB"
        class="text-xl sm:text-2xl"
      >
        Please wait, loading your tests from the local database...
      </h2>
      <h2
        v-else
        class="text-xl sm:text-2xl"
      >
        No test was found in your local database.<br><br>
        If you have a test data file (.json) from the
        <span class="text-green-500 font-bold underline">
          <NuxtLink to="/cbt/interface">CBT Interface</NuxtLink>
        </span>,<br>
        <span class="hidden sm:inline">
          or from "Export Test Data" button above then,
        </span>
        <span class="sm:hidden">
          or from "Export Data" button above then,
        </span>
        <br>you can import it here.<br><br>
        Otherwise, take a test first!
      </h2>
    </div>
    <div
      v-for="testResultOverview in testResultOverviews"
      :key="testResultOverview.id"
    >
      <CbtResultsOverviewCard
        :is-current-results-id="testResultOverview.id === currentResultsID"
        :test-result-overview="testResultOverview"
        class="w-[80dvh] max-w-3xs sm:w-3xs xl:w-[15rem]"
        @menu-btn-click="(e: Event) => cardMenuToggleHandler(testResultOverview.id, e)"
        @view-results-btn-click="(bool) => viewResultsBtnHandler(bool, testResultOverview.id)"
      />
    </div>
    <Popover
      ref="menuPopOverElem"
      pt:root:class="dark:[background:color-mix(in_srgb,_theme(colors.neutral.900),_white_2%)]"
      @show="cardMenuState.isPopOverShown = true"
      @hide="cardMenuState.isPopOverShown = false"
    >
      <div class="flex flex-col gap-3 text-nowrap">
        <BaseButton
          label="Rename"
          size="small"
          @click="renameTestDialogHandler('show')"
        >
          <template #icon>
            <Icon
              name="mdi:rename-outline"
              size="1.5rem"
            />
          </template>
        </BaseButton>
        <BaseButton
          label="Delete"
          severity="danger"
          size="small"
          @click="deleteTestResultsDataFromDB()"
        >
          <template #icon>
            <Icon
              name="material-symbols:delete"
              size="1.4rem"
            />
          </template>
        </BaseButton>
      </div>
    </Popover>
    <Dialog
      v-model:visible="showRenameTestDialogState.visibility"
      modal
      header="Rename Test"
    >
      <InputText
        v-model="showRenameTestDialogState.newName"
        autocomplete="off"
      />
      <div class="flex gap-5 mt-5">
        <BaseButton
          label="Rename"
          @click="renameTestDialogHandler('rename')"
        >
          <template #icon>
            <Icon
              name="mdi:rename-outline"
              size="1.5rem"
            />
          </template>
        </BaseButton>
        <BaseButton
          label="Cancel"
          severity="danger"
          @click="showRenameTestDialogState.visibility = false"
        >
          <template #icon>
            <Icon
              name="mdi:clear-circle"
              size="1.5rem"
            />
          </template>
        </BaseButton>
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { liveQuery } from 'dexie'
import Popover from '~/src/volt/Popover.vue'
import type { TestResultOverviewDB, TestResultOverviewsDBSortByOption } from '~/src/types'
import { db } from '~/src/db/cbt-db'

const props = defineProps<{
  loadOrRefreshDataWhen: boolean
}>()

const emit = defineEmits<{
  viewOrGenerateResultsClicked: [id: number, btnType: 'generate' | 'view']
  currentTestRenamed: [newName: string]
}>()

const currentResultsID = useCbtResultsCurrentID()

const menuPopOverElem = ref()

const sortBy = shallowRef<TestResultOverviewsDBSortByOption>('addedDescending')

const testResultOverviews = ref<TestResultOverviewDB[]>([])

const isDataNotFoundInDB = defineModel<boolean>('disableExportDataBtn')

const showRenameTestDialogState = shallowReactive({
  visibility: false,
  newName: '',
})

// reactively update testResultOverviews from db if either of these changes:
// testResultOverviews store in db (when something is added/removed/updated etc)
// sortBy value
// loadOrRefreshDataWhen is changed to true
watchEffect((onCleanup) => {
  if (!props.loadOrRefreshDataWhen) return

  const observable = liveQuery(() => db.getTestResultOverviews(sortBy.value))

  const subscription = observable.subscribe({
    next: (val) => {
      testResultOverviews.value = val
      isDataNotFoundInDB.value = val.length === 0
    },
    error: undefined,
  })

  onCleanup(() => subscription.unsubscribe())
})

const cardMenuState = shallowReactive({
  currentID: 0,
  isPopOverShown: false,
})

const cardMenuToggleHandler = async (id: number, e: Event) => {
  if (cardMenuState.isPopOverShown) {
    if (cardMenuState.currentID !== id) { // when popover is shown, but user clicks on other overview's menu
      menuPopOverElem.value.hide()
      await nextTick()
      menuPopOverElem.value.show(e)
      cardMenuState.currentID = id
    }
    else {
      menuPopOverElem.value.hide()
    }
  }
  else {
    menuPopOverElem.value.show(e)
    cardMenuState.currentID = id
  }
}

const deleteTestResultsDataFromDB = async () => {
  const id = cardMenuState.currentID
  if (id) {
    menuPopOverElem.value.hide()
    await db.removeTestOutputDataAndResultOverview(id)
    cardMenuState.currentID = 0
  }
}

const renameTestDialogHandler = async (type: 'show' | 'rename') => {
  const id = cardMenuState.currentID
  if (!id) return

  if (type === 'show') {
    const result = testResultOverviews.value.find(item => item.id === id)
    if (result) {
      showRenameTestDialogState.newName = result.testName
      showRenameTestDialogState.visibility = true
    }
    else {
      console.error('No Test Result Overview found with id of: ' + id)
    }
  }
  else if (type === 'rename') {
    showRenameTestDialogState.visibility = false
    const newName = showRenameTestDialogState.newName.trim()
    if (newName) {
      const renameStatus = await db.renameTestNameOfTestOutputData(id, newName)
      if (renameStatus && currentResultsID.value === id) {
        emit('currentTestRenamed', newName) // emit to results page that currently loaded results name has changed
      }
    }
  }
}

const viewResultsBtnHandler = (isResultsGenerated: boolean, id: number) => {
  const btnType = isResultsGenerated ? 'view' : 'generate'
  emit('viewOrGenerateResultsClicked', id, btnType)
}
</script>

<style>

</style>
