<script lang="ts" setup>
import {
  useVueTable,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,

} from '@tanstack/vue-table'
import type { CellContext, ColumnHelper, Table, Column } from '@tanstack/vue-table'
import {
  QUESTION_STATUS_LIST,
  QUESTION_TYPES_LIST,
  RESULT_STATUS_LIST,
  MARKS_STATUS_LIST,
  QUESTION_STATUS_LABELS,
  RESULT_STATUS_LABELS,
  QUESTION_TYPES_LABELS,
  TEST_OVERALL,
  OVERALL,
  FONT_SIZES,
} from '#layers/shared/shared/constants'
import { UiDropdownMenu, UiDropdownMenuTrigger, UiPopover, UiPopoverTrigger } from '#components'

type FilterState = Record<string, Set<string>>

type StatsCellContext = CellContext<StatusStatsWithName, unknown>
  & CellContext<ResultStatsWithName, unknown>
  & CellContext<MarksStatsWithName, unknown>

type SelectedSectionKeys = {
  [subject: string]: string
}

type Props = {
  testResultData: TestResultData
  testQuestions: TestResultQuestionData[]
  testConfig: TestInterfaceAndResultCommonJsonOutputData['testConfig']
  waitUntil: boolean
}

const tooltipContent = {
  marksSummary: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'In this, Avg. Time Spent is time spent per mark ("Time Spent" divided by "Marks").'),
      h('p', 'if marks is zero then avg time spent will be equal to "Time Spent".'),
    ]),
}

const { testResultData, waitUntil, testConfig, testQuestions } = defineProps<Props>()

const currentSelectedState = shallowReactive({
  subject: TEST_OVERALL,
  section: '',
})

const currentLoadState = shallowReactive<{
  loadedResultsID: null | number
}>({
  loadedResultsID: null,
})

// to store subject -> section -> section stats
const testStats = shallowRef<TestStats>({})
// to store overall stats of each subject
const subjectsOverallStats = shallowRef<SubjectsOverallStats>({})
// to store only the test overall stats
const testOverallStats = ref<Stats>()

const questionStatusStats = shallowRef<StatusStatsWithName[]>([])
const questionResultStats = shallowRef<ResultStatsWithName[]>([])
const questionMarksStats = shallowRef<MarksStatsWithName[]>([])

const currentResultsID = useCbtResultsCurrentID()

const questionsData = shallowRef<TestResultQuestionData[]>([])

// to store previously selected sections,
// so that this can be used to get user back to the section they left for that particular subject
const selectedTabs = ref<SelectedSectionKeys>({})

// flag being used to indicate whether to load/reload for v-if of this component root
const loadDataNow = shallowRef(false)

const subjectSectionNames = shallowRef<Record<string, string[]>>({})

const storageSettings = useCbtResultsLocalStorageSettings()

const questionPreviewState = shallowReactive({
  show: false,
  currentQueIndex: 0,
})

const answerOptionsFormat = useCbtSettings().uiSettings.value.questionPanel.answerOptionsFormat

const highlightStyleClasses: Record<string, string> = {
  'status': `status-answered:bg-green-400/20 status-not-answered:bg-red-500/20
      status-marked:bg-purple-500/20 status-marked-answered:bg-sky-500/20
      status-not-visited:bg-gray-500/20`,
  'result.status': `result-correct:bg-green-400/20 result-incorrect:bg-red-500/20
      result-partial:bg-yellow-600/30 result-dropped:bg-purple-500/20
      result-bonus:bg-sky-500/20 result-not-answered:bg-gray-500/20`,
}

const settings = shallowReactive({
  highlightMode: 'result.status' as 'result.status' | 'status' | null,
  queNumOrder: 'oriQueId' as keyof Pick<TestResultQuestionData, 'oriQueId' | 'queId' | 'secQueId'>,
})

const questionsTableFilterKeyValues = {
  'status': QUESTION_STATUS_LIST,
  'result.status': RESULT_STATUS_LIST,
  'type': QUESTION_TYPES_LIST,
  'queId': ['oriQueId', 'secQueId', 'queId'] as const,
}

const formattedLabels = {
  ...QUESTION_STATUS_LABELS,
  ...RESULT_STATUS_LABELS,
  ...QUESTION_TYPES_LABELS,
  oriQueId: 'Original',
  secQueId: 'Section-wise',
  queId: 'Cumulative',
}

const defaultQuestionsTableFilterState: FilterState = {
  'subject': new Set(),
  'section': new Set(),
  'status': new Set([...QUESTION_STATUS_LIST] as string[]),
  'result.status': new Set([...RESULT_STATUS_LIST] as string[]),
  'type': new Set([...QUESTION_TYPES_LIST] as string[]),
}

const timeSpentFilterState = shallowReactive({
  min: 0,
  max: Infinity,
  openPopOver: false,
})

const showFiltersOnTheseColumnIds = new Set([
  'status',
  'result.status',
  'type',
  'timeSpent',
])

const questionsTableFilters = reactive({
  ...structuredClone(defaultQuestionsTableFilterState),
})

const timeSpentFilterMinRange = computed({
  get: () => Math.min(Math.max(timeSpentFilterState.min, 0), testConfig.testDurationInSeconds),
  set: (value) => {
    timeSpentFilterState.min = Math.min(Math.max(value, 0), testConfig.testDurationInSeconds)
  },
})

const timeSpentFilterMaxRange = computed({
  get: () => Math.min(timeSpentFilterState.max, testConfig.testDurationInSeconds),
  set: (value) => {
    timeSpentFilterState.max = Math.min(value, testConfig.testDurationInSeconds)
  },
})

