<template>
  <div class="flex flex-col w-full grow">
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
            v-if="Object.keys(testOverallStats ?? {}).length > 1"
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
        :value="selectedTabs[currentSelectedState.subject]"
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
                && Object.keys(subjectsOverallStats[currentSelectedState.subject] ?? {}).length > 1"
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
        class="px-4 pt-3 pb-15 flex flex-col gap-5 text-nowrap max-w-full overflow-auto"
      >
        <div
          v-show="currentSelectedState.subject === TEST_OVERALL || currentSelectedState.section.endsWith(OVERALL)"
          class="flex flex-row gap-3 justify-center mt-3 items-center"
        >
          <h3 class="text-lg font-semibold text-center">
            {{ showOverallQuestions ? 'Hide' : 'Show' }}&nbsp;
            {{
              currentSelectedState.subject === TEST_OVERALL
                ? 'Test Questions'
                : currentSelectedState.subject + ' Questions'
            }}
          </h3>
          <BaseButton
            class="w-7! h-7! p-0!"
            rounded
            raised
            @click="showOverallQuestions = !showOverallQuestions"
          >
            <template #icon>
              <Icon
                :name="showOverallQuestions ? 'mdi:expand-less' : 'mdi:expand-more'"
                class="text-2xl"
              />
            </template>
          </BaseButton>
        </div>
        <table
          v-show="showOverallQuestions || (currentSelectedState.subject !== TEST_OVERALL && !currentSelectedState.section.endsWith(OVERALL))"
          class="table-auto border w-full border-collapse text-lg pb-5"
          :class="highlightModeClasses + questionStatusFilterClasses + questionResultFilterClasses"
        >
          <thead class="bg-gray-300 dark:bg-gray-800">
            <tr class="border-b divide-x text-center">
              <th
                v-show="currentSelectedState.subject === TEST_OVERALL"
                class="px-2 py-1.5"
              >
                Subject
              </th>
              <th
                v-show="currentSelectedState.subject === TEST_OVERALL || currentSelectedState.section.endsWith(OVERALL)"
                class="px-2 py-1.5"
              >
                Section
              </th>
              <th class="px-2 py-1.5">
                <div class="flex items-center gap-1 justify-center">
                  Q. No.
                  <BaseButton
                    variant="text"
                    rounded
                    raised
                    @click="(e) => popOverQNumOrderElem.show(e)"
                  >
                    <template #icon>
                      <Icon
                        name="mdi:format-list-numbers"
                        class="text-2xl"
                      />
                    </template>
                  </BaseButton>
                </div>
              </th>
              <th class="px-2 py-1.5">
                Marks
              </th>
              <th class="px-2 py-1.5">
                <div class="flex items-center gap-1 justify-center">
                  <BaseButton
                    variant="text"
                    rounded
                    raised
                    @click="() => {
                      if (settings.highlightMode === 'result') settings.highlightMode = null
                      else settings.highlightMode = 'result'
                    }"
                  >
                    <template #icon>
                      <Icon
                        name="mdi:color"
                        class="text-2xl"
                        :class="settings.highlightMode === 'result' ? 'text-green-400' : 'text-gray-300'"
                      />
                    </template>
                  </BaseButton>
                  Result
                  <BaseButton
                    variant="text"
                    severity="warn"
                    rounded
                    raised
                    @click="(e) => showFilterPopOverMenu('result', e)"
                  >
                    <template #icon>
                      <Icon
                        name="mdi:filter-menu-outline"
                        class="text-2xl"
                      />
                    </template>
                  </BaseButton>
                </div>
              </th>
              <th class="px-2 py-1.5">
                Type
              </th>
              <th class="px-2 py-1.5">
                Your Answer
              </th>
              <th class="px-2 py-1.5">
                Correct Answer
              </th>
              <th class="px-2 py-1.5">
                <div class="flex items-center gap-1 justify-center">
                  <BaseButton
                    variant="text"
                    :title="settings.sortByTimeSpent === null
                      ? 'sort by descending order'
                      : (
                        settings.sortByTimeSpent === 'descending'
                          ? 'sort by ascending order'
                          : 'remove sort'
                      )"
                    rounded
                    raised
                    @click="() => {
                      const sortByTimeSpent = settings.sortByTimeSpent
                      switch (sortByTimeSpent) {
                      case null:
                        settings.sortByTimeSpent = 'descending'
                        break;
                      case 'descending':
                        settings.sortByTimeSpent = 'ascending'
                        break;
                      default:
                        settings.sortByTimeSpent = null
                        break;
                      }
                    }"
                  >
                    <template #icon>
                      <Icon
                        :name="settings.sortByTimeSpent === 'ascending'
                          ? 'mdi:sort-clock-ascending-outline'
                          : 'mdi:sort-clock-descending-outline'"
                        class="text-2xl"
                        :class="settings.sortByTimeSpent === null
                          ? 'text-gray-300'
                          : 'text-green-400'"
                      />
                    </template>
                  </BaseButton>
                  Time Spent
                  <BaseButton
                    variant="text"
                    severity="warn"
                    rounded
                    raised
                    @click="(e) => showFilterPopOverMenu('timeSpent', e)"
                  >
                    <template #icon>
                      <Icon
                        name="mdi:filter-menu-outline"
                        class="text-2xl"
                      />
                    </template>
                  </BaseButton>
                </div>
              </th>
              <th class="px-2 py-1.5">
                <div class="flex items-center gap-1 justify-center">
                  <BaseButton
                    variant="text"
                    rounded
                    raised
                    @click="() => {
                      if (settings.highlightMode === 'status') settings.highlightMode = null
                      else settings.highlightMode = 'status'
                    }"
                  >
                    <template #icon>
                      <Icon
                        name="mdi:color"
                        class="text-2xl"
                        :class="settings.highlightMode === 'status' ? 'text-green-400' : 'text-gray-300'"
                      />
                    </template>
                  </BaseButton>
                  Status
                  <BaseButton
                    variant="text"
                    severity="warn"
                    rounded
                    raised
                    @click="(e) => showFilterPopOverMenu('status', e)"
                  >
                    <template #icon>
                      <Icon
                        name="mdi:filter-menu-outline"
                        class="text-2xl"
                      />
                    </template>
                  </BaseButton>
                </div>
              </th>
            </tr>
          </thead>
          <tbody
            class="dark:divide-gray-500"
          >
            <tr
              v-for="question in testQuestions"
              v-show="
                (
                  question.timeSpent >= timeSpentFilterMinRange
                  && question.timeSpent <= timeSpentFilterMaxRange
                ) && (
                  question.section === currentSelectedState.section
                  || (
                    showOverallQuestions
                    && (
                      currentSelectedState.subject === TEST_OVERALL
                      || (currentSelectedState.section.endsWith(OVERALL) && question.subject === currentSelectedState.subject)
                    )
                  )
                )"
              :key="question.queId"
              class="divide-x border-t dark:border-gray-500 dark:divide-gray-500 text-center [&>td]:px-2 [&>td]:py-1.5"
              :data-status="question.status"
              :data-result="question.result.status"
            >
              <td v-show="currentSelectedState.subject === TEST_OVERALL">
                {{ question.subject }}
              </td>
              <td
                v-show="currentSelectedState.subject === TEST_OVERALL
                  || (
                    currentSelectedState.subject === question.subject && currentSelectedState.section.endsWith(OVERALL)
                  )"
              >
                {{ question.section }}
              </td>
              <td>
                <div class="flex items-center justify-items gap-4">
                  <BaseButton
                    variant="text"
                    rounded
                    raised
                    title="Show Question Preview"
                    @click="showQuestionPreview(question.queId)"
                  >
                    <template #icon>
                      <Icon
                        name="mdi:pageview"
                        class="text-2xl"
                      />
                    </template>
                  </BaseButton>
                  <span>
                    {{ questionsNumberingOrder === 'oriQueId'
                      ? question.oriQueId
                      : (
                        questionsNumberingOrder === 'secQueId'
                          ? question.secQueId
                          : question.queId
                      )
                    }}
                  </span>
                </div>
              </td>
              <td>{{ utilMarksWithSign(question.result.marks) }}</td>
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
      <div class="flex flex-row gap-3 justify-center mt-5 items-center">
        <h3 class="text-lg font-semibold text-center">
          Marks Summary
        </h3>
        <IconWithTooltip :tooltip-content="tooltipContent.marksSummary" />
      </div>
      <div
        class="px-4 pt-3 flex pb-20 flex-col gap-10 text-nowrap max-w-full overflow-auto"
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
                <td>{{ status === 'total' ? stats.marks[status].marks : utilMarksWithSign(stats.marks[status].marks) }}</td>
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
                <td>{{ status === 'total' ? stats.marks[status].marks : utilMarksWithSign(stats.marks[status].marks) }}</td>
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
      <Popover
        ref="popOverStatusFilterElem"
        pt:root:class="dark:[background:color-mix(in_srgb,_theme(colors.neutral.900),_white_2%)]"
      >
        <div
          v-for="(label, key) in formattedQuestionStatus"
          :key="key"
          class="mb-2 flex items-center"
        >
          <input
            :id="'status-' + key + 'filter-label'"
            v-model="questionFiltersState.status"
            type="checkbox"
            name="question-status-filter"
            :value="key"
            class="accent-green-400 w-4 h-4 mr-2"
          >
          <label
            :for="'status-' + key + 'filter-label'"
            class="cursor-pointer"
          >
            {{ label }}
          </label>
        </div>
      </Popover>
      <Popover
        ref="popOverResultFilterElem"
        pt:root:class="dark:[background:color-mix(in_srgb,_theme(colors.neutral.900),_white_2%)]"
      >
        <div
          v-for="(label, key) in formattedResultStatus"
          :key="key"
          class="mb-2 flex items-center"
        >
          <input
            :id="'result-' + key + 'filter-label'"
            v-model="questionFiltersState.result"
            type="checkbox"
            name="question-result-filter"
            :value="key"
            class="accent-green-400 w-4 h-4 mr-2 cursor-pointer"
          >
          <label
            :for="'result-' + key + 'filter-label'"
            class="cursor-pointer"
          >
            {{ label }}
          </label>
        </div>
      </Popover>
      <Popover
        ref="popOverQNumOrderElem"
        pt:root:class="dark:[background:color-mix(in_srgb,_theme(colors.neutral.900),_white_2%)]"
      >
        <div class="flex flex-col gap-2">
          <div
            v-for="(order, index) in questionsNumberingOrderList"
            :key="index"
            class="flex items-center gap-2"
          >
            <input
              :id="'que-order-' + order.value"
              v-model="questionsNumberingOrder"
              type="radio"
              name="que-num-order"
              :value="order.value"
              class="accent-green-400 w-4 h-4 cursor-pointer"
            >
            <label
              :for="'que-order-' + order.value"
              class="cursor-pointer"
            >
              {{ order.label }}
            </label>
          </div>
        </div>
      </Popover>
      <Popover
        ref="popOverTimeSpentFilterElem"
        pt:root:class="dark:[background:color-mix(in_srgb,_theme(colors.neutral.900),_white_2%)]
          max-w-3xs"
      >
        <div class="flex flex-col">
          <h4 class="text-base text-center">
            Filter by Time Spent Range
          </h4>
          <BaseFloatLabel
            class="w-full mt-6"
            label="Minimum"
            label-id="time_spent_filter_min"
            label-class="start-1/2! -translate-x-1/2"
          >
            <BaseInputNumber
              v-model="timeSpentFilterMinRange"
              :min="0"
              :max="testDuration"
              label-id="time_spent_filter_min"
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
              v-model="timeSpentFilterMaxRange"
              :min="0"
              :max="testDuration"
              label-id="time_spent_filter_max"
              :step="10"
            />
          </BaseFloatLabel>
          <BaseButton
            class="mt-5 max-w-42 mx-auto"
            label="Clear Filter"
            severity="danger"
            size="small"
            @click="resetTimeSpentFilter"
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
    </div>
    <LazyCbtResultsQuestionPanel
      v-if="questionPreviewState.hydrate"
      v-model:show-panel="questionPreviewState.show"
      :preview-question-id="questionPreviewQueId"
      :formatted-question-status="formattedQuestionStatus"
      :formatted-result-status="formattedResultStatus"
      :question-filters-state="questionFiltersState"
      :time-spent-filter-min-range="timeSpentFilterMinRange"
      :time-spent-filter-max-range="timeSpentFilterMaxRange"
      :questions-numbering-order="questionsNumberingOrder"
      :selected-sub-and-sec="currentSelectedState"
      :overall-constants="[TEST_OVERALL, OVERALL]"
      :all-questions="testQuestions"
      :test-pdf-file-hash="testPdfFileHash"
    />
  </div>
