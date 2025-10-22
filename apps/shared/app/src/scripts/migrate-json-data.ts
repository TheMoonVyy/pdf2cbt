/* eslint-disable @typescript-eslint/no-explicit-any */

type OldAnswerKeyJsonOutput = Omit<AnswerKeyJsonOutput, 'testAnswerKey'> & {
  testAnswerKey: GenericSubjectsTree<QuestionAnswer>
}

export class MigrateJsonData {
  currentAppVersion: string
  constructor(currentAppVersion: string = import.meta.env.PROJECT_VERSION) {
    this.currentAppVersion = currentAppVersion
  }

  private migrateSubjectsData(data: any, isDataOfTestResults = false) {
    const subjectDatas = Object.values(data as TestResultJsonOutput['testResultData'])

    for (const subjectData of subjectDatas) {
      for (const sectionData of Object.values(subjectData)) {
        for (const questionData of Object.values(sectionData)) {
          this.questionData(questionData, isDataOfTestResults)
        }
      }
    }
  }

  getAppVersion() {
    return this.currentAppVersion
  }

  questionData(data: any, isDataOfTestResults: boolean) {
    const type = data.type
    if (type === 'mcq' || type === 'msq') {
      if ('options' in data) {
        data.answerOptions = (data.options || 4) + ''
        delete data.options
      }
      else if ('totalOptions' in data) {
        data.answerOptions = (data.totalOptions || 4) + ''
        delete data.totalOptions
      }
      else if ('answerOptions' in data) {
        data.answerOptions = (data.answerOptions || 4) + ''
      }
      else {
        data.answerOptions = '4'
      }
    }

    if (isDataOfTestResults) {
      const { result, answer } = data
      if (typeof result.accuracyNumerator === 'number')
        return

      if (result.status === 'correct')
        result.accuracyNumerator = 1
      else if (result.status === 'partial') {
        const partialCount = answer.length / (result.correctAnswer?.length || 4)
        result.accuracyNumerator = Math.round(partialCount * 100) / 100 // round to 2 decimal places
      }
      else
        result.accuracyNumerator = 0
    }
  }

  removeEmptyKeysFromTestConfig<
    T extends (TestInterfaceAndResultCommonJsonOutputData['testConfig'] | PdfCropperJsonOutput['testConfig']),
  >(testConfig: T) {
    for (const key of Object.keys(testConfig) as (keyof T)[])
      if (key === 'optionalQuestions') {
        if (!testConfig.optionalQuestions?.length)
          delete testConfig.optionalQuestions
      }
      else {
        if (!testConfig[key])
          delete testConfig[key] // eslint-disable-line @typescript-eslint/no-dynamic-delete
      }
  }

  getPdfCropperJsonOutputTemplate(): PdfCropperJsonOutput {
    return {
      testConfig: {
        zipConvertedUrl: '',
        zipOriginalUrl: '',
        zipUrl: '',
        optionalQuestions: [],
        pdfFileHash: '',
      },
      pdfCropperData: {},
      appVersion: this.currentAppVersion,
      generatedBy: 'pdfCropperPage',
    }
  }

  pdfCropperData(
    data: any,
    output = this.getPdfCropperJsonOutputTemplate(),
  ): PdfCropperJsonOutput {
    if (!('appVersion' in data)) {
      if ('pdfFileHash' in data) {
        output.testConfig.pdfFileHash = data.pdfFileHash
      }

      if ('testConfig' in data && Object.keys(data.testConfig).length > 0) {
        utilSelectiveMergeObj(output.testConfig, data.testConfig)
      }

      if ('pdfCropperData' in data) {
        output.pdfCropperData = data.pdfCropperData
        this.migrateSubjectsData(output.pdfCropperData)
      }
    }
    else {
      Object.assign(output, data)
    }

    this.removeEmptyKeysFromTestConfig(output.testConfig)
    return output
  }

  testInterfaceData(data: any): TestInterfaceJsonOutput {
    const output: TestInterfaceJsonOutput = {
      testConfig: {
        testName: '',
        testDurationInSeconds: 0,
        zipOriginalUrl: '',
        zipConvertedUrl: '',
        pdfFileHash: '',
      },
      testData: {},
      testSummary: [],
      testLogs: [],
      testResultOverview: {
        testName: '',
        testStartTime: 0,
        testEndTime: 0,
        overview: {},
      },
      testAnswerKey: {},
      generatedBy: 'testInterfacePage',
      appVersion: this.currentAppVersion,
    }

    if (!('appVersion' in data)) {
      if ('testConfig' in data && Object.keys(data.testConfig).length > 0) {
        utilSelectiveMergeObj(output.testConfig, data.testConfig)
      }

      if ('testLogs' in data && Array.isArray(data.testLogs)) {
        output.testLogs = data.testLogs
      }

      if ('testSummary' in data && Array.isArray(data.testSummary)) {
        output.testSummary = data.testSummary
      }

      if ('testAnswerKey' in data)
        output.testAnswerKey = data.testAnswerKey
      else
        delete output.testAnswerKey

      if ('testData' in data) {
        output.testData = data.testData
        this.migrateSubjectsData(output.testData)
      }

      if ('testResultOverview' in data && Object.keys(data.testResultOverview).length > 0) {
        output.testResultOverview = data.testResultOverview || {}
      }
      output.testResultOverview = utilGetTestResultOverview(output)

      if ('testAnswerKey' in data) {
        output.testAnswerKey = data.testAnswerKey
      }
    }
    else {
      Object.assign(output, data)
    }

    this.removeEmptyKeysFromTestConfig(output.testConfig)
    return output
  }

