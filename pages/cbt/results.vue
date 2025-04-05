<template>
  <div
    class="max-h-dvh min-h-dvh w-full border-t-2 overflow-y-auto border-surface-700 dark:bg-surface-900 dark:text-surface-0">
    <div class="m-4">
      <!-- This is the file upload component for uploading the analysis file -->
      <BaseSimpleFileUpload accept="application/json,.json"
        :label="isLoading ? 'Please wait, loading File...' : 'Select the Analysis File'"
        :icon-name="isLoading ? 'line-md:loading-twotone-loop' : 'prime:plus'" icon-size="1.5rem"
        invalid-file-type-message="Invalid file. Please select a valid JSON Analysis File."
        @uploader="(e: any) => handleAnalysisFileUpload(e.files)" />
    </div>
    <div :class="{ 'hidden': !isUploaded }">
      <div>
        <div class="flex flex-col lg:flex-row w-full h-screen lg:h-auto justify-evenly">
          <div class="px-2 flex-1 min-w-0 h-96 items-center justify-center">
            <!-- Here goes the pie chart for the test summary -->
            <v-chart class="h-screen" :option="{
              backgroundColor: 'transparent',
              title: {
                text: 'Attempt Type',
                left: 'center',
                top: '0%',
                textStyle: {
                  color: isDarkMode() ? '#FFFFFF' : '#000000',
                },
              },
              legend: {
                top: '7%',
                textStyle: {
                  color: isDarkMode() ? '#FFFFFF' : '#000000',
                }
              },
              tooltip: {
                trigger: 'item',
              },
              series: [
                {
                  name: 'Attempts',
                  type: 'pie',
                  radius: '80%',
                  center: ['50%', '55%'],
                  data: [
                    { value: getTestSummaryData('answered'), name: 'Answered', itemStyle: { color: '#00FF00' } },
                    { value: getTestSummaryData('notAnswered'), name: 'Not Answered', itemStyle: { color: '#FF0000' } },
                    { value: getTestSummaryData('notVisited'), name: 'Not Visited', itemStyle: { color: '#D3D3D3' } },
                    { value: getTestSummaryData('marked'), name: 'Marked for Review', itemStyle: { color: '#8F00FF' } },
                    { value: getTestSummaryData('markedAnswered'), name: 'Marked for Review and Answered', itemStyle: { color: '#0000FF' } },
                  ],
                  label: {
                    show: false,
                  },
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                  },
                },
              ],
            }
              " autoresize />
          </div>
          <div class="px-2 items-center min-w-0 h-96 flex-1 justify-center">
            <!-- Here goes the pie chart for the time spent on each section -->
            <v-chart class="h-screen" :option="{
              backgroundColor: 'transparent',
              title: {
                text: 'Time Spent per Section',
                left: 'center',
                top: '0%',
                textStyle: {
                  color: isDarkMode() ? '#FFFFFF' : '#000000',
                },
              },
              legend: {
                top: '7%',
                textStyle: {
                  color: isDarkMode() ? '#FFFFFF' : '#000000',
                }
              },
              tooltip: {
                trigger: 'item',
                formatter: function (params: any) {
                  return `${params.marker} ${params.name} <br/>${params.value} min`;
                },
              },
              series: [
                {
                  name: 'Attempts',
                  type: 'pie',
                  radius: '80%',
                  center: ['50%', '55%'],
                  data: getTestTimebySection().map((item) => ({ value: Math.round(item.timeSpent / 0.6) / 100, name: item.label })),
                  label: {
                    show: false,
                  },
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                  },
                },
              ],
            }
              " autoresize />
          </div>
        </div>
        <div class="pb-24 px-5" style="height: 400px;">
          <!-- Here goes the line chart for the test journey -->
          <v-chart class="h-screen" :option="{
            title: {
              text: 'Test Journey',
              left: 'center',
              top: '0%',
              textStyle: {
                color: isDarkMode() ? '#FFFFFF' : '#000000',
              },
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                label: {
                  backgroundColor: '#6a7985'
                }
              }
            },

            legend: {
              top: '8%',
              textStyle: {
                color: isDarkMode() ? '#FFFFFF' : '#000000',
              }
            },
            xAxis: {
              type: 'category',
              data: Array.from({ length: 6 }, (_, i) => {
                const testTime = jsonData?.testLogs
                  ? (getStartEndTimestamp(jsonData.testLogs).end - getStartEndTimestamp(jsonData.testLogs).start) / 60000
                  : 0;
                const start = Math.round((i * testTime / 6) * 10) / 10;
                const end = Math.round(((i + 1) * testTime / 6) * 10) / 10;
                return `${start}-${end} min`;
              })
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                name: 'Questions Attempted',
                data: getAttemptedQuestionsbyInveral(getLatestLogsByQueId(jsonData?.testLogs ?? []), 6),
                type: 'line',
                smooth: true
              }
            ]
          }" autoresize />
        </div>
        <!-- <div class="grid"> -->
        <!-- Here goes the Question Journey based on testLogs -->
        <!-- </div> -->
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { TestLog, TestOutputData } from '../../src/types'

// Importing necessary components and modules from the ECharts library
import { use } from 'echarts/core'
import { PieChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
use([GridComponent, TooltipComponent, LegendComponent, TitleComponent, PieChart, LineChart, CanvasRenderer])

// This ref holds the loading state of the file upload process.
let isLoading = ref(false);
let isUploaded = ref(false);

// This ref holds the parsed JSON data from the uploaded file.
let jsonData = ref<TestOutputData | null>(null);

// This function handles the file upload and parsing of the JSON data.
// It sets the isLoading state to true while the file is being processed.
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

// This function calculates the total number of questions for each type
// by iterating through the test summary data of each section and summing up the values.
function getTestSummaryData(data: 'answered' | 'notAnswered' | 'notVisited' | 'marked' | 'markedAnswered'): number {
  let num = 0;
  if (jsonData.value) {
    jsonData.value.testSummary.forEach((section) => {
      num = num + section[data];
    });
  }
  return num; // Ensure a number is always returned
}

// This function calculates the time spent on each section of the test
// by iterating through the test data and summing up the time spent on each question.
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

// This function filters the test logs to get the latest log for each question ID (queId).
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

// This function retrieves the start and end timestamps from the test logs.
function getStartEndTimestamp(testLogs: TestLog[]): { start: number; end: number } {
  let start = testLogs.find((log) => log.type === 'testStarted')?.timestamp || 0;
  let end = testLogs.find((log) => log.type === 'testFinished')?.timestamp || 0;
  return { start, end };
}

// This function calculates the number of attempted questions in each time interval.
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