</template>

<script lang="ts" setup>
import Tabs from '~/src/volt/Tabs.vue'
import TabList from '~/src/volt/TabList.vue'
import Tab from '~/src/volt/Tab.vue'
import Popover from '~/src/volt/Popover.vue'
import type {
  QuestionResult,
  QuestionStatus,
  TestResultData,
  TestResultDataSection,
  TestResultDataQuestion,
} from '~/src/types'

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

interface StyleClasses {
  highlight: {
    status: string
    result: string
  }
  filters: {
    status: {
      answered: string
      markedAnswered: string
      notAnswered: string
      marked: string
      notVisited: string
    }
    result: {
      correct: string
      partial: string
      incorrect: string
      notAnswered: string
      bonus: string
      dropped: string
    }
  }
}

interface Settings {
  freezeMode: null
    | 'sectionHeader'
  highlightMode: 'status' | 'result' | null
  sortByTimeSpent: 'ascending' | 'descending' | null
}

const questionPreviewState = shallowReactive({
  show: false,
  hydrate: false,
})

const questionPreviewQueId = shallowRef(1)

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

const styleClasses: StyleClasses = {
  highlight: {
    status: `status-answered:bg-green-400/20 status-not-answered:bg-red-500/20
      status-marked:bg-purple-500/20 status-marked-answered:bg-sky-500/20
      status-not-visited:bg-gray-500/20`,
    result: `result-correct:bg-green-400/20 result-incorrect:bg-red-500/20
      result-partial:bg-yellow-600/30 result-dropped:bg-purple-500/20
      result-bonus:bg-sky-500/20 result-not-answered:bg-gray-500/20`,
  },
  filters: {
    status: {
      answered: 'status-answered:hidden',
      markedAnswered: 'status-marked-answered:hidden',
      notAnswered: 'status-not-answered:hidden',
      marked: 'status-marked:hidden',
      notVisited: 'status-not-visited:hidden',
    },
    result: {
      correct: 'result-correct:hidden',
      partial: 'result-partial:hidden',
      incorrect: 'result-incorrect:hidden',
      notAnswered: 'result-not-answered:hidden',
      bonus: 'result-bonus:hidden',
      dropped: 'result-dropped:hidden',
    },
  },
}

