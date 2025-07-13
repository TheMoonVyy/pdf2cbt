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
}
