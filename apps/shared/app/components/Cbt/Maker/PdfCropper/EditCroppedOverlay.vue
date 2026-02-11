<script lang="ts" setup>
import type { CroppedOverlayResizeDirection } from '#layers/shared/shared/constants'
import { SEPARATOR } from '#layers/shared/shared/constants'
import {
  activeOverlayIdKey,
  pagesImgDataKey,
  pageZoomScaleKey,
  pdfPagesContainerDimsKey,
  cropperOverlayDatasKey,
  overlaysPerQuestionDataKey,
} from '../keys'

const {
  currentPageNum,
} = defineProps<{
  currentPageNum: number
}>()

const overlays = inject(cropperOverlayDatasKey)!
const pageZoomScale = inject(pageZoomScaleKey)!
const overlaysPerQuestionData = inject(overlaysPerQuestionDataKey)!
const pdfPagesContainerDims = inject(pdfPagesContainerDimsKey)!
const activeId = inject(activeOverlayIdKey)!
const pagesImgData = inject(pagesImgDataKey)!

const croppedOverlaysContainerElem = shallowRef<SVGElement | HTMLElement | null>(null)

const emit = defineEmits<{
  setCroppedRect: [data: PdfCroppedOverlayCoords]
}>()

const settings = usePdfCropperLocalStorageSettings()

const contextMenuElem = useTemplateRef('contextMenuElem')

const magicKeys = useMagicKeys()
const isHoldingCtrl = magicKeys['Ctrl']!
const isEscapePressed = magicKeys['Escape']!

const resizeDir = shallowRef<CroppedOverlayResizeDirection | null>(null)
const startPointer = shallowReactive({ x: 0, y: 0 })
const startBox = shallowReactive({ l: 0, t: 0, r: 0, b: 0 })

const contextMenuState = shallowReactive({
  copiedCoords: null as PdfCroppedOverlayCoords | null,
  showDeleteAllCurrentPageDialog: false,
  showDeleteAllDialog: false,
})

const eventListenersToCleanup: {
  pointermove: (() => void) | null
  pointerup: (() => void) | null
  pointerdown: (() => void) | null
  contextmenu: (() => void) | null
  keydown: (() => void) | null
} = {
  pointermove: null,
  pointerup: null,
  pointerdown: null,
  contextmenu: null,
  keydown: null,
}

const cleanUpEventListeners = (
  listenersToClean: (keyof (typeof eventListenersToCleanup))[] | null = null,
) => {
  if (!listenersToClean) {
    listenersToClean = Object.keys(eventListenersToCleanup) as (keyof (typeof eventListenersToCleanup))[]
  }
  for (const key of listenersToClean) {
    const listener = eventListenersToCleanup[key]
    if (listener) {
      listener()
      eventListenersToCleanup[key] = null
    }
  }
}

