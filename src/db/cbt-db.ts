import Dexie, { type EntityTable } from 'dexie'
import type {
  CbtTestSettings,
  CbtUiSettings,
  TestSectionListItem,
  CurrentTestState,
  TestSectionsData,
  TestQuestionData,
  TestLog,
  TestResultOverviewDB,
  TestResultOverviewsDBSortByOption,
  TestResultCommonOutput,
} from '~/src/types'
import { utilGetTestResultOverview, utilCloneJson } from '~/utils/utils'

interface SettingsData {
  id: number
  testSettings: CbtTestSettings
  uiSettings: CbtUiSettings
}

interface CurrentTestStateDB extends CurrentTestState {
  id: number
}

type TestSectionListItemDB = TestSectionListItem & {
  id: number
}

type TestOutputDataDB = {
  id?: number
  testOutputData: TestResultCommonOutput
}

class CBTDatabase extends Dexie {
  settingsData!: EntityTable<SettingsData, 'id'>
  testSectionsList!: EntityTable<TestSectionListItemDB, 'id'>
  currentTestState!: EntityTable<CurrentTestStateDB, 'id'>
  testQuestionsData!: EntityTable<TestQuestionData, 'queId'>
  testLog!: EntityTable<TestLog, 'id'>
  testResultOverviews!: EntityTable<TestResultOverviewDB, 'id'>
  testOutputDatas!: EntityTable<TestOutputDataDB, 'id'>

  constructor() {
    super('CBT-Interface')

    this.version(2).stores({
      settingsData: 'id',
      testSectionsList: 'id++',
      currentTestState: 'id',
      testQuestionsData: 'queId',
      testLog: 'id',
      testResultOverviews: 'id,testName,testStartTime,testEndTime,[testName+testStartTime+testEndTime]',
      testOutputDatas: 'id++',
    })
  }

  async getSettings() {
    return this.settingsData.get(1).then((data) => {
      if (!data) return null

      const { id, ...rest } = data
      return rest
    }).catch(_ => null)
  }

  async replaceSettings(data: Omit<SettingsData, 'id'>, viaJson: boolean = false) {
    let finalData = { id: 1, ...data }
    if (viaJson) finalData = JSON.parse(JSON.stringify(finalData))

    return this.settingsData.put(finalData).catch(() => {
      const fallbackData = JSON.parse(JSON.stringify(finalData))
      return this.settingsData.put(fallbackData)
    })
  }

  addLog(testLog: TestLog) {
    return this.testLog.add(testLog)
  }

  putTestData(
    testSectionsList: TestSectionListItem[],
    currentTestState: CurrentTestState,
    testSectionsData: TestSectionsData,
  ) {
    const testQuestionsData: TestQuestionData[] = testSectionsList
      .flatMap(({ name: sectionName }) => Object.values(testSectionsData[sectionName]))

    return Promise.all([
      this.testSectionsList.bulkPut(testSectionsList),
      this.currentTestState.put({ id: 1, ...currentTestState }),
      this.testQuestionsData.bulkPut(testQuestionsData),
    ])
  }

  getTestData() {
    return Promise.all([
      this.testSectionsList.toArray().then(
        (testSectionsList) => {
          if (testSectionsList.length > 0) {
            return testSectionsList.map(({ id, ...rest }) => rest as TestSectionListItem)
          }
          return Promise.reject(new Error('testSectionsList is empty in db'))
        },
      ),
      this.currentTestState.get(1).then(
        (currentTestState) => {
          if (currentTestState) {
            const { id, ...rest } = currentTestState
            return rest as CurrentTestState
          }
          return Promise.reject(new Error('currentTestState is empty in db'))
        },
      ),
      this.testQuestionsData.toArray().then((testQuestionsData) => {
        if (testQuestionsData.length > 0) {
          const testSectionsData: TestSectionsData = {}

          for (const questionData of testQuestionsData) {
            const section = questionData.section

            testSectionsData[section] ??= {}

            const questionKey = questionData.que
            testSectionsData[section][questionKey] = questionData
          }

          return { testSectionsData, totalQuestions: testQuestionsData.length }
        }
        return Promise.reject(new Error('testQuestionsData is empty in db'))
      }),
      this.testLog.toArray(),
    ])
  }

