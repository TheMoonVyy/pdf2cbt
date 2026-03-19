<template>
  <div class="flex flex-col w-full overflow-hidden">
    <div class="flex flex-col w-full gap-3 sticky top-0 bg-background py-3 px-4 z-10">
      <div class="grid grid-cols-[1fr_auto_1fr] text-nowrap">
        <div class="flex items-center justify-center gap-4">
          <BaseButton
            :size="screenWidth.isSmOrAbove ? 'icon' : 'iconMd'"
            variant="outline"
            :icon-class="cbtResultsSettings.myTests.showDetailedOverviewOnCard
              ? 'text-green-400'
              : ''"
            title="Show/Hide More Metrics on Cards"
            icon-name="mdi:scroll-text-outline"
            @click="toggleDetailedOverviewOnCard"
          />
          <UiDropdownMenu>
            <UiDropdownMenuTrigger as-child>
              <BaseButton
                variant="outline"
                :label="screenWidth.isSmOrAbove ? 'Sort By': undefined"
                :size="screenWidth.isSmOrAbove ? undefined : 'iconMd'"
                icon-class="text-green-400"
                class="px-1 gap-1 text-green-400 hover:text-green-400"
                title="Sort By"
                icon-name="mdi:sort"
              />
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent class="w-48">
              <template
                v-for="(sortByRootItem, sortByType) in SORT_BY_DD_MENU_MAP"
                :key="sortByType"
              >
                <UiDropdownMenuSub v-if="'groupItems' in sortByRootItem">
                  <UiDropdownMenuSubTrigger
                    class="cursor-pointer"
                    :class="cbtResultsSettings.myTests.sortBy.type === sortByType
                      ? 'text-green-400 data-state:text-green-400!'
                      : ''"
                  >
                    {{ sortByRootItem.name }}
                  </UiDropdownMenuSubTrigger>
                  <UiDropdownMenuPortal>
                    <UiDropdownMenuSubContent>
                      <UiDropdownMenuItem
                        v-for="groupItem in sortByRootItem.groupItems"
                        :key="groupItem.value"
                        :class="(
                          cbtResultsSettings.myTests.sortBy.type === sortByType
                          && cbtResultsSettings.myTests.sortBy.qType === groupItem.value
                        ) ? 'text-green-400 data-highlighted:text-green-400'
                          : ''"
                        @select="changeSortBy(sortByType, groupItem.value)"
                      >
                        {{ groupItem.name }}
                      </UiDropdownMenuItem>
                    </UiDropdownMenuSubContent>
                  </UiDropdownMenuPortal>
                </UiDropdownMenuSub>
                <UiDropdownMenuItem
                  v-else
                  :class="cbtResultsSettings.myTests.sortBy.type === sortByRootItem.value
                    ? 'text-green-400 data-highlighted:text-green-400'
                    : ''"
                  @select="changeSortBy(sortByRootItem.value)"
                >
                  {{ sortByRootItem.name }}
                </UiDropdownMenuItem>
              </template>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
          <BaseButton
            :size="screenWidth.isSmOrAbove ? 'icon' : 'iconMd'"
            variant="outline"
            icon-class="text-green-400"
            title="Toggle Sort Order"
            :icon-name="cbtResultsSettings.myTests.sortBy.order === 'ascending'
              ? 'mdi:sort-ascending'
              : 'mdi:sort-descending'"
            @click="toggleSortOrder"
          />
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-center">
          My Tests
        </h2>
        <div class="flex items-center justify-center gap-4">
          <BaseSimpleFileUpload
            class="flex flex-col"
            accept="application/json,.json"
            :label="screenWidth.isLgOrAbove
              ? 'Import Test(s)'
              : (screenWidth.isSmOrAbove ? 'Import' : '')"
            :size="screenWidth.isSmOrAbove ? undefined : 'iconMd'"
            button-class="px-1 gap-2"
            invalid-file-type-message="Please select a valid JSON file containing Test Data."
            :icon-name="isLoadingImportedFile ? 'line-md:loading-twotone-loop' : 'prime:download'"
            @upload="(file) => showImportExportDialog('Import', file)"
          />
          <BaseButton
            :label="screenWidth.isLgOrAbove
              ? 'Export Test(s)'
              : (screenWidth.isSmOrAbove ? 'Export' : undefined)"
            :size="screenWidth.isSmOrAbove ? undefined : 'iconMd'"
            variant="help"
            class="px-1 gap-1"
            icon-name="prime:upload"
            :disabled="!testResultOverviewsTotalCount"
            @click="() => showImportExportDialog('Export')"
          />
        </div>
      </div>
      <UiPagination
        v-if="testResultOverviewsTotalCount"
        v-model:page="currentPageNum"
        :items-per-page="NUM_OF_OVERVIEWS_PER_PAGE"
        :total="testResultOverviewsTotalCount"
        show-edges
        :sibling-count="paginationSiblingCount"
      >
        <UiPaginationContent v-slot="{ items }">
          <UiPaginationPrevious class="cursor-pointer text-base" />
          <template
            v-for="(item, index) in items"
            :key="index"
          >
            <UiPaginationItem
              v-if="item.type === 'page'"
              :value="item.value"
              :is-active="item.value === currentPageNum"
              class="cursor-pointer font-bold text-base data-selected:text-green-400"
              variant=""
            >
              {{ item.value }}
            </UiPaginationItem>
            <UiPaginationEllipsis
              v-else
              class="cursor-pointer text-base"
              :index="index"
            />
          </template>
          <UiPaginationNext class="cursor-pointer text-base" />
        </UiPaginationContent>
      </UiPagination>
    </div>
    <UiScrollArea
      ref="scrollAreaElem"
      type="auto"
      viewport-class="min-h-0 [&>div]:pb-20"
    >
      <div class="flex flex-row justify-center flex-wrap gap-6 pb-4 px-2 sm:px-4 md:px-8">
        <div
          v-if="!testResultOverviewsTotalCount"
          class="text-center w-full my-10"
        >
          <span
            v-if="checkingDataInDB"
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
            <span>
              or from "Export Test(s)" button above then,
            </span>
            <br>you can import it here.<br><br>
            Otherwise, take a test first!
          </p>
        </div>
        <div
          v-for="testResultOverview in currentPageOverviews"
          :key="testResultOverview.id"
        >
          <CbtResultsOverviewCard
            :is-current-results-id="testResultOverview.id === currentResultsID"
            :test-result-overview="testResultOverview"
            :show-detailed-overview="cbtResultsSettings.myTests.showDetailedOverviewOnCard"
            @menu-btn-click="(e: MouseEvent, isResultsGenerated: boolean) =>
              cardMenuBarClickHandler(testResultOverview, e, isResultsGenerated)"
            @view-results-btn-click="(bool) => viewResultsBtnHandler(bool, testResultOverview.id)"
          />
        </div>
      </div>
    </UiScrollArea>
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
    <UiDialog v-model:open="showRenameTestDialogState.visibility">
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
    <UiDialog v-model:open="showDeleteTestDialog">
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
    <CbtResultsImportExportDialog
      v-if="importExportDialogState.isVisible && importExportDialogState.data"
      v-model="importExportDialogState.isVisible"
      :type="importExportDialogState.type"
      :data="importExportDialogState.data"
      @processed="processImportExport"
    />
  </div>
