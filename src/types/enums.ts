export enum CbtUseState {
  UiSettings = 'CBT-UiSettings',
  TestSettings = 'CBT-TestSettings',
  MiscSettings = 'CBT-MiscSettings',
  TestSectionsList = 'CBT-TestSectionsList',
  CropperSectionsData = 'CBT-CropperSectionsData',
  TestSectionsData = 'CBT-TestSectionsData',
  TestQuestionsData = 'CBT-TestQuestionsData',
  TestSectionsSummary = 'CBT-TestSectionsSummary',
  CurrentTestState = 'CBT-CurrentTestState',
  TestSectionsImgUrls = 'CBT-TestSectionsImgUrls',
  LastLoggedAnswer = 'CBT-LastLoggedAnswer',
  CurrentResultsID = 'CBT-CurrentResultsID',
  ResultsTestQuestionsImgUrls = 'CBT-ResultsTestQuestionsImgUrls',
}

export enum DataFileNames {
  questionsPdf = 'questions.pdf',
  dataJson = 'data.json',
}

export enum MiscConsts {
  BackupNoticeDismissedKey = 'backupNoticeDismissed',
}

export enum ResultsPagePanels {
  Summary = 'summary',
  Detailed = 'detailed',
  MyTests = 'myTests',
}

export enum LocalStorageKeys {
  ResultsQuestionPanelWidth = 'CBT-ResultsQuestionPanelWidth',
  ResultsQuestionPanelImgBgColor = 'CBT-ResultsQuestionPanelImgBgColor',
}

export enum CBTInterfaceQueryParams {
  testName = 'name',
  testDuration = 'duration',
  submitMode = 'submit',
  timeFormat = 'timeformat',
  zipUrl = 'zipurl',
  allowPause = 'allowpause',
  imageScale = 'imagescale',
}
