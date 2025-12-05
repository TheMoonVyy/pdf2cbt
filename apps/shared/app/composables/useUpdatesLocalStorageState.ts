import { LocalStorageKeys } from '#layers/shared/shared/enums'

type UpdatesLocalStorageState = {
  releases: {
    version: string
    showIndicator: boolean
    showPopup: boolean
  }
  dev: {
    version: string
    showIndicator: boolean
    showPopup: boolean
  }
}

let cache: ReturnType<typeof useLocalStorage<UpdatesLocalStorageState>> | null = null
export default () => {
  return cache ??= useLocalStorage<UpdatesLocalStorageState>(
    LocalStorageKeys.UpdatesState,
    {
      releases: {
        version: '1.5.0',
        showIndicator: false,
        showPopup: false,
      },
      dev: {
        version: '0',
        showIndicator: false,
        showPopup: false,
      },
    },
    {
      mergeDefaults: (storageValue, defaults) => utilSelectiveMergeObj(defaults, storageValue),
    },
  )
}
