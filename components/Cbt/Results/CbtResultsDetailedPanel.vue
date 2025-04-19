<template>
  <div
    v-if="loadDataNow"
    class="flex flex-col w-full grow pb-50"
  >
    <Tabs
      :value="currentSelectedState.subject"
      scrollable
      @update:value="subjectChangeHandler"
    >
      <TabList
        pt:nextButton:class="shadow-[0px_0px_5px_8px]!"
        pt:prevButton:class="shadow-[0px_0px_5px_8px]!"
      >
        <Tab
          v-if="Object.keys(testOverallStats ?? {}).length > 0"
          :value="TEST_OVERALL"
        >
          Test Overall
        </Tab>
        <Tab
          v-for="(subject, idx) in Object.keys(testResultData)"
          :key="idx"
          :value="subject"
        >
          {{ subject }}
        </Tab>
      </TabList>
    </Tabs>
    <Tabs
      :value="selectedKeys[currentSelectedState.subject]"
      :class="{
        'sticky top-0 z-20': settings.freezeMode === 'sectionHeader',
      }"
      scrollable
      @update:value="sectionChangeHandler"
    >
      <TabList
        pt:nextButton:class="shadow-[0px_0px_5px_8px]!"
        pt:prevButton:class="shadow-[0px_0px_5px_8px]!"
      >
        <Tab
          v-if="
            (currentSelectedState.subject !== TEST_OVERALL)
              && Object.keys(subjectsOverallStats[currentSelectedState.subject] ?? {}).length > 0"
          :value="currentSelectedState.subject + OVERALL"
        >
          {{ currentSelectedState.subject + ' Overall' }}
        </Tab>
        <Tab
          v-for="(section, index) in currentSectionTabs"
          :key="index"
          :value="section"
        >
          {{ section }}
        </Tab>
      </TabList>
    </Tabs>
    <div
      v-show="currentSelectedState.subject !== TEST_OVERALL && !currentSelectedState.section.endsWith(OVERALL)"
      class="px-4 pt-3 pb-15 flex flex-col gap-10 text-nowrap max-w-full overflow-auto"
    >
      <table class="table-auto border w-full border-collapse text-lg pb-5">
        <thead class="bg-gray-300 dark:bg-gray-800">
          <tr
            class="border-b divide-x text-center"
          >
            <th
              v-for="(colName, index) in questionTableRow"
              :key="index"
              class="px-2 py-1.5"
            >
              {{ colName }}
            </th>
          </tr>
        </thead>
        <tbody
          v-for="(sectionData, sectionName) in reduceTestResultDataToListOfSectionData(testResultData)"
          v-show="currentSelectedState.section === sectionName"
          :key="sectionName"
          class="dark:divide-gray-500 divide-y"
        >
          <tr
            v-for="question in Object.values(sectionData)"
            :key="question.queId"
            class="divide-x dark:divide-gray-500 text-center [&>td]:px-2 [&>td]:py-1.5"
          >
            <td>{{ question.queId }}</td>
            <td>{{ question.result.marks }}</td>
            <td>{{ formattedResultStatus[question.result.status] }}</td>
            <td>{{ question.type.toUpperCase() }}</td>
            <td>{{ utilStringifyAnswer(question.answer, ', ', true) }}</td>
            <td>{{ utilStringifyAnswer(question.result.correctAnswer, ', ', true) }}</td>
            <td>{{ utilSecondsToTime(question.timeSpent, 'mmm:ss') }}</td>
            <td>{{ formattedQuestionStatus[question.status] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <h3 class="text-lg font-semibold text-center mt-5">
      Questions Status Summary
    </h3>
    <div
      class="px-4 pt-3 pb-15 flex flex-col gap-10 text-nowrap max-w-full overflow-auto"
    >
      <table class="table-auto border w-full border-collapse text-lg text-center">
        <thead class="bg-gray-300 dark:bg-gray-800">
          <tr
            class="border-b divide-x"
          >
            <th
              v-show="currentSelectedState.subject === TEST_OVERALL || (currentSelectedState.section.endsWith(OVERALL))"
              rowspan="2"
              class="px-2 py-1.5"
            >
              {{ currentSelectedState.subject === TEST_OVERALL ? 'Subject Name' : 'Section Name' }}
            </th>
            <th
              v-for="status in (statusListWithTotal as (keyof Stats['status'])[])"
              :key="status"
              colspan="3"
              class="px-2 py-1.5"
            >
              {{ formattedQuestionStatus[status as QuestionStatus] ?? 'Total' }}
            </th>
          </tr>
          <tr class="border-b divide-x text-base">
            <template
              v-for="status in statusListWithTotal"
              :key="status"
            >
              <th
                v-for="subHeader in ['Count', 'Time Spent', 'Avg. Time']"
                :key="subHeader"
                class="px-2 py-1.5"
              >
                {{ subHeader }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody
          v-for="(subjectData, subject) in testStats"
          v-show="currentSelectedState.subject === subject"
          :key="subject"
          class="dark:divide-gray-500 border"
          :class="{
            'divide-y': currentSelectedState.section.endsWith(OVERALL),
          }"
        >
          <tr
            v-for="(stats, section) in subjectData"
            v-show="currentSelectedState.section === section || currentSelectedState.section === subject + OVERALL"
            :key="section"
            class="divide-x dark:divide-gray-500 text-center [&>td]:px-2 [&>td]:py-1.5"
          >
            <td v-show="currentSelectedState.section === subject + OVERALL">
              {{ section }}
            </td>
            <template
              v-for="status in (statusListWithTotal as (keyof Stats['status'])[])"
              :key="status"
            >
              <td>{{ stats.status[status].count }}</td>
              <td>{{ utilSecondsToTime(stats.status[status].totalTime, 'mmm:ss', true) }}</td>
              <td>{{ utilSecondsToTime(stats.status[status].avgTime, 'mmm:ss', true) }}</td>
            </template>
          </tr>
        </tbody>
        <tfoot
          class="dark:divide-gray-500"
          :class="{
            'divide-y-excluding-last-two': currentSelectedState.subject === TEST_OVERALL,
          }"
        >
          <tr
            v-for="(stats, subject) in subjectsOverallStats"
            v-show="(currentSelectedState.section === subject + OVERALL) || currentSelectedState.subject === TEST_OVERALL"
            :key="subject"
            class="divide-x dark:divide-gray-500 text-center [&>td]:px-2 [&>td]:py-1.5"
          >
            <td>
              {{
                currentSelectedState.subject === TEST_OVERALL
                  ? subject
                  : subject + OVERALL
              }}
            </td>
            <template
              v-for="status in (statusListWithTotal as (keyof Stats['status'])[])"
              :key="status"
            >
              <td>{{ stats.status[status].count }}</td>
              <td>{{ utilSecondsToTime(stats.status[status].totalTime, 'mmm:ss', true) }}</td>
              <td>{{ utilSecondsToTime(stats.status[status].avgTime, 'mmm:ss', true) }}</td>
            </template>
          </tr>
          <tr
            v-show="currentSelectedState.subject === TEST_OVERALL"
            class="border divide-x dark:divide-gray-500 text-center [&>td]:px-2 [&>td]:py-1.5"
          >
            <td>
              {{ TEST_OVERALL }}
            </td>
            <template
              v-for="status in (statusListWithTotal as (keyof Stats['status'])[])"
              :key="status"
            >
              <td>{{ testOverallStats?.status[status].count }}</td>
              <td>{{ utilSecondsToTime(testOverallStats?.status[status].totalTime || 0, 'mmm:ss', true) }}</td>
              <td>{{ utilSecondsToTime(testOverallStats?.status[status].avgTime || 0, 'mmm:ss', true) }}</td>
            </template>
          </tr>
        </tfoot>
      </table>
    </div>
    <h3 class="text-lg font-semibold text-center mt-5">
      Results Summary
    </h3>
    <div
      class="px-4 pt-3 pb-15 flex flex-col gap-10 text-nowrap max-w-full overflow-auto"
    >
      <table class="table-auto border w-full border-collapse text-lg text-center">
        <thead class="bg-gray-300 dark:bg-gray-800">
          <tr
            class="border-b divide-x"
          >
            <th
              v-show="currentSelectedState.subject === TEST_OVERALL || (currentSelectedState.section.endsWith(OVERALL))"
              rowspan="2"
              class="px-2 py-1.5"
            >
              {{ currentSelectedState.subject === TEST_OVERALL ? 'Subject Name' : 'Section Name' }}
            </th>
            <th
              v-for="status in (resultStatusListWithTotal as (keyof Stats['result'])[])"
              :key="status"
              :colspan="status === 'total' ? 4 : 3"
              class="px-2 py-1.5"
            >
              {{ formattedResultStatus[status as QuestionResult['status']]?? 'Total' }}
            </th>
          </tr>
          <tr class="border-b divide-x text-base">
            <template
              v-for="status in resultStatusListWithTotal"
              :key="status"
            >
              <th
                v-for="subHeader in (status === 'total' ? ['Count', 'Accuracy', 'Time Spent', 'Avg. Time'] : ['Count', 'Time Spent', 'Avg. Time'])"
                :key="subHeader"
                class="px-2 py-1.5"
              >
                {{ subHeader }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody
          v-for="(subjectData, subject) in testStats"
          v-show="currentSelectedState.subject === subject"
          :key="subject"
          class="dark:divide-gray-500 border"
          :class="{
            'divide-y': currentSelectedState.section.endsWith(OVERALL),
          }"
        >
          <tr
            v-for="(stats, section) in subjectData"
            v-show="currentSelectedState.section === section || currentSelectedState.section === subject + OVERALL"
            :key="section"
            class="divide-x dark:divide-gray-500 text-center [&>td]:px-2 [&>td]:py-1.5"
          >
            <td v-show="currentSelectedState.section === subject + OVERALL">
              {{ section }}
            </td>
            <template
              v-for="status in (resultStatusListWithTotal as (keyof Stats['result'])[])"
              :key="status"
            >
              <td>{{ stats.result[status].count }}</td>
              <td v-if="status === 'total'">
                {{ stats.accuracy.percent }}%
              </td>
              <td>{{ utilSecondsToTime(stats.result[status].totalTime, 'mmm:ss', true) }}</td>
              <td>{{ utilSecondsToTime(stats.result[status].avgTime, 'mmm:ss', true) }}</td>
            </template>
          </tr>
        </tbody>
        <tfoot
          class="dark:divide-gray-500"
          :class="{
            'divide-y-excluding-last-two': currentSelectedState.subject === TEST_OVERALL,
          }"
        >
          <tr
            v-for="(stats, subject) in subjectsOverallStats"
            v-show="(currentSelectedState.section === subject + OVERALL) || currentSelectedState.subject === TEST_OVERALL"
            :key="subject"
            class="divide-x dark:divide-gray-500 text-center [&>td]:px-2 [&>td]:py-1.5"
          >
            <td>
              {{
                currentSelectedState.subject === TEST_OVERALL
                  ? subject
                  : subject + OVERALL
              }}
            </td>
            <template
              v-for="status in (resultStatusListWithTotal as (keyof Stats['result'])[])"
              :key="status"
            >
              <td>{{ stats.result[status].count }}</td>
              <td v-if="status === 'total'">
                {{ stats.accuracy.percent }}%
              </td>
              <td>{{ utilSecondsToTime(stats.result[status].totalTime, 'mmm:ss', true) }}</td>
              <td>{{ utilSecondsToTime(stats.result[status].avgTime, 'mmm:ss', true) }}</td>
            </template>
          </tr>
          <tr
            v-show="currentSelectedState.subject === TEST_OVERALL"
            class="divide-x border dark:divide-gray-500 text-center [&>td]:px-2 [&>td]:py-1.5"
          >
            <td>
              {{ TEST_OVERALL }}
            </td>
            <template
              v-for="status in (resultStatusListWithTotal as (keyof Stats['result'])[])"
              :key="status"
            >
              <td>{{ testOverallStats?.result[status].count }}</td>
              <td v-if="status === 'total'">
                {{ testOverallStats?.accuracy.percent }}%
              </td>
              <td>{{ utilSecondsToTime(testOverallStats?.result[status].totalTime || 0, 'mmm:ss', true) }}</td>
              <td>{{ utilSecondsToTime(testOverallStats?.result[status].avgTime || 0, 'mmm:ss', true) }}</td>
            </template>
          </tr>
        </tfoot>
      </table>
    </div>
    <h3 class="text-lg font-semibold text-center mt-5">
      Marks Summary
    </h3>
    <div
      class="px-4 pt-3 flex flex-col gap-10 text-nowrap max-w-full overflow-auto"
    >
      <table class="table-auto border w-full border-collapse text-lg text-center">
        <thead class="bg-gray-300 dark:bg-gray-800">
          <tr
            class="border-b divide-x"
          >
            <th
              v-show="currentSelectedState.subject === TEST_OVERALL || (currentSelectedState.section.endsWith(OVERALL))"
              rowspan="2"
              class="px-2 py-1.5"
            >
              {{ currentSelectedState.subject === TEST_OVERALL ? 'Subject Name' : 'Section Name' }}
            </th>
            <th
              v-for="status in (marksStatusListWithTotal as (keyof Stats['status'])[])"
              :key="status"
              :colspan="status === 'total' ? 4 : 3"
              class="px-2 py-1.5"
            >
              {{ utilKeyToLabel(status) }}
            </th>
          </tr>
          <tr class="border-b divide-x text-base">
            <template
              v-for="status in marksStatusListWithTotal"
              :key="status"
            >
              <th
                v-for="subHeader in (status === 'total' ? ['Marks', 'Max Marks', 'Time Spent', 'Avg. Time'] : ['Marks', 'Time Spent', 'Avg. Time'])"
                :key="subHeader"
                class="px-2 py-1.5"
              >
                {{ subHeader }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody
          v-for="(subjectData, subject) in testStats"
          v-show="currentSelectedState.subject === subject"
          :key="subject"
          class="dark:divide-gray-500 border"
          :class="{
            'divide-y': currentSelectedState.section.endsWith(OVERALL),
          }"
        >
          <tr
            v-for="(stats, section) in subjectData"
            v-show="currentSelectedState.section === section || currentSelectedState.section === subject + OVERALL"
            :key="section"
            class="divide-x dark:divide-gray-500 text-center [&>td]:px-2 [&>td]:py-1.5"
          >
            <td v-show="currentSelectedState.section === subject + OVERALL">
              {{ section }}
            </td>
            <template
              v-for="status in (marksStatusListWithTotal as (keyof Stats['marks'])[])"
              :key="status"
            >
              <td>{{ stats.marks[status].marks }}</td>
              <td v-if="status === 'total'">
                {{ stats.marks[status].maxMarks }}
              </td>
              <td>{{ utilSecondsToTime(stats.marks[status].totalTime, 'mmm:ss', true) }}</td>
              <td>{{ utilSecondsToTime(stats.marks[status].avgTime, 'mmm:ss', true) }}</td>
            </template>
          </tr>
        </tbody>
        <tfoot
          class="dark:divide-gray-500"
          :class="{
            'divide-y-excluding-last-two': currentSelectedState.subject === TEST_OVERALL,
          }"
        >
          <tr
            v-for="(stats, subject) in subjectsOverallStats"
            v-show="(currentSelectedState.section === subject + OVERALL) || currentSelectedState.subject === TEST_OVERALL"
            :key="subject"
            class="divide-x dark:divide-gray-500 text-center [&>td]:px-2 [&>td]:py-1.5"
          >
            <td>
              {{
                currentSelectedState.subject === TEST_OVERALL
                  ? subject
                  : subject + OVERALL
              }}
            </td>
            <template
              v-for="status in (marksStatusListWithTotal as (keyof Stats['marks'])[])"
              :key="status"
            >
              <td>{{ stats.marks[status].marks }}</td>
              <td v-if="status === 'total'">
                {{ stats.marks[status].maxMarks }}
              </td>
              <td>{{ utilSecondsToTime(stats.marks[status].totalTime, 'mmm:ss', true) }}</td>
              <td>{{ utilSecondsToTime(stats.marks[status].avgTime, 'mmm:ss', true) }}</td>
            </template>
          </tr>
          <tr
            v-show="currentSelectedState.subject === TEST_OVERALL"
            class="divide-x border dark:divide-gray-500 text-center [&>td]:px-2 [&>td]:py-1.5"
          >
            <td>
              {{ TEST_OVERALL }}
            </td>
            <template
              v-for="status in (marksStatusListWithTotal as (keyof Stats['marks'])[])"
              :key="status"
            >
              <td>{{ testOverallStats?.marks[status].marks }}</td>
              <td v-if="status === 'total'">
                {{ testOverallStats?.marks[status].maxMarks }}
              </td>
              <td>{{ utilSecondsToTime(testOverallStats?.marks[status].totalTime || 0, 'mmm:ss', true) }}</td>
              <td>{{ utilSecondsToTime(testOverallStats?.marks[status].avgTime || 0, 'mmm:ss', true) }}</td>
            </template>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Tabs from '~/src/volt/Tabs.vue'
