import Dexie from 'dexie'
import type { Collection, EntityTable, InsertType } from 'dexie'
import type {
  CbtUiSettings,
  TestSectionListItem,
  CurrentTestState,
  TestSectionsData,
  TestQuestionData,
  TestLog,
  TestResultOverviewDB,
  TestResultOverviewsDBSortByOption,
  TestResultCommonOutput,
  TestNotes,
} from '#shared/types'
import { utilGetTestResultOverview } from '@/utils/utils'
import type {
  SettingsData,
  TestOutputDataDB,
  TestNotesDB,
  IPdf2CbtDB,
} from '#shared/types/db'

type SettingsDataWithID = SettingsData & {
  id: number
}

interface CurrentTestStateDB extends CurrentTestState {
  id: number
}

type TestSectionListItemDB = TestSectionListItem & {
  id: number
}

class Pdf2CbtDB extends Dexie implements IPdf2CbtDB {
  settingsData!: EntityTable<SettingsDataWithID, 'id'>
  testSectionsList!: EntityTable<TestSectionListItemDB, 'id'>
  currentTestState!: EntityTable<CurrentTestStateDB, 'id'>
  testQuestionsData!: EntityTable<TestQuestionData, 'queId'>
  testLog!: EntityTable<TestLog, 'id'>
  testResultOverviews!: EntityTable<TestResultOverviewDB, 'id'>
  testOutputDatas!: EntityTable<TestOutputDataDB, 'id'>
  testNotes!: EntityTable<TestNotesDB, 'id'>

  constructor() {
    super('CBT-Interface')

    this.version(4).stores({
      settingsData: 'id',
      testSectionsList: 'id++',
      currentTestState: 'id',
      testQuestionsData: 'queId',
      testLog: 'id',
      testResultOverviews: 'id,testName,testStartTime,testEndTime,[testName+testStartTime+testEndTime]',
      testOutputDatas: 'id++',
      testNotes: 'id',
    }).upgrade(async (tx) => {
      const table = tx.table('settingsData')

      await table.toCollection().modify((record) => {
        const ui = record.uiSettings as CbtUiSettings
        if (!ui) return

        ui.themes.base.bgColor = utilEnsureHashInHexColor(ui.themes.base.bgColor)
        ui.themes.base.textColor = utilEnsureHashInHexColor(ui.themes.base.textColor)

        ui.themes.primary.bgColor = utilEnsureHashInHexColor(ui.themes.primary.bgColor)
        ui.themes.primary.textColor = utilEnsureHashInHexColor(ui.themes.primary.textColor)

        ui.themes.secondary.bgColor = utilEnsureHashInHexColor(ui.themes.secondary.bgColor)
        ui.themes.secondary.textColor = utilEnsureHashInHexColor(ui.themes.secondary.textColor)

        const icons = ui.questionPalette?.quesIcons
        if (icons) {
          const keys = ['answered', 'notAnswered', 'notVisited', 'marked', 'markedAnswered'] as const
          for (const key of keys) {
            icons[key].textColor = utilEnsureHashInHexColor(icons[key].textColor)
          }
        }
      })
    })
  }

  async getSettings() {
    return this.settingsData.get(1).then((data) => {
      if (!data) return null

      const { id, ...rest } = data
      return rest
    })
      .catch(_ => null)
  }

  async replaceSettings(data: SettingsData) {
    return this.settingsData.put({ id: 1, ...data })
  }

  async addLog(testLog: TestLog) {
    return this.testLog.add(testLog)
  }

  async putTestData(
    testSectionsList: TestSectionListItem[],
    currentTestState: CurrentTestState,
    testSectionsData: TestSectionsData,
  ) {
    const testQuestionsData: TestQuestionData[] = testSectionsList
      .flatMap(({ name: sectionName }) => Object.values(testSectionsData[sectionName] ?? {}))

    return this.transaction(
      'rw',
      this.testSectionsList,
      this.currentTestState,
      this.testQuestionsData,
      async () => {
        await this.testSectionsList.bulkPut(testSectionsList)
        await this.currentTestState.put({ id: 1, ...currentTestState })
        await this.testQuestionsData.bulkPut(testQuestionsData)
      },
    )
  }

