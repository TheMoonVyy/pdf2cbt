<template>
  <div
    class="max-h-dvh min-h-dvh w-full border-t-2 overflow-y-auto border-surface-700 dark:bg-surface-900 dark:text-surface-0">
    <div class="m-4">
      <BaseSimpleFileUpload accept="application/json,.json"
        :label="isLoading ? 'Please wait, loading File...' : 'Select the Analysis File'"
        :icon-name="isLoading ? 'line-md:loading-twotone-loop' : 'prime:plus'" icon-size="1.5rem"
        invalid-file-type-message="Invalid file. Please select a valid JSON Analysis File."
        @uploader="(e: any) => handleAnalysisFileUpload(e.files)" />
    </div>
    <div :class="{ 'hidden': !isUploaded }">
      <div>
      <div class="flex flex-col lg:flex-row w-full justify-evenly">
        <div class="px-2 flex-1 min-w-0 items-center justify-center">
          <Pie :data="{
            labels: ['Answered', 'Not Answered', 'Not Visited', 'Marked for Review', 'Marked for Review and Answered'],
            datasets: [
              {
                backgroundColor: ['#00A000', '#FF0000', '#D3D3D3', '#8F00FF', '#0000FF'],
                data: [
                  getTestSummaryData('answered'),
                  getTestSummaryData('notAnswered'),
                  getTestSummaryData('notVisited'),
                  getTestSummaryData('marked'),
                  getTestSummaryData('markedAnswered')
                ]
              }
            ]
          }

            " :options="{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: isDarkMode() ? '#FFFFFF' : '#000000',
                  },
                },
                title: {
                  display: true, // Enable the title
                  text: 'Attempt Type', // Title text
                  font: {
                    size: 18, // Font size for the title
                    weight: 'bold', // Font weight
                  },
                  color: isDarkMode() ? '#FFFFFF' : '#000000', // Title color based on dark mode
                },
              },
            }" />
        </div>
        <div class="px-2 items-center min-w-0 flex-1 justify-center">
          <Pie :data="{
            labels: getTestTimebySection().map((item) => item.label),
            datasets: [{
              backgroundColor: getTestTimebySection().map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`),
              data: getTestTimebySection().map((item) => Math.round(item.timeSpent / 0.6) / 100)
            }]
          }

            " :options="{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: isDarkMode() ? '#FFFFFF' : '#000000',
                  },
                  title: {
                    display: true, // Enable the title
                    text: 'Time Spent per Section', // Title text
                    font: {
                      size: 18, // Font size for the title
                      weight: 'bold', // Font weight
                    },
                    color: isDarkMode() ? '#FFFFFF' : '#000000', // Title color based on dark mode
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context: any) {
                      const time = context.raw;
                      return `${time} min`;
                    },
                  },
                },
              },
            }" />
        </div>
      </div>
      <div class="pb-24" style="height: 400px;">
        <Line :data="{
          labels: Array.from({ length: 6 }, (_, i) => {
            const testTime = jsonData?.testLogs
              ? (getStartEndTimestamp(jsonData.testLogs).end - getStartEndTimestamp(jsonData.testLogs).start) / 60000
              : 0;
            const start = Math.round((i * testTime / 6) * 10) / 10;
            const end = Math.round(((i + 1) * testTime / 6) * 10) / 10;
            return `${start}-${end} min`;
          }),
          datasets: [{
            label: 'Questions Attempted',
            data: getAttemptedQuestionsbyInveral(getLatestLogsByQueId(jsonData?.testLogs ?? []), 6),
            backgroundColor: '#FFFF00',
          }]
        }

          " :options="{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: isDarkMode() ? '#FFFFFF' : '#000000',
                },
              },
              title: {
                display: true, // Enable the title
                text: 'Time Journey', // Title text
                font: {
                  size: 18, // Font size for the title
                  weight: 'bold', // Font weight
                },
                color: isDarkMode() ? '#FFFFFF' : '#000000', // Title color based on dark mode
              },
            },
            elements: {
              point: {
                radius: 4,
                hoverRadius: 6,
              },
            },
          }" />
      </div>
      <!-- <div class="grid"> -->
        <!-- Here goes the Question Journey based on testLogs -->
      <!-- </div> -->
    </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Title
} from 'chart.js'
import { Pie, Line } from 'vue-chartjs'
import type { TestLog, TestOutputData } from '../../src/types'
ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Title);
let isLoading = ref(false);
let isUploaded = ref(false);

let jsonData = ref<TestOutputData | null>(null);

function handleAnalysisFileUpload(files: File | File[]) {
  isLoading.value = true;
  const file = Array.isArray(files) ? files[0] : files
  console.log('File uploaded:', file);
  file.text().then((text) => {
    try {
      const parsedData = JSON.parse(text);
      if (parsedData) {
        jsonData.value = parsedData;
        isUploaded.value = true;
      } else {
        console.error('Invalid JSON structure');
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  }).finally(() => {
    isLoading.value = false;
  });
}

function getTestSummaryData(data: 'answered' | 'notAnswered' | 'notVisited' | 'marked' | 'markedAnswered'): number {
  let num = 0;
  if (jsonData.value) {
    jsonData.value.testSummary.forEach((section) => {
      num = num + section[data];
    });
  }
  return num; // Ensure a number is always returned
}

function getTestTimebySection() {
  interface timebySection {
    subject: string;
    timeSpent: number;
    label: string;
  }
  let time: timebySection[] = [];
  if (jsonData.value) {
    Object.keys(jsonData.value.testData).forEach(
      (subject: string) => {
        Object.keys(jsonData.value?.testData[subject] ?? {}).forEach((section) => {
          let sectionTime = 0;
          Object.values(jsonData.value?.testData[subject][section] ?? {}).forEach((q) => {
            sectionTime = sectionTime + q.timeSpent;
          });
          time.push({
            subject: subject,
            timeSpent: sectionTime,
            label: subject + ' ' + section,
          });
        });
      }
    )
  }
  return time;
}

function getLatestLogsByQueId(testLogs: TestLog[]) {
  const latestLogsMap = new Map();

  // Iterate through the logs
  for (const log of testLogs) {
    const queId = log.current?.queId; // Extract queId from the log
    if (queId !== undefined) {
      // Check if the queId exists in the map or if the current log has a later timestamp
      if (!latestLogsMap.has(queId) || log.timestamp > latestLogsMap.get(queId).timestamp) {
        latestLogsMap.set(queId, log); // Update the map with the latest log
      }
    }
  }
  // Convert the Map values to an array
  return Array.from(latestLogsMap.values());
}

function getStartEndTimestamp(testLogs: TestLog[]): { start: number; end: number } {
  let start = testLogs.find((log) => log.type === 'testStarted')?.timestamp || 0;
  let end = testLogs.find((log) => log.type === 'testFinished')?.timestamp || 0;
  return { start, end };
}

function getAttemptedQuestionsbyInveral(uniqueTestLog: TestLog[], interval: number): number[] {
  const attemptedQuestions: number[] = Array(interval).fill(0);
  const { start, end } = getStartEndTimestamp(jsonData.value?.testLogs ?? []);
  const totalDuration = end - start;
  const intervalDuration = totalDuration / interval;
  uniqueTestLog.forEach(log => {
    const attemptedTime = log.timestamp - start;
    const intervalIndex = Math.floor(attemptedTime / intervalDuration);
    console.log(attemptedTime / intervalDuration, intervalIndex);
    if (intervalIndex >= 0) {
      if (intervalIndex < interval) {
        attemptedQuestions[intervalIndex] += 1; // Increment the count for the corresponding interval
      } else {
        attemptedQuestions[interval - 1] += 1; // Increment the last interval if it exceeds
      }
    }
  });
  return attemptedQuestions;
}

function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}
</script>
