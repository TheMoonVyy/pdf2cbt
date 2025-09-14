import { LocalStorageKeys } from '#layers/shared/shared/enums'

let storageSettings: ReturnType<typeof useLocalStorage<PdfCropperSettings>> | null = null

export default () => {
  if (!storageSettings) {
    storageSettings = useLocalStorage<PdfCropperSettings>(
      LocalStorageKeys.PdfCropperPageSettings,
      {
        general: {
          cropperMode: 'line',
          scale: 1,
          splitterPanelSize: 26, // in %
          /* For settings Drawer */
          // General Settings
          qualityFactor: 1.5,
          pageBGColor: '#ffffff',
          minCropDimension: 10, // units of coords
          moveOnKeyPressDistance: 10, // units of coords
          allowResizingPanels: true,
          // Crop Selection
          cropSelectionGuideColor: '#0000ff', // blue
          cropSelectionBgOpacity: 15, // in %
          cropSelectionSkipColor: '#8B0000', // dark red
          selectionThrottleInterval: 30, // in milliseconds
          // Cropped Region
          cropSelectedRegionColor: '#004D00', // dark variant of green
          cropSelectedRegionBgOpacity: 15, // in %
          showQuestionDetailsOnOverlay: true,
          blurCroppedRegion: true,
          blurIntensity: 1.5, // in px
        },
      },
      { mergeDefaults: (storageValue, defaults) => utilSelectiveMergeObj(defaults, storageValue) },
    )
  }
  return storageSettings
}