  async getTestData() {
    return this.transaction(
      'r',
      this.testSectionsList,
      this.currentTestState,
      this.testQuestionsData,
      this.testLog,
      async () => {
        const testSectionsListRaw = await this.testSectionsList.toArray()
        if (testSectionsListRaw.length === 0)
          throw new Error('testSectionsList is empty in db')

        const testSectionsList = testSectionsListRaw.map(({ id, ...rest }) => rest as TestSectionListItem)

        const currentTestStateRaw = await this.currentTestState.get(1)
        if (!currentTestStateRaw)
          throw new Error('currentTestState is empty in db')

        const { id, ...currentTestState } = currentTestStateRaw

        const testQuestionsData = await this.testQuestionsData.toArray()
        if (testQuestionsData.length === 0)
          throw new Error('testQuestionsData is empty in db')

        const testSectionsData: TestSectionsData = {}
        for (const questionData of testQuestionsData) {
          const section = questionData.section
          const questionKey = questionData.que
          testSectionsData[section] ??= {}
          testSectionsData[section][questionKey] = questionData
        }

        const testLogs = await this.testLog.toArray()

        return {
          testSectionsList,
          currentTestState,
          testSectionsData,
          totalQuestions: testQuestionsData.length,
          testLogs,
        }
      },
    )
  }

  async getTestStatus() {
    return this.currentTestState.get(1).then(testState => testState?.testStatus)
  }

  async clearTestSectionsList() {
    return this.testSectionsList.clear()
  }

  async clearTestQuestionsData() {
    return this.testQuestionsData.clear()
  }

  async clearCurrentTestState() {
    return this.currentTestState.clear()
  }

  async clearTestLogs() {
    return this.testLog.clear()
  }

  async clearTestDataInDB() {
    return this.transaction(
      'rw',
      this.currentTestState,
      this.testSectionsList,
      this.testQuestionsData,
      this.testLog,
      async () => {
        await this.currentTestState.clear()
        await this.testSectionsList.clear()
        await this.testQuestionsData.clear()
        await this.testLog.clear()
      },
    )
  }

  async updateQuestionData(questionData: TestQuestionData) {
    const { status, answer, timeSpent, queId } = questionData
    const updatedData = {
      status,
      answer: Array.isArray(answer) ? [...answer] : answer,
      timeSpent,
    }

    this.testQuestionsData.update(queId, updatedData)
  }