import TabList from '~/src/volt/TabList.vue'
import Tab from '~/src/volt/Tab.vue'
import type { QuestionResult, QuestionStatus, TestResultData, TestResultDataQuestion, TestResultDataSection, TestResultDataSubject } from '~/src/types'

interface SelectedSectionKeys {
  [subject: string]: string
}

interface StatsItem {
  count: number
  avgTime: number
  totalTime: number
}

interface StatusStats {
  answered: StatsItem
  notAnswered: StatsItem
  marked: StatsItem
  markedAnswered: StatsItem
  notVisited: StatsItem
  total: StatsItem
}

interface ResultStats {
  correct: StatsItem
  incorrect: StatsItem
  partial: StatsItem
  notAnswered: StatsItem
  bonus: StatsItem
  dropped: StatsItem
  total: StatsItem
}

interface MarksStatsItem {
  marks: number
  avgTime: number
  totalTime: number
}

interface MarksStats {
  positive: MarksStatsItem
  negative: MarksStatsItem
  bonus: MarksStatsItem
  dropped: MarksStatsItem
  total: MarksStatsItem & { maxMarks: number }
}

interface AccuracyStats {
  count: number
  total: number
  percent: number
}

interface Stats {
  status: StatusStats
  result: ResultStats
  marks: MarksStats
  accuracy: AccuracyStats
}