const tooltipContent = {
  marksSummary: 'In this, Avg. Time Spent is time spent per mark ("Time Spent" divided by "marks").\n\n'
    + 'if marks is zero then avg time spent will be equal to "Time Spent".',
}

const questionsNumberingOrderList: {
  label: string
  value: keyof TestResultDataQuestion
}[] = [
  { label: 'Original order', value: 'oriQueId' },
  { label: 'Section-wise order', value: 'secQueId' },
  { label: 'Cumulative order', value: 'queId' },
]

const statusList = ['answered', 'markedAnswered', 'notAnswered', 'marked', 'notVisited']
const statusListWithTotal = statusList.concat('total')

const resultStatusList = ['correct', 'partial', 'incorrect', 'notAnswered', 'bonus', 'dropped']
const resultStatusListWithTotal = resultStatusList.concat('total')

const marksStatusList = ['positive', 'negative', 'bonus', 'dropped']
const marksStatusListWithTotal = marksStatusList.concat('total')
const TEST_OVERALL = 'Test Overall'
const OVERALL = ' Overall'

const settings = shallowReactive<Settings>({
  freezeMode: 'sectionHeader',
  highlightMode: 'result',
  sortByTimeSpent: null,
})

const { testResultData, waitUntil, testPdfFileHash, testResultQuestionsData, testDuration } = defineProps<{
  testResultData: TestResultData
  testResultQuestionsData: Record<string | number, TestResultDataQuestion>
  testPdfFileHash: string
  waitUntil: boolean
  testDuration: number
}>()