</template>

<script lang="ts" setup>
import AnswerKeyDialog from './AnswerKeyDialog.vue'
import { liveQuery } from 'dexie'
import { MIME_TYPE } from '#layers/shared/shared/constants'

type SortByDDMenuMapLeafItem = {
  name: string
  value: TestResultOverviewsDBSortByWithoutQType['type']
}

type SortByDDMenuMapGroup = {
  name: string
  groupItems: {
    name: string
    value: TestResultOverviewsDBSortByWithQType['qType']
  }[]
}

type SortByDDMenuMap = Record<
  TestResultOverviewsDBSortBy['type'],
SortByDDMenuMapLeafItem | SortByDDMenuMapGroup
>

const SortByDDMenuMapQTypeData: SortByDDMenuMapGroup['groupItems'] = [
  { name: 'All', value: 'all' },
  { name: 'MCQ', value: 'mcq' },
  { name: 'MSQ', value: 'msq' },
  { name: 'Nat', value: 'nat' },
  { name: 'MSM', value: 'msm' },
] as const

const SORT_BY_DD_MENU_MAP: SortByDDMenuMap = {
  added: {
    name: 'Test Added',
    value: 'added',
  },
  startTime: {
    name: 'Test Start Date & Time',
    value: 'startTime',
  },
  endTime: {
    name: 'Test End Date & Time',
    value: 'endTime',
  },
  testName: {
    name: 'Test Name',
    value: 'testName',
  },
  accuracy: {
    name: 'Accuracy',
    groupItems: SortByDDMenuMapQTypeData,
  },
  correctQ: {
    name: 'Num of Correct Qs',
    groupItems: SortByDDMenuMapQTypeData,
  },
  incorrectQ: {
    name: 'Num of Incorrect Qs',
    groupItems: SortByDDMenuMapQTypeData,
  },
  avgTimeSpent: {
    name: 'Avg Time Spent per Q',
    groupItems: SortByDDMenuMapQTypeData,
  },
  totalTimeSpent: {
    name: 'Total Time Spent',
    groupItems: SortByDDMenuMapQTypeData,
  },
  marksPercent: {
    name: 'Marks Percent',
    groupItems: SortByDDMenuMapQTypeData,
  },
  marksObtained: {
    name: 'Marks Obtained',
    groupItems: SortByDDMenuMapQTypeData,
  },
  maxMarks: {
    name: 'Max Marks',
    groupItems: SortByDDMenuMapQTypeData,
  },
  qAttemptedPercent: {
    name: 'Qs Attempted Percent',
    groupItems: SortByDDMenuMapQTypeData,
  },
  qAttempted: {
    name: 'Qs Attempted',
    groupItems: SortByDDMenuMapQTypeData,
  },
  totalQuestions: {
    name: 'Total Num of Qs',
    groupItems: SortByDDMenuMapQTypeData,
  },
}

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

