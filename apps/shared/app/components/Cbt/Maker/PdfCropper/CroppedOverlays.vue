<script lang="ts" setup>
import { CROPPED_OVERLAY_RESIZE_DIRECTIONS, type CroppedOverlayResizeDirection } from '#layers/shared/shared/constants'
import {
  activeOverlayIdKey,
  cropperOverlayDatasKey,
  overlaysPerQuestionDataKey,
  pagesImgDataKey,
  currentPagesToLoadKey,
} from '../keys'

const {
  showLabels,
} = defineProps<{
  showLabels: boolean
}>()

const activeOverlayId = inject(activeOverlayIdKey)!
const pagesImgData = inject(pagesImgDataKey)!
const overlays = inject(cropperOverlayDatasKey)!
const overlaysPerQuestionData = inject(overlaysPerQuestionDataKey)!
const currentPagesToLoad = inject(currentPagesToLoadKey)!

const emit = defineEmits<{
  onPointerDownOnCroppedOverlay: [e: PointerEvent, id: string]
  onStartResizeOnCroppedOverlay: [e: PointerEvent, id: string, dir: CroppedOverlayResizeDirection]
}>()

const currentPagesYCoords = computed(() => {
  return {
    t: pagesImgData[currentPagesToLoad.value[0] ?? 1]?.top || 0,
    b: pagesImgData[currentPagesToLoad.value.at(-1) ?? 1]?.bottom || 0,
  }
})
</script>

<template>
  <div
    id="cropped-overlay-elem"
    class="absolute top-0 left-0 focus-visible:outline-hidden"
    tabindex="-1"
  >
    <template
      v-for="[id, overlay] in overlays"
      :key="id"
    >
      <div
        v-if="overlay.coords.t <= currentPagesYCoords.b
          && overlay.coords.b >= currentPagesYCoords.t"
        class="cropped-overlay touch-none"
        :class="{
          active: activeOverlayId === id,
        }"
        :style="{
          '--l': overlay.coords.l,
          '--r': overlay.coords.r,
          '--t': overlay.coords.t,
          '--b': overlay.coords.b,
        }"
        @pointerdown.stop="emit('onPointerDownOnCroppedOverlay', $event, id)"
      >
        <div
          v-if="showLabels"
          class="overlay-label w-fit flex flex-wrap divide-x divide-current [&>span]:px-1"
        >
          <span>{{ overlay.section || overlay.subject }}</span>
          <span>
            Q: {{ overlay.que }}
            <template v-if="(overlaysPerQuestionData.get(overlay.queId) || 0) > 1">
              ({{ overlay.imgNum }})
            </template>
          </span>
          <span>
            {{ overlay.type.toUpperCase() }}
            <template
              v-if="overlay.type !== 'nat'
                && overlay.answerOptions !== '4'
                && overlay.answerOptions !== '4x4'"
            >
              ({{ overlay.answerOptions }})
            </template>
          </span>
          <span>
            M: ({{ utilMarksWithSign(overlay.marks.cm) }}
            <template v-if="overlay.type === 'msq'">
              {{ utilMarksWithSign(overlay.marks.pm as number) }}
            </template>
            {{ utilMarksWithSign(overlay.marks.im) }})
          </span>
        </div>

        <template v-if="id === activeOverlayId">
          <div
            v-for="dir in CROPPED_OVERLAY_RESIZE_DIRECTIONS"
            :key="dir"
            :class="`resizer ${dir}`"
            @pointerdown.stop.prevent="emit('onStartResizeOnCroppedOverlay', $event, id, dir)"
          />
        </template>
      </div>
    </template>
  </div>
</template>