const showOverallQuestions = shallowRef(false)

const popOverStatusFilterElem = ref()
const popOverResultFilterElem = ref()
const popOverQNumOrderElem = ref()
const popOverTimeSpentFilterElem = ref()

const questionFiltersState = reactive({
  status: [...statusList],
  result: [...resultStatusList],
})

const questionsNumberingOrder = shallowRef<keyof Pick<
  TestResultDataQuestion, 'oriQueId' | 'queId' | 'secQueId'
>>('oriQueId')

// to store raw min and max range of time spent filter
// for min, this will be used directly but for max,
// timeSpentFilterMinRange and timeSpentFilterMaxRange (writeable computed vars) will be the actual ones
// that will be used, due to requiring reactive testDuration for max limit for both
const timeSpentFilterState = shallowReactive({
  min: 0,
  max: Infinity,
})

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
const selectedTabs = ref<SelectedSectionKeys>({})

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
  ([newID, _]) => {
    if ((newID !== currentLoadState.loadedResultsID) && loadDataNow.value) {
      reloadTestData()
      resetTimeSpentFilter()
    }
  },
  { deep: false },
)

const testQuestions = computed(() => {
  const questions = Object.values(testResultQuestionsData)

  if (settings.sortByTimeSpent === 'ascending') {
    return questions.toSorted((a, b) => a.timeSpent - b.timeSpent)
  }
  else if (settings.sortByTimeSpent === 'descending') {
    return questions.toSorted((a, b) => b.timeSpent - a.timeSpent)
  }
  else {
    return questions
  }
})

