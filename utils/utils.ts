import type { TestLog, TestResultOverview, TestResultCommonOutput } from '~/src/types'

export const utilFindTestLog = (
  logs: TestLog[],
  logType: string,
  fromLast = false,
): TestLog | null => {
  if (fromLast) {
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].type === logType)
        return logs[i] ?? null
    }
  }
  else {
    return logs.find(log => log.type === logType) ?? null
  }

  return null
}

export const utilCreateError = (name: string, msg: string) => {
  const err = new Error(msg)
  err.name = name
  return err
}

export const utilFormatUnixMsToReadableTime = (msUtc: number) => {
  const date = new Date(msUtc)
  return date.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function utilCloneJson<T>(data: T, returnString: boolean): T | string
export function utilCloneJson(data: unknown, returnString: true): string
export function utilCloneJson<T>(data: T, returnString?: false): T

export function utilCloneJson<T>(data: T, returnString: boolean = false): T | string {
  const dataString = JSON.stringify(data)
  return returnString ? dataString : JSON.parse(dataString)
}

/**
 * Generates TestResultOverview from the provided testOutputData.
 *
 * It performs the following steps:
 *
 * 1. If `testResultOverview` is already present in the `testOutputData` and is valid
 * it returns that directly (unless `fresh` is true).
 * 2. If `fresh` is true or existing testResultOverview is invalid/incomplete:
 *    - Extracts the `testName` from `testConfig`.
 *    - Extracts the `testStartTime` from the first `"testStarted"` log.
 *    - Extracts the `testEndTime` from the last `"testFinished"` log.
 * 3. Returns a `TestResultOverview` with an empty overview obj if not present in testOutputData
 *
 * @param testOutputData - The TestOutputData
 * @param fresh - Whether to ignore any pre-existing overview data and regenerate it from logs. Defaults to false.
 * @returns `TestResultOverview` object.
 * @throws MissingTestNameError - If `testName` is missing in `testConfig`.
 * @throws MissingTestLogError - If timestamp of either `testStarted` or `testFinished` logs are missing.
 */

export const utilGetTestResultOverview = (
  testOutputData: Omit<TestResultCommonOutput, 'testResultOverview'>
    & Partial<Pick<TestResultCommonOutput, 'testResultOverview'>>,
  fresh: boolean = false,
): TestResultOverview => {
  // first try to obtain testOutputData.testResultOverview, if it is invalid then create fresh one
  if (!fresh) {
    const {
      testName,
      testStartTime,
      testEndTime,
      overview,
    } = testOutputData.testResultOverview ?? {}

    if (testName && testStartTime && testEndTime) {
      return {
        testName,
        testStartTime,
        testEndTime,
        overview: overview ?? {},
      }
    }
  }

  const testName = testOutputData?.testConfig?.testName

  if (!testName) {
    throw utilCreateError('MissingTestNameError', 'Missing Test Name')
  }

  const { testLogs } = testOutputData
  const testStartTime = utilFindTestLog(testLogs ?? [], 'testStarted')?.timestamp
  const testEndTime = utilFindTestLog(testLogs ?? [], 'testFinished', true)?.timestamp

  if (!testStartTime || !testEndTime) {
    throw utilCreateError('MissingTestLogError', 'Missing testStarted or testFinished log')
  }

  return {
    testName,
    testStartTime,
    testEndTime,
    overview: {},
  }
}