const questionsTable = useVueTable({
  data: questionsData,
  columns: getQuestionsTableColumnsData(),
  initialState: {
    columnFilters: Object.entries(questionsTableFilters).map(([id, value]) => ({ id, value: [...value] })),
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  enableSortingRemoval: true,
})

const questionsStatusStatsTable = useVueTable({
  data: questionStatusStats,
  columns: getQuestionStatusStatsColumnData(),
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})

const questionsResultStatsTable = useVueTable({
  data: questionResultStats,
  columns: getResultStatsColumnData(),
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})

const questionsMarksStatsTable = useVueTable({
  data: questionMarksStats,
  columns: getMarksStatsColumnData(),
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})

const tables = computed(() => {
  const questions = storageSettings.value.tableFontSizes.questions
  const statusStats = storageSettings.value.tableFontSizes.statusStats
  const resultStats = storageSettings.value.tableFontSizes.resultStats
  const marksStats = storageSettings.value.tableFontSizes.marksStats

  return [
    {
      id: 'questions',
      heading: '',
      table: questionsTable,
      class: highlightModeClasses.value,
      style: {
        '--table-header-font-size': FONT_SIZES[questions.header],
        '--table-body-font-size': FONT_SIZES[questions.body],
      },
    },
    {
      id: 'statusStats',
      heading: 'Questions Status Summary',
      table: questionsStatusStatsTable,
      class: '',
      style: {
        '--table-header-font-size': FONT_SIZES[statusStats.header],
        '--table-body-font-size': FONT_SIZES[statusStats.body],
      },
    },
    {
      id: 'resultStats',
      heading: 'Results Summary',
      table: questionsResultStatsTable,
      class: '',
      style: {
        '--table-header-font-size': FONT_SIZES[resultStats.header],
        '--table-body-font-size': FONT_SIZES[resultStats.body],
      },
    },
    {
      id: 'marksStats',
      heading: 'Marks Summary',
      table: questionsMarksStatsTable,
      class: '',
      style: {
        '--table-header-font-size': FONT_SIZES[marksStats.header],
        '--table-body-font-size': FONT_SIZES[marksStats.body],
      },
    },
  ] as const
})

const questionsToPreview = computed(() =>
  questionsTable.getRowModel().rows.map(row => row.original),
)

const testNotes = useCurrentTestNotes()

const highlightModeClasses = computed(() => {
  if (settings.highlightMode === 'status') {
    return highlightStyleClasses.status
  }
  else if (settings.highlightMode === 'result.status') {
    return highlightStyleClasses['result.status']
  }
  else {
    return ''
  }
})

function changeTablesFilters(changeLevel: 'test' | 'showTestOverall' | 'section') {
  if (changeLevel === 'test' || changeLevel === 'showTestOverall') {
    const newSubSecNames = subjectSectionNames.value
    questionsTableFilters['subject'] = new Set(Object.keys(newSubSecNames))
    questionsTableFilters['section'] = new Set(Object.values(newSubSecNames).flat())

    toggleQuestionsTableColumnVisibility([
      { id: 'subject', isVisible: true },
      { id: 'section', isVisible: true },
    ])

    if (changeLevel === 'test') setTimeSpentFilterRange(true)
  }
  else if (changeLevel === 'section') {
    const { subject, section } = currentSelectedState
    questionsTableFilters['subject'] = new Set([subject])

    if (section.endsWith(OVERALL)) {
      questionsTableFilters['section'] = new Set(subjectSectionNames.value[subject])
      toggleQuestionsTableColumnVisibility([
        { id: 'subject', isVisible: false },
        { id: 'section', isVisible: true },
      ])
    }
    else {
      questionsTableFilters['section'] = new Set([section])
      toggleQuestionsTableColumnVisibility([
        { id: 'subject', isVisible: false },
        { id: 'section', isVisible: false },
      ])
    }
  }
  else {
    return
  }

  for (const { table, id } of tables.value) {
    if (id === 'questions') continue

    const nameColumn = table.getColumn('name')
    if (nameColumn) {
      nameColumn.setFilterValue({ ...currentSelectedState })
      if (changeLevel === 'section' && !currentSelectedState.section.endsWith(OVERALL)) {
        nameColumn.toggleVisibility(false)
      }
      else {
        nameColumn.toggleVisibility(true)
      }
    }
  }
  updateQuestionsTableColumnFilters()
}

function getQuestionsTableColumnsData() {
  const columnHelper = createColumnHelper<TestResultQuestionData>()

  const columns = [
    columnHelper.accessor('subject', {
      id: 'subject',
      header: 'Subject',
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableSorting: false,
    }),
    columnHelper.accessor('section', {
      id: 'section',
      header: 'Section',
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableSorting: false,
    }),
    columnHelper.accessor('queId', {
      id: 'queId',
      header: 'Q. No.',
      cell: (info) => {
        const data = info.row.original
        if (settings.queNumOrder === 'oriQueId') {
          return data.oriQueId
        }
        else if (settings.queNumOrder === 'secQueId') {
          return data.secQueId
        }
        return data.queId
      },
      enableSorting: false,
    }),
    columnHelper.accessor(row => row.result.marks, {
      id: 'result.marks',
      header: 'Marks',
      enableSorting: false,
    }),
    columnHelper.accessor(row => row.result.status, {
      id: 'result.status',
      header: 'Result',
      cell: info => RESULT_STATUS_LABELS[info.getValue()],
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableSorting: false,
    }),
    columnHelper.accessor('type', {
      id: 'type',
      header: 'Type',
      cell: info => QUESTION_TYPES_LABELS[info.getValue()],
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableSorting: false,
    }),
    columnHelper.accessor('answer', {
      id: 'answer',
      header: 'Your Answer',
      cell: info => utilStringifyAnswer(info.getValue(), info.row.original.type, true),
      enableSorting: false,
    }),
    columnHelper.accessor(row => row.result.correctAnswer, {
      id: 'result.correctAnswer',
      header: 'Correct Answer',
      cell: info => utilStringifyAnswer(info.getValue(), info.row.original.type, true),
      enableSorting: false,
    }),
    columnHelper.accessor('timeSpent', {
      id: 'timeSpent',
      header: 'Time Spent',
      cell: info => utilSecondsToTime(info.getValue(), 'mmm:ss'),
      filterFn: (row, columnId, range) => {
        if (!range) return true

        const t = row.getValue(columnId) as number
        return (t >= range.min && t <= range.max)
      },
      enableSorting: true,
      sortingFn: 'basic',
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      cell: info => QUESTION_STATUS_LABELS[info.getValue()],
      filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
      enableSorting: false,
    }),
  ]

  return columns
}

function getStatsTablesFirstColumnDef<T extends StatsMetaData>(
  columnHelper: ColumnHelper<T>,
) {
  return {
    id: 'name',
    header: () => currentSelectedState.section.endsWith(OVERALL) ? 'Sections' : 'Subjects',
    enableSorting: false,
    columns: [
      columnHelper.accessor(row => row.name, {
        id: 'name',
        header: '',
        cell: (info) => {
          const original = info.row.original
          const { subject, section } = currentSelectedState
          if (subject !== TEST_OVERALL) {
            if (section.endsWith(OVERALL) && original.type === 'subject') {
              return `${original.name} ${OVERALL}`
            }
          }
          return original.name
        },
        filterFn: (row, _, filterState) => {
          const original = row.original
          const { subject, section } = filterState
          if (subject === TEST_OVERALL) {
            return (original.type === 'test' || original.type === 'subject')
          }
          else if (section.endsWith(OVERALL)) {
            if (original.type === 'section') {
              return original.subject === subject
            }
            return (original.type === 'subject' && original.name === subject)
          }

          return original.type === 'section'
            && original.subject === subject
            && original.name === section
        },
      }),
    ],
  }
}

function getQuestionStatusStatsColumnData() {
  const columnHelper = createColumnHelper<StatusStatsWithName>()

  const labels: Record<keyof StatusStats, string> = {
    ...QUESTION_STATUS_LABELS,
    total: 'Total',
  }

  const statusKeys = Object.keys(labels) as (keyof StatusStats)[]
  const remainingColumns = statusKeys.map(key => ({
    header: labels[key],
    columns: [
      columnHelper.accessor(row => row[key].count, {
        id: `${key}.count`,
        header: 'Count',
      }),
      columnHelper.accessor(row => row[key].totalTime, {
        id: `${key}.totalTime`,
        header: 'Time Spent',
        cell: info => utilSecondsToTime(info.getValue(), 'mmm:ss', true),
      }),
      columnHelper.accessor(row => row[key].avgTime, {
        id: `${key}.avgTime`,
        header: 'Avg Time',
        cell: info => utilSecondsToTime(info.getValue(), 'mmm:ss', true),
      }),
    ],
  }))

  const firstColumn = getStatsTablesFirstColumnDef(columnHelper)
  const columns = [firstColumn, ...remainingColumns]

  return columns
}

function getResultStatsColumnData() {
  const columnHelper = createColumnHelper<ResultStatsWithName>()

  const labels: Record<keyof ResultStats, string> = {
    ...RESULT_STATUS_LABELS,
    total: 'Total',
  }

  const statusKeys = Object.keys(labels) as (keyof ResultStats)[]
  const remainingColumns = statusKeys.map((key, index) => {
    const isLast = index === (statusKeys.length - 1)

    const baseColumns = [
      columnHelper.accessor(row => row[key].count, {
        id: `${key}.count`,
        header: 'Count',
      }),
      columnHelper.accessor(row => row[key].totalTime, {
        id: `${key}.totalTime`,
        header: 'Time Spent',
        cell: info => utilSecondsToTime(info.getValue(), 'mmm:ss', true),
      }),
      columnHelper.accessor(row => row[key].avgTime, {
        id: `${key}.avgTime`,
        header: 'Avg Time',
        cell: info => utilSecondsToTime(info.getValue(), 'mmm:ss', true),
      }),
    ]

    if (isLast) {
      const accuracyColumn = columnHelper.accessor(row => row[key as 'total'].accuracy as unknown as number, {
        id: `${key}.accuracy`,
        header: 'Accuracy',
      })

      baseColumns.splice(1, 0, accuracyColumn) // insert at 2nd position
    }

    return {
      header: labels[key],
      columns: baseColumns,
    }
  })

  const firstColumn = getStatsTablesFirstColumnDef(columnHelper)
  const columns = [firstColumn, ...remainingColumns]

  return columns
}

function getMarksStatsColumnData() {
  const columnHelper = createColumnHelper<MarksStatsWithName>()

  const statusKeys = [...MARKS_STATUS_LIST, 'total'] as (keyof MarksStats)[]
  const remainingColumns = statusKeys.map((key, index) => {
    const isLast = index === statusKeys.length - 1

    const baseColumns = [
      columnHelper.accessor(row => row[key].marks, {
        id: `${key}.marks`,
        header: 'Marks',
      }),
      columnHelper.accessor(row => row[key].totalTime, {
        id: `${key}.totalTime`,
        header: 'Time Spent',
        cell: info => utilSecondsToTime(info.getValue(), 'mmm:ss', true),
      }),
      columnHelper.accessor(row => row[key].avgTime, {
        id: `${key}.avgTime`,
        header: 'Avg Time',
        cell: info => utilSecondsToTime(info.getValue(), 'mmm:ss', true),
      }),
    ]

    if (isLast) {
      const marksColumn = columnHelper.accessor(row => row[key as 'total'].maxMarks, {
        id: `${key}.maxMarks`,
        header: 'Max Marks',
      })

      baseColumns.splice(1, 0, marksColumn) // insert at 2nd position
    }

    return {
      header: utilKeyToLabel(key),
      columns: baseColumns,
    }
  })

  const firstColumn = getStatsTablesFirstColumnDef(columnHelper)
  const columns = [firstColumn, ...remainingColumns]

  return columns
}

function toggleQuestionsTableColumnVisibility(
  columnIdsWithVisiblity: { id: string, isVisible: boolean }[],
) {
  for (const colData of columnIdsWithVisiblity) {
    const { id, isVisible } = colData
    const col = questionsTable.getColumn(id)
    if (col) {
      col.toggleVisibility(isVisible)
    }
  }
}

function toggleQuestionsTableFilter(
  key: keyof typeof questionsTableFilters,
  val: string,
  enabled: boolean,
) {
  const filter = questionsTableFilters[key]
  if (!filter) return

  if (enabled) filter.add(val)
  else filter.delete(val)

  updateQuestionsTableColumnFilters()
}

function updateQuestionsTableColumnFilters() {
  questionsTable.setColumnFilters(
    Object.entries(questionsTableFilters)
      .filter(([, v]) => v.size)
      .map(([id, value]) => ({ id, value: [...value] })),
  )
}

function resetTableColumnsVisibility<T>(table: Table<T>) {
  table.getAllColumns().forEach((c) => {
    c.toggleVisibility(true)
    c.columns?.forEach(childCol => childCol.toggleVisibility(true))
  })
}

function setTimeSpentFilterRange(reset: boolean = false) {
  const column = questionsTable.getColumn('timeSpent')
  if (!column) return
  timeSpentFilterState.openPopOver = false

  const { min, max } = timeSpentFilterState
  if (min <= 0 && max >= testConfig.testDurationInSeconds) reset = true

  if (reset) {
    timeSpentFilterState.max = testConfig.testDurationInSeconds
    timeSpentFilterState.min = 0
  }

  column.setFilterValue(reset ? null : { min, max })
}

function showQuestionPreview(queId: number | null = null) {
  if (typeof queId !== 'number') {
    const firstRow = questionsTable.getRowModel().rows[0]
    if (firstRow) {
      queId = firstRow.original.queId
    }
  }

  if (typeof queId !== 'number') return

  const index = questionsToPreview.value.findIndex(que => queId === que.queId)
  const maxIndex = Math.max(0, questionsToPreview.value.length - 1)
  questionPreviewState.currentQueIndex = utilClampNumber(index, 0, maxIndex)

  questionPreviewState.show = true
}

// wait until user clicks this "Detailed" page layout/component to render this component.
// Basically to load on-demand
watch(
  () => waitUntil,
  () => {
    reloadTestData()
  },
  { once: true },
)

// watch for any changes to input data
// so that tables data can be recalculated and rendered
watch(
  [currentResultsID, () => testResultData],
  ([newID, _]) => {
    if ((newID !== currentLoadState.loadedResultsID) && loadDataNow.value) {
      reloadTestData()
    }
  },
  { deep: false },
)

// computed "sections" tablist for current subject
const currentSectionTabs = computed(() => {
  const subject = currentSelectedState.subject
  if (subject && !subject.endsWith(OVERALL)) {
    return Object.keys(testResultData[subject] ?? {})
  }
  return []
})

async function reloadTestData(isFirst: boolean = false) {
  loadDataNow.value = false
  if (!isFirst) {
    await nextTick()
  }

  questionsData.value = testQuestions
  currentSelectedState.subject = TEST_OVERALL
  currentSelectedState.section = ''
  const newSubjectSectionNames: Record<string, string[]> = {}

  const newSelectedKeys: SelectedSectionKeys = {}
  for (const [subject, subjectData] of Object.entries(testResultData)) {
    const sectionNames = Object.keys(subjectData)
    newSubjectSectionNames[subject] = [...sectionNames]

    if (sectionNames.length > 1) {
      newSelectedKeys[subject] = subject + OVERALL
    }
    else {
      newSelectedKeys[subject] = sectionNames[0]!
    }
  }

  subjectSectionNames.value = newSubjectSectionNames
  selectedTabs.value = newSelectedKeys

  const newTestStats: TestStats = {}
  const newSubjectsOverallStats: SubjectsOverallStats = {}
  const newStatusStats: StatusStatsWithName[] = []
  const newResultStats: ResultStatsWithName[] = []
  const newMarksStats: MarksStatsWithName[] = []

  for (const [subject, subjectData] of Object.entries(testResultData)) {
    newTestStats[subject] ??= {}

    for (const [section, sectionData] of Object.entries(subjectData)) {
      const sectionStats = getSectionStats(sectionData)
      newTestStats[subject][section] = sectionStats

      const { status, result, marks } = sectionStats
      newStatusStats.push({ name: section, subject, type: 'section', ...status })
      newResultStats.push({ name: section, subject, type: 'section', ...result })
      newMarksStats.push({ name: section, subject, type: 'section', ...marks })
    }

    if (Object.keys(newTestStats[subject]).length > 1) {
      const subjectStats = getStatsTotal(Object.values(newTestStats[subject]))
      newSubjectsOverallStats[subject] = subjectStats

      const { status, result, marks } = subjectStats
      newStatusStats.push({ name: subject, type: 'subject', ...status })
      newResultStats.push({ name: subject, type: 'subject', ...result })
      newMarksStats.push({ name: subject, type: 'subject', ...marks })
    }
    else {
      const firstSection = Object.keys(newTestStats[subject])[0]
      selectedTabs.value[subject] = firstSection!
    }
  }

  testStats.value = newTestStats
  subjectsOverallStats.value = newSubjectsOverallStats

  let isTestOverallNeeded = false
  const subjectsOverallKeys = Object.keys(newSubjectsOverallStats)

  if (subjectsOverallKeys.length > 1) {
    testOverallStats.value = getStatsTotal(Object.values(newSubjectsOverallStats))
    isTestOverallNeeded = true
  }
  else if (subjectsOverallKeys.length === 0) {
    const subjectNames = Object.keys(newTestStats)
    if (subjectNames.length > 1) {
      const allSectionsStats: Stats[] = []
      for (const sectionStats of Object.values(newTestStats)) {
        for (const stats of Object.values(sectionStats)) {
          allSectionsStats.push(stats)
        }
      }

      testOverallStats.value = getStatsTotal(allSectionsStats)
      isTestOverallNeeded = true
    }
  }

  if (!isTestOverallNeeded) {
    const firstSubject = Object.keys(newTestStats)[0]!
    currentSelectedState.subject = firstSubject
    currentSelectedState.section = selectedTabs.value[firstSubject]!
  }
  else if (testOverallStats.value) {
    const overallStatus = testOverallStats.value
    const { status, result, marks } = overallStatus
    newStatusStats.push({ name: TEST_OVERALL, type: 'test', ...status })
    newResultStats.push({ name: TEST_OVERALL, type: 'test', ...result })
    newMarksStats.push({ name: TEST_OVERALL, type: 'test', ...marks })
  }

  questionStatusStats.value = newStatusStats
  questionResultStats.value = newResultStats
  questionMarksStats.value = newMarksStats

  currentLoadState.loadedResultsID = currentResultsID.value
  changeTablesFilters('test')
  loadDataNow.value = true
}

function createEmptyBaseForStats() {
  const emptyStatsItem = (): StatsItem => ({
    count: 0,
    totalTime: 0,
    avgTime: 0,
  })

  const emptyMarksStatsItem = (): MarksStatsItem => ({
    marks: 0,
    totalTime: 0,
    avgTime: 0,
  })

  const emptyResultStatsItemWithAccuracy = (): ResultStats['total'] => ({
    ...emptyStatsItem(),
    accuracy: '',
  })

  const emptyMarksStatsItemWithMax = (): MarksStats['total'] => ({
    ...emptyMarksStatsItem(),
    maxMarks: 0,
  })

  const status = {} as StatusStats
  for (const key of [...QUESTION_STATUS_LIST, 'total']) {
    status[key as keyof StatusStats] = emptyStatsItem()
  }

  const result = {} as ResultStats
  for (const key of RESULT_STATUS_LIST) {
    result[key as Exclude<keyof ResultStats, 'total'>] = emptyStatsItem()
  }
  result.total = emptyResultStatsItemWithAccuracy()

  const marks = {} as MarksStats
  for (const key of MARKS_STATUS_LIST) {
    marks[key as Exclude<keyof MarksStats, 'total'>] = emptyMarksStatsItem()
  }
  marks.total = emptyMarksStatsItemWithMax()

  return { status, result, marks }
}

function getSectionStats(sectionData: TestResultSectionData): Stats {
  const {
    marks: questionMarks,
    status: questionStatus,
    result: questionResult,
  } = createEmptyBaseForStats()

  let maxMarks = 0
  let accuracyCount = 0

  for (const questionData of Object.values(sectionData)) {
    const { result, timeSpent } = questionData
    const { marks, status } = result

    questionStatus[questionData.status].count++
    questionStatus[questionData.status].totalTime += timeSpent
    questionResult[status].count++
    questionResult[status].totalTime += timeSpent

    maxMarks += questionData.marks.max ?? questionData.marks.cm

    if (marks > 0) {
      if (status === 'bonus') {
        questionMarks.bonus.marks += marks
        questionMarks.bonus.totalTime += timeSpent
      }
      else if (status === 'dropped') {
        questionMarks.dropped.marks += marks
        questionMarks.dropped.totalTime += timeSpent
      }
      else {
        questionMarks.positive.marks += marks
        questionMarks.positive.totalTime += timeSpent
      }
    }
    else if (marks < 0) {
      questionMarks.negative.marks += marks
      questionMarks.negative.totalTime += timeSpent
    }

    accuracyCount += result.accuracyNumerator
  }

  const accuracyDenominator = questionResult.correct.count
    + questionResult.incorrect.count
    + questionResult.partial.count

  const accuracy = Math.round((accuracyCount / (accuracyDenominator || 1)) * 10000) / 100

  for (const status of Object.keys(questionStatus) as (keyof StatusStats)[]) {
    if (status === 'total') continue

    const { count, totalTime } = questionStatus[status]
    questionStatus[status].avgTime = totalTime / (count || 1)

    questionStatus.total.count += count
    questionStatus.total.totalTime += totalTime
  }

  for (const status of Object.keys(questionResult) as (keyof ResultStats)[]) {
    if (status === 'total') continue

    const { count, totalTime } = questionResult[status]
    questionResult[status].avgTime = totalTime / (count || 1)

    questionResult.total.count += count
    questionResult.total.totalTime += totalTime
  }

  for (const status of Object.keys(questionMarks) as (keyof MarksStats)[]) {
    if (status === 'total') continue

    const { marks, totalTime } = questionMarks[status]
    questionMarks[status].avgTime = Math.abs(totalTime / (marks || 1))

    questionMarks.total.marks += marks
    questionMarks.total.totalTime += totalTime
  }

  questionResult.total.accuracy = accuracy + '%'

  questionStatus.total.avgTime = questionStatus.total.totalTime / (questionStatus.total.count || 1)
  questionResult.total.avgTime = questionResult.total.totalTime / (questionResult.total.count || 1)
  questionMarks.total.avgTime = questionMarks.total.totalTime / (questionMarks.total.marks || 1)
  questionMarks.total.maxMarks = maxMarks

  return {
    status: {
      ...questionStatus,
    },
    result: {
      ...questionResult,
    },
    marks: {
      ...questionMarks,
    },
    accuracy: {
      count: accuracyCount,
      total: accuracyDenominator,
      percent: accuracy,
    },
  }
}

function getStatsTotal(statsArray: Stats[]): Stats {
  const { status: statusSum, result: resultSum, marks: marksSum } = createEmptyBaseForStats()

  let totalMaxMarks = 0
  let totalAccuracyCount = 0
  let totalAccuracyDenominator = 0

  for (const stat of statsArray) {
    // total Status Stats
    for (const key of Object.keys(statusSum)) {
      const k = key as keyof StatusStats
      statusSum[k].count += stat.status[k].count
      statusSum[k].totalTime += stat.status[k].totalTime
    }

    // total Result Stats
    for (const key of Object.keys(resultSum)) {
      const k = key as keyof ResultStats
      resultSum[k].count += stat.result[k].count
      resultSum[k].totalTime += stat.result[k].totalTime
    }

    // total Marks Stats
    for (const key of Object.keys(marksSum)) {
      const k = key as keyof MarksStats
      marksSum[k].marks += stat.marks[k].marks
      marksSum[k].totalTime += stat.marks[k].totalTime
    }

    totalMaxMarks += stat.marks.total.maxMarks
    totalAccuracyCount += stat.accuracy.count
    totalAccuracyDenominator += stat.accuracy.total
  }

  // calculate avgTime
  for (const key of Object.keys(statusSum)) {
    const k = key as keyof StatusStats
    const { count, totalTime } = statusSum[k]
    statusSum[k].avgTime = totalTime / (count || 1)
  }

  for (const key of Object.keys(resultSum)) {
    const k = key as keyof ResultStats
    const { count, totalTime } = resultSum[k]
    resultSum[k].avgTime = totalTime / (count || 1)
  }

  for (const key of Object.keys(marksSum)) {
    const k = key as keyof MarksStats
    const { marks, totalTime } = marksSum[k]
    marksSum[k].avgTime = Math.abs(totalTime / (marks || 1))
  }
  marksSum.total.maxMarks = totalMaxMarks

  const accuracy = Math.round((totalAccuracyCount / (totalAccuracyDenominator || 1)) * 10000) / 100
  resultSum.total.accuracy = accuracy + '%'

  return {
    status: statusSum,
    result: resultSum,
    marks: marksSum,
    accuracy: {
      count: totalAccuracyCount,
      total: totalAccuracyDenominator,
      percent: accuracy,
    },
  }
}

function toggleColumnVisibility<T>(
  column: Column<T, unknown>,
  visible: boolean,
) {
  column.toggleVisibility(visible)

  if (column.columns?.length) {
    for (const child of column.columns) {
      child.toggleVisibility(visible)
    }
  }
}

const sectionChangeHandler = (section: string) => {
  currentSelectedState.section = section
  changeTablesFilters('section')
}

const subjectChangeHandler = (subject: string) => {
  if (subject === TEST_OVERALL) {
    currentSelectedState.section = ''
    changeTablesFilters('showTestOverall')
  }
  else {
    currentSelectedState.section = selectedTabs.value[subject] ?? subject + OVERALL
    changeTablesFilters('section')
  }
}
</script>

<template>
  <div class="flex flex-col w-full grow">
    <div
      v-if="loadDataNow"
      class="flex flex-col w-full grow pb-50"
    >
      <UiTabs
        v-model="currentSelectedState.subject"
        class="border-b border-border"
        @update:model-value="(val) => subjectChangeHandler(val as string)"
      >
        <UiScrollArea class="w-full">
          <BaseTabsListWithIndicator class="flex flex-nowrap gap-x-1 px-3 max-w-max">
            <BaseTabsTriggerWithIndicator
              v-if="Object.keys(testOverallStats ?? {}).length > 1"
              :value="TEST_OVERALL"
              class="cursor-pointer p-2.5 text-base"
            >
              Test Overall
            </BaseTabsTriggerWithIndicator>
            <BaseTabsTriggerWithIndicator
              v-for="(subject, idx) in Object.keys(testResultData)"
              :key="idx"
              :value="subject"
              class="cursor-pointer p-2.5 text-base"
            >
              {{ subject }}
            </BaseTabsTriggerWithIndicator>
          </BaseTabsListWithIndicator>
          <UiScrollBar orientation="horizontal" />
        </UiScrollArea>
      </UiTabs>
      <UiTabs
        v-if="(currentSelectedState.subject !== TEST_OVERALL)
          && Object.keys(subjectsOverallStats[currentSelectedState.subject] ?? {}).length > 1
        "
        v-model="selectedTabs[currentSelectedState.subject]"
        class="border-b border-border sticky top-0 z-20 bg-background"
        @update:model-value="(val) => sectionChangeHandler(val as string)"
      >
        <UiScrollArea class="w-full">
          <BaseTabsListWithIndicator
            class="flex flex-nowrap px-3 gap-x-1 max-w-max"
          >
            <BaseTabsTriggerWithIndicator
              :value="currentSelectedState.subject + OVERALL"
              class="cursor-pointer p-2.5 text-base"
            >
              {{ currentSelectedState.subject + ' Overall' }}
            </BaseTabsTriggerWithIndicator>
            <BaseTabsTriggerWithIndicator
              v-for="(section, index) in currentSectionTabs"
              :key="index"
              :value="section"
              class="cursor-pointer p-2.5 text-base"
            >
              {{ section }}
            </BaseTabsTriggerWithIndicator>
          </BaseTabsListWithIndicator>
          <UiScrollBar orientation="horizontal" />
        </UiScrollArea>
      </UiTabs>
      <div>
        <template
          v-for="tableItem in tables"
          :key="tableItem.heading"
        >
          <div class="flex flex-row gap-3 justify-center my-4 items-center">
            <UiDropdownMenu>
              <UiDropdownMenuTrigger as-child>
                <BaseButton
                  label-class="text-sm font-semibold"
                  variant="outline"
                  title="Settings"
                  class="size-7"
                  size="icon"
                  icon-name="line-md:cog-filled"
                  icon-class="text-orange-500"
                />
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent class="w-48">
                <UiDropdownMenuLabel class="text-center">
                  Table Settings
                </UiDropdownMenuLabel>
                <UiDropdownMenuSeparator />
                <UiDropdownMenuGroup>
                  <UiDropdownMenuSub>
                    <UiDropdownMenuSubTrigger class="cursor-pointer">
                      <span>Columns to show</span>
                    </UiDropdownMenuSubTrigger>
                    <UiDropdownMenuPortal>
                      <UiDropdownMenuSubContent>
                        <template
                          v-for="column in tableItem.table.getAllColumns()"
                          :key="column.id"
                        >
                          <UiDropdownMenuCheckboxItem
                            :model-value="column.getIsVisible()"
                            @update:model-value="(v) => {
                              toggleColumnVisibility(column as Column<unknown, unknown>, v)
                            }"
                            @select.prevent
                          >
                            {{
                              typeof column.columnDef.header === 'function'
                                ? column.columnDef.header(1 as any)
                                : column.columnDef.header
                            }}
                          </UiDropdownMenuCheckboxItem>
                        </template>
                        <UiDropdownMenuSeparator />

                        <UiDropdownMenuItem
                          @click="resetTableColumnsVisibility(tableItem.table as Table<unknown>)"
                          @select.prevent
                        >
                          Show All Columns
                        </UiDropdownMenuItem>
                      </UiDropdownMenuSubContent>
                    </UiDropdownMenuPortal>
                  </UiDropdownMenuSub>
                </UiDropdownMenuGroup>
                <UiDropdownMenuSeparator />
                <UiDropdownMenuGroup>
                  <UiDropdownMenuSub>
                    <UiDropdownMenuSubTrigger class="cursor-pointer">
                      <span>Header Font Size</span>
                    </UiDropdownMenuSubTrigger>
                    <UiDropdownMenuPortal>
                      <UiDropdownMenuSubContent>
                        <UiDropdownMenuItem
                          v-for="(_, size) in FONT_SIZES"
                          :key="size"
                          :disabled="storageSettings.tableFontSizes[tableItem.id].header === size"
                          :class="{
                            'text-green-500 data-[disabled]:opacity-100':
                              storageSettings.tableFontSizes[tableItem.id].header === size,
                          }"
                          @click="storageSettings.tableFontSizes[tableItem.id].header = size"
                        >
                          {{ utilKeyToLabel(size) }}
                        </UiDropdownMenuItem>
                      </UiDropdownMenuSubContent>
                    </UiDropdownMenuPortal>
                  </UiDropdownMenuSub>
                  <UiDropdownMenuSeparator />
                  <UiDropdownMenuSub>
                    <UiDropdownMenuSubTrigger class="cursor-pointer">
                      <span>Body Font Size</span>
                    </UiDropdownMenuSubTrigger>
                    <UiDropdownMenuPortal>
                      <UiDropdownMenuSubContent>
                        <UiDropdownMenuItem
                          v-for="(_, size) in FONT_SIZES"
                          :key="size"
                          :disabled="storageSettings.tableFontSizes[tableItem.id].body === size"
                          :class="{
                            'text-green-500 data-[disabled]:opacity-100':
                              storageSettings.tableFontSizes[tableItem.id].body === size,
                          }"
                          @click="storageSettings.tableFontSizes[tableItem.id].body = size"
                        >
                          {{ utilKeyToLabel(size) }}
                        </UiDropdownMenuItem>
                      </UiDropdownMenuSubContent>
                    </UiDropdownMenuPortal>
                  </UiDropdownMenuSub>
                </UiDropdownMenuGroup>
              </UiDropdownMenuContent>
            </UiDropdownMenu>
            <span
              v-if="tableItem.heading"
              class="text-lg font-semibold text-center"
            >
              {{ tableItem.heading }}
            </span>
            <BaseButton
              v-if="tableItem.id === 'questions'"
              class="ml-4"
              label="View Question Preview"
              variant="help"
              icon-name="material-symbols:table-view-outline-rounded"
              @click="showQuestionPreview()"
            />
            <IconWithTooltip
              v-else-if="tableItem.id === 'marksStats'"
              :content="tooltipContent.marksSummary"
              icon-size="1.4rem"
            />
          </div>
          <UiScrollArea
            class="w-full"
            viewport-class="[&>div]:pb-6 [&>div]:px-8"
          >
            <UiTable
              class="mx-auto"
              :class="tableItem.class"
              :style="tableItem.style"
            >
              <UiTableHeader>
                <UiTableRow
                  v-if="tableItem.id === 'questions'"
                  class="bg-accent/60 border border-input divide-x divide-input hover:bg-accent/60"
                >
                  <UiTableHead
                    v-for="header in tableItem.table.getHeaderGroups()?.[0]?.headers"
                    v-show="header.column.getIsVisible()"
                    :key="header.id"
                    class="h-11 py-0.5"
                  >
                    <div class="flex items-center gap-1 justify-center">
                      <BaseButton
                        v-if="header.column.getCanSort()"
                        label-class="text-sm font-semibold"
                        class="size-7"
                        variant="ghost"
                        size="icon"
                        :icon-name="header.column.getIsSorted() === 'asc'
                          ? 'mdi:sort-clock-ascending-outline'
                          : 'mdi:sort-clock-descending-outline'"
                        :icon-class="header.column.getIsSorted() ? 'text-green-400' : 'text-orange-400'"
                        @click="header.column.toggleSorting()"
                      />
                      <BaseButton
                        v-else-if="highlightStyleClasses[header.column.id]"
                        label-class="text-sm font-semibold"
                        class="size-7"
                        variant="ghost"
                        size="icon"
                        icon-name="mdi:color"
                        icon-size="1.3rem"
                        :icon-class="settings.highlightMode === header.column.id
                          ? 'text-green-400'
                          : 'text-orange-400'"
                        @click="() => {
                          if (settings.highlightMode === header.column.id) settings.highlightMode = null
                          else settings.highlightMode = header.column.id as 'status' | 'result.status'
                        }"
                      />
                      <span
                        class="table-header-size font-semibold text-foreground text-wrap text-center"
                      >
                        {{ header.column.columnDef.header }}
                      </span>
                      <component
                        :is="header.column.id === 'timeSpent' ? UiPopover : UiDropdownMenu"
                        v-if="showFiltersOnTheseColumnIds.has(header.column.id) || header.column.id === 'queId'"
                        v-bind="header.column.id === 'timeSpent'
                          ? {
                            'open': timeSpentFilterState.openPopOver,
                            'onUpdate:open': (val: boolean) => timeSpentFilterState.openPopOver = val,
                          }
                          : {}
                        "
                      >
                        <component
                          :is="header.column.id === 'timeSpent' ? UiPopoverTrigger : UiDropdownMenuTrigger"
                          as-child
                        >
                          <BaseButton
                            v-if="header.column.id === 'queId'"
                            label-class="text-sm font-semibold"
                            class="size-7"
                            variant="ghost"
                            size="icon"
                            icon-name="mdi:format-list-numbers"
                            icon-class="text-green-400"
                          />
                          <BaseButton
                            v-else
                            label-class="text-sm font-semibold"
                            class="size-7"
                            variant="ghost"
                            size="icon"
                            icon-name="mdi:filter-menu-outline"
                            icon-size="1.2rem"
                            :icon-class="{
                              'text-orange-400': true,
                              'text-green-400': header.column.id === 'timeSpent'
                                ? (timeSpentFilterMaxRange < testConfig.testDurationInSeconds || timeSpentFilterMinRange > 0)
                                : (questionsTableFilters[header.column.id]?.size || 0) !== (defaultQuestionsTableFilterState[header.column.id]?.size || 0),
                            }"
                          />
                        </component>
                        <UiPopoverContent
                          v-if="header.column.id === 'timeSpent'"
                          class="w-fit"
                        >
                          <div class="flex flex-col">
                            <span class="text-base text-center">
                              Filter by Time Spent Range<br>
                              (values are in seconds)
                            </span>
                            <BaseFloatLabel
                              class="w-full mt-6"
                              label="Minimum"
                              label-id="time_spent_filter_min"
                              label-class="start-1/2! -translate-x-1/2"
                            >
                              <BaseInputNumber
                                id="time_spent_filter_min"
                                v-model="timeSpentFilterMinRange"
                                :min="0"
                                :max="testConfig.testDurationInSeconds"
                                :step="10"
                              />
                            </BaseFloatLabel>
                            <BaseFloatLabel
                              class="w-full mt-6"
                              label="Maximum"
                              label-id="time_spent_filter_max"
                              label-class="start-1/2! -translate-x-1/2"
                            >
                              <BaseInputNumber
                                id="time_spent_filter_max"
                                v-model="timeSpentFilterMaxRange"
                                :min="0"
                                :max="testConfig.testDurationInSeconds"
                                :step="10"
                              />
                            </BaseFloatLabel>
                            <BaseButton
                              class="mt-5 max-w-42 mx-auto"
                              label="Apply Filter"
                              icon-name="mdi:filter-menu-outline"
                              @click="setTimeSpentFilterRange()"
                            />
                            <BaseButton
                              class="mt-5 max-w-42 mx-auto"
                              label="Clear Filter"
                              variant="destructive"
                              icon-name="material-symbols:delete"
                              @click="setTimeSpentFilterRange(true)"
                            />
                          </div>
                        </UiPopoverContent>
                        <UiDropdownMenuContent
                          v-else-if="header.column.id === 'queId'"
                          class="w-fit"
                        >
                          <UiDropdownMenuItem
                            v-for="t in questionsTableFilterKeyValues[header.column.id as 'queId']"
                            :key="t"
                            :disabled="settings.queNumOrder === t"
                            class="data-[disabled]:text-green-500 data-[disabled]:opacity-100"
                            @click="settings.queNumOrder = t"
                          >
                            {{ formattedLabels[t] }}
                          </UiDropdownMenuItem>
                        </UiDropdownMenuContent>
                        <UiDropdownMenuContent
                          v-else
                          class="w-fit"
                        >
                          <UiDropdownMenuCheckboxItem
                            v-for="t in questionsTableFilterKeyValues[header.column.id as keyof typeof questionsTableFilterKeyValues]"
                            :key="t"
                            :model-value="questionsTableFilters[header.column.id]?.has(t)"
                            :disabled="
                              questionsTableFilters[header.column.id]?.has(t)
                                && (questionsTableFilters[header.column.id]?.size || 0) <= 1
                            "
                            @update:model-value="v => toggleQuestionsTableFilter(header.column.id as keyof typeof questionsTableFilterKeyValues, t, v)"
                            @select.prevent
                          >
                            {{ formattedLabels[t] }}
                          </UiDropdownMenuCheckboxItem>
                          <UiDropdownMenuSeparator />

                          <UiDropdownMenuItem
                            class="justify-center"
                            @click="() => {
                              const id = header.column.id as keyof typeof questionsTableFilterKeyValues
                              questionsTableFilters[id] = new Set([...questionsTableFilterKeyValues[id]])
                              updateQuestionsTableColumnFilters()
                            }"
                            @select.prevent
                          >
                            Select All
                          </UiDropdownMenuItem>
                        </UiDropdownMenuContent>
                      </component>
                    </div>
                  </UiTableHead>
                </UiTableRow>

                <template v-else>
                  <UiTableRow
                    v-for="(headerGroup, groupIndex) in tableItem.table.getHeaderGroups()"
                    :key="headerGroup.id"
                    class="bg-accent/60 border border-input divide-x divide-input hover:bg-accent/60"
                  >
                    <template
                      v-for="header in headerGroup.headers"
                      :key="header.id"
                    >
                      <UiTableHead
                        v-if="!header.isPlaceholder && !(groupIndex === 1 && header.column.id === 'name')"
                        v-show="header.column.getIsVisible()"
                        :colspan="header.colSpan"
                        :rowspan="groupIndex === 0 && header.column.id === 'name' ? 2 : undefined"
                        class="h-8 text-foregound font-semibold py-0.5 text-center table-header-size align-middle"
                      >
                        {{
                          typeof header.column.columnDef.header === 'function'
                            ? header.column.columnDef.header(header.getContext())
                            : header.column.columnDef.header
                        }}
                      </UiTableHead>
                    </template>
                  </UiTableRow>
                </template>
              </UiTableHeader>

              <UiTableBody>
                <template v-if="tableItem.id === 'questions'">
                  <UiTableRow
                    v-for="row in tableItem.table.getRowModel().rows"
                    :key="row.original.queId"
                    class="divide-x border-x border-input divide-input"
                    :data-result="row.original.result.status"
                    :data-status="row.original.status"
                  >
                    <UiTableCell
                      v-for="cell in row.getVisibleCells()"
                      :key="cell.id"
                      class="text-center table-body-size whitespace-pre-line"
                    >
                      <div
                        v-if="cell.column.id === 'queId'"
                        class="flex items-center justify-center gap-1"
                      >
                        <BaseButton
                          :label="`${typeof cell.column.columnDef.cell === 'function'
                            ? cell.column.columnDef.cell(cell.getContext())
                            : cell.getValue()}`"
                          label-class="table-body-size"
                          title="Show Question Preview"
                          class="size-7"
                          variant="ghost"
                          @click="showQuestionPreview(row.original.queId)"
                        />
                        <Icon
                          v-show="testNotes[row.original.queId]"
                          title="Has Notes"
                          name="mdi:text-box-edit-outline"
                          class="text-green-500 text-sm"
                        />
                      </div>
                      <template v-else>
                        {{
                          typeof cell.column.columnDef.cell === 'function'
                            ? cell.column.columnDef.cell(cell.getContext())
                            : cell.getValue()
                        }}
                      </template>
                    </UiTableCell>
                  </UiTableRow>
                </template>

                <template v-else>
                  <UiTableRow
                    v-for="row in tableItem.table.getRowModel().rows"
                    :key="row.id"
                    class="border border-input divide-x divide-input"
                  >
                    <UiTableCell
                      v-for="cell in row.getVisibleCells()"
                      :key="cell.id"
                      class="text-center py-2 table-body-size"
                    >
                      {{
                        typeof cell.column.columnDef.cell === 'function'
                          ? cell.column.columnDef.cell(cell.getContext() as StatsCellContext)
                          : cell.getValue()
                      }}
                    </UiTableCell>
                  </UiTableRow>
                </template>
              </UiTableBody>
            </UiTable>
            <UiScrollBar orientation="horizontal" />
          </UiScrollArea>
        </template>

        <LazyCbtResultsQuestionPanel
          v-if="questionPreviewState.show"
          v-model="questionPreviewState.currentQueIndex"
          v-model:show-panel="questionPreviewState.show"
          :questions-to-preview="questionsToPreview"
          :all-questions="questionsData"
          :test-config="testConfig"
          :questions-numbering-order="settings.queNumOrder"
          :answer-options-format="answerOptionsFormat"
        />
      </div>
    </div>
  </div>
</template>

<style>
.table-header-size {
  font-size: calc(var(--table-header-font-size) * 1rem)
}
.table-body-size {
  font-size: calc(var(--table-body-font-size) * 1rem)
}
</style>