const onOpenContextMenu = (e: MouseEvent): void => {
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

const setActiveOverlayToNone = () => {
  activeId.value = ''
  cleanUpEventListeners()
}

const deleteActiveOverlay = () => {
  overlays.value.delete(activeId.value)
  setActiveOverlayToNone()
}

const clearAllOverlaysData = () => {
  if (contextMenuState.showDeleteAllDialog) {
    contextMenuState.showDeleteAllDialog = false
  }
  else {
    return
  }

  overlays.value.clear()
  overlaysPerQuestionData.clear()
  setActiveOverlayToNone()
}

const deleteAllOverlaysOnCurrentPage = async () => {
  if (contextMenuState.showDeleteAllCurrentPageDialog) {
    contextMenuState.showDeleteAllCurrentPageDialog = false
  }
  else {
    return
  }

  setActiveOverlayToNone()
  await nextTick()

  const overlayIdsToDelete: string[] = []
  const currentPageImgData = pagesImgData[currentPageNum]
  if (currentPageImgData) {
    for (const [id, overlay] of overlays.value) {
      if (overlay.coords.t >= currentPageImgData.top
        && overlay.coords.b <= currentPageImgData.bottom
      ) {
        overlayIdsToDelete.push(id)
      }
    }
  }

  const sortedIds = overlayIdsToDelete.toSorted((a, b) => {
    const [subA, qA, iA] = a.split(SEPARATOR)
    const [subB, qB, iB] = b.split(SEPARATOR)

    if (subA !== subB) return String(subA).localeCompare(String(subB))
    if (qA !== qB) return Number(qA) - Number(qB)

    return Number(iB) - Number(iA) // Descending order of image/overlay number
  })

  for (const id of sortedIds) {
    activeId.value = id
    await nextTick()
    overlays.value.delete(id)
  }

  setActiveOverlayToNone()
}

const copyRegion = () => {
  const coords = overlays.value.get(activeId.value)?.coords
  if (!coords) return

  contextMenuState.copiedCoords = { ...coords }
  setActiveOverlayToNone()
}

const pasteRegion = () => {
  if (!contextMenuState.copiedCoords) return
  emit('setCroppedRect', { ...contextMenuState.copiedCoords })
  contextMenuState.copiedCoords = null
}

watch(isEscapePressed, (isPressed) => {
  if (isPressed && activeId.value) {
    cleanUpEventListeners()
    activeId.value = ''
  }
})

const onPointerMove = (e: PointerEvent) => {
  const id = activeId.value
  if (!id) return
  const currentRelPointerCoords = getCurrentRelPointerXAndYCoords(e)
  if (!currentRelPointerCoords) return

  const dw = currentRelPointerCoords.x - startPointer.x
  const dh = currentRelPointerCoords.y - startPointer.y

  const coords = overlays.value.get(id)?.coords
  if (!coords) return

  const containerW = pdfPagesContainerDims.w
  const containerH = pdfPagesContainerDims.h
  if (!resizeDir.value) {
    // Dragging
    const width = startBox.r - startBox.l
    const height = startBox.b - startBox.t
    const newL = utilClampNumber(startBox.l + dw, 0, containerW - width)
    const newT = utilClampNumber(startBox.t + dh, 0, containerH - height)
    coords.l = newL
    coords.t = newT
    coords.r = newL + width
    coords.b = newT + height
  }
  else {
    // Resizing
    let { l, t, r, b } = startBox

    switch (resizeDir.value) {
      case 'top-left':
        l += dw
        t += dh
        break
      case 'top':
        t += dh
        break
      case 'top-right':
        r += dw
        t += dh
        break
      case 'right':
        r += dw
        break
      case 'bottom-right':
        r += dw
        b += dh
        break
      case 'bottom':
        b += dh
        break
      case 'bottom-left':
        l += dw
        b += dh
        break
      case 'left':
        l += dw
        break
    }

    l = utilClampNumber(l, 0, containerW)
    r = utilClampNumber(r, 0, containerW)
    t = utilClampNumber(t, 0, containerH)
    b = utilClampNumber(b, 0, containerH)

    coords.l = Math.min(l, r)
    coords.t = Math.min(t, b)
    coords.r = Math.max(l, r)
    coords.b = Math.max(t, b)
  }
}

function getCurrentRelPointerXAndYCoords(e: PointerEvent) {
  if (!croppedOverlaysContainerElem.value) return
  e.preventDefault()
  const rect = croppedOverlaysContainerElem.value.getBoundingClientRect()
  const xRel = e.clientX - rect.left
  const yRel = e.clientY - rect.top

  const scale = pageZoomScale.value

  return {
    x: utilClampNumber(xRel, 0, pdfPagesContainerDims.w, scale),
    y: utilClampNumber(yRel, 0, pdfPagesContainerDims.h, scale),
  }
}

const throttledOnPointerMove = useThrottleFn(
  onPointerMove,
  () => settings.value.general.selectionThrottleInterval,
  true,
)

const onPointerUp = () => {
  resizeDir.value = null
  cleanUpEventListeners(['pointermove', 'pointerup'])
}

const onKeyDown = (e: KeyboardEvent) => {
  if (isHoldingCtrl.value) {
    const key = e.key.toLowerCase()
    if (key === 'c') {
      e.preventDefault()
      copyRegion()
      return
    }
    else if (key === 'v') {
      e.preventDefault()
      pasteRegion()
      return
    }
  }

  const id = activeId.value
  if (!id) return

  const coords = overlays.value.get(id)?.coords
  if (!coords) return
  e.preventDefault()

  const moveAmount = settings.value.general.moveOnKeyPressDistance

  switch (e.key) {
    case 'Delete': {
      deleteActiveOverlay()
      break
    }
    case 'ArrowUp': {
      const dh = Math.max(0, coords.t - moveAmount)
      if (dh !== coords.t) {
        coords.t = dh
        coords.b = Math.max(0, coords.b - moveAmount)
      }
      break
    }
    case 'ArrowDown': {
      const containerH = pdfPagesContainerDims.h
      const dh = Math.min(coords.b + moveAmount, containerH)
      if (dh !== coords.b) {
        coords.b = dh
        coords.t = Math.min(coords.t + moveAmount, containerH)
      }
      break
    }
    case 'ArrowLeft': {
      const dw = Math.max(0, coords.l - moveAmount)
      if (dw !== coords.l) {
        coords.l = dw
        coords.r = Math.max(0, coords.r - moveAmount)
      }
      break
    }
    case 'ArrowRight': {
      const containerW = pdfPagesContainerDims.w
      const dw = Math.min(coords.r + moveAmount, containerW)
      if (dw !== coords.r) {
        coords.r = dw
        coords.l = Math.min(coords.l + moveAmount, containerW)
      }
      break
    }
  }
}

const addEventListeners = (
  listenersToAdd: (keyof (typeof eventListenersToCleanup))[],
) => {
  cleanUpEventListeners(listenersToAdd)

  for (const key of listenersToAdd) {
    switch (key) {
      case 'pointermove':
        eventListenersToCleanup.pointermove = useEventListener(croppedOverlaysContainerElem, 'pointermove', throttledOnPointerMove)
        break
      case 'pointerup':
        eventListenersToCleanup.pointerup = useEventListener(window, 'pointerup', onPointerUp)
        break
      case 'keydown':
        eventListenersToCleanup.keydown = useEventListener(croppedOverlaysContainerElem, 'keydown', onKeyDown)
        break
      case 'contextmenu':
        eventListenersToCleanup.contextmenu = useEventListener(croppedOverlaysContainerElem, 'contextmenu', (e: PointerEvent) => {
          e.preventDefault()
          e.stopPropagation()
          onOpenContextMenu(e)
        })
        break
    }
  }
}

function onPointerDown(e: PointerEvent, id: string) {
  if (e.pointerType === 'mouse' && e.buttons !== 1 && e.buttons !== 2) return

  if (activeId.value !== id) {
    activeId.value = id
    cleanUpEventListeners()
    addEventListeners(['keydown', 'contextmenu'])
    return
  }

  if (e.buttons === 2) return

  const coords = overlays.value.get(id)?.coords
  if (!coords) return
  const currentRelPointerCoords = getCurrentRelPointerXAndYCoords(e)
  if (!currentRelPointerCoords) return

  startPointer.x = currentRelPointerCoords.x
  startPointer.y = currentRelPointerCoords.y
  resizeDir.value = null

  Object.assign(startBox, { ...coords })
  addEventListeners(['pointermove', 'pointerup', 'keydown', 'contextmenu'])
}

function startResize(e: PointerEvent, id: string, dir: CroppedOverlayResizeDirection) {
  if (e.pointerType === 'mouse' && e.buttons !== 1) return

  const coords = overlays.value.get(id)?.coords
  if (!coords) return
  const currentRelPointerCoords = getCurrentRelPointerXAndYCoords(e)
  if (!currentRelPointerCoords) return

  startPointer.x = currentRelPointerCoords.x
  startPointer.y = currentRelPointerCoords.y
  resizeDir.value = dir

  Object.assign(startBox, { ...coords })
  addEventListeners(['pointermove', 'pointerup'])
}

defineExpose({
  onPointerDownOnCroppedOverlay: onPointerDown,
  onStartResizeOnCroppedOverlay: startResize,
})

onBeforeMount(() => {
  croppedOverlaysContainerElem.value = document.getElementById('cropped-overlay-elem') || null
  useEventListener(croppedOverlaysContainerElem, 'pointerdown', () => activeId.value = '')
})
onMounted(() => {
  activeId.value = ''
})
onBeforeUnmount(() => {
  activeId.value = ''
})
</script>

<template>
  <UiDialog
    v-model:open="contextMenuState.showDeleteAllCurrentPageDialog"
  >
    <UiDialogContent>
      <UiDialogHeader>
        <UiDialogTitle class="mx-auto">
          Delete all on current page
        </UiDialogTitle>
      </UiDialogHeader>
      <p class="text-center text-lg mb-2">
        Are you sure you want to delete all regions on page #{{ currentPageNum }} ?<br>
      </p>
      <div class="flex justify-center gap-10 sm:gap-15 m-3 py-4">
        <BaseButton
          label="Yes"
          variant="warn"
          @click="deleteAllOverlaysOnCurrentPage"
        />
        <BaseButton
          label="No"
          @click="contextMenuState.showDeleteAllCurrentPageDialog = false"
        />
      </div>
    </UiDialogContent>
  </UiDialog>
  <UiDialog
    v-model:open="contextMenuState.showDeleteAllDialog"
  >
    <UiDialogContent>
      <UiDialogHeader>
        <UiDialogTitle class="mx-auto">
          Confirm Deleting All
        </UiDialogTitle>
      </UiDialogHeader>
      <p class="text-center text-lg mb-2">
        Are you sure you want to delete regions on all pages?<br>
      </p>
      <div class="flex justify-center gap-10 sm:gap-15 m-3 py-4">
        <BaseButton
          label="Yes"
          variant="warn"
          @click="clearAllOverlaysData"
        />
        <BaseButton
          label="No"
          @click="contextMenuState.showDeleteAllDialog = false"
        />
      </div>
    </UiDialogContent>
  </UiDialog>
  <UiContextMenu>
    <UiContextMenuTrigger
      class="hidden"
      @contextmenu.stop
      @click.stop
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
      <UiContextMenuItem
        inset
        :disabled="!activeId"
        @click="copyRegion"
      >
        Copy Region
        <UiContextMenuShortcut>Ctrl + C</UiContextMenuShortcut>
      </UiContextMenuItem>
      <UiContextMenuItem
        inset
        :disabled="!contextMenuState.copiedCoords"
        @click="pasteRegion"
      >
        Paste Region
        <UiContextMenuShortcut>Ctrl + V</UiContextMenuShortcut>
      </UiContextMenuItem>
      <UiContextMenuCheckboxItem
        v-model="settings.general.blurCroppedRegion"
        inset
      >
        Blur Cropped Region
      </UiContextMenuCheckboxItem>
      <UiContextMenuItem
        inset
        :disabled="!activeId"
        @click="deleteActiveOverlay"
      >
        Delete Region
        <UiContextMenuShortcut>Delete</UiContextMenuShortcut>
      </UiContextMenuItem>
      <UiContextMenuSub>
        <UiContextMenuSubTrigger inset>
          Delete all on...
        </UiContextMenuSubTrigger>
        <UiContextMenuSubContent class="w-48">
          <UiContextMenuItem @click="contextMenuState.showDeleteAllCurrentPageDialog = true">
            Current Page
          </UiContextMenuItem>
          <UiContextMenuItem @click="contextMenuState.showDeleteAllDialog = true">
            All Pages
          </UiContextMenuItem>
        </UiContextMenuSubContent>
      </UiContextMenuSub>
    </UiContextMenuContent>
  </UiContextMenu>
</template>
