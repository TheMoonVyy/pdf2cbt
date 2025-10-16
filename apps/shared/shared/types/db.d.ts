import type {
  PatternModeConfigJson,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/config-schema'

export type SettingsData = {
  testSettings: CbtTestSettings
  uiSettings: CbtUiSettings
}

export type TestNotesDB = {
  id: number
  notes: TestNotes
}

export type TestOutputDataDB = {
  id: number
  testOutputData: TestInterfaceOrResultJsonOutput
}

export type PatternModeConfigDB = {
  id: number
  data: {
    patternModeConfig: PatternModeConfigJson
  }
}

export interface IPdf2CbtDB {
  getSettings(): Promise<SettingsData | null>
  replaceSettings(data: SettingsData): Promise<number>
  addLog(testLog: TestLog): Promise<number>
  putTestData(
    testSectionsList: TestSectionListItem[],
    currentTestState: CurrentTestState,
    testSectionsData: TestSessionSectionsData,
  ): Promise<void>
  getTestData(): Promise<{
    testSectionsList: TestSectionListItem[]
    currentTestState: CurrentTestState
    testSectionsData: TestSessionSectionsData
    totalQuestions: number
    testLogs: TestLog[]
  }>
  getTestStatus(): Promise<CurrentTestState['testStatus'] | undefined>
  clearTestSectionsList(): Promise<void>
  clearTestQuestionsData(): Promise<void>
  clearCurrentTestState(): Promise<void>
  clearTestLogs(): Promise<void>
  clearTestDataInDB(): Promise<void>
  updateQuestionData(questionData: TestSessionQuestionData): Promise<void>
  updateCurrentTestState(
    currentTestState: CurrentTestState,
    _updateAll?: boolean,
    _updateSectionsPrevQuestion?: boolean,
  ): Promise<number>
  getTestOutputData(id: number): Promise<TestOutputDataDB | undefined>
  getTestResultOverview(id: number | null, getAll: true): Promise<TestResultOverviewDB[]>
  getTestResultOverview(id?: number | null, getAll?: false): Promise<TestResultOverviewDB | undefined>
  getTestResultOverviewByCompoundIndex(data: TestResultOverview): Promise<TestResultOverviewDB | undefined>
  getTestResultOverviewsByCompoundIndexes(
    compoundIndexes: Array<[
      TestResultOverview['testName'],
      TestResultOverview['testStartTime'],
      TestResultOverview['testEndTime'],
    ]>
  ): Promise<TestResultOverviewDB[]>
  getTestResultOverviews(
    sortBy: TestResultOverviewsDBSortByOption,
    limit?: number | null
  ): Promise<TestResultOverviewDB[]>
  addTestOutputData(testOutputData: TestInterfaceOrResultJsonOutput): Promise<number>
  bulkAddTestOutputData(testOutputDatas: TestInterfaceOrResultJsonOutput[]): Promise<number[]>
  replaceTestResultOverview(data: TestResultOverviewDB): Promise<number>
  replaceTestOutputData(data: TestOutputDataDB): Promise<number>
  getTestOutputDatas(ids: number[]): Promise<(TestOutputDataDB | undefined)[]>
  removeTestOutputDataAndResultOverview(id: number): Promise<boolean>
  replaceTestOutputDataAndResultOverview(id: number, data: TestInterfaceOrResultJsonOutput): Promise<boolean>
  renameTestNameOfTestOutputData(id: number, newName: string): Promise<boolean>
  getTestNotes(testId: number): Promise<TestNotes | null>
  putTestNotes(testId: number, testNotes: TestNotes): Promise<number>
  bulkGetTestNotes(ids: number[]): Promise<(TestNotesDB | undefined)[]>
  replaceTestQuestionNotes(
    testId: number,
    queId: number | string,
    notesText?: string,
  ): Promise<number>
  getAllPatternModeConfigNames(
    order?: 'inc' | 'dec'
  ): Promise<(PatternModeUserConfig | undefined)[]>
  getPatternModeConfig(id: number): Promise<PatternModeConfigDB | undefined>
  bulkGetPatternModeConfigs(
    ids: number[]
  ): Promise<PatternModeImportExportConfigData[]>
  addPatternModeConfig(configData: PatternModeImportExportConfigData): Promise<PatternModeUserConfig>
  bulkAddPatternModeConfigs(
    configs: { name: string, data: PatternModeConfigDB['data'] }[]
  ): Promise<{
    ids: number[]
    configNames: PatternModeUserConfig[]
  }>
  removePatternModeConfig(id: number): Promise<boolean>
  removePatternModeConfigs(ids: number[]): Promise<boolean>
  renamePatternModeConfig(id: number, newName: string): Promise<number>
  replacePatternModeConfig(
    newData: Omit<PatternModeImportExportConfigData, 'name'> & { id: number }
  ): Promise<boolean>
}
