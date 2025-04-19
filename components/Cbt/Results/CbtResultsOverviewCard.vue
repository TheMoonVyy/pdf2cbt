<template>
  <div
    :data-selected="Boolean(selected)"
    class="py-2 grid place-items-center text-center rounded-2xl shadow
    dark:bg-neutral-800 space-y-1.5 text-gray-800 dark:text-gray-200
      border border-green-500
      data-[selected=true]:ring-4 data-[selected=true]:ring-green-500"
  >
    <!-- Row 1 -->
    <div class="pl-3 grid grid-cols-6 gap-1">
      <div
        class="col-span-5 overflow-auto w-full"
        :class="{ 'col-span-5': readOnly }"
      >
        <div class="min-w-max">
          <h4 class="text-lg font-bold">
            {{ testResultOverview.testName }}
          </h4>
          <h5 class="text-sm text-left">
            {{ utilFormatUnixMsToReadableTime(testResultOverview.testStartTime) }}
          </h5>
          <h5 class="text-sm text-left">
            {{ utilFormatUnixMsToReadableTime(testResultOverview.testEndTime) }}
          </h5>
        </div>
      </div>
      <template v-if="!readOnly">
        <BaseButton
          class="w-7!"
          variant="text"
          size="small"
          rounded
          raised
          @click="menuBtnClickHandler"
        >
          <template #icon>
            <Icon
              name="my-icon:kebab"
              class="text-3xl"
            />
          </template>
        </BaseButton>
      </template>
    </div>
    <!-- Row 2 -->
    <div class="px-3 grid grid-cols-2 gap-3 w-full max-w-3xl">
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
          {{ testResultOverview.overview?.questionsAttempted ?? '--' }}/{{ testResultOverview.overview?.totalQuestions ?? '--' }}
        </div>
      </div>
    </div>
    <!-- Row 3 -->
    <div v-if="!readOnly">
      <BaseButton
        class="px-6 py-1.5 disabled:cursor-not-allowed! disabled:pointer-events-auto!"

        :label="isResultsGenerated
          ? (isCurrentResultsId ? 'Showing Results' : 'View Results')
          : 'Generate Results'"
        :severity="isResultsGenerated
          ? (isCurrentResultsId ? 'warn' : 'help')
          : undefined"
        :disabled="isCurrentResultsId && isResultsGenerated"
        rounded
        @click="viewResultsBtnClickHandler"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TestResultOverview, TestResultOverviewDB } from '~/src/types'

const props = defineProps<{
  testResultOverview: TestResultOverview | TestResultOverviewDB
  readOnly?: boolean
  selected?: boolean
  isCurrentResultsId?: boolean
}>()

const emit = defineEmits<{
  menuBtnClick: [buttonEvent: Event]
  viewResultsBtnClick: [isResultsGenerated: boolean]
}>()

const isResultsGenerated = computed(() => {
  const { marksObtained, maxMarks } = props.testResultOverview?.overview ?? {}

  if (marksObtained && maxMarks) {
    return true
  }

  return false
})

const menuBtnClickHandler = (e: Event) => {
  emit('menuBtnClick', e)
}

const viewResultsBtnClickHandler = () => {
  emit('viewResultsBtnClick', isResultsGenerated.value)
}
</script>