const importExportDialogState = shallowReactive({
  isVisible: false,
  type: 'Import' as 'Import' | 'Export',
  data: null as TestInterfaceOrResultJsonOutput[] | null,
  isLoadingImportedFile: false,
})

const migrateJsonData = useMigrateJsonData()

const isLoadingImportedFile = shallowRef(false)

const screenBreakpoints = useBreakpoints(
  { sm: 640, lg: 1024 },
  { ssrWidth: 1024 },
)

const screenWidth = reactive({
  isSmOrAbove: screenBreakpoints.greaterOrEqual('sm'),
  isLgOrAbove: screenBreakpoints.greaterOrEqual('lg'),
})

const paginationSiblingCount = computed(() => {
  if (screenWidth.isLgOrAbove)
    return 5
  else if (screenWidth.isSmOrAbove)
    return 3
  else
    return 2
})

const cbtResultsSettings = useCbtResultsLocalStorageSettings()

const NUM_OF_OVERVIEWS_PER_PAGE = 20

const currentPageNum = shallowRef(1)

const testResultOverviews = reactive({
  sorted: [] as TestResultOverviewDB[],
  unsorted: [] as TestResultOverviewDB[],
})

const testResultOverviewsTotalCount = computed(
  () => testResultOverviews.sorted.length + testResultOverviews.unsorted.length,
)

const combinedTestResultOverviews = computed(() => {
  if (!testResultOverviewsTotalCount.value) return []

  const sorted = testResultOverviews.sorted
  const unsorted = testResultOverviews.unsorted

  const combined = [...sorted]

  if (cbtResultsSettings.value.myTests.sortBy.order === 'descending') {
    combined.reverse()
  }

  combined.push(...unsorted)

  return combined
})