  getTestStatus() {
    return this.currentTestState.get(1).then(testState => testState?.testStatus)
  }

  clearTestSectionsList() {
    return this.testSectionsList.clear()
  }

  clearTestQuestionsData() {
    return this.testQuestionsData.clear()
  }

  clearCurrentTestState() {
    return this.currentTestState.clear()
  }

  clearTestLogs() {
    return this.testLog.clear()
  }

  clearTestDataInDB() {
    return Promise.all([
      db.clearCurrentTestState(),
      db.clearTestSectionsList(),
      db.clearTestQuestionsData(),
      db.clearTestLogs(),
    ])
  }

  updateQuestionData(questionData: TestQuestionData) {
    const { status, answer, timeSpent, queId } = questionData
    const updatedData = {
      status,
      answer: Array.isArray(answer) ? [...answer] : answer,
      timeSpent,
    }

    return this.testQuestionsData.update(queId, updatedData)
  }

  updateCurrentTestState(
    currentTestState: CurrentTestState,
    updateAll: boolean = false,
    updateSectionsPrevQuestion: boolean = false,
  ) {
    if (updateAll) {
      return this.currentTestState.put({ id: 1, ...currentTestState })
    }
    else {
      const {
        section,
        question,
        queId,
        remainingSeconds,
        currentQuestionStartTime,
        currentAnswerBuffer,
        sectionsPrevQuestion,
      } = currentTestState

      const data: Partial<CurrentTestState> & { id: number } = {
        id: 1,
        section,
        question,
        queId,
        remainingSeconds,
        currentQuestionStartTime,
        currentAnswerBuffer,
      }

      if (updateSectionsPrevQuestion) data.sectionsPrevQuestion = sectionsPrevQuestion

      return this.currentTestState.update(1, data)
    }
  }

  // return a test output data by id
  async getTestOutputData(id: number) {
    return this.testOutputDatas.get(id)
  }

  // return a test result overview by id if provided,
  // if id is not provided then get last test result overview
  // if getAll is true, will return all test result overview
  async getTestResultOverview(id: number | null, getAll: true): Promise<TestResultOverviewDB[]>
  async getTestResultOverview(id?: number | null, getAll?: false): Promise<TestResultOverviewDB | undefined>
  async getTestResultOverview(
  id: number | null = null,
  getAll: boolean = false,
  ): Promise<TestResultOverviewDB[] | TestResultOverviewDB | undefined> {
    if (getAll) {
      return this.testResultOverviews.toArray()
    }
    if (id !== null) {
      return this.testResultOverviews.get(id)
    }
    return this.testResultOverviews.orderBy('id').last()
  }

  async getTestResultOverviewByCompoundIndex(data: TestResultCommonOutput) {
    const { testName, testStartTime, testEndTime } = data.testResultOverview

    return this.testResultOverviews
      .where('[testName+testStartTime+testEndTime]')
      .equals([testName, testStartTime, testEndTime])
      .first()
  }

  async getTestResultOverviews(sortBy: TestResultOverviewsDBSortByOption): Promise<TestResultOverviewDB[]> {
    switch (sortBy) {
      case 'addedAscending':
        return this.testResultOverviews
          .orderBy('id')
          .toArray()
      case 'addedDescending':
        return this.testResultOverviews
          .orderBy('id')
          .reverse()
          .toArray()
      case 'startTimeAscending':
        return this.testResultOverviews
          .orderBy('testStartTime')
          .toArray()
      case 'startTimeDescending':
        return this.testResultOverviews
          .orderBy('testStartTime')
          .reverse()
          .toArray()
      case 'endTimeAscending':
        return this.testResultOverviews
          .orderBy('testEndTime')
          .toArray()
      case 'endTimeDescending':
        return this.testResultOverviews
          .orderBy('testEndTime')
          .reverse()
          .toArray()
      default:
        return []
    }
  }

