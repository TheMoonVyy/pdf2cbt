<template>
  <Dialog
    v-model:visible="visibility"
    :header="dialogLabel"
    :modal="true"
    :closable="true"
    :draggable="false"
    maximizable
    pt:root:class="mx-auto"
    pt:title:class="p-0 mx-auto"
    pt:content:class="p-0"
    pt:header:class="gap-4"
  >
    <div class="flex mb-5">
      <BaseButton
        :label="dialogLabel"
        class="mx-auto"
        :disabled="!selectedKeys.size"
        @click="processData()"
      />
    </div>
    <div class="flex flex-row justify-center flex-wrap gap-6 py-4 px-2 sm:px-4 md:px-8">
      <div
        v-for="(testOutputData, index) in data"
        :key="index"
      >
        <CbtResultsOverviewCard
          :test-result-overview="testOutputData.testResultOverview!"
          read-only
          class="cursor-pointer select-none"
          :selected="selectedKeys.has(index)"
          @click="() => selectedKeys.has(index) ? selectedKeys.delete(index) : selectedKeys.add(index)"
        />
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import type {
  TestOutputData,
  TestResultsOutputData,
} from '~/src/types'

const selectedKeys = ref(new Set<number>())

const visibility = defineModel<boolean>('visibility', {
  default: true,
})

const emit = defineEmits<{
  processed: [type: 'Import' | 'Export', data: (TestOutputData | TestResultsOutputData)[]]
}>()

const props = defineProps<{
  type: 'Import' | 'Export'
  data: (TestOutputData | TestResultsOutputData)[]
}>()

const processData = () => {
  const processedData: (TestOutputData | TestResultsOutputData)[] = []

  for (const i of selectedKeys.value.values()) {
    processedData.push(props.data[i])
  }

  emit('processed', props.type, processedData)
}

const dialogLabel = utilKeyToLabel(props.type) + ' Test Data'
</script>