const currentPageOverviews = computed(() => {
  const combined = combinedTestResultOverviews.value
  if (!combined.length) return []

  const start = (currentPageNum.value - 1) * NUM_OF_OVERVIEWS_PER_PAGE
  const end = start + NUM_OF_OVERVIEWS_PER_PAGE

  return combined.slice(start, end)
})

watch(testResultOverviewsTotalCount,
  (total) => {
    const lastPage = Math.max(1, Math.ceil(total / NUM_OF_OVERVIEWS_PER_PAGE))
    if (currentPageNum.value > lastPage) {
      currentPageNum.value = lastPage
    }
  },
  { immediate: true },
)

watch(
  [
    () => cbtResultsSettings.value.myTests.sortBy.type,
    () => cbtResultsSettings.value.myTests.sortBy.qType,
  ],
  () => currentPageNum.value = 1,
)

const checkingDataInDB = shallowRef(true)

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
watchEffect(
  (onCleanup) => {
    if (!props.loadOrRefreshDataWhen) return

    const currentSortBy = { ...cbtResultsSettings.value.myTests.sortBy }
    checkingDataInDB.value = true
    const observable = liveQuery(() => db.getTestResultOverviews(currentSortBy))

    const subscription = observable.subscribe({
      next: (val) => {
        if (Array.isArray(val)) {
          testResultOverviews.sorted = val
          testResultOverviews.unsorted = []
        }
        else {
          testResultOverviews.sorted = val.sorted
          testResultOverviews.unsorted = val.unsorted
        }
        checkingDataInDB.value = false
      },
    })

    onCleanup(() => subscription.unsubscribe())
  },
)

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
    let result = testResultOverviews.sorted.find(item => item.id === id)
    result ??= testResultOverviews.unsorted.find(item => item.id === id)

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
        // emit to results page that currently loaded results name has changed
        emit('currentTestRenamed', newName)
      }
    }
  }
}

const viewResultsBtnHandler = (isResultsGenerated: boolean, id: number) => {
  const btnType = isResultsGenerated ? 'view' : 'generate'
  emit('viewOrGenerateResultsClicked', id, btnType)
}

function changeSortBy<T extends TestResultOverviewsDBSortBy['type']>(
  sortType: T,
  qType?: T extends TestResultOverviewsDBSortByWithQType['type']
    ? TestResultOverviewsDBSortByWithQType['qType']
    : never,
) {
  cbtResultsSettings.value.myTests.sortBy.type = sortType

  if (qType) {
    cbtResultsSettings.value.myTests.sortBy.qType = qType
  }
}

function toggleSortOrder() {
  if (cbtResultsSettings.value.myTests.sortBy.order === 'ascending') {
    cbtResultsSettings.value.myTests.sortBy.order = 'descending'
  }
  else {
    cbtResultsSettings.value.myTests.sortBy.order = 'ascending'
  }
}

function toggleDetailedOverviewOnCard() {
  const current = cbtResultsSettings.value.myTests.showDetailedOverviewOnCard
  cbtResultsSettings.value.myTests.showDetailedOverviewOnCard = !current
}

