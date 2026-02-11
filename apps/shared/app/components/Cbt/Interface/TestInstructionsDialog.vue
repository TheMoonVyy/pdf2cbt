<script lang="ts" setup>
const showDialog = defineModel<boolean>({ required: true })

defineProps<{
  parsedTestInstructions: CbtParsedTestInstructions
}>()

useEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    showDialog.value = false
  }
})
</script>

<template>
  <div
    class="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-1000"
    @click.self="showDialog = false"
  >
    <div class="flex flex-col bg-white rounded-xl max-w-5xl h-[90dvh]">
      <!-- Header -->
      <div class="sticky top-0 z-10 py-2 px-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-gray-400">
        <div />
        <h2 class="text-2xl font-bold text-center">
          Test Instructions
        </h2>
        <div class="flex justify-end gap-2">
          <BaseButton
            variant="destructive"
            size="iconMd"
            title="Close"
            icon-name="prime:times-circle"
            @click="showDialog = false"
          />
        </div>
      </div>

      <UiScrollArea
        type="auto"
        class="w-full h-full"
        viewport-class="[&>div]:px-8"
        scroll-bar-class="w-3 mr-0.5"
      >
        <h2 class="text-red-600 mb-4 text-center text-xl">
          Note that the timer is ticking while you read the Question Paper.<br>
          Close this page to return to answering the questions.
        </h2>

        <CbtTestInstructionsPanel
          class="pb-5"
          :parsed-test-instructions="parsedTestInstructions"
          view-only
        />
      </UiScrollArea>
    </div>
  </div>
</template>
