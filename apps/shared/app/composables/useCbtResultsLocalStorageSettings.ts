import { LocalStorageKeys } from '#layers/shared/shared/enums'
import { RESULTS_QUESTION_PANEL_DRAWER_MIN_SIZE } from '#layers/shared/shared/constants'

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
          drawerWidth: RESULTS_QUESTION_PANEL_DRAWER_MIN_SIZE,
          imgPanelDir: 'left',
        },
      },
      {
        mergeDefaults: (storageValue, defaults) => {
          const result = utilSelectiveMergeObj(defaults, storageValue) as CbtResultsSettings
          // if drawerWidth in local storage is less then 80, then set to min size
          if (result.quePreview.drawerWidth < RESULTS_QUESTION_PANEL_DRAWER_MIN_SIZE)
            result.quePreview.drawerWidth = RESULTS_QUESTION_PANEL_DRAWER_MIN_SIZE
          return result
        },
      },
    )
  }

  return storageSettings
}
