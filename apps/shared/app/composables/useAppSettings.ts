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
      },
      {
        mergeDefaults: (storageValue, defaults) => utilSelectiveMergeObj(defaults, storageValue),
        initOnMounted: true,
      },
    )
  }

  return storageSettings
}
