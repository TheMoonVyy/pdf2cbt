<template>
  <div
    v-show="currentMode === 'crop'"
    ref="overlayContainerElem"
    class="absolute top-0 left-0 w-full h-full"
    :class="{
      'pointer-events-none': currentMode !== 'crop',
    }"
    :style="{
      '--l': currentOverlayData.pdfData.l,
      '--t': currentOverlayData.pdfData.t,
      '--r': currentOverlayData.pdfData.r,
      '--b': currentOverlayData.pdfData.b,
    }"
    @contextmenu.prevent="(e) => {
      if (cropperMode.isBox) {
        boxCropperState.isDragging = false
        cleanUpEventListeners()
        addEventListeners(['pointerdown'])
      }
      onOpenContextMenu(e)
    }"
  >
    <template v-if="cropperMode.isLine">
      <div
        class="line-cropper l"
        :class="{
          selected: lineCropperState.currentCoord !== 'l',
        }"
      />
      <div
        v-show="lineCropperState.currentCoord !== 'l'"
        class="line-cropper r"
        :class="{
          selected: lineCropperState.currentCoord === 't' || lineCropperState.currentCoord === 'b',
        }"
      />
      <div
        v-show="lineCropperState.currentCoord === 't' || lineCropperState.currentCoord === 'b'"
        class="line-cropper t"
        :class="{
          selected: lineCropperState.currentCoord === 'b',
        }"
      />
      <div
        v-show="lineCropperState.currentCoord === 'b'"
        class="line-cropper b"
        :class="{
          'skip-line': skipNextLine,
        }"
      />
    </template>
    <div
      v-else-if="props.cropperMode.isBox"
      v-show="boxCropperState.isDragging"
      class="box-cropper"
    />
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
          Line Cropper
        </UiContextMenuLabel>
        <UiContextMenuSeparator />
        <UiContextMenuItem
          inset
          :disabled="!props.cropperMode.isLine || lineCropperState.currentCoord === 'l'"
          @click="undoLastCoordLine"
        >
          Undo Last Line
          <UiContextMenuShortcut>Ctrl + Z</UiContextMenuShortcut>
        </UiContextMenuItem>
        <UiContextMenuCheckboxItem
          v-model="skipNextLine"
          inset
          :disabled="!props.cropperMode.isLine || lineCropperState.currentCoord !== 'b'"
        >
          Skip Next Bottom Line
          <UiContextMenuShortcut>Shift</UiContextMenuShortcut>
        </UiContextMenuCheckboxItem>
        <UiContextMenuSeparator />
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

<script lang="ts" setup>
const props = defineProps<{
  mainImgPanelElem: HTMLDivElement | null
  currentPageNum: number
  pageWidth: number
  pageHeight: number
  pageScale: number
  currentMode: PdfCropperCurrentMode
  cropperMode: CropperMode
}>()

const currentOverlayData = defineModel<PdfCroppedOverlayData>('currentOverlayData', { required: true })

const settings = usePdfCropperLocalStorageSettings()

const emit = defineEmits<{
  setPdfData: [data: PdfCroppedOverlayData['pdfData']]
}>()

const overlayContainerElem = useTemplateRef('overlayContainerElem')
const contextMenuElem = useTemplateRef('contextMenuElem')

const lineCropperState = shallowReactive({
  currentCoord: 'l' as 'l' | 'r' | 't' | 'b',
  skipNextLine: false,
})

const boxCropperState = shallowReactive({
  isDragging: false,
  startX: 0,
  startY: 0,
})

const magicKeys = useMagicKeys()
const isHoldingCtrl = magicKeys['Ctrl']!
const isHoldingShift = magicKeys['Shift']!

const skipNextLine = computed({
  get: () => {
    return isHoldingShift.value || lineCropperState.skipNextLine
  },
  set: (value) => {
    lineCropperState.skipNextLine = value
  },
})

