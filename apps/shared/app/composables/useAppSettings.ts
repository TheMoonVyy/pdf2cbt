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
          pdfCropper: { size: 100 },
          testInterface: { size: 100 },
          testResults: { size: 100 },
          generateAnswerKey: { size: 100 },
        },
      },
      {
        mergeDefaults: (storageValue, defaults) => utilSelectiveMergeObj(defaults, storageValue),
      },
    )
  }

  return storageSettings
}