// computed "sections" tablist for current subject
const currentSectionTabs = computed(() => {
  const subject = currentSelectedState.subject
  if (subject && !subject.endsWith(OVERALL)) {
    return Object.keys(testResultData[subject])
  }
  return []
})

const highlightModeClasses = computed(() => {
  if (settings.highlightMode === 'status') {
    return ' ' + styleClasses.highlight.status + ' '
  }
  else if (settings.highlightMode === 'result') {
    return ' ' + styleClasses.highlight.result + ' '
  }
  else {
    return ' '
  }
})

const questionStatusFilterClasses = computed(() => {
  const itemsToHide = statusList.filter(
    s => !questionFiltersState.status.includes(s),
  )

  let classString = ' '
  for (const item of itemsToHide as (keyof StyleClasses['filters']['status'])[]) {
    classString += styleClasses.filters.status[item] + ' '
  }
  return classString
})

const questionResultFilterClasses = computed(() => {
  const itemsToHide = resultStatusList.filter(
    s => !questionFiltersState.result.includes(s),
  )

  let classString = ' '
  for (const item of itemsToHide as (keyof StyleClasses['filters']['result'])[]) {
    classString += styleClasses.filters.result[item] + ' '
  }

  return classString
})

const timeSpentFilterMinRange = computed({
  get: () => Math.min(Math.max(timeSpentFilterState.min, 0), testDuration),
  set: (value) => {
    timeSpentFilterState.min = Math.min(Math.max(value, 0), testDuration)
  },
})

const timeSpentFilterMaxRange = computed({
  get: () => Math.min(timeSpentFilterState.max, testDuration),
  set: (value) => {
    timeSpentFilterState.max = Math.min(value, testDuration)
  },
})

const resetTimeSpentFilter = () => {
  timeSpentFilterState.min = 0
  timeSpentFilterState.max = Infinity
}

async function reloadTestData(isFirst: boolean = false) {
  loadDataNow.value = false
  if (!isFirst) {
    await nextTick()
  }

  currentSelectedState.subject = TEST_OVERALL
  currentSelectedState.section = ''

  const newSelectedKeys: SelectedSectionKeys = {}
  for (const [subject, subjectData] of Object.entries(testResultData)) {
    const sectionNames = Object.keys(subjectData)
    if (sectionNames.length > 1) {
      newSelectedKeys[subject] = subject + OVERALL
    }
    else {
      newSelectedKeys[subject] = sectionNames[0]
    }
  }

  selectedTabs.value = newSelectedKeys

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
      selectedTabs.value[subject] = firstSection
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
    const firstSubject = Object.keys(newTestStats)[0]
    currentSelectedState.subject = firstSubject
    currentSelectedState.section = selectedTabs.value[firstSubject]
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
  selectedTabs.value[currentSelectedState.subject] = section
  currentSelectedState.section = section
}

const subjectChangeHandler = (subject: string) => {
  currentSelectedState.subject = subject
  if (subject === TEST_OVERALL) {
    currentSelectedState.section = ''
  }
  else {
    currentSelectedState.section = selectedTabs.value[subject] ?? subject + OVERALL
  }
}

const showFilterPopOverMenu = (type: 'status' | 'result' | 'timeSpent', e: Event) => {
  if (type === 'result') {
    popOverResultFilterElem.value?.show(e)
  }
  else if (type === 'status') {
    popOverStatusFilterElem.value?.show(e)
  }
  else {
    popOverTimeSpentFilterElem.value?.show(e)
  }
}

const showQuestionPreview = (queId: number) => {
  questionPreviewQueId.value = queId
  questionPreviewState.show = true

  questionPreviewState.hydrate ||= true
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
