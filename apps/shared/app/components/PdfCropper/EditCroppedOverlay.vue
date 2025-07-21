<template>
  <div
    class="absolute top-0 left-0 w-full h-full"
    :class="{
      'pointer-events-none': currentMode !== 'edit',
    }"
    @contextmenu.prevent="onOpenContextMenu"
    @click="setActiveOverlayToNone"
  >
    <div
      v-for="[id, item] in overlays"
      v-show="currentPageNum === item.pdfData.page"
      :key="id"
      class="cropped-overlay"
      :class="{
        active: activeId === id,
      }"
      :style="{
        '--l': item.pdfData.l,
        '--r': item.pdfData.r,
        '--t': item.pdfData.t,
        '--b': item.pdfData.b,
      }"
      @pointerdown="(e) => onPointerDown(e, id)"
      @click.stop
    >
      <div
        v-if="settings.general.showQuestionDetailsOnOverlay"
        class="overlay-label w-fit flex flex-wrap divide-x divide-current [&>span]:px-1"
      >
        <span>{{ item.section || item.subject }}</span>
        <span>
          Q: {{ item.que }}
          <template v-if="(overlaysPerQuestionData.get(item.queId) || 0) > 1">
            ({{ item.imgNum }})
          </template>
        </span>
        <span>
          {{ item.type.toUpperCase() }}
          <template v-if="item.type !== 'nat' && item.answerOptions !== '4' && item.answerOptions !== '4x4'">
            ({{ item.answerOptions }})
          </template>
        </span>
        <span>
          M: ({{ utilMarksWithSign(item.marks.cm) }}
          <template v-if="item.type === 'msq'">
            {{ utilMarksWithSign(item.marks.pm as number) }}
          </template>
          {{ utilMarksWithSign(item.marks.im) }})
        </span>
      </div>

      <template v-if="id === activeId">
        <div
          v-for="dir in resizeDirections"
          :key="dir"
          :class="`resizer ${dir}`"
          @pointerdown.stop.prevent="startResize($event, id, dir)"
        />
      </template>
    </div>
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
  </div>
</template>

<script lang="ts" setup>
import { SEPARATOR } from '#layers/shared/shared/constants'

const props = defineProps<{
  mainImgPanelElem: HTMLDivElement | null
  currentPageNum: number
  pageWidth: number
  pageHeight: number
  pageScale: number
  currentMode: PdfCropperCurrentMode
}>()

const overlays = defineModel<Map<string, PdfCroppedOverlayData>>({ required: true })

const overlaysPerQuestionData = defineModel<PdfCropperOverlaysPerQuestion>(
  'overlaysPerQuestionData',
  { required: true },
)

const activeId = defineModel<string>('activeOverlayId', { required: true })

const emit = defineEmits<{
  setPdfData: [data: PdfCroppedOverlayData['pdfData']]
}>()

const settings = usePdfCropperLocalStorageSettings()

const contextMenuElem = useTemplateRef('contextMenuElem')

const resizeDirections = [
  'top-left', 'top', 'top-right',
  'right', 'bottom-right', 'bottom',
  'bottom-left', 'left',
] as const

const magicKeys = useMagicKeys()
const isHoldingCtrl = magicKeys['Ctrl']!
const isEscapePressed = magicKeys['Escape']!

const resizeDir = shallowRef<string | null>(null)
const startPointer = shallowReactive({ x: 0, y: 0 })
const startBox = shallowReactive({ l: 0, t: 0, r: 0, b: 0 })