const undoLastCoordLine = () => {
  if (props.currentMode !== 'crop' || !props.cropperMode.isLine) return
  const pdfData = currentOverlayData.value.pdfData
  switch (lineCropperState.currentCoord) {
    case 'b':
      lineCropperState.currentCoord = 't'
      pdfData.b = 0
      pdfData.t = 0
      break
    case 't':
      lineCropperState.currentCoord = 'r'
      pdfData.t = 0
      pdfData.r = 0
      break
    case 'r':
      lineCropperState.currentCoord = 'l'
      pdfData.r = 0
      pdfData.l = 0
      break
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

const eventListenersToCleanup: {
  pointermove: (() => void) | null
  pointerup: (() => void) | null
  pointerdown: (() => void) | null
  click: (() => void) | null
  keydown: (() => void) | null
  keyup: (() => void) | null
} = {
  pointermove: null,
  pointerup: null,
  pointerdown: null,
  click: null,
  keydown: null,
  keyup: null,
}

const cleanUpEventListeners = (
  listenersToClean: (keyof (typeof eventListenersToCleanup))[] | null = null,
  listernersToNotClean: (keyof (typeof eventListenersToCleanup))[] = [],
) => {
  if (!listenersToClean) {
    listenersToClean = Object.keys(eventListenersToCleanup) as (keyof (typeof eventListenersToCleanup))[]
  }
  for (const key of listenersToClean) {
    if (listernersToNotClean.includes(key)) continue

    const listener = eventListenersToCleanup[key]
    if (listener) {
      listener()
      eventListenersToCleanup[key] = null
    }
  }
}

const onBoxPointerDown = (e: PointerEvent) => {
  if (!props.cropperMode.isBox || props.currentMode !== 'crop') return
  if (!overlayContainerElem.value) return

  const pdfData = currentOverlayData.value.pdfData

  const rect = overlayContainerElem.value.getBoundingClientRect()
  const xRel = e.clientX - rect.left
  const yRel = e.clientY - rect.top

  const x = utilClampNumber(xRel, 0, props.pageWidth, props.pageScale)
  const y = utilClampNumber(yRel, 0, props.pageHeight, props.pageScale)

  boxCropperState.startX = x
  boxCropperState.startY = y
  pdfData.l = x
  pdfData.r = x
  pdfData.t = y
  pdfData.b = y

  boxCropperState.isDragging = true
  cleanUpEventListeners(null, ['pointerdown'])
  addEventListeners(['pointermove', 'pointerup'], true)
}

const onPointerMove = (e: PointerEvent) => {
  if (!overlayContainerElem.value) return
  e.preventDefault()

  const rect = overlayContainerElem.value.getBoundingClientRect()

  const xRel = e.clientX - rect.left
  const yRel = e.clientY - rect.top

  if (props.cropperMode.isBox && boxCropperState.isDragging) {
    const pdfData = currentOverlayData.value.pdfData

    const x = utilClampNumber(xRel, 0, props.pageWidth, props.pageScale)
    const y = utilClampNumber(yRel, 0, props.pageHeight, props.pageScale)

    pdfData.l = Math.min(boxCropperState.startX, x)
    pdfData.r = Math.max(boxCropperState.startX, x)
    pdfData.t = Math.min(boxCropperState.startY, y)
    pdfData.b = Math.max(boxCropperState.startY, y)
  }
  else if (props.cropperMode.isLine) {
    const currentCoord = lineCropperState.currentCoord
    const pdfData = currentOverlayData.value.pdfData

    switch (currentCoord) {
      case 'l':
        pdfData.l = utilClampNumber(xRel, 0, props.pageWidth, props.pageScale)
        break
      case 'r':
        pdfData.r = utilClampNumber(xRel, 0, props.pageWidth, props.pageScale)
        break
      case 't':
        pdfData.t = utilClampNumber(yRel, 0, props.pageHeight, props.pageScale)
        break
      case 'b':
        pdfData.b = utilClampNumber(yRel, 0, props.pageHeight, props.pageScale)
        break
    }
  }
}

const onBoxPointerUp = (e: PointerEvent) => {
  if (!boxCropperState.isDragging || !props.cropperMode.isBox || props.currentMode !== 'crop') return
  onPointerMove(e)
  cleanUpEventListeners(null, ['pointerdown'])
  boxCropperState.isDragging = false
  const pdfData = utilCloneJson(currentOverlayData.value.pdfData)
  pdfData.page = props.currentPageNum
  emit('setPdfData', pdfData)
}

const throttledOnPointerMove = useThrottleFn(
  onPointerMove,
  () => settings.value.general.selectionThrottleInterval,
  true,
)

const setLineCropperCoord = () => {
  const currentCoord = lineCropperState.currentCoord
  switch (currentCoord) {
    case 'l':
      lineCropperState.currentCoord = 'r'
      break
    case 'r':
      lineCropperState.currentCoord = 't'
      break
    case 't':
      lineCropperState.currentCoord = 'b'
      break
    case 'b': {
      const pdfData = currentOverlayData.value.pdfData

      const { t, b } = pdfData
      pdfData.t = Math.min(b, t)
      pdfData.b = Math.max(b, t)

      if (!skipNextLine.value) {
        const pdfDataToEmit = utilCloneJson(pdfData)
        pdfDataToEmit.page = props.currentPageNum
        emit('setPdfData', pdfDataToEmit)
      }
      skipNextLine.value = false
      if (currentOverlayData.value.subject) {
        pdfData.t = pdfData.b
      }
      break
    }
  }
}

const onClick = (e: PointerEvent) => {
  if (props.cropperMode.isLine) {
    onPointerMove(e)
    setLineCropperCoord()
  }
}

const onKeyDown = (e: KeyboardEvent) => {
  if (props.currentMode !== 'crop' || !props.cropperMode.isLine) return
  const key = e.key

  if (key !== 'ArrowUp'
    && key !== 'ArrowDown'
    && key !== 'ArrowLeft'
    && key !== 'ArrowRight'
    && key !== 'Enter'
    && key.toLowerCase() !== 'z'
  ) return

  if (key === 'Enter') {
    e.preventDefault()
    setLineCropperCoord()
    return
  }

  if (isHoldingCtrl.value && key.toLowerCase() === 'z') {
    e.preventDefault()
    undoLastCoordLine()
    return
  }

  const currentCoord = lineCropperState.currentCoord

  let moveAmount = settings.value.general.moveOnKeyPressDistance

  if (currentCoord === 'l' || currentCoord === 'r') {
    if (key === 'ArrowLeft') {
      moveAmount = -moveAmount
    }
    else if (key !== 'ArrowRight') {
      return
    }
  }
  else if (currentCoord === 't' || currentCoord === 'b') {
    if (key === 'ArrowUp') {
      moveAmount = -moveAmount
    }
    else if (key !== 'ArrowDown') {
      return
    }
  }
  else {
    return
  }

  e.preventDefault()

  const pdfData = currentOverlayData.value.pdfData

  if (currentCoord === 'l' || currentCoord === 'r') {
    const { l, r } = pdfData
    const oldValue = currentCoord === 'l' ? l : r
    const newValue = utilClampNumber(oldValue + moveAmount, 0, props.pageWidth)
    if (currentCoord === 'l') {
      pdfData.l = newValue
    }
    else {
      pdfData.r = newValue
    }
  }
  else {
    const { t, b } = pdfData
    const oldValue = currentCoord === 't' ? t : b
    const newValue = utilClampNumber(oldValue + moveAmount, 0, props.pageHeight)
    if (currentCoord === 't') {
      pdfData.t = newValue
    }
    else {
      pdfData.b = newValue
    }
  }
}

function addEventListeners(
  listenersToAdd: (keyof (typeof eventListenersToCleanup))[],
  skipPreCleanup: boolean = false,
) {
  if (!skipPreCleanup) cleanUpEventListeners(listenersToAdd)

  for (const key of listenersToAdd) {
    switch (key) {
      case 'pointerdown':
        eventListenersToCleanup.pointerdown = useEventListener(overlayContainerElem, 'pointerdown', onBoxPointerDown)
        break
      case 'pointermove':
        eventListenersToCleanup.pointermove = useEventListener(overlayContainerElem, 'pointermove', throttledOnPointerMove)
        break
      case 'keydown':
        eventListenersToCleanup.keydown = useEventListener(props.mainImgPanelElem, 'keydown', onKeyDown)
        break
      case 'click':
        eventListenersToCleanup.click = useEventListener(overlayContainerElem, 'click', onClick)
        break
      case 'pointerup':
        eventListenersToCleanup.pointerup = useEventListener(window, 'pointerup', onBoxPointerUp)
        break
    }
  }
}

watchEffect(() => {
  cleanUpEventListeners()
  if (props.currentMode === 'crop') {
    if (props.cropperMode.isLine) {
      skipNextLine.value = false
      addEventListeners(['pointermove', 'click', 'keydown', 'keyup'])
    }
    else if (props.cropperMode.isBox) {
      addEventListeners(['pointerdown'])
    }
  }
})

watch(() => props.currentPageNum,
  () => {
    if (props.currentMode === 'crop' && props.cropperMode.isLine) {
      if (lineCropperState.currentCoord === 'b') {
        skipNextLine.value = false
        lineCropperState.currentCoord = 't'
        currentOverlayData.value.pdfData.b = 0
      }
    }
  },
)
</script>
