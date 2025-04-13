<template>
  <div
    :data-selected="Boolean(selected)"
    class="p-3 grid place-items-center text-center rounded-2xl shadow
    dark:bg-neutral-800 space-y-1.5 text-gray-800 dark:text-gray-200
      border border-green-500
      data-[selected=true]:ring-4 data-[selected=true]:ring-green-500"
  >
    <!-- Row 1 -->
    <div class="overflow-auto w-full">
      <div class="min-w-max">
        <h4 class="text-lg font-bold">
          {{ testResultOverview.testName }}
        </h4>
        <h5 class="text-sm text-left">
          {{ formatUnixMsToReadableTime(testResultOverview.testStartTime) }}
        </h5>
        <h5 class="text-sm text-left">
          {{ formatUnixMsToReadableTime(testResultOverview.testEndTime) }}
        </h5>
      </div>
    </div>
    <!-- Row 2 -->
    <div class="grid grid-cols-2 gap-3 w-full max-w-3xl">
      <div class="space-y-0.5">
        <div class="font-bold">
          Score
        </div>
        <div>
          {{ testResultOverview.overview?.marksObtained ?? '--' }}/{{ testResultOverview.overview?.maxMarks ?? '--' }}
        </div>
      </div>
      <div class="space-y-0.5">
        <div class="font-bold">
          Accuracy
        </div>
        <div>
          {{ testResultOverview.overview.accuracy ?? '--' }}%
        </div>
      </div>
      <div class="space-y-0.5">
        <div class="font-bold">
          Time Spent
        </div>
        <span>
          {{
            typeof testResultOverview.overview?.timeSpent === 'number'
              ? utilSecondsToTime(testResultOverview.overview.timeSpent, 'mmm:ss')
              : '---:--'
          }}&nbsp;/&nbsp;{{
            typeof testResultOverview.overview?.testDuration === 'number'
              ? utilSecondsToTime(testResultOverview.overview.testDuration, 'mmm:ss')
              : '---:--'
          }}
        </span>
      </div>
      <div class="space-y-0.5">
        <div class="font-bold">
          Attempted
        </div>
        <div>
          {{ testResultOverview.overview?.questionAttempted ?? '--' }}/{{ testResultOverview.overview?.totalQuestion ?? '--' }}
        </div>
      </div>
    </div>
    <!-- Row 3 -->
    <div v-if="!readOnly">
      <BaseButton
        class="px-6 py-2"
        label="View Analysis"
        severity="help"
        rounded
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TestResultOverview } from '~/src/types'

defineProps<{
  testResultOverview: TestResultOverview
  readOnly?: boolean
  selected?: boolean
}>()
</script>
