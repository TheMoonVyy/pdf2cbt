<script lang="ts" setup>
defineProps<{
  coords: PdfCroppedOverlayCoords
  pageWidth: number
  pageHeight: number
}>()
</script>

<template>
  <svg
    :viewBox="`0 0 ${pageWidth} ${pageHeight}`"
    preserveAspectRatio="none"
  >
    <rect
      :x="coords.l"
      :y="coords.t"
      :width="coords.r - coords.l"
      :height="coords.b - coords.t"
      class="box-cropper"
    />
  </svg>
</template>
