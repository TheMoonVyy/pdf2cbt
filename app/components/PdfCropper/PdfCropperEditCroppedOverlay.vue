<template>
  <div
    class="absolute top-0 left-0 w-full h-full"
    :class="{
      'pointer-events-none': currentMode !== 'edit',
    }"
    @contextmenu.prevent="(e) => {
      if (contextMenuState.copiedCoords) contextMenuElem?.show(e)
    }"
    @click="setActiveOverlayToNone"
  >
    <template
      v-for="[id, item] in overlays"
      :key="id"
    >
      <div
        v-for="(pdfData, imgIndex) in item.pdfData"
        v-show="currentPageNum === pdfData.page"
        :key="imgIndex"
        class="cropped-overlay"
        :class="{
          active: active.id === id && (imgIndex + 1) === active.imgNum,
        }"
        :style="{
          '--l': pdfData.l,
          '--r': pdfData.r,
          '--t': pdfData.t,
          '--b': pdfData.b,
        }"
        @pointerdown="(e) => onPointerDown(e, id, imgIndex + 1)"
        @click.stop
      >
        <div
          v-if="showQuestionDetailsOnOverlay"
          class="overlay-label w-fit flex flex-wrap divide-x divide-current"
        >
          <span class="px-1">
            {{ item.section || item.subject }}
          </span>
          <span class="px-1">
            Q: {{ item.que }}
            <template v-if="item.pdfData.length > 1">
              ({{ imgIndex + 1 }})
            </template>
          </span>
          <span class="px-1">
            {{ item.type.toUpperCase() }}
            <template v-if="item.type !== 'nat' && item.options !== 4">
              ({{ item.options }})
            </template>
          </span>
          <span class="px-1">
            M: ({{ utilMarksWithSign(item.marks.cm) }}
            <template v-if="item.type === 'msq'">
              {{ utilMarksWithSign(item.marks.pm as number) }}
            </template>
            {{ utilMarksWithSign(item.marks.im) }})
          </span>
        </div>

        <template v-if="id === active.id && (imgIndex + 1) === active.imgNum">
          <div
            v-for="dir in resizeDirections"
            :key="dir"
            :class="`resizer ${dir}`"
            @pointerdown.stop.prevent="startResize($event, id, imgIndex + 1, dir)"
          />
        </template>
      </div>
    </template>
    <ContextMenu
      ref="contextMenuElem"
      :model="contextMenuItems"
    >
      <template #itemicon="{ item }">
        <Icon
          v-if="item.icon"
          :name="item.icon"
          class="text-lg"
        />
      </template>
    </ContextMenu>
  </div>
</template>

<script lang="ts" setup>
import ContextMenu from 'primevue/contextmenu'

const props = defineProps<{
  mainImgPanelElem: HTMLDivElement | null
  showQuestionDetailsOnOverlay: boolean
  currentPageNum: number
  pageWidth: number
  pageHeight: number
  pageScale: number
  selectionThrottleInterval: number
  moveOnKeyPressDistance: number
  currentMode: 'crop' | 'edit'
}>()

const overlays = defineModel<Map<string, PdfCroppedOverlayData>>({ required: true })

const active = defineModel<ActiveCroppedOverlay>('activeOverlay', { required: true })

const blurCroppedRegion = defineModel<boolean>('blurCroppedRegion', { required: true })

const emit = defineEmits<{
  setPdfData: [data: PdfCroppedOverlayData['pdfData'][number]]
}>()

const contextMenuElem = templateRef('contextMenuElem')

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
  copiedCoords: null as PdfCroppedOverlayData['pdfData'][number] | null,
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

const setActiveOverlayToNone = () => {
  active.value.id = ''
  active.value.imgNum = 0
  cleanUpEventListeners()
}

const deleteActiveOverlay = () => {
  const { id, imgNum } = active.value
  const pdfDatas = overlays.value.get(id)?.pdfData
  if (!pdfDatas) return

  if (pdfDatas.length > 1) {
    pdfDatas.splice(imgNum - 1, 1)
  }
  else {
    overlays.value.delete(id)
  }
  setActiveOverlayToNone()
}

const copyRegion = () => {
  const { id, imgNum } = active.value
  if (!id || !imgNum) return

  const pdfDataCoords = overlays.value.get(id)?.pdfData[imgNum - 1]
  if (!pdfDataCoords) return

  contextMenuState.copiedCoords = { ...pdfDataCoords }
  active.value.id = ''
  active.value.imgNum = 0
}

const pasteRegion = () => {
  if (!contextMenuState.copiedCoords) return
  emit('setPdfData', { ...contextMenuState.copiedCoords })
  contextMenuState.copiedCoords = null
}

