<script lang="ts" setup>
import { pageZoomScaleKey, pdfPagesContainerDimsKey } from '../keys'

const emit = defineEmits<{
  setCroppedRect: [data: PdfCroppedOverlayCoords]
}>()

const currentCoords = defineModel<PdfCroppedOverlayCoords>({ required: true })

const pdfPagesContainerDims = inject(pdfPagesContainerDimsKey)!
const pageZoomScale = inject(pageZoomScaleKey)!

const settings = usePdfCropperLocalStorageSettings()

const svgElem = useTemplateRef('svgElem')
const contextMenuElem = useTemplateRef('contextMenuElem')

const magicKeys = useMagicKeys()
const isHoldingCtrl = magicKeys['Ctrl']!
const isHoldingShift = magicKeys['Shift']!

const state = shallowReactive({
  skipNextBottomLine: false,
  activeLine: 'l' as keyof PdfCroppedOverlayCoords,
})

const skipNextBottomLine = computed({
  get: () => {
    return isHoldingShift.value || state.skipNextBottomLine
  },
  set: v => state.skipNextBottomLine = v,
})

function undoLastLine() {
  const coords = currentCoords.value
  switch (state.activeLine) {
    case 'b':
      state.activeLine = 't'
      coords.b = 0
      coords.t = 0
      break
    case 't':
      state.activeLine = 'r'
      coords.t = 0
      coords.r = 0
      break
    case 'r':
      state.activeLine = 'l'
      coords.r = 0
      coords.l = 0
      break
  }
}

function onPointerMove(e: PointerEvent) {
  if (!svgElem.value) return
  e.preventDefault()

  const rect = svgElem.value.getBoundingClientRect()
  const xRel = e.clientX - rect.left
  const yRel = e.clientY - rect.top

  const line = state.activeLine
  const coords = currentCoords.value
  const scale = pageZoomScale.value

  switch (line) {
    case 'l':
    case 'r':
      coords[line] = utilClampNumber(xRel, 0, pdfPagesContainerDims.w, scale)
      break
    case 't':
    case 'b':
      coords[line] = utilClampNumber(yRel, 0, pdfPagesContainerDims.h, scale)
      break
  }
}

const throttledOnPointerMove = useThrottleFn(
  onPointerMove,
  () => settings.value.general.selectionThrottleInterval,
  true,
)

function setLineCropperCoord() {
  const line = state.activeLine
  switch (line) {
    case 'l':
      state.activeLine = 'r'
      break
    case 'r':
      state.activeLine = 't'
      break
    case 't':
      state.activeLine = 'b'
      break
    case 'b': {
      const coords = currentCoords.value

      const { t, b } = coords
      coords.t = Math.min(b, t)
      coords.b = Math.max(b, t)

      if (!skipNextBottomLine.value) {
        const { l, r, t, b } = coords
        emit('setCroppedRect', { l, r, t, b })
      }
      skipNextBottomLine.value = false
      coords.t = coords.b
      break
    }
  }
}

const onClick = (e: PointerEvent) => {
  onPointerMove(e)
  setLineCropperCoord()
}

const onKeyDown = (e: KeyboardEvent) => {
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
    undoLastLine()
    return
  }

  const line = state.activeLine

  let moveAmount = settings.value.general.moveOnKeyPressDistance

  if (line === 'l' || line === 'r') {
    if (key === 'ArrowLeft') {
      moveAmount = -moveAmount
    }
    else if (key !== 'ArrowRight') {
      return
    }
  }
  else if (line === 't' || line === 'b') {
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

  const coords = currentCoords.value

  if (line === 'l' || line === 'r') {
    const { l, r } = coords
    const oldValue = line === 'l' ? l : r
    const newValue = utilClampNumber(oldValue + moveAmount, 0, pdfPagesContainerDims.w)
    if (line === 'l') {
      coords.l = newValue
    }
    else {
      coords.r = newValue
    }
  }
  else {
    const { t, b } = coords
    const oldValue = line === 't' ? t : b
    const newValue = utilClampNumber(oldValue + moveAmount, 0, pdfPagesContainerDims.h)
    if (line === 't') {
      coords.t = newValue
    }
    else {
      coords.b = newValue
    }
  }
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
  <div
    class="absolute top-0 z-20 left-0 w-full h-full focus-visible:outline-hidden cursor-cell touch-none"
  >
    <svg
      ref="svgElem"
      :viewBox="`0 0 ${pdfPagesContainerDims.w} ${pdfPagesContainerDims.h}`"
      preserveAspectRatio="none"
      tabindex="-1"
      @contextmenu.prevent="onOpenContextMenu"
      @click="onClick"
      @pointermove="throttledOnPointerMove"
      @keydown="onKeyDown"
    >
      <!-- Left Line -->
      <line
        class="line-cropper"
        :class="{
          selected: state.activeLine !== 'l',
        }"
        :x1="currentCoords.l"
        :x2="currentCoords.l"
        y1="0"
        :y2="pdfPagesContainerDims.h"
      />
      <!-- Right Line -->
      <line
        v-if="state.activeLine !== 'l'"
        class="line-cropper"
        :class="{
          selected: state.activeLine === 't' || state.activeLine === 'b',
        }"
        :x1="currentCoords.r"
        :x2="currentCoords.r"
        y1="0"
        :y2="pdfPagesContainerDims.h"
      />
      <!-- Top Line -->
      <line
        v-if="state.activeLine === 't' || state.activeLine === 'b'"
        class="line-cropper"
        :class="{
          selected: state.activeLine === 'b',
        }"
        x1="0"
        :x2="pdfPagesContainerDims.w"
        :y1="currentCoords.t"
        :y2="currentCoords.t"
      />
      <!-- Bottom Line -->
      <line
        v-if="state.activeLine === 'b'"
        class="line-cropper"
        :class="{
          skip: skipNextBottomLine,
        }"
        x1="0"
        :x2="pdfPagesContainerDims.w"
        :y1="currentCoords.b"
        :y2="currentCoords.b"
      />
    </svg>
  </div>
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
        :disabled="state.activeLine === 'l'"
        @click="undoLastLine"
      >
        Undo Last Line
        <UiContextMenuShortcut>Ctrl + Z</UiContextMenuShortcut>
      </UiContextMenuItem>
      <UiContextMenuCheckboxItem
        v-model="skipNextBottomLine"
        inset
        :disabled="state.activeLine !== 'b'"
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
</template>