interface TestStats {
  [subject: string]: {
    [section: string]: Stats
  }
}

interface SubjectsOverallStats {
  [subject: string]: Stats
}

interface Settings {
  freezeMode: null
    | 'sectionHeader'
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

const statusList = ['answered', 'markedAnswered', 'notAnswered', 'marked', 'notVisited']
const statusListWithTotal = statusList.concat('total')
const resultStatusList = ['correct', 'partial', 'incorrect', 'notAnswered', 'bonus', 'dropped']
const resultStatusListWithTotal = resultStatusList.concat('total')
const marksStatusList = ['positive', 'negative', 'bonus', 'dropped']
const marksStatusListWithTotal = marksStatusList.concat('total')
const TEST_OVERALL = 'Test Overall'
const OVERALL = ' Overall'

const questionTableRow = ['Q. No.', 'Marks', 'Result', 'Type', 'Your Answer', 'Correct Answer', 'Time Spent', 'Status']
const settings = reactive<Settings>({
  freezeMode: 'sectionHeader',
})

const { testResultData, waitUntil } = defineProps<{
  testResultData: TestResultData
  testResultQuestionsData: Record<number | string, TestResultDataQuestion>
  waitUntil: boolean
}>()

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

const currentResultsID = useCbtResultsCurrentID()

// to store previously selected sections,
// so that this can be used to get user back to the section they left for that particular subject
const selectedKeys = ref<SelectedSectionKeys>({})

// flag being used to indicate whether to load/reload for v-if of this component root
const loadDataNow = shallowRef(false)

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
// so that tables can be recalculated and rendered
watch(
  [currentResultsID, testResultData],
  async ([newID, _]) => {
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
    return Object.keys(testResultData[subject])
  }
  return []
})