  testResultData(data: any): TestResultJsonOutput {
    const output: TestResultJsonOutput = {
      testConfig: {
        testName: '',
        testDurationInSeconds: 0,
        zipOriginalUrl: '',
        zipConvertedUrl: '',
        pdfFileHash: '',
      },
      testResultData: {},
      testSummary: [],
      testLogs: [],
      testResultOverview: {
        testName: '',
        testStartTime: 0,
        testEndTime: 0,
        overview: {},
      },
      generatedBy: 'testResultsPage',
      appVersion: this.currentAppVersion,
    }

    if (!('appVersion' in data)) {
      if ('testConfig' in data && Object.keys(data.testConfig).length > 0) {
        utilSelectiveMergeObj(output.testConfig, data.testConfig)
      }

      if ('testLogs' in data && Array.isArray(data.testLogs)) {
        output.testLogs = data.testLogs
      }

      if ('testSummary' in data && Array.isArray(data.testSummary)) {
        output.testSummary = data.testSummary
      }

      if ('testResultData' in data) {
        output.testResultData = data.testResultData
        this.migrateSubjectsData(output.testResultData, true)
      }

      if ('testResultOverview' in data && Object.keys(data.testResultOverview).length > 0) {
        output.testResultOverview = data.testResultOverview || {}
      }
      output.testResultOverview = utilGetTestResultOverview(output)
    }
    else {
      Object.assign(output, data)
    }
    this.removeEmptyKeysFromTestConfig(output.testConfig)

    return output
  }

  testInterfaceOrResultData(data: any): TestInterfaceOrResultJsonOutput {
    if ('testResultData' in data)
      return this.testResultData(data)

    return this.testInterfaceData(data)
  }

  answerKeyData<T extends AnswerKeyJsonOutput = AnswerKeyJsonOutput>(
    data: any,
    migrateOnlyAnswerKey: boolean = false,
  ): T {
    let output: T

    if (!('appVersion' in data) && !migrateOnlyAnswerKey) {
      if (data?.testOutputDatas) {
        data = data.testOutputDatas[0]
      }

      if ('testData' in data) {
        output = this.testInterfaceData(data) as unknown as T
      }
      else if ('pdfCropperData' in data) {
        output = this.pdfCropperData(data) as unknown as T
        if (data?.testAnswerKey)
          output.testAnswerKey = data.testAnswerKey
      }
      else {
        output = data
      }
      output.generatedBy = 'answerKeyPage'
    }
    else if (!migrateOnlyAnswerKey && data.generatedBy && data.generatedBy !== 'answerKeyPage') {
      output = data
      output.generatedBy = 'answerKeyPage'
    }
    else {
      output = data
    }

    if (
      output.testAnswerKey
      && ('testData' in output || 'pdfCropperData' in output)
      && utilCompareVersion(output.appVersion || '', '<', '1.29.0')
    ) {
      const oldAnswerKeyData = output as unknown as OldAnswerKeyJsonOutput
      const subjects = 'testData' in output
        ? output.testData
        : output.pdfCropperData
      const newTestAnswerKey: TestAnswerKeyData = {}

      for (const [subject, subjectData] of Object.entries(oldAnswerKeyData.testAnswerKey)) {
        newTestAnswerKey[subject] = {}
        for (const [section, sectionData] of Object.entries(subjectData)) {
          newTestAnswerKey[subject][section] = {}
          for (const [qNum, correctAnswer] of Object.entries(sectionData)) {
            const qData = subjects[subject]?.[section]?.[qNum]
            if (!qData) continue

            const answerData: TestAnswerKeyData[string][string][string] = {
              type: qData.type,
              correctAnswer,
            }
            if (qData.type === 'mcq' || qData.type === 'msq' || qData.type === 'msm')
              answerData.answerOptions = qData.answerOptions || '4'

            newTestAnswerKey[subject][section][qNum] = answerData
          }
        }
      }

      output.testAnswerKey = newTestAnswerKey
      if (!migrateOnlyAnswerKey)
        output.generatedBy = 'answerKeyPage'
    }

    output.appVersion = this.currentAppVersion
    return output
  }
}
