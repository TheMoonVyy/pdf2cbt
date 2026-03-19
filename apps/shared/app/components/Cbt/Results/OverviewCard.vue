<template>
  <UiCard
    :data-selected="Boolean(selected)"
    class="rounded-2xl pt-1 pb-3 w-full
      bg-secondary/60 text-secondary-foreground
      border border-green-500 dark:border-green-500
      data-[selected=true]:ring-4 data-[selected=true]:ring-green-500"
    :class="showDetailedOverview ? 'max-w-[95%] sm:max-w-110' : 'max-w-2xs'"
  >
    <UiCardContent
      class="p-0 grid place-items-center text-center"
    >
      <!-- Row 1 -->
      <div class="pl-3 grid grid-cols-6 gap-1">
        <UiScrollArea
          class="col-span-5"
          type="hover"
          viewport-class=""
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
          <UiScrollBar orientation="horizontal" />
        </UiScrollArea>
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
      <div class="px-3 grid grid-cols-2 gap-3 w-full">
        <div class="space-y-0.5">
          <div class="font-bold">
            Score
          </div>
          <div>
            {{ testResultOverview.overview.marksObtained?.all ?? '--' }}/{{ testResultOverview.overview.maxMarks.all }}
          </div>
        </div>
        <div class="space-y-0.5">
          <div class="font-bold">
            Accuracy
          </div>
          <div>
            {{ testResultOverview.overview?.accuracy?.all ?? '--' }}%
          </div>
        </div>
        <div class="space-y-0.5">
          <div class="font-bold">
            Time Spent
          </div>
          <span>
            {{
              utilSecondsToTime(testResultOverview.overview.totalTimeSpent.all, 'mmm:ss')
            }}&nbsp;/&nbsp;{{
              utilSecondsToTime(testResultOverview.testDuration, 'mmm:ss')
            }}
          </span>
        </div>
        <div class="space-y-0.5">
          <div class="font-bold">
            Attempted
          </div>
          <div>
            {{
              testResultOverview.overview.qAttempted.all
            }}/{{
              testResultOverview.overview.totalQuestions.all
            }}
          </div>
        </div>
      </div>
      <!-- Row 3 -->
      <div
        v-if="!readOnly"
        class="pt-2 not-last:pb-2"
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
      <!-- Row 4 -->
      <table
        v-if="showDetailedOverview"
        class="w-full text-xs sm:text-sm border border-border"
      >
        <thead>
          <tr>
            <th class="p-1 text-bold border">
              Metric
            </th>
            <th
              v-for="label in Object.values(OVERVIEW_QTYPE_LABELS)"
              :key="label"
              class="p-1 text-bold border"
            >
              {{ label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="key in TEST_RESULT_OVERVIEW_KEYS"
            :key="key"
          >
            <tr
              v-if="typeof testResultOverview.overview?.[key]?.all === 'number'"
            >
              <td
                class="p-1 text-bold border"
                :title="OVERVIEW_LABELS[key] "
              >
                {{ OVERVIEW_SHORT_LABELS[key] }}
              </td>
              <td
                v-for="(label, qType) in OVERVIEW_QTYPE_LABELS"
                :key="qType"
                class="p-1 border"
              >
                {{
                  (key === 'avgTimeSpent' || key === 'totalTimeSpent')
                    ? utilSecondsToTime(testResultOverview.overview?.[key]?.[qType], 'mmm:ss')
                    : testResultOverview.overview?.[key]?.[qType]
                }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
import {
  OVERVIEW_QTYPE_LABELS,
  OVERVIEW_SHORT_LABELS,
  OVERVIEW_LABELS,
  TEST_RESULT_OVERVIEW_KEYS,
} from '#layers/shared/shared/constants'

const props = defineProps<{
  testResultOverview: TestResultOverview | TestResultOverviewDB
  readOnly?: boolean
  selected?: boolean
  isCurrentResultsId?: boolean
  showDetailedOverview?: boolean
}>()

const emit = defineEmits<{
  menuBtnClick: [buttonEvent: MouseEvent, isResultsGenerated: boolean]
  viewResultsBtnClick: [isResultsGenerated: boolean]
}>()

const isResultsGenerated = computed(() => {
  const { accuracy } = props.testResultOverview.overview ?? {}

  return ('all' in (accuracy ?? {}))
})

const menuBtnClickHandler = (e: MouseEvent) => {
  emit('menuBtnClick', e, isResultsGenerated.value)
}

const viewResultsBtnClickHandler = () => {
  emit('viewResultsBtnClick', isResultsGenerated.value)
}
</script>