async function reloadTestData(isFirst: boolean = false) {
  loadDataNow.value = false
  if (!isFirst) {
    await nextTick()
  }

  const newSelectedKeys: SelectedSectionKeys = {}
  for (const subject of Object.keys(testResultData)) {
    newSelectedKeys[subject] = subject + OVERALL
  }
  selectedKeys.value = newSelectedKeys

  const newTestStats: TestStats = {}
  const newSubjectsOverallStats: SubjectsOverallStats = {}

  for (const [subject, subjectData] of Object.entries(testResultData)) {
    newTestStats[subject] ??= {}

    for (const [section, sectionData] of Object.entries(subjectData)) {
      const sectionStats = getSectionStats(sectionData)

      newTestStats[subject][section] = sectionStats
    }

    if (Object.keys(newTestStats[subject]).length > 1) {
      newSubjectsOverallStats[subject] = getStatsTotal(Object.values(newTestStats[subject]))
    }
    else {
      const firstSection = Object.keys(newTestStats[subject])[0]
      selectedKeys.value[subject] = firstSection
    }
  }

  testStats.value = newTestStats
  subjectsOverallStats.value = newSubjectsOverallStats

  if (Object.keys(newSubjectsOverallStats).length > 1) {
    testOverallStats.value = getStatsTotal(Object.values(newSubjectsOverallStats))
  }
  else {
    const firstSubject = Object.keys(newSubjectsOverallStats)[0]
    currentSelectedState.subject = firstSubject
    currentSelectedState.section = selectedKeys.value[firstSubject]
  }

  currentLoadState.loadedResultsID = currentResultsID.value
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

  const emptyMarksStatsItemWithMax = (): MarksStatsItem & { maxMarks: number } => ({
    ...emptyMarksStatsItem(),
    maxMarks: 0,
  })

  const status = {} as StatusStats
  for (const key of statusListWithTotal) {
    status[key as keyof StatusStats] = emptyStatsItem()
  }

  const result = {} as ResultStats
  for (const key of resultStatusListWithTotal) {
    result[key as keyof ResultStats] = emptyStatsItem()
  }

  const marks = {} as MarksStats
  for (const key of marksStatusListWithTotal) {
    if (key === 'total') {
      marks.total = emptyMarksStatsItemWithMax()
      continue
    }

    marks[key as Exclude<keyof MarksStats, 'total'>] = emptyMarksStatsItem()
  }

  return { status, result, marks }
}

