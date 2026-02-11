import type { ShallowRef, InjectionKey, Reactive } from 'vue'

type PdfPagesContainerDims = {
  w: number
  h: number
}

type ReadonlyRefLike<T> = Readonly<Ref<T> | ShallowRef<T> | ComputedRef<T>>
type WriteableRefLike<T> = Ref<T> | ShallowRef<T> | WritableComputedRef<T>

export const pdfPagesContainerDimsKey
  = Symbol('pdfPagesContainerDims') as InjectionKey<PdfPagesContainerDims>

export const pdfPagesContainerScaledDimsKey
  = Symbol('pdfPagesContainerScaledDims') as InjectionKey<ReadonlyRefLike<PdfPagesContainerDims>>

export const pdfContainerScrollYKey
  = Symbol('pdfContainerScrollY') as InjectionKey<ReadonlyRefLike<number>>

export const pagesImgDataKey
  = Symbol('pagesImgData') as InjectionKey<Reactive<PagesImgData>>

export const testConfigKey
  = Symbol('testConfig') as InjectionKey<Reactive<PdfCropperJsonOutput['testConfig']>>

export const pageZoomScaleKey
  = Symbol('pageZoomScale') as InjectionKey<ReadonlyRefLike<number>>

export const activeOverlayIdKey
  = Symbol('activeOverlayId') as InjectionKey<WriteableRefLike<string>>

export const currentPagesToLoadKey
  = Symbol('currentPagesToLoad') as InjectionKey<ReadonlyRefLike<number[]>>

export const cropperModeKey
  = Symbol('cropperMode') as InjectionKey<ReadonlyRefLike<CropperMode>>

export const currentModeKey
  = Symbol('currentMode') as InjectionKey<ReadonlyRefLike<PdfCropperCurrentMode>>

export const currentSelectionCoordsKey
  = Symbol('currentSelectionCoords') as InjectionKey<WriteableRefLike<PdfCropperCurrentSelectionCoords>>

export const cropperOverlayIdsPerPageKey
  = Symbol('cropperOverlayIdsPerPage') as InjectionKey<Ref<CropperOverlayIdsPerPage>>

export const cropperOverlayDatasKey
  = Symbol('cropperOverlayDatas') as InjectionKey<Ref<Map<string, PdfCroppedOverlayInternalData>>>

export const instructionsDataKey
  = Symbol('instructionsData') as InjectionKey<Reactive<CbtMakerInternalInstructionsData>>

export const outputZipFileNameKey
  = Symbol('outputZipFileName') as InjectionKey<Ref<string>>

export const downloadDataKey
  = Symbol('downloadDataKey') as InjectionKey<ReadonlyRefLike<{
    jsonOutputData: CbtMakerJsonOutput
    pdfFile: Uint8Array | null
  }>>

export const overlaysPerQuestionDataKey
  = Symbol('overlaysPerQuestionData') as InjectionKey<Reactive<PdfCropperOverlaysPerQuestion>>
