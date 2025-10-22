<template>
  <div class="flex flex-row justify-center flex-wrap pb-30 gap-6 py-4 px-2 sm:px-4 md:px-8">
    <div
      v-if="testResultOverviews.length === 0"
      class="text-center w-full my-10"
    >
      <span
        v-if="!isDataNotFoundInDB"
        class="text-xl sm:text-2xl"
      >
        Please wait, loading your tests from the local database...
      </span>
      <p
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
      </p>
    </div>
    <div
      v-for="testResultOverview in testResultOverviews"
      :key="testResultOverview.id"
    >
      <CbtResultsOverviewCard
        :is-current-results-id="testResultOverview.id === currentResultsID"
        :test-result-overview="testResultOverview"
        class="w-[80dvh] max-w-3xs sm:w-3xs xl:w-60"
        @menu-btn-click="(e: MouseEvent, isResultsGenerated: boolean) =>
          cardMenuBarClickHandler(testResultOverview, e, isResultsGenerated)"
        @view-results-btn-click="(bool) => viewResultsBtnHandler(bool, testResultOverview.id)"
      />
    </div>
    <UiContextMenu>
      <UiContextMenuTrigger
        class="hidden"
        @contextmenu.stop
        @click.stop
      >
        <div ref="contextMenuElem" />
      </UiContextMenuTrigger>
      <UiContextMenuContent>
        <UiContextMenuLabel
          class="text-center"
        >
          Test Actions
        </UiContextMenuLabel>
        <UiContextMenuSeparator />
        <UiContextMenuItem
          @click="renameTestDialogHandler('show')"
        >
          <Icon
            name="mdi:rename-outline"
            size="1.4rem"
            class="text-green-400"
          />
          Rename Test
        </UiContextMenuItem>
        <UiContextMenuSeparator />
        <UiContextMenuItem
          :disabled="!cardMenuState.isResultsGenerated"
          @click="showReevaluateResultsDialog = true"
        >
          <Icon
            name="mdi:file-document-refresh-outline"
            size="1.3rem"
            class="text-green-400"
          />
          Re-evaluate Results
        </UiContextMenuItem>
        <UiContextMenuSeparator />
        <UiContextMenuItem
          @click="showDeleteTestDialog = true"
        >
          <Icon
            name="material-symbols:delete"
            size="1.3rem"
            class="text-red-400"
          />
          Delete Test
        </UiContextMenuItem>
      </UiContextMenuContent>
    </UiContextMenu>
    <UiDialog
      v-model:open="showRenameTestDialogState.visibility"
    >
      <UiDialogContent class="w-fit">
        <UiDialogHeader>
          <UiDialogTitle>Rename Test</UiDialogTitle>
        </UiDialogHeader>
        <UiInput
          v-model="showRenameTestDialogState.newName"
          type="text"
          class="mx-auto text-base md:text-lg h-10 my-4"
          autocomplete="off"
        />
        <UiDialogFooter>
          <BaseButton
            label="Rename"
            icon-name="mdi:rename-outline"
            icon-size="1.5rem"
            @click="renameTestDialogHandler('rename')"
          />
          <BaseButton
            label="Cancel"
            variant="destructive"
            icon-name="mdi:clear-circle"
            icon-size="1.5rem"
            @click="showRenameTestDialogState.visibility = false"
          />
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
    <UiDialog
      v-model:open="showDeleteTestDialog"
    >
      <UiDialogContent class="w-fit">
        <UiDialogHeader>
          <UiDialogTitle>Confirm Deleting Test</UiDialogTitle>
        </UiDialogHeader>
        <span class="text-lg text-center pt-2 pb-4">
          Are you sure you want to delete this test:<br>
          {{ cardMenuState.testName }}
        </span>
        <UiDialogFooter>
          <BaseButton
            label="Delete Test"
            variant="destructive"
            icon-name="material-symbols:delete"
            icon-size="1.5rem"
            @click="deleteTestResultsDataFromDB"
          />
          <BaseButton
            label="Cancel"
            variant="warn"
            icon-name="mdi:clear-circle"
            icon-size="1.5rem"
            @click="showDeleteTestDialog = false"
          />
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
    <AnswerKeyDialog
      v-if="cardMenuState.testResultOverview"
      v-model="showReevaluateResultsDialog"
      :test-result-overview="cardMenuState.testResultOverview"
      :test-id="cardMenuState.currentID"
      is-for-reevaluation
      @upload="emit('reevaluateTestResults', cardMenuState.currentID, $event.testAnswerKey)"
    />
  </div>
</template>

<script lang="ts" setup>
import AnswerKeyDialog from './AnswerKeyDialog.vue'
import { liveQuery } from 'dexie'

const props = defineProps<{
  loadOrRefreshDataWhen: boolean
}>()

const emit = defineEmits<{
  viewOrGenerateResultsClicked: [id: number, btnType: 'generate' | 'view']
  currentTestRenamed: [newName: string]
  reevaluateTestResults: [id: number, answerKeyData: TestAnswerKeyData]
}>()

const currentResultsID = useCbtResultsCurrentID()

const contextMenuElem = useTemplateRef('contextMenuElem')

const sortBy = shallowRef<TestResultOverviewsDBSortByOption>('addedDescending')

const testResultOverviews = ref<TestResultOverviewDB[]>([])

const isDataNotFoundInDB = defineModel<boolean>('disableExportDataBtn')

const showRenameTestDialogState = shallowReactive({
  visibility: false,
  newName: '',
})

const showDeleteTestDialog = shallowRef(false)
const showReevaluateResultsDialog = shallowRef(false)

const db = useDB()

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
  })

  onCleanup(() => subscription.unsubscribe())
})

const cardMenuState = shallowReactive({
  currentID: 0,
  testName: '',
  testResultOverview: null as TestResultOverviewDB | null,
  isResultsGenerated: false,
})

const cardMenuBarClickHandler = (
  testResultOverview: TestResultOverviewDB,
  e: MouseEvent,
  isResultsGenerated: boolean,
) => {
  if (!contextMenuElem.value) return
  cardMenuState.currentID = testResultOverview.id
  cardMenuState.testName = testResultOverview.testName
  cardMenuState.testResultOverview = testResultOverview
  cardMenuState.isResultsGenerated = isResultsGenerated

  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: e.clientX,
    clientY: e.clientY,
    button: 2,
    buttons: 2,
    view: window,
  })
  contextMenuElem.value.dispatchEvent(event)
}

const deleteTestResultsDataFromDB = async () => {
  if (!showDeleteTestDialog.value) return

  showDeleteTestDialog.value = false
  const id = cardMenuState.currentID
  if (id) {
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
      useErrorToast('Error: No Test Result Overview found with id of: ' + id)
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
