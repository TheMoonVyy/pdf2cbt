<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  DialogClose,
  DialogContent,

  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
import { cn } from '#layers/shared/app/lib/utils'

type FnOrNull = (() => void) | null

const props = defineProps<DialogContentProps & { class?: HTMLAttributes['class'], title?: string }>()
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'title')

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const modelValue = defineModel<boolean>()

const resizable = useTemplateRef('resizable')

const directions = [
  'top', 'right', 'bottom', 'left',
  'top-left', 'top-right', 'bottom-left', 'bottom-right',
] as const

// for dialog layout
const coords = shallowReactive({ l: 400, t: 400, h: 300, w: 300 })

// State
const isResizeMode = shallowRef(false)
const resizing = ref(false)
const moving = ref(false)
const currentDir = ref('')
const minState = shallowReactive({
  w: 250,
  h: 200,
})
const start = shallowReactive({ x: 0, y: 0, l: 0, t: 0, h: 300, w: 300 })

const eventListenersToCleanup = {
  pointermove: null as FnOrNull,
  pointerup: null as FnOrNull,
}

const startResize = (e: PointerEvent, dir: (typeof directions)[number]) => {
  if (!resizable.value) return
  resizing.value = true
  currentDir.value = dir
  start.x = e.clientX
  start.y = e.clientY
  Object.assign(start, coords)
  addEventListeners(['pointermove', 'pointerup'])
}

const startMoving = (e: PointerEvent) => {
  start.x = e.clientX
  start.y = e.clientY
  start.l = coords.l
  start.t = coords.t
  moving.value = true
  addEventListeners(['pointermove', 'pointerup'])
}

const onPointerup = () => {
  resizing.value = false
  moving.value = false
  cleanUpEventListeners()
}

const onPointermove = (e: PointerEvent) => {
  if (!resizing.value && !moving.value) return

  const dx = e.clientX - start.x
  const dy = e.clientY - start.y

  if (moving.value) {
    coords.l = start.l + dx
    coords.t = start.t + dy
  }
  else {
    if (currentDir.value.includes('right'))
      coords.w = Math.max(start.w + dx, minState.w)
    else if (currentDir.value.includes('left') && (start.w - dx) > minState.w) {
      coords.w = Math.max(start.w - dx, minState.w)
      coords.l = Math.max(start.l + dx, 0)
    }

    if (currentDir.value.includes('bottom'))
      coords.h = Math.max(start.h + dy, minState.h)
    else if (currentDir.value.includes('top') && (start.h - dy) > minState.h) {
      coords.h = Math.max(start.h - dy, minState.h)
      coords.t = Math.max(start.t + dy, 0)
    }
  }
}

type eventListenersKeys = (keyof (typeof eventListenersToCleanup))[]

function cleanUpEventListeners(keys: eventListenersKeys | null = null) {
  if (!keys) keys = Object.keys(eventListenersToCleanup) as eventListenersKeys

  for (const key of keys) {
    eventListenersToCleanup[key]?.()
    eventListenersToCleanup[key] = null
  }
}

function addEventListeners(keys: eventListenersKeys) {
  cleanUpEventListeners(keys)

  for (const key of keys) {
    switch (key) {
      case 'pointermove':
        eventListenersToCleanup[key] = useEventListener(document, 'pointermove', onPointermove)
        break
      case 'pointerup':
        eventListenersToCleanup[key] = useEventListener(document, 'pointerup', onPointerup)
        break
    }
  }
}
</script>

<template>
  <UiDialog
    v-model:open="modelValue"
    :modal="false"
  >
    <DialogPortal>
      <UiDialogOverlay />
      <DialogContent
        ref="resizable"
        data-slot="dialog-content"
        :data-resize-mode="isResizeMode"
        v-bind="forwarded"
        :aria-describedby="undefined"
        :class="
          cn(
            'resizable-dialog bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed z-50 grid gap-4 py-4 border-2 rounded-lg shadow-lg',
            'data-[resize-mode=true]:rounded-none',
            props.class,
          )"
        :style="{
          '--l': coords.l,
          '--t': coords.t,
          '--w': coords.w,
          '--h': coords.h,
        }"
        @interact-outside.prevent
      >
        <UiDialogHeader>
          <UiDialogTitle
            class="flex mx-6"
            :class="isResizeMode ? 'cursor-move select-none' : ''"
            @pointerdown="isResizeMode && startMoving($event)"
          >
            <span
              v-if="props.title"
              class="text-lg mx-auto flex items-center"
            >
              {{ props.title }}
            </span>
            <div class="flex gap-3 ml-auto sm:gap-4">
              <BaseButton
                variant="outline"
                size="iconMd"
                title="Resize/Move Dialog"
                icon-name="fluent:arrow-move-20-filled"
                :icon-class="isResizeMode ? 'text-green-500' : 'text-gray-200'"
                @click="isResizeMode = !isResizeMode"
              />
              <DialogClose as-child>
                <BaseButton
                  variant="outline"
                  size="iconMd"
                  icon-name="line-md:close"
                  icon-size="1.3rem"
                />
                <span class="sr-only">Close</span>
              </DialogClose>
            </div>
          </UiDialogTitle>
        </UiDialogHeader>
        <UiScrollArea class="min-h-0">
          <slot />
        </UiScrollArea>
        <template v-if="isResizeMode">
          <div
            v-for="dir in directions"
            :key="dir"
            :class="`resize-handle ${dir}`"
            @pointerdown.prevent="startResize($event, dir)"
          />
        </template>
      </DialogContent>
    </DialogPortal>
  </UiDialog>
</template>

<style>
.resizable-dialog {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  left: calc(var(--l) * 1px);
  top: calc(var(--t) * 1px);
  width: calc(var(--w) * 1px);
  height: calc(var(--h) * 1px);
}

/* Resize Handles */
.resize-handle {
  position: absolute;
  background: var(--ring);
  z-index: 10;
  width: 8px;
  height: 8px;
}
.resize-handle.top,
.resize-handle.bottom {
  left: 0;
  width: 100%;
  cursor: ns-resize;
}
.resize-handle.top { top: -2px; }
.resize-handle.bottom { bottom: -2px; }

.resize-handle.left,
.resize-handle.right {
  top: 0;
  height: 100%;
  cursor: ew-resize;
}
.resize-handle.left { left: -2px; }
.resize-handle.right { right: -2px; }

.resize-handle.top-left {
  top: -2px; left: -2px;
  cursor: nwse-resize;
}
.resize-handle.top-right {
  top: -2px; right: -2px;
  cursor: nesw-resize;
}
.resize-handle.bottom-left {
  bottom: -2px; left: -2px;
  cursor: nesw-resize;
}
.resize-handle.bottom-right {
  bottom: -2px; right: -2px;
  cursor: nwse-resize;
}
</style>
