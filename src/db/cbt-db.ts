import Dexie, { type EntityTable } from 'dexie'
import type {
  CbtTestSettings,
  CbtUiSettings,
  TestSectionListItem,
  CurrentTestState,
  TestSectionsData,
  TestQuestionData,
  TestLog,
} from '~/src/types'

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

class CBTDatabase extends Dexie {
  settingsData!: EntityTable<SettingsData, 'id'>
  testSectionsList!: EntityTable<TestSectionListItemDB, 'id'>
  currentTestState!: EntityTable<CurrentTestStateDB, 'id'>
  testQuestionsData!: EntityTable<TestQuestionData, 'queId'>
  testLog!: EntityTable<TestLog, 'id'>

  constructor() {
    super('CBT-Interface')

    this.version(1).stores({
      settingsData: 'id',
      testSectionsList: 'id++',
      currentTestState: 'id',
      testQuestionsData: 'queId',
      testLog: 'id',
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
}

export const db = new CBTDatabase()
