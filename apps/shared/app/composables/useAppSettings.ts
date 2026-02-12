import { LocalStorageKeys } from '#layers/shared/shared/enums'

let storageSettings: ReturnType<typeof useLocalStorage<AppSettings>> | null = null

export default () => {
  if (!storageSettings) {
    storageSettings = useLocalStorage<AppSettings>(
      LocalStorageKeys.AppSettings,
      {
        theme: 'blue',
        notify: {
          releases: {
            indicator: true,
            popup: true,
          },
          dev: {
            indicator: true,
            popup: true,
          },
        },
        pages: {
          homePage: { size: 100 },
          testMaker: { size: 100 },
          testInterface: { size: 100 },
          testResults: { size: 100 },
          generateAnswerKey: { size: 100 },
        },
      },
      {
        mergeDefaults: (storageValue, defaults) => {
          if ('pdfCropper' in storageValue.pages) {
            storageValue.pages.testMaker = storageValue.pages.pdfCropper as { size: number }
          }
          return utilSelectiveMergeObj(defaults, storageValue)
        },
      },
    )
  }

  return storageSettings
}
