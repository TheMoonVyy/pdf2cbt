import type {
  OVERVIEW_PRE_RESULT_GENERATION_KEYS } from '#layers/shared/shared/constants'
import {
  OVERVIEW_POST_RESULT_GENERATION_KEYS,
} from '#layers/shared/shared/constants'

type Overview<T extends boolean> = T extends true
  ? Required<TestResultOverview['overview']>
  : Pick<TestResultOverview['overview'], (typeof OVERVIEW_PRE_RESULT_GENERATION_KEYS)[number]>

const getTemplate = () => ({ all: 0, mcq: 0, msq: 0, nat: 0, msm: 0 })

function generateTestResultOverview<T extends boolean>(
  testData: T extends true ? TestResultJsonOutput : TestInterfaceJsonOutput,
  isTestResultData: T,
): Overview<T> {
  const overview: Required<TestResultOverview['overview']> = {
    marksObtained: getTemplate(),
    maxMarks: getTemplate(),
    marksPercent: getTemplate(),
    correctQ: getTemplate(),
    incorrectQ: getTemplate(),
    qAttempted: getTemplate(),
    totalQuestions: getTemplate(),
    qAttemptedPercent: getTemplate(),
    accuracy: getTemplate(),
    totalTimeSpent: getTemplate(),
    avgTimeSpent: getTemplate(),
  }

  const accuracyPerQType: Record<QuestionType, { value: number, total: number }> = {
    mcq: { value: 0, total: 0 },
    msq: { value: 0, total: 0 },
    nat: { value: 0, total: 0 },
    msm: { value: 0, total: 0 },
  }

  const subjectData = isTestResultData
    ? (testData as TestResultJsonOutput).testResultData
    : (testData as TestInterfaceJsonOutput).testData as unknown as TestResultJsonOutput['testResultData']

  for (const subject of Object.values(subjectData)) {
    for (const section of Object.values(subject)) {
      for (const q of Object.values(section)) {
        const qType = q.type

        // max marks
        overview.maxMarks[qType] += q.marks.max ?? q.marks.cm

        // questions attempted
        if (q.status === 'answered' || q.status === 'markedAnswered') {
          overview.qAttempted[qType] += 1
        }

        // total questions
        overview.totalQuestions[qType] += 1

        // total time spent
        overview.totalTimeSpent[qType] += q.timeSpent

        const result = isTestResultData ? q.result : null
        if (!result || result?.status === 'notConsidered') continue
        // from here on as result is generated, data depending on it can be calculated

        // marks obtained
        overview.marksObtained[qType] += result.marks

        // correct and incorrect questions count
        if (result.status === 'correct') {
          overview.correctQ[qType] += 1
        }
        else if (result.status === 'incorrect') {
          overview.incorrectQ[qType] += 1
        }

        // accuracy
        accuracyPerQType[qType].value += result.accuracyNumerator
        if (result.status === 'correct'
          || result.status === 'incorrect'
          || result.status === 'partial') {
          accuracyPerQType[qType].total += 1
        }
      }
    }
  }

  overview.maxMarks.all = Object.values(overview.maxMarks)
    .reduce((a, b) => a + b, 0)

  overview.qAttempted.all = Object.values(overview.qAttempted)
    .reduce((a, b) => a + b, 0)

  overview.totalQuestions.all = Object.values(overview.totalQuestions)
    .reduce((a, b) => a + b, 0)

  for (const qType of Object.keys(overview.qAttempted) as (keyof typeof overview.qAttempted)[]) {
    const attempted = overview.qAttempted[qType]
    const total = overview.totalQuestions[qType]
    overview.qAttemptedPercent[qType] = Math.round((attempted / (total || 1)) * 10000) / 100
  }

  overview.totalTimeSpent.all = Object.values(overview.totalTimeSpent)
    .reduce((a, b) => a + b, 0)

  for (const qType of Object.keys(overview.totalTimeSpent) as (keyof typeof overview.totalTimeSpent)[]) {
    const totalTime = overview.totalTimeSpent[qType]
    const totalQ = overview.totalQuestions[qType]
    overview.avgTimeSpent[qType] = Math.round((totalTime / (totalQ || 1)))
  }

  if (!isTestResultData) {
    const overviewToReturn: TestResultOverview['overview'] = overview
    for (const key of OVERVIEW_POST_RESULT_GENERATION_KEYS) {
      delete overviewToReturn[key] // eslint-disable-line @typescript-eslint/no-dynamic-delete
    }

    return overviewToReturn as Overview<T>
  }

  overview.marksObtained.all = Object.values(overview.marksObtained)
    .reduce((a, b) => a + b, 0)

  for (const qType of Object.keys(overview.marksObtained) as (keyof typeof overview.marksObtained)[]) {
    const marksObtained = overview.marksObtained[qType]
    const maxMarks = overview.maxMarks[qType]
    overview.marksPercent[qType] = Math.round((marksObtained / (maxMarks || 1)) * 10000) / 100
  }

  overview.correctQ.all = Object.values(overview.correctQ)
    .reduce((a, b) => a + b, 0)

  overview.incorrectQ.all = Object.values(overview.incorrectQ)
    .reduce((a, b) => a + b, 0)

  let totalAccuracyValue = 0
  let totalAccuracyCount = 0
  for (const qType of Object.keys(accuracyPerQType) as QuestionType[]) {
    const { value, total } = accuracyPerQType[qType]
    totalAccuracyValue += value
    totalAccuracyCount += total

    overview.accuracy[qType] = Math.round((value / (total || 1)) * 10000) / 100
  }
  overview.accuracy.all = Math.round((totalAccuracyValue / (totalAccuracyCount || 1)) * 10000) / 100

  return overview as Overview<T>
}

export default generateTestResultOverview
