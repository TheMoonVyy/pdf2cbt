<template>
  <div
    ref="profileDetailsContainerElem"
    class="flex flex-1 border-l-2 border-b-2 border-slate-500"
    :class="[
      isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in',
      isForInstructionsPanel ? 'flex-col items-center gap-1 pt-5 border-0! h-fit' : 'flex-row items-center gap-3',
    ]"
    :style="{ width: widthInPercent ? `${widthInPercent}%` : 'auto' }"
    @click="toggleFullScreen()"
  >
    <div
      class="flex items-center justify-center w-2/5"
    >
      <span
        class="bg-image"
        :style="{
          backgroundImage: `url(&quot;${profileSettings.img || profileIcon}&quot;)`,
          width: (1.18 * profileSettings.imgWidth) + 'px',
          height: (1.18 * profileSettings.imgHeight) + 'px',
        }"
      />
    </div>
    <div
      class="flex items-center"
      :class="isForInstructionsPanel ? 'w-full justify-center' : 'flex-1'"
    >
      <span :style="{ fontSize: `${profileSettings.fontSize}rem` }">
        {{ profileSettings.username }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import profileIcon from '#layers/shared/app/assets/icons/profile.svg?no-inline'

defineProps<{
  widthInPercent?: number
  profileSettings: CbtUiSettings['profile']
  isForInstructionsPanel?: boolean
}>()

const showHiddenSettings = defineModel<boolean>('showHiddenSettings', { required: true })
const { isFullscreen, toggle: toggleFullScreen } = useFullscreen()

const profileDetailsContainerElem = useTemplateRef('profileDetailsContainerElem')

onLongPress(
  profileDetailsContainerElem,
  () => showHiddenSettings.value = true,
  {
    modifiers: {
      prevent: true,
    },
    delay: 750,
  },
)
</script>
