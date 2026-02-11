<script lang="ts" setup>
import { pageZoomScaleKey, pdfPagesContainerDimsKey } from '../keys'

const currentCoords = defineModel<PdfCroppedOverlayCoords>({ required: true })

const settings = usePdfCropperLocalStorageSettings()

const emit = defineEmits<{
  setCroppedRect: [data: PdfCroppedOverlayCoords]
}>()

const pdfPagesContainerDims = inject(pdfPagesContainerDimsKey)!
const pageZoomScale = inject(pageZoomScaleKey)!

const svgElem = useTemplateRef('svgElem')

const contextMenuElem = useTemplateRef('contextMenuElem')

const state = shallowReactive({
  isDragging: false,
  startX: 0,
  startY: 0,
})

const eventListenersToCleanup = {
  pointermove: null as (() => void) | null,
  pointerup: null as (() => void) | null,
}

const throttledOnPointerMove = useThrottleFn(
  onPointerMove,
  () => settings.value.general.selectionThrottleInterval,
  true,
)

function getCurrentRelPointerXAndYCoords(e: PointerEvent) {
  if (!svgElem.value) return
  e.preventDefault()

  const rect = svgElem.value.getBoundingClientRect()
  const xRel = e.clientX - rect.left
  const yRel = e.clientY - rect.top

  const scale = pageZoomScale.value

  return {
    x: utilClampNumber(xRel, 0, pdfPagesContainerDims.w, scale),
    y: utilClampNumber(yRel, 0, pdfPagesContainerDims.h, scale),
  }
}

function onPointerMove(e: PointerEvent) {
  const pointerCoords = getCurrentRelPointerXAndYCoords(e)
  if (!pointerCoords) return

  const coords = currentCoords.value

  coords.l = Math.min(state.startX, pointerCoords.x)
  coords.r = Math.max(state.startX, pointerCoords.x)
  coords.t = Math.min(state.startY, pointerCoords.y)
  coords.b = Math.max(state.startY, pointerCoords.y)
}

function onPointerDown(e: PointerEvent) {
  const pointerCoords = getCurrentRelPointerXAndYCoords(e)
  if (!pointerCoords) return

  state.isDragging = true

  const coords = currentCoords.value
  const { x, y } = pointerCoords

  state.startX = x
  state.startY = y

  coords.l = x
  coords.r = x
  coords.t = y
  coords.b = y

  eventListenersToCleanup.pointermove?.()
  eventListenersToCleanup.pointermove = useEventListener(
    svgElem,
    'pointermove',
    throttledOnPointerMove,
  )

  eventListenersToCleanup.pointerup?.()
  eventListenersToCleanup.pointerup = useEventListener(
    window,
    'pointerup',
    onPointerUp,
  )
}

function onPointerUp(e: PointerEvent) {
  onPointerMove(e)
  state.isDragging = false

  eventListenersToCleanup.pointerup?.()
  eventListenersToCleanup.pointermove?.()
  eventListenersToCleanup.pointerup = null
  eventListenersToCleanup.pointermove = null

  const { l, r, t, b } = currentCoords.value
  emit('setCroppedRect', { l, r, t, b })
}

function onOpenContextMenu(e: PointerEvent) {
  if (!contextMenuElem.value) return
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: e.clientX,
    clientY: e.clientY,
    button: 2,
    buttons: 2,
    view: window,
  })
  contextMenuElem.value.dispatchEvent(event)
}
</script>

<template>
  <div class="absolute z-20 top-0 left-0 w-full h-full focus-visible:outline-hidden cursor-cell">
    <svg
      ref="svgElem"
      :viewBox="`0 0 ${pdfPagesContainerDims.w} ${pdfPagesContainerDims.h}`"
      preserveAspectRatio="none"
      tabindex="-1"
      @contextmenu.prevent="onOpenContextMenu"
      @pointerdown="onPointerDown"
    >
      <rect
        v-if="state.isDragging"
        :x="currentCoords.l"
        :y="currentCoords.t"
        :width="Math.abs(currentCoords.r - currentCoords.l)"
        :height="Math.abs(currentCoords.b - currentCoords.t)"
        class="box-cropper"
      />
    </svg>
    <UiContextMenu>
      <UiContextMenuTrigger
        class="hidden"
        @contextmenu.stop
      >
        <div ref="contextMenuElem" />
      </UiContextMenuTrigger>
      <UiContextMenuContent class="w-64">
        <UiContextMenuLabel
          class="text-center"
        >
          Cropped Regions
        </UiContextMenuLabel>
        <UiContextMenuSeparator />
        <UiContextMenuCheckboxItem
          v-model="settings.general.blurCroppedRegion"
          inset
        >
          Blur Cropped Region
        </UiContextMenuCheckboxItem>
      </UiContextMenuContent>
    </UiContextMenu>
  </div>
</template>