function getSectionStats(sectionData: TestResultDataSection): Stats {
  const { marks: questionMarks, status: questionStatus, result: questionResult } = createEmptyBaseForStats()

  let maxMarks = 0
  let accuracyCount = 0

  for (const questionData of Object.values(sectionData)) {
    const { result, timeSpent, totalOptions } = questionData
    const { marks, status } = result

    questionStatus[questionData.status].count++
    questionStatus[questionData.status].totalTime += timeSpent
    questionResult[status].count++
    questionResult[status].totalTime += timeSpent

    maxMarks += questionData.marks.cm

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

    if (status === 'correct') {
      accuracyCount++
    }
    else if (status === 'partial') {
      const partialCount = marks / (questionData.marks.pm || 1)
      accuracyCount += partialCount / (totalOptions || 4)
    }
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
    if (k === 'total') marksSum[k].maxMarks = totalMaxMarks
  }

  const percent = Math.round((totalAccuracyCount / (totalAccuracyDenominator || 1)) * 10000) / 100

  return {
    status: statusSum,
    result: resultSum,
    marks: marksSum,
    accuracy: {
      count: totalAccuracyCount,
      total: totalAccuracyDenominator,
      percent,
    },
  }
}

const sectionChangeHandler = (section: string) => {
  selectedKeys.value[currentSelectedState.subject] = section
  currentSelectedState.section = section
}

const subjectChangeHandler = (subject: string) => {
  currentSelectedState.subject = subject
  if (subject === TEST_OVERALL) {
    currentSelectedState.section = ''
  }
  else {
    currentSelectedState.section = selectedKeys.value[subject] ?? subject + OVERALL
  }
}

const reduceTestResultDataToListOfSectionData = (data: TestResultData): TestResultDataSubject => {
  const allSectionsData: TestResultDataSubject = {}
  for (const subjectData of Object.values(data)) {
    for (const [section, sectionData] of Object.entries(subjectData)) {
      allSectionsData[section] = sectionData
    }
  }

  return allSectionsData
}
</script>

<style>
.divide-y-excluding-last-two {
  :where(& > :nth-last-child(n+3)) {
    --tw-divide-y-reverse: 0;
    border-bottom-style: var(--tw-border-style);
    border-top-style: var(--tw-border-style);
    border-top-width: calc(1px * var(--tw-divide-y-reverse));
    border-bottom-width: calc(1px * calc(1 - var(--tw-divide-y-reverse)));
  }
}
</style>