async function showImportExportDialog(
  type: 'Import' | 'Export',
  importDataFile: File | null = null,
) {
  try {
    if (type === 'Export') {
      const sortBy = { ...cbtResultsSettings.value.myTests.sortBy }
      const data = await db.getTestResultOverviews(sortBy)
      if (data) {
        let tests: TestResultOverviewDB[]
        if (Array.isArray(data)) {
          tests = sortBy.order === 'descending' ? data.reverse() : data
        }
        else {
          tests = sortBy.order === 'descending' ? data.sorted.reverse() : data.sorted
          tests.push(...data.unsorted)
        }

        if (tests.length > 0) {
          const overviews: Partial<TestInterfaceOrResultJsonOutput>[] = tests
            .map(overview => ({ testResultOverview: overview }))

          importExportDialogState.type = type
          importExportDialogState.data = overviews as TestInterfaceOrResultJsonOutput[]
          importExportDialogState.isVisible = true
        }
      }
    }
    else if (importDataFile && type === 'Import') {
      importExportDialogState.data = null

      const importedData = await utilParseJsonFile<
        ExportedCbtResultsJsonData | TestInterfaceOrResultJsonOutput
      >(importDataFile)
      if ('testOutputDatas' in importedData && Array.isArray(importedData.testOutputDatas)) {
        const testOutputDatas: TestInterfaceOrResultJsonOutput[] = importedData.testOutputDatas
          .map((data: unknown) => migrateJsonData.testInterfaceOrResultData(data))

        importExportDialogState.data = testOutputDatas
      }
      else if (!('testOutputDatas' in importedData)
        && importedData.testConfig
        && importedData.testSummary
        && importedData.testLogs
        && (
          ('testResultData' in importedData && importedData.testResultData)
          || ('testData' in importedData && importedData.testData)
        )
      ) {
        importExportDialogState.data = [migrateJsonData.testInterfaceOrResultData(importedData)]
      }

      if (importExportDialogState.data !== null) {
        importExportDialogState.type = type
        importExportDialogState.isVisible = true
      }
    }
  }
  catch (err) {
    useErrorToast(`Error while ${type}ing Test Data`, err)
  }
}

async function processImportExport(
  type: 'Import' | 'Export',
  data: TestInterfaceOrResultJsonOutput[],
) {
  if (type === 'Import') {
    try {
      if (data.length > 0) {
        const queryList: [string, number, number][] = []
        for (const dataItem of data) {
          const {
            testName,
            testStartTime,
            testEndTime,
          } = utilGetTestResultOverviewWithoutOverviewData(dataItem)

          queryList.push([testName, testStartTime, testEndTime])
        }
        const duplicateDatas = await db.getTestResultOverviewsByCompoundIndexes(queryList)

        if (duplicateDatas.length > 0) {
          useErrorToast(
            'Error: Importing duplicate test data is disallowed, '
            + 'a better way to handle this will be available soon',
          )
        }
        else if (queryList.length > 0) {
          await db.bulkAddTestOutputData(utilCloneJson(data))
        }
      }
    }
    catch (err) {
      useErrorToast('Error while trying to save Imported Test Data to DB:', err)
    }
  }
  else {
    try {
      const ids: number[] = []
      for (const outputData of data) {
        const id = (outputData.testResultOverview as TestResultOverviewDB).id
        if (id) ids.push(id)
      }

      const testOutputDataDBList = await db.getTestOutputDatas(ids)
      const testNotesDBList = await db.bulkGetTestNotes(ids)

      if (!testOutputDataDBList || !testNotesDBList) {
        throw new Error('Error: testOutputDataDBList or testNotesDBList is undefined')
      }

      const testNotesObject: Record<Numberish, TestNotes> = {}
      for (const notesItem of testNotesDBList) {
        const { id, notes } = notesItem ?? {}
        if (id && notes) {
          testNotesObject[id] = notes
        }
      }

      const testOutputDatas: TestInterfaceOrResultJsonOutput[] = []

      for (const outputData of testOutputDataDBList) {
        const { id, testOutputData } = outputData ?? {}
        if (testOutputData) {
          if (id && testNotesObject[id]) {
            testOutputData.testNotes = testNotesObject[id]
          }
          testOutputDatas.push(testOutputData)
        }
      }

      if (testOutputDatas.length > 0) {
        const jsonString = JSON.stringify(
          { testOutputDatas } satisfies ExportedCbtResultsJsonData,
        )
        const outputBlob = new Blob([jsonString], { type: MIME_TYPE.json })
        utilSaveFile('pdf2cbt_test_results.json', outputBlob)
      }
    }
    catch (err) {
      useErrorToast(`Error ${type}ing Test Data(s)`, err)
    }
  }

  importExportDialogState.isVisible = false
  importExportDialogState.data = null
}
</script>
