<template>
  <UiCard
    :data-selected="Boolean(selected)"
    class="rounded-2xl pb-3 pt-1
      bg-secondary/60 text-secondary-foreground
      border border-green-500 dark:border-green-500
      data-[selected=true]:ring-4 data-[selected=true]:ring-green-500"
  >
    <UiCardContent class="p-0 grid place-items-center text-center">
      <!-- Row 1 -->
      <div class="pl-3 grid grid-cols-6 gap-1">
        <div
          class="col-span-5 overflow-auto w-full"
          :class="{ 'col-span-5': readOnly }"
        >
          <div class="min-w-max [&>span]:block">
            <p class="text-lg font-bold">
              {{ testResultOverview.testName }}
            </p>
            <p class="text-sm text-left">
              {{ utilFormatUnixMsToReadableTime(testResultOverview.testStartTime) }}
            </p>
            <p class="text-sm text-left">
              {{ utilFormatUnixMsToReadableTime(testResultOverview.testEndTime) }}
            </p>
          </div>
        </div>
        <template v-if="!readOnly">
          <BaseButton
            class="w-7!"
            variant="ghost"
            size="icon"
            icon-name="my-icon:kebab"
            icon-class="text-3xl"
            @click="menuBtnClickHandler"
          />
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
      <div
        v-if="!readOnly"
        class="pt-2"
      >
        <BaseButton
          class="px-6 py-1.5 rounded-lg disabled:cursor-not-allowed! disabled:pointer-events-auto!"

          :label="isResultsGenerated
            ? (isCurrentResultsId ? 'Showing Results' : 'View Results')
            : 'Generate Results'"
          :variant="isResultsGenerated
            ? (isCurrentResultsId ? 'warn' : 'help')
            : undefined"
          :disabled="isCurrentResultsId && isResultsGenerated"
          @click="viewResultsBtnClickHandler"
        />
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  testResultOverview: TestResultOverview | TestResultOverviewDB
  readOnly?: boolean
  selected?: boolean
  isCurrentResultsId?: boolean
}>()

const emit = defineEmits<{
  menuBtnClick: [buttonEvent: MouseEvent, isResultsGenerated: boolean]
  viewResultsBtnClick: [isResultsGenerated: boolean]
}>()

const isResultsGenerated = computed(() => {
  const { maxMarks, totalQuestions } = props.testResultOverview?.overview ?? {}

  if (maxMarks || totalQuestions) {
    return true
  }

  return false
})

const menuBtnClickHandler = (e: MouseEvent) => {
  emit('menuBtnClick', e, isResultsGenerated.value)
}

const viewResultsBtnClickHandler = () => {
  emit('viewResultsBtnClick', isResultsGenerated.value)
}
</script>