const contextMenuItems = ref([
  {
    label: 'Delete',
    icon: 'prime:trash',
    visible: () => Boolean(active.value.id && active.value.imgNum > 0),
    command: deleteActiveOverlay,
  },
  {
    separator: true,
  },
  {
    label: 'Copy Region',
    icon: 'mdi:content-copy',
    visible: () => Boolean(active.value.id && active.value.imgNum),
    command: copyRegion,
  },
  {
    label: 'Paste Region',
    icon: 'mdi:content-paste',
    visible: () => !!contextMenuState.copiedCoords,
    command: pasteRegion,
  },
  {
    separator: true,
  },
  {
    label: 'Blur Cropped Regions',
    icon: 'mdi:eye',
    visible: () => !blurCroppedRegion.value,
    command: () => {
      blurCroppedRegion.value = true
    },
  },
  {
    label: 'Unblur Cropped Regions',
    icon: 'mdi:eye-off',
    visible: () => blurCroppedRegion.value,
    command: () => {
      blurCroppedRegion.value = false
    },
  },
])

watch(isEscapePressed, (isPressed) => {
  if (isPressed && props.currentMode === 'edit' && active.value.id && active.value.imgNum) {
    cleanUpEventListeners()
    active.value.id = ''
    active.value.imgNum = 0
  }
})

watch(() => props.currentMode, (newMode) => {
  if (newMode !== 'edit') {
    cleanUpEventListeners()
    contextMenuState.copiedCoords = null
    active.value.id = ''
    active.value.imgNum = 0
  }
})

const onPointerMove = (e: PointerEvent) => {
  if (!active.value.id) return
  const dw = Math.floor((e.clientX - startPointer.x) / props.pageScale)
  const dh = Math.floor((e.clientY - startPointer.y) / props.pageScale)
  const pdfDataCoords = overlays.value.get(active.value.id)?.pdfData[active.value.imgNum - 1]
  if (!pdfDataCoords) return

  if (!resizeDir.value) {
    // Dragging
    const width = startBox.r - startBox.l
    const height = startBox.b - startBox.t
    const newL = utilClampNumber(startBox.l + dw, 0, props.pageWidth - width)
    const newT = utilClampNumber(startBox.t + dh, 0, props.pageHeight - height)
    pdfDataCoords.l = newL
    pdfDataCoords.t = newT
    pdfDataCoords.r = newL + width
    pdfDataCoords.b = newT + height
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

    pdfDataCoords.l = Math.min(l, r)
    pdfDataCoords.t = Math.min(t, b)
    pdfDataCoords.r = Math.max(l, r)
    pdfDataCoords.b = Math.max(t, b)
  }
}

const throttledOnPointerMove = useThrottleFn(onPointerMove, () => props.selectionThrottleInterval, true)

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

  const { id, imgNum } = active.value
  if (!id || !imgNum) return

  const pdfData = overlays.value.get(id)?.pdfData[imgNum - 1]
  if (!pdfData) return
  e.preventDefault()

  const moveAmount = props.moveOnKeyPressDistance

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
          contextMenuElem.value?.show(e)
        })
        break
    }
  }
}

function onPointerDown(e: PointerEvent, id: string, imgNum: number) {
  if (e.pointerType === 'mouse' && e.buttons !== 1 && e.buttons !== 2) return
  const { id: activeId, imgNum: activeImgNum } = active.value

  if (activeId !== id || activeImgNum !== imgNum) {
    active.value.id = id
    active.value.imgNum = imgNum
    cleanUpEventListeners()
    addEventListeners(['keydown', 'contextmenu'], e)
    return
  }

  if (e.buttons === 2) return

  const overlay = overlays.value.get(activeId)
  if (!overlay) return

  const { page, ...coords } = overlay.pdfData[activeImgNum - 1] ?? {}
  if (!('l' in coords)) return

  resizeDir.value = null
  startPointer.x = e.clientX
  startPointer.y = e.clientY

  Object.assign(startBox, { ...coords })
  addEventListeners(['pointermove', 'pointerup', 'keydown', 'contextmenu'], e)
}

function startResize(e: PointerEvent, id: string, imgNum: number, dir: typeof resizeDirections[number]) {
  if (e.pointerType === 'mouse' && e.buttons !== 1) return

  const overlay = overlays.value.get(id)
  if (!overlay) return

  const { page, ...coords } = overlay.pdfData[imgNum - 1] ?? {}
  if (!('l' in coords)) return

  resizeDir.value = dir
  startPointer.x = e.clientX
  startPointer.y = e.clientY

  Object.assign(startBox, { ...coords })
  addEventListeners(['pointermove', 'pointerup'], e)
}
</script>
