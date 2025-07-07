import { LocalStorageKeys } from '#layers/shared/shared/enums'

let storageSettings: ReturnType<typeof useLocalStorage<CbtResultsSettings>> | null = null

export default () => {
  if (!storageSettings) {
    storageSettings = useLocalStorage<CbtResultsSettings>(
      LocalStorageKeys.ResultsPageSettings,
      {
        tableFontSizes: {
          questions: {
            header: 'small',
            body: 'small',
          },
          statusStats: {
            header: 'small',
            body: 'small',
          },
          resultStats: {
            header: 'small',
            body: 'small',
          },
          marksStats: {
            header: 'small',
            body: 'small',
          },
        },
        quePreview: {
          imgBgColor: '#ffffff',
          drawerWidth: 60,
        },
      },
      { mergeDefaults: (storageValue, defaults) => utilSelectiveMergeObj(defaults, storageValue) },
    )
  }

  return storageSettings
}
