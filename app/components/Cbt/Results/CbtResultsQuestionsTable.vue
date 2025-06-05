<template>
  <div>
    <!-- Filters Panel -->
    <div class="flex flex-wrap gap-4 mb-4 items-end">
      <div class="flex justify-end mb-2">
        <UiDropdownMenu>
          <UiDropdownMenuTrigger as-child>
            <UiButton variant="outline">
              Columns <ChevronDown class="ml-2 h-4 w-4" />
            </UiButton>
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent class="w-48">
            <UiDropdownMenuCheckboxItem
              v-for="column in table.getAllLeafColumns().filter(c => c.getCanHide())"
              :key="column.id"
              :model-value="column.getIsVisible()"
              @update:model-value="v => column.toggleVisibility(!!v)"
              @select.prevent
            >
              {{ column.columnDef.header || column.id }}
            </UiDropdownMenuCheckboxItem>

            <UiDropdownMenuSeparator />

            <UiDropdownMenuItem
              @click="resetColumnVisibility"
              @select.prevent
            >
              Show All Columns
            </UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </div>
    </div>

    <UiTable class="mx-auto max-w-full">
      <UiTableHeader>
        <UiTableRow class="bg-accent/60 border border-input divide-x divide-input">
          <UiTableHead
            v-for="header in table.getHeaderGroups()?.[0]?.headers"
            v-show="header.column.getIsVisible()"
            :key="header.id"
          >
            <div class="flex items-center gap-1 justify-center">
              <span
                class="text-sm font-semibold text-foreground"
              >
                {{ header.column.columnDef.header }}
              </span>
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
              <UiDropdownMenu v-if="filters[header.column.id as keyof typeof keyValues]">
                <UiDropdownMenuTrigger as-child>
                  <BaseButton
                    label-class="text-sm font-semibold"
                    class="size-7"
                    variant="ghost"
                    size="icon"
                    icon-name="mdi:filter-menu-outline"
                    icon-size="1.1rem"
                    :icon-class="
                      (filters[header.column.id]?.size || 0) === (defaultFilterState[header.column.id]?.size || 0)
                        ? 'text-orange-400'
                        : 'text-green-400'
                    "
                  />
                </UiDropdownMenuTrigger>
                <UiDropdownMenuContent class="w-fit">
                  <UiDropdownMenuCheckboxItem
                    v-for="t in keyValues[header.column.id as keyof typeof keyValues]"
                    :key="t"
                    :model-value="filters[header.column.id]?.has(t)"
                    :disabled="
                      filters[header.column.id]?.has(t)
                        && (filters[header.column.id]?.size || 0) <= 1
                    "
                    @update:model-value="v => toggleFilter(header.column.id as keyof typeof keyValues, t, v)"
                    @select.prevent
                  >
                    {{ formattedLabels[t] }}
                  </UiDropdownMenuCheckboxItem>
                  <UiDropdownMenuSeparator />

                  <UiDropdownMenuItem
                    class="justify-center"
                    @click="() => {
                      const id = header.column.id as keyof typeof keyValues
                      filters[id] = new Set([...keyValues[id]])
                      updateColumnFilters()
                    }"
                    @select.prevent
                  >
                    Select All
                  </UiDropdownMenuItem>
                </UiDropdownMenuContent>
              </UiDropdownMenu>
            </div>
          </UiTableHead>
        </UiTableRow>
      </UiTableHeader>
      <UiTableBody class="border border-input border-t-0">
        <UiTableRow
          v-for="row in table.getRowModel().rows"
          :key="row.original.queId"
          class="divide-x divide-input border-input"
        >
          <UiTableCell
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            class="text-center"
          >
            {{ typeof cell.column.columnDef.cell === 'function'
              ? cell.column.columnDef.cell(cell.getContext())
              : cell.getValue() }}
          </UiTableCell>
        </UiTableRow>
      </UiTableBody>
    </UiTable>
  </div>
</template>

<script lang="ts" setup>
import {
  useVueTable,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
} from '@tanstack/vue-table'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  questionsData: TestResultDataQuestion[]
}>()

const statusList = ['answered', 'markedAnswered', 'notAnswered', 'marked', 'notVisited'] as const
const resultStatusList = ['correct', 'partial', 'incorrect', 'notAnswered', 'bonus', 'dropped'] as const
const questionTypes = ['mcq', 'msq', 'nat'] as const

const keyValues = {
  'status': statusList,
  'result.status': resultStatusList,
  'type': questionTypes,
}

const formattedQuestionStatus = {
  answered: 'Answered',
  markedAnswered: 'MFR & Answered',
  notAnswered: 'Not Answered',
  marked: 'Marked for Review',
  notVisited: 'Not Visited',
}

const formattedResultStatus = {
  correct: 'Correct',
  incorrect: 'Incorrect',
  partial: 'Partially Correct',
  notAnswered: 'Not Answered',
  bonus: 'Bonus',
  dropped: 'Dropped',
}

const formattedLabels = {
  ...formattedResultStatus,
  ...formattedQuestionStatus,
  mcq: 'MCQ',
  msq: 'MSQ',
  nat: 'NAT',
}

const defaultFilterState: Record<string, Set<string>> = {
  'status': new Set([...statusList] as string[]),
  'result.status': new Set([...resultStatusList] as string[]),
  'type': new Set([...questionTypes] as string[]),
}

const filters = reactive({
  ...structuredClone(defaultFilterState),
})

const questionsData = computed(() => props.questionsData)

const sortingState = ref<SortingState>([])

const columnHelper = createColumnHelper<TestResultDataQuestion>()

const columns = [
  columnHelper.accessor('subject', {
    id: 'subject',
    header: 'Subject',
    enableSorting: false,
  }),
  columnHelper.accessor('section', {
    id: 'section',
    header: 'Section',
    enableSorting: false,
  }),
  columnHelper.accessor('oriQueId', {
    id: 'queNum',
    header: 'Q. No.',
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
    cell: info => formattedResultStatus[info.getValue()],
    filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
    enableSorting: false,
  }),
  columnHelper.accessor('type', {
    id: 'type',
    header: 'Type',
    cell: info => info.getValue().toUpperCase(),
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
    enableSorting: true,
    sortingFn: 'basic',
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: 'Status',
    cell: info => formattedQuestionStatus[info.getValue()],
    filterFn: (row, columnId, value) => value.includes(row.getValue(columnId)),
    enableSorting: false,
  }),
]

const table = useVueTable({
  data: questionsData,
  columns,
  state: {
    get sorting() { return sortingState.value },
  },
  initialState: {
    columnFilters: Object.entries(filters).map(([id, value]) => ({ id, value: [...value] })),
  },
  onSortingChange: (updater) => {
    sortingState.value = typeof updater === 'function' ? updater(sortingState.value) : updater
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  enableSortingRemoval: true,
})

function toggleFilter(key: keyof typeof filters, val: string, enabled: boolean) {
  const filter = filters[key]
  if (!filter) return

  if (enabled) filter.add(val)
  else filter.delete(val)
  updateColumnFilters()
}

function updateColumnFilters() {
  table.setColumnFilters(
    Object.entries(filters)
      .filter(([, v]) => v.size)
      .map(([id, value]) => ({ id, value: [...value] })),
  )
}

function resetColumnVisibility() {
  table.getAllColumns().forEach((c) => {
    if (c.getCanHide()) c.toggleVisibility(true)
  })
}
</script>
