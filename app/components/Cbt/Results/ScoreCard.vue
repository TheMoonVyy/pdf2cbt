<template>
  <UiCard
    class="px-3 py-2 max-w-2xs bg-secondary/60 text-secondary-foreground gap-2"
  >
    <UiCardHeader class="px-0 py-1">
      <UiCardTitle class="mx-auto">
        {{ scoreCardData.title }}
      </UiCardTitle>
    </UiCardHeader>
    <UiCardContent class="p-0">
      <div class="space-y-2">
        <div>
          <div class="flex items-center justify-center gap-1">
            <span>Score: </span>
            <span class="text-lg font-bold">
              {{ scoreCardData.marksObtained }}/{{ scoreCardData.maxMarks }}
            </span>
            <div
              v-if="Object.values(scoreCardData.marks).some(n => Boolean(n))"
              class="text-neutral-300 font-semibold"
            >
              <span>(</span>
              <span class="space-x-1.5">
                <span
                  v-if="scoreCardData.marks.correct"
                  class="text-green-400"
                  title="Correct"
                >
                  {{ utilMarksWithSign(scoreCardData.marks.correct) }}
                </span>
                <span
                  v-if="scoreCardData.marks.partial"
                  class="text-yellow-400"
                  title="Partially Correct"
                >
                  {{ utilMarksWithSign(scoreCardData.marks.partial) }}
                </span>
                <span
                  v-if="scoreCardData.marks.incorrect"
                  class="text-red-400"
                  title="Incorrect"
                >
                  {{ utilMarksWithSign(scoreCardData.marks.incorrect) }}
                </span>
                <span
                  v-if="scoreCardData.marks.bonus"
                  class="text-cyan-400"
                  title="Bonus"
                >
                  {{ utilMarksWithSign(scoreCardData.marks.bonus) }}
                </span>
                <span
                  v-if="scoreCardData.marks.dropped"
                  class="text-fuchsia-400"
                  title="Dropped"
                >
                  {{ utilMarksWithSign(scoreCardData.marks.dropped) }}
                </span>
              </span>

              <span>)</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex flex-row justify-between gap-4">
            <div class="flex flex-col items-center gap-0.5">
              <span>Accuracy</span>
              <span
                v-if="scoreCardData.accuracy.denominator"
                class="font-semibold"
              >
                {{ Math.round((scoreCardData.accuracy.count / scoreCardData.accuracy.denominator) * 10000) / 100 }}%
              </span>
              <span
                v-else
                class="font-semibold"
                title="Not Applicable as no questions answered"
              >
                N.A.
              </span>
            </div>
            <div class="flex flex-col items-center gap-0.5">
              <span>Ques. Attempted</span>
              <span class="font-semibold">{{ scoreCardData.questionsAttempted }} / {{ scoreCardData.totalQuestions }}</span>
            </div>
          </div>
          <div
            class="flex items-center justify-center gap-3"
            title="Time Spent in mmm:ss format"
          >
            <span>Time Spent:</span>
            <span
              v-if="scoreCardData.testDuration"
              class="font-semibold"
            >
              {{ utilSecondsToTime(scoreCardData.timeSpent, 'mmm:ss') }} / {{ utilSecondsToTime(scoreCardData.testDuration, 'mmm:ss') }}
            </span>
            <span
              v-else
              class="font-semibold"
            >
              {{ utilSecondsToTime(scoreCardData.timeSpent, 'mmm:ss') }}
            </span>
          </div>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
defineProps<{
  scoreCardData: ScoreCardData
}>()
</script>