  async updateCurrentTestState(
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

  async getTestOutputData(id: number) {
    return this.testOutputDatas.get(id)
  }

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

  async getTestResultOverviewByCompoundIndex(data: TestResultOverview) {
    const { testName, testStartTime, testEndTime } = data

    return this.testResultOverviews
      .where('[testName+testStartTime+testEndTime]')
      .equals([testName, testStartTime, testEndTime])
      .first()
  }

  async getTestResultOverviewsByCompoundIndexes(
    compoundIndexes: Array<[
      TestResultOverview['testName'],
      TestResultOverview['testStartTime'],
      TestResultOverview['testEndTime'],
    ]>,
  ): Promise<TestResultOverviewDB[]> {
    return this.testResultOverviews
      .where('[testName+testStartTime+testEndTime]')
      .anyOf(compoundIndexes)
      .toArray()
  }

  async getTestResultOverviews(
    sortBy: TestResultOverviewsDBSortByOption,
    limit: number | null = null,
  ) {
    let collection: Collection<TestResultOverviewDB, number, InsertType<TestResultOverviewDB, 'id'>>
      | null = null

    switch (sortBy) {
      case 'addedAscending':
        collection = this.testResultOverviews.orderBy('id')
        break
      case 'addedDescending':
        collection = this.testResultOverviews.orderBy('id').reverse()
        break
      case 'startTimeAscending':
        collection = this.testResultOverviews.orderBy('testStartTime')
        break
      case 'startTimeDescending':
        collection = this.testResultOverviews.orderBy('testStartTime').reverse()
        break
      case 'endTimeAscending':
        collection = this.testResultOverviews.orderBy('testEndTime')
        break
      case 'endTimeDescending':
        collection = this.testResultOverviews.orderBy('testEndTime').reverse()
        break
    }

    if (!collection) return []

    if (limit && limit > 0)
      collection = collection.limit(limit)

    return collection.toArray()
  }

  async addTestOutputData(testOutputData: TestResultCommonOutput) {
    const testResultOverview = utilGetTestResultOverview(testOutputData)
    testOutputData.testResultOverview = testResultOverview

    const existing = await this.getTestResultOverviewByCompoundIndex(testResultOverview)

    if (existing) {
      return existing.id
    }
    const id = await this.testOutputDatas.add({ testOutputData })

    return this.replaceTestResultOverview({
      id: id!,
      ...testResultOverview,
    })
  }

  async bulkAddTestOutputData(testOutputDatas: TestResultCommonOutput[]) {
    const newTestOutputDatas: { testOutputData: TestResultCommonOutput }[] = []
    const newTestResultOverviews: TestResultOverviewDB[] = []

    const testNotes: (TestNotes | null)[] = []

    for (const testOutputData of testOutputDatas) {
      testOutputData.testResultOverview = utilGetTestResultOverview(testOutputData)

      if (testOutputData.testNotes) {
        testNotes.push(testOutputData.testNotes)
        delete testOutputData.testNotes
      }
      else {
        testNotes.push(null)
      }

      newTestOutputDatas.push({ testOutputData })
    }

    return this.transaction(
      'rw',
      [this.testOutputDatas, this.testNotes, this.testResultOverviews],
      async () => {
        const ids = await this.testOutputDatas.bulkAdd(newTestOutputDatas, { allKeys: true })
        const newTestNotes: TestNotesDB[] = []

        newTestOutputDatas.forEach((item, idx) => {
          const id = ids?.[idx] ?? undefined

          if (id !== undefined) {
            newTestResultOverviews.push({
              id,
              ...item.testOutputData.testResultOverview,
            })

            const notes = testNotes[idx]
            if (notes) {
              newTestNotes.push({
                id,
                notes,
              })
            }
          }
        })

        await this.testNotes.bulkPut(newTestNotes)
        return this.testResultOverviews.bulkPut(newTestResultOverviews, { allKeys: true })
      },
    )
  }

  async replaceTestResultOverview(data: TestResultOverviewDB) {
    return this.testResultOverviews.put(data)
  }

  async replaceTestOutputData(data: TestOutputDataDB) {
    return this.testOutputDatas.put(data)
  }

  async getTestOutputDatas(ids: number[]) {
    return this.testOutputDatas.bulkGet(ids)
  }

  async removeTestOutputDataAndResultOverview(id: number) {
    return this.transaction('rw', [this.testResultOverviews, this.testOutputDatas], async () => {
      await this.testResultOverviews.delete(id)
      await this.testOutputDatas.delete(id)
      return true
    })
  }

  async replaceTestOutputDataAndResultOverview(id: number, data: TestResultCommonOutput) {
    return this.transaction(
      'rw',
      [this.testOutputDatas, this.testResultOverviews],
      async () => {
        const dataToReplace = { id, testOutputData: data }
        const status = await this.replaceTestOutputData(dataToReplace)

        if (!status) return false

        return !!this.replaceTestResultOverview({
          id,
          ...data.testResultOverview,
        })
      },
    )
  }

  async renameTestNameOfTestOutputData(id: number, newName: string) {
    return this.transaction(
      'rw',
      [this.testOutputDatas, this.testResultOverviews],
      async () => {
        const updateStatus = await this.testOutputDatas.update(id, {
          'testOutputData.testConfig.testName': newName,
          'testOutputData.testResultOverview.testName': newName,
        })

        if (!updateStatus) return false

        return !!this.testResultOverviews.update(id, {
          testName: newName,
        })
      })
  }

  async getTestNotes(testId: number) {
    try {
      const testNotes = await this.testNotes.get(testId)
      if (testNotes) {
        return testNotes.notes
      }
      else {
        await this.testNotes.add({ id: testId, notes: {} })
        return {}
      }
    }
    catch (err) {
      console.error('Error in getTestNotes function:', err)
      return null
    }
  }

  async putTestNotes(testId: number, testNotes: TestNotes) {
    return this.testNotes.put({ id: testId, notes: testNotes })
  }

  async bulkGetTestNotes(ids: number[]) {
    return this.testNotes.bulkGet(ids)
  }

  async replaceTestQuestionNotes(testId: number, queId: number | string, notesText: string = '') {
    return this.testNotes.update(testId, {
      [`notes.${queId}`]: notesText,
    })
  }
}

export const db = new Pdf2CbtDB()
