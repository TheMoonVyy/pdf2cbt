<template>
  <UiDialog
    v-model:open="visibility"
  >
    <UiDialogContent class="max-w-full sm:min-w-xl sm:max-w-9/10 px-3">
      <UiDialogHeader>
        <UiDialogTitle>
          {{ dialogLabel }}
        </UiDialogTitle>
      </UiDialogHeader>
      <UiScrollArea
        class="max-h-[80dvh] px-6"
        type="auto"
      >
        <div class="flex">
          <BaseButton
            :label="dialogLabel"
            class="mx-auto"
            :disabled="!selectedKeys.size"
            @click="processData()"
          />
        </div>
        <p class="m-4 text-center font-bold">
          Select the test(s) you want to {{ type.toLowerCase() }}
        </p>
        <div class="flex flex-row justify-center flex-wrap gap-6 py-4 px-2 sm:px-4 md:px-8">
          <div
            v-for="(testOutputData, index) in data"
            :key="index"
          >
            <CbtResultsOverviewCard
              :test-result-overview="testOutputData.testResultOverview!"
              read-only
              class="w-[80dvh] max-w-3xs sm:w-3xs xl:w-60 cursor-pointer select-none"
              :selected="selectedKeys.has(index)"
              @click="() => selectedKeys.has(index) ? selectedKeys.delete(index) : selectedKeys.add(index)"
            />
          </div>
        </div>
      </UiScrollArea>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
const selectedKeys = ref(new Set<number>())

const visibility = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  processed: [type: 'Import' | 'Export', data: TestInterfaceOrResultJsonOutput[]]
}>()

const props = defineProps<{
  type: 'Import' | 'Export'
  data: TestInterfaceOrResultJsonOutput[]
}>()

const processData = () => {
  const processedData: (TestInterfaceOrResultJsonOutput)[] = []

  for (const i of selectedKeys.value.values()) {
    const iData = props.data[i]
    if (iData) processedData.push(iData)
  }

  emit('processed', props.type, processedData)
}

const dialogLabel = utilKeyToLabel(props.type) + ' Test Data'
</script>