  /**
   * Adds test output data and its overview to the database.
   *
   * This function does the following:
   * 1. gets testOverview from utilGetTestResultOverview(testOutputData).
   * 2. Validates that a test result with the same name and timestamps doesn't already exist.
   * 3. Adds the test output data to the testOutputDatas store.
   * 4. Adds the testResultOverview to testResultOverviews store with id of testOutputDatas
   *
   * @param testOutputData - The testOutputData.
   * @param overviewData - Optional additional test overview data.
   * @returns Promise of Dexie saving testOverview.
   * @throws DuplicateTestResultError if a test with the same name and timestamps already exists.
   */

  async addTestOutputData(
    testOutputData: TestResultCommonOutput,
    viaJson: boolean = true,
  ) {
    testOutputData.testResultOverview = utilGetTestResultOverview(testOutputData)

    const existing = await this.getTestResultOverviewByCompoundIndex(testOutputData)

    if (existing) {
      return existing.id
    }

    const dataToSave = viaJson ? utilCloneJson(testOutputData) : testOutputData
    const id = await this.testOutputDatas.add({ testOutputData: dataToSave })

    return this.testResultOverviews.put({
      id: id!,
      ...dataToSave.testResultOverview,
    })
  }

  async bulkAddTestOutputData(
    testOutputDatas: TestResultCommonOutput[],
    viaJson: boolean = true,
    checkAndSkipExisting: boolean = false,
  ) {
    const newTestOutputDatas: { testOutputData: TestResultCommonOutput }[] = []
    const newTestResultOverviews: TestResultOverviewDB[] = []

    testOutputDatas = (viaJson && !checkAndSkipExisting)
      ? utilCloneJson(testOutputDatas)
      : testOutputDatas

    for (const testOutputData of testOutputDatas) {
      testOutputData.testResultOverview = utilGetTestResultOverview(testOutputData)

      if (checkAndSkipExisting) {
        const existing = await this.getTestResultOverviewByCompoundIndex(testOutputData)
        if (existing) continue
      }

      const dataToSave = (viaJson && checkAndSkipExisting)
        ? utilCloneJson(testOutputData)
        : testOutputData

      newTestOutputDatas.push({ testOutputData: dataToSave })
    }

    const ids = await this.testOutputDatas.bulkAdd(newTestOutputDatas, { allKeys: true })

    newTestOutputDatas.forEach((item, idx) => {
      const id = ids?.[idx] ?? undefined
      if (id !== undefined) {
        newTestResultOverviews.push({
          id,
          ...item.testOutputData.testResultOverview,
        })
      }
    })

    return this.testResultOverviews.bulkPut(newTestResultOverviews, { allKeys: true })
  }

  async replaceTestResultOverview(data: TestResultOverviewDB, viaJson: boolean = true) {
    const dataToSave = viaJson ? utilCloneJson(data) : data
    return this.testResultOverviews.put(dataToSave)
  }

  async replaceTestOutputData(
    data: TestOutputDataDB,
    viaJson: boolean = true,
  ) {
    const dataToSave = viaJson ? utilCloneJson(data) : data
    return this.testOutputDatas.put(dataToSave)
  }

  async getTestOutputDatas(ids: number[]) {
    return this.testOutputDatas.bulkGet(ids)
  }

  async removeTestOutputDataAndResultOverview(id: number) {
    // Attempt to delete the test result overview
    await this.testResultOverviews.delete(id)

    // Attempt to delete the test output data
    await this.testOutputDatas.delete(id)

    return true
  }

  async replaceTestOutputDataAndResultOverview(id: number, data: TestResultCommonOutput) {
    const dataToReplace = { id, testOutputData: data }
    const status = await this.replaceTestOutputData(dataToReplace)
    if (status) return this.replaceTestResultOverview({
      id: dataToReplace.id,
      ...data.testResultOverview,
    })
  }

  async renameTestNameOfTestOutputData(id: number, newName: string) {
    const updateStatus = await this.testOutputDatas.update(id, {
      'testOutputData.testConfig.testName': newName,
      'testOutputData.testResultOverview.testName': newName,
    })
    if (updateStatus) {
      return this.testResultOverviews.update(id, {
        testName: newName,
      })
    }
    else {
      return updateStatus
    }
  }
}

export const db = new CBTDatabase()