const contextMenuState = shallowReactive({
  copiedCoords: null as PdfCroppedOverlayData['pdfData'] | null,
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
  overlaysPerQuestionData.value.clear()
  setActiveOverlayToNone()
}

const deleteAllOverlaysOnCurrentPage = async () => {
  if (contextMenuState.showDeleteAllCurrentPageDialog) {
    contextMenuState.showDeleteAllCurrentPageDialog = false
  }
  else {
    return
  }

  const pageNum = props.currentPageNum
  setActiveOverlayToNone()
  await nextTick()

  const overlayIdsToDelete: string[] = []

  for (const [id, overlay] of overlays.value) {
    if (overlay.pdfData.page === pageNum) {
      overlayIdsToDelete.push(id)
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
  const pdfDataCoords = overlays.value.get(activeId.value)?.pdfData
  if (!pdfDataCoords) return

  contextMenuState.copiedCoords = { ...pdfDataCoords }
  activeId.value = ''
}

const pasteRegion = () => {
  if (!contextMenuState.copiedCoords) return
  emit('setPdfData', { ...contextMenuState.copiedCoords })
  contextMenuState.copiedCoords = null
}

watch(isEscapePressed, (isPressed) => {
  if (isPressed && props.currentMode === 'edit' && activeId.value) {
    cleanUpEventListeners()
    activeId.value = ''
  }
})

watch(() => props.currentMode, (newMode) => {
  if (newMode !== 'edit') {
    cleanUpEventListeners()
    contextMenuState.copiedCoords = null
    activeId.value = ''
  }
})

const onPointerMove = (e: PointerEvent) => {
  const id = activeId.value
  if (!id) return
  const dw = Math.floor((e.clientX - startPointer.x) / props.pageScale)
  const dh = Math.floor((e.clientY - startPointer.y) / props.pageScale)
  const pdfData = overlays.value.get(id)?.pdfData
  if (!pdfData) return

  if (!resizeDir.value) {
    // Dragging
    const width = startBox.r - startBox.l
    const height = startBox.b - startBox.t
    const newL = utilClampNumber(startBox.l + dw, 0, props.pageWidth - width)
    const newT = utilClampNumber(startBox.t + dh, 0, props.pageHeight - height)
    pdfData.l = newL
    pdfData.t = newT
    pdfData.r = newL + width
    pdfData.b = newT + height
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

    l = utilClampNumber(l, 0, props.pageWidth)
    r = utilClampNumber(r, 0, props.pageWidth)
    t = utilClampNumber(t, 0, props.pageHeight)
    b = utilClampNumber(b, 0, props.pageHeight)

    pdfData.l = Math.min(l, r)
    pdfData.t = Math.min(t, b)
    pdfData.r = Math.max(l, r)
    pdfData.b = Math.max(t, b)
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

  const pdfData = overlays.value.get(id)?.pdfData
  if (!pdfData) return
  e.preventDefault()

  const moveAmount = settings.value.general.moveOnKeyPressDistance

  switch (e.key) {
    case 'Delete': {
      deleteActiveOverlay()
      break
    }
    case 'ArrowUp': {
      const dh = Math.max(0, pdfData.t - moveAmount)
      if (dh !== pdfData.t) {
        pdfData.t = dh
        pdfData.b = Math.max(0, pdfData.b - moveAmount)
      }
      break
    }
    case 'ArrowDown': {
      const dh = Math.min(pdfData.b + moveAmount, props.pageHeight)
      if (dh !== pdfData.b) {
        pdfData.b = dh
        pdfData.t = Math.min(pdfData.t + moveAmount, props.pageHeight)
      }
      break
    }
    case 'ArrowLeft': {
      const dw = Math.max(0, pdfData.l - moveAmount)
      if (dw !== pdfData.l) {
        pdfData.l = dw
        pdfData.r = Math.max(0, pdfData.r - moveAmount)
      }
      break
    }
    case 'ArrowRight': {
      const dw = Math.min(pdfData.r + moveAmount, props.pageWidth)
      if (dw !== pdfData.r) {
        pdfData.r = dw
        pdfData.l = Math.min(pdfData.l + moveAmount, props.pageWidth)
      }
      break
    }
  }
}

const addEventListeners = (
  listenersToAdd: (keyof (typeof eventListenersToCleanup))[],
  e: PointerEvent | FocusEvent | KeyboardEvent | MouseEvent | null = null,
) => {
  const target = e?.currentTarget || window
  cleanUpEventListeners(listenersToAdd)

  for (const key of listenersToAdd) {
    switch (key) {
      case 'pointermove':
        eventListenersToCleanup.pointermove = useEventListener(window, 'pointermove', throttledOnPointerMove)
        break
      case 'pointerup':
        eventListenersToCleanup.pointerup = useEventListener(window, 'pointerup', onPointerUp)
        break
      case 'keydown':
        eventListenersToCleanup.keydown = useEventListener(props.mainImgPanelElem, 'keydown', onKeyDown)
        break
      case 'contextmenu':
        eventListenersToCleanup.contextmenu = useEventListener(target, 'contextmenu', (e: PointerEvent) => {
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
    addEventListeners(['keydown', 'contextmenu'], e)
    return
  }

  if (e.buttons === 2) return

  const overlay = overlays.value.get(id)
  if (!overlay) return

  const { page, ...coords } = overlay.pdfData
  if (!('l' in coords)) return

  resizeDir.value = null
  startPointer.x = e.clientX
  startPointer.y = e.clientY

  Object.assign(startBox, { ...coords })
  addEventListeners(['pointermove', 'pointerup', 'keydown', 'contextmenu'], e)
}

function startResize(e: PointerEvent, id: string, dir: typeof resizeDirections[number]) {
  if (e.pointerType === 'mouse' && e.buttons !== 1) return

  const overlay = overlays.value.get(id)
  if (!overlay) return

  const { page, ...coords } = overlay.pdfData ?? {}
  if (!('l' in coords)) return

  resizeDir.value = dir
  startPointer.x = e.clientX
  startPointer.y = e.clientY

  Object.assign(startBox, { ...coords })
  addEventListeners(['pointermove', 'pointerup'], e)
}
</script>
