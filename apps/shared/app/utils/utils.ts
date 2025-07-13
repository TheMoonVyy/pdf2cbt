export const utilFindTestLog = (
  logs: TestLog[],
  logType: string,
  fromLast = false,
): TestLog | null => {
  if (fromLast) {
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i]?.type === logType)
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

export const utilGetTestResultOverview = (
  testOutputData: Omit<TestInterfaceAndResultCommonJsonOutputData, 'testResultData'>,
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

export const utilIsPdfFile = (file: File): Promise<0 | 1 | 2> => {
  return new Promise((resolve, reject) => {
    if (file.size <= 2) {
      return resolve(0)
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const results = e.target?.result

      if (results) {
        const arr = new Uint8Array(results as ArrayBuffer)
        // Check file type via magic number
        if (arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46) {
          return resolve(2) // valid pdf by magic number
        }
        else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          return resolve(1) // probably a pdf
        }
      }

      return resolve(0) // not a pdf
    }
    reader.onerror = error => reject(error)
    reader.readAsArrayBuffer(file.slice(0, 4))
  })
}

export const utilIsZipFile = (file: File | Blob): Promise<0 | 1 | 2> => {
  return new Promise((resolve, reject) => {
    if (file.size <= 2) {
      return resolve(0)
    }
    const reader = new FileReader()

    reader.onload = (e) => {
      const results = e.target?.result

      if (results) {
        const arr = new Uint8Array(results as ArrayBuffer)
        // Check file type via magic number
        if (arr[0] === 0x50 && arr[1] === 0x4B) {
          return resolve(2) // valid zip by magic number
        }
        else if (
          (file.type === 'application/zip')
          || (file instanceof File && file.name.toLowerCase().endsWith('.zip'))
        ) {
          return resolve(1) // probably a zip
        }
      }

      return resolve(0) // not a zip
    }

    reader.onerror = error => reject(error)
    reader.readAsArrayBuffer(file.slice(0, 2))
  })
}

export const utilGhUrlToJsDelivrUrl = (githubUrl: string) => {
  // Extract the username, repository, branch, and file path from the GitHub URL
  const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:tree|blob)\/([^/]+)\/(.*)/
  const match = githubUrl.match(regex)

  if (match) {
    const username = match[1]
    const repository = match[2]
    const branch = match[3]
    const filePath = match[4]

    // Construct the jsDelivr URL
    return `https://cdn.jsdelivr.net/gh/${username}/${repository}@${branch}/${filePath}`
  }
  else {
    return null
  }
}
