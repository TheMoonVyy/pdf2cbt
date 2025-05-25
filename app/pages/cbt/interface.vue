<template>
  <div
    class="flex flex-col box-border"
    style="padding-top: env(safe-area-inset-top);
      padding-right: env(safe-area-inset-right);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
    "
    :style="pageCssVars"
    @contextmenu.prevent
  >
    <div
      v-show="!submitState.isSubmitBtnClicked
        && !submitState.isSubmitting
        && !submitState.isSubmitted
        && !submitState.unableToSave"
      class="flex flex-col max-w-full max-h-dvh min-h-dvh select-none"
    >
      <div
        class="flex shrink-0"
      >
        <div
          class="flex flex-col border-b-2 border-slate-400 shrink-0"
          :style="{ width: `${100 - (uiSettings.questionPalette.width || 15)}%` }"
        >
          <div
            v-if="uiSettings.mainLayout.testTotalHeaderHeight"
            class="flex py-1 bg-gray-100 shrink-0"
            :style="{ height: `${uiSettings.mainLayout.testTotalHeaderHeight}rem` }"
          >
            <div
              class="flex ml-8 gap-2 items-center primary-theme"
              data-id="test_total_summary"
            >
              <span class="pl-3 py-0.5">{{ testSettings.testName }}</span>
              <CbtInterfaceSectionSummaryTooltip
                :section-name="testSettings.testName"
                :question-status-list="questionStatusList"
                :ques-icons="uiSettings.questionPalette.quesIcons"
                :total-summary="testTotalSummary"
                data-id-selector="test_total_summary"
                icon-class="cursor-pointer text-xl!"
              />
            </div>
          </div>
          <div class="flex justify-between px-3 py-0.5 shrink-0">
            <span class="flex ml-auto items-center">Time Left:&nbsp;&nbsp;{{ testTimeLeftString }}</span>
          </div>
          <div
            class="flex flex-col overflow-x-scroll grow w-full border-t-2 border-slate-400 divide-y-2 divide-slate-400"
            :style="{ paddingBottom: `${uiSettings.mainLayout.sectionHeaderScrollPadding}rem` }"
          >
            <div
              class="flex last:border-r-2 border-slate-400 w-full whitespace-nowrap px-2 divide-x-2 divide-slate-400"
              :style="{ height: `${uiSettings.mainLayout.sectionHeaderHeight}rem` }"
            >
              <template
                v-for="(sectionItem, index) in testSectionsList"
                :key="sectionItem.name"
              >
                <div
                  class="flex items-center gap-2 border-y-2 border-slate-400 my-[-2px] cursor-pointer"
                  :class="{
                    'primary-theme': sectionItem.name === currentTestState.section,
                    'border-r-2!': index === (testSectionsList.length - 1),
                  }"
                  :data-id="'data-id_' + sectionItem.name"
                  @click="changeCurrentQuestion('sectionBtn', null, sectionItem.name)"
                >
                  <h4 class="pl-3 py-0.5">
                    {{ sectionItem.name }}
                  </h4>
                  <CbtInterfaceSectionSummaryTooltip
                    :section-name="sectionItem.name"
                    :question-status-list="questionStatusList"
                    :ques-icons="uiSettings.questionPalette.quesIcons"
                    :section-summary="testSectionsSummary.get(sectionItem.name)!"
                    :data-id-selector="'data-id_' + sectionItem.name"
                  />
                </div>
              </template>
            </div>
            <div />
          </div>
        </div>
        <div
          ref="profileDetailsContainerElem"
          class="flex flex-1 gap-3 border-l-2 border-b-2 border-slate-500"
          :class="isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in'"
          @click="toggleFullScreen()"
        >
          <div class="flex items-center justify-center w-2/5">
            <span
              class="bg-image bg-contain"
              :style="{
                backgroundImage: `url(&quot;${miscSettings.profileImg || profileIcon}&quot;)`,
                width: `${miscSettings.imgWidth}%`,
                height: `${miscSettings.imgHeight}%`,
              }"
            />
          </div>
          <div class="flex items-center flex-1">
            <span :style="{ fontSize: `${miscSettings.fontSize}rem` }">{{ miscSettings.username }}</span>
          </div>
        </div>
      </div>
      <div
        class="flex grow overflow-auto"
      >
        <div class="flex flex-col relative grow">
          <div
            v-if="uiSettings.mainLayout.showQuestionType || uiSettings.mainLayout.showMarkingScheme"
            class="flex px-2"
          >
            <span
              v-if="uiSettings.mainLayout.showQuestionType"
              class="flex items-center"
              :style="{ fontSize: `${uiSettings.mainLayout.questionTypeFontSize}rem` }"
            >
              Question Type: {{ cropperSectionsData[currentTestState.section]?.[currentTestState.question]?.type.toUpperCase() || '' }}
            </span>
            <div
              v-if="uiSettings.mainLayout.showMarkingScheme"
              class="flex items-center ml-auto divide-x-2 divide-slate-900"
              :style="{ fontSize: `${uiSettings.mainLayout.markingSchemeFontSize}rem` }"
            >
              <span class="px-2">
                Correct:&nbsp;
                <span class="text-green-700">
                  +{{ cropperSectionsData?.[currentTestState.section]?.[currentTestState.question]?.marks.cm }}
                </span>
              </span>
              <span
                v-if="cropperSectionsData?.[currentTestState.section]?.[currentTestState.question]?.type === 'msq'"
                class="px-2"
              >
                Partial:&nbsp;
                <span class="text-orange-700">
                  +{{ cropperSectionsData?.[currentTestState.section]?.[currentTestState.question]?.marks.pm }}
                </span>
              </span>
              <span class="px-2">
                Incorrect:&nbsp;
                <span class="text-red-700">
                  {{ cropperSectionsData?.[currentTestState.section]?.[currentTestState.question]?.marks.im }}
                </span>
              </span>
            </div>
          </div>
          <div
            v-if="uiSettings.mainLayout.sectionHeaderAndQuesPanelDividerHeight"
            class="block shrink-0 primary-theme"
            :style="{ height: `${uiSettings.mainLayout.sectionHeaderAndQuesPanelDividerHeight}rem` }"
          />
          <div class="flex px-2 mt-[1px] border-y-2 gap-3 border-gray-300">
            <span
              class="flex items-center"
              :style="{ fontSize: `${uiSettings.mainLayout.questionNumFontSize}rem` }"
            >
              Question No.
              {{
                currentTestState.questionsNumberingOrderType === 'cumulative'
                  ? currentTestState.queId
                  : currentTestState.questionsNumberingOrderType === 'section-wise'
                    ? testQuestionsData.get(currentTestState.queId)?.secQueId
                    : currentTestState.question
              }}
            </span>
            <span
              v-if="uiSettings.mainLayout.showQuestionTimeSpent"
              class="pl-3 border-l-[1.5px] border-black"
              :style="{ fontSize: `${uiSettings.mainLayout.questionTimeSpentFontSize}rem` }"
            >
              {{ questionTimeSpentString }}
            </span>
          </div>
          <CbtInterfaceSettingsPanel
            v-if="testState.currentProcess === 'initial'"
            v-model:test-state="testState"
            @prepare-test="prepareTest"
          />
          <LazyGenerateTestImages
            v-else-if="testState.currentProcess === 'preparing-imgs'"
            :pdf-uint8-array="testState.pdfFile"
            :question-img-scale="testSettings.questionImgScale"
            :use-device-pixel-ratio="true"
            :cropper-sections-data="cropperSectionsData"
            @current-question-progress="(questionNum) => testState.preparingTestCurrentQuestion = questionNum"
            @image-blobs-generated="loadQuestionsImgUrlsFromBlobs"
          />
          <CbtInterfaceQuestionPanel
            v-else-if="testState.currentProcess === 'test-is-ready' || testState.currentProcess === 'test-started'"
            :class="{
              hidden: testState.currentProcess !== 'test-started',
            }"
            :is-question-pallete-collapsed="isQuestionPalleteCollapsed"
          />
          <div
            class="flex absolute py-3 cursor-pointer right-0 top-1/2 z-10 bg-black"
            @click="isQuestionPalleteCollapsed = !isQuestionPalleteCollapsed"
          >
            <Icon
              name="material-symbols:arrow-back-ios-new-rounded"
              class="text-xl text-white"
              :class="{ '-scale-x-100': !isQuestionPalleteCollapsed }"
            />
          </div>
        </div>
        <div
          class="flex flex-col shrink-0 border-black border-y-2 border-l-2"
          :class="{ hidden: isQuestionPalleteCollapsed }"
          :style="{ width: `${uiSettings.questionPalette.width}%` }"
        >
          <!-- Section Summary -->
          <div class="grid grid-cols-2 gap-2 p-4">
            <div
              v-for="item in questionStatusList"
              :key="item.key"
              class="flex gap-2 items-center"
              :class="{ 'col-span-2': item.colSpan2 }"
            >
              <span
                class="flex shrink-0 bg-image"
                :class="item.key"
                :style="{ fontSize: `${uiSettings.questionPalette.quesIcons[item.key].summaryIconSize}rem` }"
              >
                <span
                  class="flex justify-center items-center text-base w-full h-full"
                  :style="{ fontSize: `${uiSettings.questionPalette.quesIcons[item.key].summaryNumberTextFontSize}rem` }"
                >
                  {{ testSectionsSummary.get(currentTestState.section)?.value?.[item.key] }}
                </span>
              </span>
              <span
                class="block content-center text-wrap"
                :style="{ fontSize: `${uiSettings.questionPalette.quesIcons[item.key].summaryLabelFontSize}rem` }"
              >
                {{ item.label }}
              </span>
            </div>
          </div>
          <div
            v-if="uiSettings.questionPalette.sectionTextFontSize"
            class="block shrink-0 py-2 pl-3 primary-theme"
            :style="{ fontSize: `${uiSettings.questionPalette.sectionTextFontSize}rem` }"
          >
            {{ currentTestState.section }}
          </div>
          <div class="flex grow overflow-y-auto overflow-x-hidden w-full py-3 pl-4 pr-2 secondary-theme">
            <div
              class="flex flex-wrap content-start"
              :style="{
                columnGap: uiSettings.questionPalette.columnsGap + 'rem',
                rowGap: uiSettings.questionPalette.rowsGap + 'rem',
              }"
            >
              <template
                v-for="question in testSectionsData[currentTestState.section]"
                :key="question.secQueId"
              >
                <span
                  class="flex shrink-0 cursor-pointer bg-image bg-size"
                  :class="question.status"
                  @click="changeCurrentQuestion('palette', question.queId)"
                >
                  <span class="flex justify-center items-center w-full h-full">
                    {{
                      currentTestState.questionsNumberingOrderType === 'cumulative'
                        ? question.queId
                        : currentTestState.questionsNumberingOrderType === 'section-wise'
                          ? question.secQueId
                          : question.que
                    }}
                  </span>
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="flex w-full border-y-2 border-slate-400">
        <div class="flex pb-4 pt-3 grow justify-between px-3">
          <div class="flex gap-2">
            <BaseButton
              class="mx-auto"
              label="Mark for Review & Next"
              unstyled
              pt:root="px-5 py-2 primary-theme-btn-hover cursor-pointer border border-slate-400
              transition delay-30 duration-100 ease-in-out"
              @click="changeCurrentQuestion('mfr')"
            />
            <BaseButton
              class="mx-auto"
              label="Clear Response"
              unstyled
              pt:root="px-5 py-2 primary-theme-btn-hover cursor-pointer border border-slate-400
              transition delay-30 duration-100 ease-in-out"
              @click="saveCurrentAnswer('clear')"
            />
          </div>
          <div class="flex gap-2">
            <BaseButton
              class="mx-auto"
              :class="{
                hidden: currentTestState.queId === 1,
              }"
              label="Previous"
              unstyled
              pt:root="px-5 py-2 primary-theme-btn-hover cursor-pointer border border-slate-400
              transition delay-30 duration-100 ease-in-out"
              @click="changeCurrentQuestion('previous')"
            />
            <BaseButton
              class="mx-auto"
              label="Save & Next"
              unstyled
              pt:root="px-5 py-2 primary-theme-btn cursor-pointer border border-slate-400
              transition delay-30 duration-100 ease-in-out"
              @click="changeCurrentQuestion('save&next')"
            />
          </div>
        </div>
        <div
          class="flex shrink-0 items-center justify-center secondary-theme
          pb-4 pt-3 border-l-2 border-slate-400"
          :style="{ width: `${uiSettings.questionPalette.width}%` }"
        >
          <BaseButton
            class="mx-auto"
            :class="{ hidden: testSettings.submitBtn === 'hidden' }"
            label="Submit"
            unstyled
            :disabled="testSettings.submitBtn === 'disabled'"
            pt:root="px-5 py-2 primary-theme-btn cursor-pointer border border-slate-400
            transition delay-30 duration-100 ease-in-out disabled:cursor-not-allowed"
            @click="submitState.isSubmitBtnClicked = true"
          />
        </div>
      </div>
    </div>
    <CbtInterfaceHiddenSettings
      v-model="hiddenSettingsVisibility"
      :test-status="currentTestState.testStatus"
      @pause-test="pauseTestHandler"
    />
    <div
      v-show="submitState.isSubmitBtnClicked
        || submitState.isSubmitting
        || submitState.isSubmitted
        || submitState.unableToSave"
      class="flex flex-col max-w-full max-h-dvh min-h-dvh light"
    >
      <div
        v-show="submitState.isSubmitBtnClicked"
        class="grow flex flex-col px-8 pt-8 pb-6 overflow-y-auto"
      >
        <p class="text-lg font-semibold text-center">
          Test Summary
        </p>
        <table class="mt-4 border border-gray-300 divide-y divide-gray-300">
          <thead class="bg-gray-100">
            <tr class="divide-x divide-gray-300">
              <th class="p-2 font-semibold">
                Section Name
              </th>
              <th class="p-2 font-semibold">
                No. of Questions
              </th>
              <th class="p-2 font-semibold">
                Answered
              </th>
              <th class="p-2 font-semibold">
                Not Answered
              </th>
              <th class="p-2 font-semibold">
                Marked for Review
              </th>
              <th class="p-2 font-semibold">
                Marked for Review & Answered
              </th>
              <th class="p-2 font-semibold">
                Not Visited
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300 text-center">
            <tr
              v-for="(row, rowIndex) in testSummaryDataTable"
              :key="rowIndex"
              class="divide-x divide-gray-300"
            >
              <td
                v-for="(rowKey, rowKeyIndex) in testSummaryDataTableKeys"
                :key="rowKeyIndex"
                class="p-2"
              >
                {{ row[rowKey] }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="flex flex-col items-center mt-15 gap-5">
          <p class="text-lg text-center">
            Are you sure you want to submit the test?<br>
            Click 'Yes' to proceed. Click 'No' to go back.
          </p>
          <div class="flex gap-10">
            <BaseButton
              label="Yes"
              :disabled="testState.currentProcess !== 'test-started'"
              unstyled
              pt:root="px-4 py-1.5 primary-theme-btn cursor-pointer border border-slate-400
              transition delay-30 duration-100 ease-in-out"
              @click="submitTest(false)"
            />
            <BaseButton
              label="No"
              unstyled
              pt:root="px-4 py-1.5 primary-theme-btn cursor-pointer border border-slate-400
              transition delay-30 duration-100 ease-in-out"
              @click="submitState.isSubmitBtnClicked = false"
            />
          </div>
        </div>
      </div>
      <div
        v-if="submitState.isSubmitting"
        class="flex m-auto"
      >
        <p class="text-xl font-semibold text-center">
          Please wait, submitting the test...
        </p>
      </div>
      <div
        v-if="submitState.isSubmitted"
        class="flex m-auto"
      >
        <p class="text-2xl font-semibold text-center">
          Your test has been submitted<br><br>
          <template v-if="!submitState.unableToSave">
            Please wait, Redirecting you to results page...<br>
          </template>
        </p>
      </div>
      <div
        v-if="submitState.unableToSave"
        class="flex flex-col m-auto gap-8 mt-5"
      >
        <p class="text-2xl font-semibold text-center">
          There was an error while trying to save the test data to your local database!
          Please download the test data so you can import it on the Results page.
        </p>
        <BaseButton
          label="Download Test Data"
          @click="downloadTestData()"
        />
      </div>
    </div>
    <Dialog
      :visible="testState.currentProcess === 'preparing-data'
        || testState.currentProcess === 'preparing-imgs'
        || testState.currentProcess === 'test-is-ready'"
      :header="testState.currentProcess === 'test-is-ready'
        ? 'Mock test is now ready!'
        : 'Preparing mock test...'"
      :modal="true"
      :closable="false"
      :close-on-escape="false"
      :block-scroll="true"
      :draggable="false"
      pt:content:class="flex flex-col p-4 pt-0"
    >
      <div
        v-if="testState.currentProcess !== 'test-is-ready'"
        class="flex flex-col gap-3"
      >
        <h3 class="text-center text-lg font-semibold">
          <template v-if="testState.currentProcess === 'preparing-data'">
            processing {{ testSettings.saveTestData ? 'and storing' : '' }} data
          </template>
          <template v-else-if="testState.preparingTestCurrentQuestion === 0">
            loading pdf...
          </template>
          <template v-else>
            processing question&nbsp;
            {{ testState.preparingTestCurrentQuestion }}/{{ testState.totalQuestions }}
          </template>
        </h3>
        <span
          v-if="currentTestState.saveTestData === null"
          class="flex flex-col text-amber-300 text-center"
        >
          <span class="text-lg">Warning!</span>
          Failed to save the test in local storage (IndexedDB).<br>
          The save feature is now disabled.<br>
        </span>
        <ProgressBar
          :value="preparingTestProgressBar"
          pt:root:class="h-7"
          pt:label:class="text-xl dark:text-surface-900"
        />
        <h3 class="text-sm">
          This may take some time, depending on the number of questions and your device's capacity.<br>
          In the meantime, buckle up for the test!
        </h3>
      </div>
      <div
        v-else-if="testState.currentProcess === 'test-is-ready'"
        class="flex flex-col gap-8"
      >
        <h3 class="text-center">
          You can now start your mock test
        </h3>
        <span
          v-if="currentTestState.saveTestData === null"
          class="flex flex-col text-amber-300 text-center"
        >
          <span class="text-lg">Warning!</span>
          Failed to save the test in local storage (IndexedDB).<br>
          The save feature is now disabled.<br>
          You can continue the test, but progress will be lost if the test,<br>
          browser, or device closes unexpectedly.
        </span>
        <BaseButton
          class="mx-auto"
          label="Start Mock Test"
          severity="help"
          @click="startTest()"
        >
          <template #icon>
            <Icon
              name="mdi:stopwatch-play-outline"
              size="1.4rem"
            />
          </template>
        </BaseButton>
      </div>
    </Dialog>
    <Dialog
      :visible="isTestPaused"
      header="Test is Paused"
      :modal="true"
      :closable="false"
      :close-on-escape="false"
      :block-scroll="true"
      :draggable="false"
      pt:content:class="flex flex-col p-6 pt-0 gap-8"
    >
      <h4 class="font-semibold">
        You have paused the test.
      </h4>
      <BaseButton
        class="mx-auto"
        label="Resume Test"
        @click="resumePausedTestHandler"
      >
        <template #icon>
          <Icon
            name="mdi:stopwatch-play-outline"
            size="1.4rem"
          />
        </template>
      </BaseButton>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import 'assets/css/cbt-interface.css'
import answeredIcon from 'assets/icons/ques-answered.svg?no-inline'
import notAnsweredIcon from 'assets/icons/ques-notAnswered.svg?no-inline'
import notVisitedIcon from 'assets/icons/ques-notVisited.svg?no-inline'
import markedIcon from 'assets/icons/ques-marked.svg?no-inline'
import markedAnsweredIcon from 'assets/icons/ques-markedAnswered.svg?no-inline'
import profileIcon from 'assets/icons/profile.svg?no-inline'
import ProgressBar from '@/src/volt/ProgressBar.vue'

import { db } from '@/src/db/cbt-db'
import { CbtUseState } from '#shared/enums'

definePageMeta({
  layout: false,
})

const testSummaryDataTableKeys: (keyof TestSummaryDataTableRow)[] = [
  'section', 'totalQuestions',
  'answered', 'notAnswered', 'marked', 'markedAnswered', 'notVisited',
]

const questionStatusList: {
  key: QuestionStatus
  label: string
  colSpan2?: boolean
}[] = [
  { key: 'answered', label: 'Answered' },
  { key: 'notAnswered', label: 'Not Answered' },
  { key: 'notVisited', label: 'Not Visited' },
  { key: 'marked', label: 'Marked for Review' },
  { key: 'markedAnswered', label: 'Answered & Marked for Review', colSpan2: true },
]

// styles and css variables being used on page
const pageCssVars = computed(() => {
  const themes = uiSettings.value.themes
  const icons = uiSettings.value.questionPalette.quesIcons

  return {
    // Theme colors
    'color': `#${themes.base.textColor}`,
    'background-color': `#${themes.base.bgColor}`,
    '--bg-primary-theme-color': `#${themes.primary.bgColor}`,
    '--text-primary-theme-color': `#${themes.primary.textColor}`,
    '--bg-secondary-theme-color': `#${themes.secondary.bgColor}`,
    '--text-secondary-theme-color': `#${themes.secondary.textColor}`,

    // Question Palette
    // icons
    '--bg-answered-image-url': `url("${icons.answered.image || answeredIcon}")`,
    '--bg-notAnswered-image-url': `url("${icons.notAnswered.image || notAnsweredIcon}")`,
    '--bg-notVisited-image-url': `url("${icons.notVisited.image || notVisitedIcon}")`,
    '--bg-marked-image-url': `url("${icons.marked.image || markedIcon}")`,
    '--bg-markedAnswered-image-url': `url("${icons.markedAnswered.image || markedAnsweredIcon}")`,

    // icons text colors
    '--text-answered-image-color': `#${icons.answered.textColor}`,
    '--text-notAnswered-image-color': `#${icons.notAnswered.textColor}`,
    '--text-notVisited-image-color': `#${icons.notVisited.textColor}`,
    '--text-marked-image-color': `#${icons.marked.textColor}`,
    '--text-markedAnswered-image-color': `#${icons.markedAnswered.textColor}`,

    // icons sizes
    '--bg-answered-image-size': `${icons.answered.iconSize}rem`,
    '--bg-notAnswered-image-size': `${icons.notAnswered.iconSize}rem`,
    '--bg-notVisited-image-size': `${icons.notVisited.iconSize}rem`,
    '--bg-marked-image-size': `${icons.marked.iconSize}rem`,
    '--bg-markedAnswered-image-size': `${icons.markedAnswered.iconSize}rem`,

    // icons number-text sizes
    '--text-answered-number-size': `${icons.answered.numberTextFontSize}rem`,
    '--text-notAnswered-number-size': `${icons.notAnswered.numberTextFontSize}rem`,
    '--text-notVisited-number-size': `${icons.notVisited.numberTextFontSize}rem`,
    '--text-marked-number-size': `${icons.marked.numberTextFontSize}rem`,
    '--text-markedAnswered-number-size': `${icons.markedAnswered.numberTextFontSize}rem`,
  }
})

const profileDetailsContainerElem = templateRef('profileDetailsContainerElem')

const hiddenSettingsVisibility = shallowRef(false)

let testOutputData: TestOutputData | null = null

const { isFullscreen, toggle: toggleFullScreen } = useFullscreen()

const { uiSettings, testSettings, miscSettings } = useCbtSettings()

const testLogger = useCbtLogger(true)

const testState = shallowReactive<TestState>({
  pdfFile: null,
  testImageBlobs: null,
  pdfFileHash: '',
  zipOriginalUrl: '',
  zipConvertedUrl: '',
  testAnswerKey: null,
  isSectionsDataLoaded: false,
  totalQuestions: 75,
  totalSections: 6,
  currentProcess: 'initial',
  preparingTestCurrentQuestion: 0,
  continueLastTest: false,
})

const preparingTestProgressBar = computed(() => {
  const ratio = testState.preparingTestCurrentQuestion / testState.totalQuestions
  return Math.floor(ratio * 100)
})

const isQuestionPalleteCollapsed = shallowRef(false)

const isTestPaused = shallowRef(false)

const submitState = shallowReactive({
  isSubmitBtnClicked: false,
  isSubmitting: false,
  isSubmitted: false,
  unableToSave: false,
})

const {
  testSectionsList,
  cropperSectionsData,
  testSectionsData,
  testQuestionsData,
  testSectionsSummary,
  currentTestState,
  testQuestionsUrls,
} = useCbtTestData()

useCreateSectionsSummary(testSectionsData, testSectionsSummary)

const testTotalSummary = computed(() => {
  const total: TestSectionSummary = {
    answered: 0,
    notAnswered: 0,
    notVisited: 0,
    marked: 0,
    markedAnswered: 0,
  }

  for (const section of testSectionsSummary.value.values()) {
    total.answered += section.value.answered
    total.notAnswered += section.value.notAnswered
    total.notVisited += section.value.notVisited
    total.marked += section.value.marked
    total.markedAnswered += section.value.markedAnswered
  }

  return total
})

const {
  startCountdown,
  pauseCountdown,
  resumeCountdown,
  stopCountdown,
} = useCbtCountdownTimer()

const testTimeLeftString = computed(() => {
  const seconds = currentTestState.value.remainingSeconds ?? testSettings.value.durationInSeconds
  const timeFormat = testSettings.value.timeFormat
  return utilSecondsToTime(seconds, timeFormat)
})

const questionTimeSpentString = computed(() => {
  let quesTimeSpentSeconds = 0

  if (currentTestState.value.testStatus === 'ongoing') {
    const remainingSeconds = currentTestState.value.remainingSeconds ?? 0
    const questionStartTime = currentTestState.value.currentQuestionStartTime
    const existingTimeSpent = testQuestionsData.value.get(currentTestState.value.queId)?.timeSpent || 0

    quesTimeSpentSeconds = existingTimeSpent + (questionStartTime - remainingSeconds)
  }

  return utilSecondsToTime(quesTimeSpentSeconds, 'mmm:ss')
})

const testSummaryDataTable = computed<TestSummaryDataTableRow[]>(() => {
  const data = []
  for (const sectionItem of testSectionsList.value) {
    const sectionName = sectionItem.name
    const totalQuestions = Object.keys(testSectionsData.value[sectionName] ?? {}).length
    const summary = testSectionsSummary.value.get(sectionName)!.value

    data.push({
      section: sectionName,
      totalQuestions,
      ...summary,
    })
  }

  return data
})

const scrollSectionIntoView = (section: TestSectionKey) => {
  const el = document.querySelector(`[data-id="data-id_${section}"]`) as HTMLElement | null
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

function changeCurrentQuestion(
  via: 'save&next' | 'mfr' | 'previous' | 'palette' | 'sectionBtn',
  newQueId: number | null = null,
  newSection: TestSectionKey | null = null,
) {
  const {
    section: currentSection,
    queId: currentQueId,
  } = currentTestState.value

  if (via === 'palette' && currentQueId === newQueId) return
  if (via === 'sectionBtn' && currentSection === newSection) return

  let answerSavedDetails: {
    prevStatus: QuestionStatus
    prevAnswer: QuestionAnswer
  } | null = null

  if (testState.currentProcess === 'test-started') {
    if (via === 'save&next' || via === 'mfr' || via === 'previous') {
      let queIdDelta = 0

      if (via === 'previous') {
        queIdDelta = -1
      }
      else {
        queIdDelta = 1
        answerSavedDetails = saveCurrentAnswer(via)
      }

      const newQuestionData = testQuestionsData.value.get(currentQueId + queIdDelta)
      if (newQuestionData) {
        newQueId = currentQueId + queIdDelta

        const maybeNewSection = newQuestionData.section
        if (maybeNewSection !== currentSection) {
          newSection = maybeNewSection
        }
      }
    }
    else if (via === 'sectionBtn') {
      if (newSection !== null) {
        const newQuestionNum = currentTestState.value.sectionsPrevQuestion[newSection]!
        newQueId = testSectionsData.value[newSection]![newQuestionNum]!.queId
      }
    }
    if (newQueId !== null) {
      const currentQuestionData = testQuestionsData.value.get(currentQueId)
      const newQuestionData = testQuestionsData.value.get(newQueId)

      if (newQuestionData && currentQuestionData) {
        const currentRemainingTime = currentTestState.value.remainingSeconds
        const timeSpent = currentTestState.value.currentQuestionStartTime - currentRemainingTime!

        currentQuestionData.timeSpent += timeSpent

        if (answerSavedDetails) {
          testLogger.answeredSaved(
            via as 'save&next' | 'mfr',
            answerSavedDetails.prevAnswer,
            answerSavedDetails.prevStatus,
          )
        }

        currentTestState.value.question = newQuestionData.que
        currentTestState.value.queId = newQueId
        currentTestState.value.currentQuestionStartTime = currentRemainingTime!
        currentTestState.value.currentAnswerBuffer = Array.isArray(newQuestionData.answer)
          ? [...newQuestionData.answer]
          : newQuestionData.answer

        const newQuestionStatus = newQuestionData.status
        if (newQuestionStatus === 'notVisited') {
          newQuestionData.status = 'notAnswered'
        }
      }

      if (newSection !== null) {
        currentTestState.value.section = newSection
        const questionNum = testQuestionsData.value.get(currentQueId)?.que
        if (typeof questionNum === 'number') {
          currentTestState.value.sectionsPrevQuestion[currentSection] = questionNum
        }
      }

      testLogger.currentQuestion(
        via, currentQueId, newSection !== null ? currentSection : null,
      )
    }
  }
  else {
    if (via === 'sectionBtn') {
      if (newSection !== null) {
        currentTestState.value.section = newSection
        const newQuestionNum = currentTestState.value.sectionsPrevQuestion[newSection]!
        newQueId = testSectionsData.value[newSection]![newQuestionNum]!.queId
      }
    }
    if (newQueId !== null) {
      const newQuestionData = testQuestionsData.value.get(newQueId)
      if (newQuestionData) {
        currentTestState.value.question = newQuestionData.que
        currentTestState.value.queId = newQueId

        if (!testState.isSectionsDataLoaded) {
          newQuestionData.status = 'notAnswered'
        }
      }
    }
  }

  if (newSection !== null) {
    scrollSectionIntoView(newSection)
  }
}

function saveCurrentAnswer(via: 'save&next' | 'mfr' | 'clear') {
  const currentQueId = currentTestState.value.queId
  let currentAnswer = currentTestState.value.currentAnswerBuffer
  const maybeClearedAnswer = currentAnswer

  let questionStatus: QuestionStatus

  switch (via) {
    case 'clear': {
      questionStatus = 'notAnswered'
      currentAnswer = null
      currentTestState.value.currentAnswerBuffer = null
      break
    }
    case 'save&next': {
      questionStatus = currentAnswer !== null ? 'answered' : 'notAnswered'
      break
    }
    case 'mfr': {
      questionStatus = currentAnswer !== null ? 'markedAnswered' : 'marked'
      break
    }
  }

  const currentQuestionData = testQuestionsData.value.get(currentQueId)
  if (currentQuestionData) {
    const prevStatus = currentQuestionData.status
    const prevAnswer = currentQuestionData.answer

    currentQuestionData.answer = currentAnswer
    currentQuestionData.status = questionStatus

    if (via === 'clear') {
      testLogger.answerCleared(maybeClearedAnswer, prevStatus)
    }
    else {
      return { prevAnswer, prevStatus }
    }
  }

  return null
}

function startTest() {
  const testDuration = currentTestState.value.remainingSeconds ?? testSettings.value.durationInSeconds

  if (testState.continueLastTest) {
    currentTestState.value.testStatus = 'ongoing'
    testLogger.logTestState('testResumed')
  }
  else {
    const currentSection = currentTestState.value.section!
    const currentQuestion = currentTestState.value.question!
    testSectionsData.value[currentSection]![currentQuestion]!.status = 'notAnswered'

    currentTestState.value.testStatus = 'ongoing'
    testLogger.logTestState('testStarted')
  }

  testState.currentProcess = 'test-started'
  startCountdown(testDuration)
}

async function prepareTest() {
  testState.currentProcess = 'preparing-data'
  const continueFromBackup = testState.continueLastTest

  const settingsData = {
    /* using toRaw because while both are ref from useState,
      .value of them is reactive object
    */
    testSettings: toRaw(testSettings.value),
    uiSettings: toRaw(uiSettings.value),
  }

  db.replaceSettings(settingsData).catch(
    (e: unknown) => console.error('Error saving settings in db: ', e),
  )

  if (!continueFromBackup) {
    const testDuration = testSettings.value.durationInSeconds
    const firstSection = testSectionsList.value[0]!.name
    const firstQuestion = currentTestState.value.sectionsPrevQuestion[firstSection]!

    currentTestState.value.section = firstSection
    currentTestState.value.question = firstQuestion
    currentTestState.value.queId = testSectionsData.value[firstSection]![firstQuestion]!.queId

    currentTestState.value.testName = testSettings.value.testName

    currentTestState.value.currentQuestionStartTime = testDuration
    currentTestState.value.remainingSeconds = testDuration
    currentTestState.value.testDuration = testDuration

    const saveTestData = testSettings.value.saveTestData
    currentTestState.value.saveTestData = saveTestData

    // clear previous test data in db if exists
    try {
      await db.clearTestDataInDB()
    }
    catch (err: unknown) {
      console.error('Error clearing test datas in db', err)
    }

    if (saveTestData) {
      const ogTestSectionsList = testSectionsList.value
      const ogTestSectionsData = testSectionsData.value
      const ogCurrentTestState = currentTestState.value
      try {
        const sectionsList = toRaw(ogTestSectionsList)
        const sectionsData = toRaw(ogTestSectionsData)
        const currentState = toRaw(ogCurrentTestState)

        await db.putTestData(sectionsList, currentState, sectionsData)
      }
      catch {
        try {
          const sectionsList = JSON.parse(JSON.stringify(ogTestSectionsList))
          const sectionsData = JSON.parse(JSON.stringify(ogTestSectionsData))
          const currentState = JSON.parse(JSON.stringify(ogCurrentTestState))

          await db.putTestData(sectionsList, currentState, sectionsData)
        }
        catch (e: unknown) {
          console.error('Error saving test data in db', e)
          currentTestState.value.saveTestData = null
        }
      }
    }
  }

  if (testState.pdfFile) {
    testState.currentProcess = 'preparing-imgs'
  }
  else {
    loadQuestionsImgUrlsFromBlobs(testState.testImageBlobs!)
  }
}

const loadQuestionsImgUrlsFromBlobs = (testImageBlobs: TestImageBlobs) => {
  testQuestionsUrls.value = utilGetQuestionsUrlsFromTestImageBlobs(testImageBlobs, testQuestionsData.value)
  testState.testImageBlobs = null
  testState.pdfFile = null
  testState.currentProcess = 'test-is-ready'
}

const pauseTestHandler = () => {
  pauseCountdown()
  isTestPaused.value = true
}

const resumePausedTestHandler = () => {
  resumeCountdown()
  isTestPaused.value = false
}

function onBeforeUnloadCallback(e: Event) {
  e.preventDefault()
  // @ts-expect-error compatibility for older browser versions
  e.returnValue = ''
}

let removeNagivationGuard = () => {}

watch(testState,
  () => {
    window.addEventListener('beforeunload', onBeforeUnloadCallback)
    const router = useRouter()
    removeNagivationGuard = router.beforeEach((to, from, next) => {
      const confirmLeave = confirm(
        'Are you sure you want to go back?\nCurrent Test State may be lost if you do!',
      )
      if (confirmLeave) {
        next()
      }
      else {
        next(false)
      }
    })
  },
  { once: true, deep: false },
)

onLongPress(
  profileDetailsContainerElem,
  () => hiddenSettingsVisibility.value = true,
  {
    modifiers: {
      prevent: true,
    },
    delay: 750,
  },
)

const pageCleanUpCallback = () => {
  window.removeEventListener('beforeunload', onBeforeUnloadCallback)
  document.documentElement.style.removeProperty('--main-layout-size')

  removeNagivationGuard()
  stopCountdown(true)
}

const testStatusWatchHandle = watch(
  () => currentTestState.value.testStatus,
  (newStatus) => {
    if (newStatus === 'finished') {
      submitTest(true)
    }
  },
)

async function submitTest(isAuto: boolean) {
  testStatusWatchHandle.stop()
  submitState.isSubmitting = true
  submitState.isSubmitBtnClicked = false
  stopCountdown()

  const currentQueId = currentTestState.value.queId
  const currentQuestionData = testQuestionsData.value.get(currentQueId)!

  const currentRemainingTime = currentTestState.value.remainingSeconds
  const timeSpent = currentTestState.value.currentQuestionStartTime - currentRemainingTime!

  currentQuestionData.timeSpent += timeSpent

  try {
    await testLogger.logTestState('testFinished', isAuto ? 'Auto' : 'Manual')
  }
  catch (err) {
    console.error('Error while saving currentTestState when testFinished', err)
  }

  generateTestOutputData()
  try {
    const id = await db.addTestOutputData(testOutputData!)
    if (id) {
      const currentResultsID = useCbtResultsCurrentID()
      currentResultsID.value = id
      submitState.isSubmitted = true
      submitState.isSubmitting = false
      await nextTick()
      pageCleanUpCallback()

      loadQuestionImgUrlsToResultsUrlsState(id)
      await navigateTo('/cbt/results')
    }
  }
  catch (err) {
    console.error('Error while saving test data in db', err)
    submitState.isSubmitted = true
    submitState.unableToSave = true
    submitState.isSubmitting = false
  }
}

function generateTestOutputData() {
  const { testName, testDuration } = currentTestState.value
  const { zipOriginalUrl, zipConvertedUrl } = testState
  const testConfig: TestOutputData['testConfig'] = {
    testName,
    testDurationInSeconds: testDuration,
    pdfFileHash: testState.pdfFileHash,
  }
  if (zipOriginalUrl) {
    testConfig.zipOriginalUrl = zipOriginalUrl
    if (zipConvertedUrl) testConfig.zipConvertedUrl = zipConvertedUrl
  }

  const testLogs = testLogger.getLogs()

  const testData: TestOutputData['testData'] = {}

  for (const sectionItem of testSectionsList.value) {
    const { name: section } = sectionItem
    const subject = sectionItem.subject as string

    testData[subject] ??= {}
    testData[subject][section] = {}

    for (const [question, testQuestionData] of Object.entries(testSectionsData.value[section] ?? {})) {
      const { marks, pdfData } = cropperSectionsData.value[section]![question]!
      const {
        queId, secQueId,
        type, status,
        answer, timeSpent,
        totalOptions,
      } = testQuestionData

      const data = {
        queId, secQueId,
        type, status,
        answer, timeSpent,
        totalOptions,
        marks,
        pdfData,
      }

      if (type === 'nat') delete data.totalOptions
      if (type !== 'msq') delete data.marks.pm

      testData[subject][section][question] = data
    }
  }

  const testSummary = testSummaryDataTable.value
  const outputData = { testConfig, testData, testSummary, testLogs }
  const testResultOverview = utilGetTestResultOverview(outputData, true)
  testOutputData = {
    ...outputData,
    testResultOverview,
  }

  const testAnswerKey = testState.testAnswerKey
  if (testAnswerKey) {
    testOutputData.testAnswerKey = testAnswerKey
  }
}

function loadQuestionImgUrlsToResultsUrlsState(testId: number) {
  const questionsUrls = testQuestionsUrls.value

  if (Object.keys(questionsUrls).length > 0) {
    const resultsStateUrls = useCbtResultsTestQuestionsImgUrls()
    resultsStateUrls.value[testId] = questionsUrls
  }
}

const downloadTestData = () => {
  const blob = new Blob([JSON.stringify(testOutputData, null, 2)], { type: 'application/json' })
  utilSaveFile('pdf2cbt_test_data.json', blob)
}

onBeforeUnmount(pageCleanUpCallback)

onUnmounted(() => {
  const keys = Object.values(CbtUseState)
  clearNuxtState((key) => {
    return keys.includes(key as CbtUseState)
      && key !== CbtUseState.CurrentResultsID
      && key !== CbtUseState.ResultsTestQuestionsImgUrls
  })
})
</script>
