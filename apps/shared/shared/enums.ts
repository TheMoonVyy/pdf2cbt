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
  ResultsCurrentTestNotes = 'CBT-ResultsCurrentTestNotes',
  ResultsQuestionPanelSettings = 'CBT-ResultsQuestionPanelSettings',
}

export enum DataFileNames {
  QuestionsPdf = 'questions.pdf',
  DataJson = 'data.json',
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
  AppSettings = 'pdf2cbt-app-settings',
  UpdatesState = 'pdf2cbt-updates-state',
  ResultsPageSettings = 'CBT-ResultsPageSettings',
  PdfCropperPageSettings = 'PDFCropperSettings',
  PagesSettings = 'pdf2cbt-pages-settings',
}

export enum DeprecatedLocalStorageKeys {
  ResultsQuestionPanelWidth = 'CBT-ResultsQuestionPanelWidth',
  ResultsQuestionPanelImgBgColor = 'CBT-ResultsQuestionPanelImgBgColor',
  PDfCropperOldSettings = 'pdf-cropper-settings',
  AppThemeVariant = 'pdf2cbt-theme-variant',
}

export enum CBTInterfaceQueryParams {
  TestName = 'name',
  TestDuration = 'duration',
  SubmitMode = 'submit',
  TimeFormat = 'timeformat',
  ZipUrl = 'zipurl',
  AllowPause = 'allowpause',
  ImageScale = 'imagescale',
}

export enum UpdatesPage {
  ReleasesContentBaseUrl = 'https://cdn.jsdelivr.net/gh/TheMoonVyy/pdf2cbt@prod/updates-content',
  DevContentBaseUrl = 'https://cdn.jsdelivr.net/gh/TheMoonVyy/pdf2cbt-dev-updates@main',
}
