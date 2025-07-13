type UnknownRecord = Record<string, unknown>

const db = useDB()

class TestLogger {
  logs: TestLog[] = []
  logId: number = 1
  testSectionsData: Ref<TestSessionSectionsData>
  testQuestionsData: Ref<Map<number, TestSessionQuestionData>>
  currentTestState: Ref<CurrentTestState>
  lastLoggedAnswer: Ref<QuestionAnswer>

  constructor(
    testSectionsData: Ref<TestSessionSectionsData>,
    testQuestionsData: Ref<Map<number, TestSessionQuestionData>>,
    currentTestState: Ref<CurrentTestState>,
    lastLoggedAnswer: Ref<QuestionAnswer>,
  ) {
    this.testSectionsData = testSectionsData
    this.testQuestionsData = testQuestionsData
    this.currentTestState = currentTestState
    this.lastLoggedAnswer = lastLoggedAnswer
  }

  #createLog(
    type: TestLogType,
    details: Record<string, unknown> | null = null,
    lastLoggedAnswerValue: QuestionAnswer | undefined = undefined,
  ) {
    const timestamp = Date.now() // in unix ms utc time
    const testTime = this.currentTestState.value.remainingSeconds!
    const questionStartTime = this.currentTestState.value.currentQuestionStartTime

    const currentQueId = this.currentTestState.value.queId

    const currentQuestionData = this.testQuestionsData.value.get(currentQueId)!

    const answer = utilCloneJson(currentQuestionData.answer)

    const log: TestLog = {
      id: this.logId++,
      timestamp,
      testTime,
      type,
      current: {
        queId: currentQuestionData.queId,
        section: currentQuestionData.section,
        question: currentQuestionData.que,
        answer,
        status: currentQuestionData.status,
        timeSpent: questionStartTime - testTime,
      },
    }

    if (details !== null) log.actionDetails = details

    this.lastLoggedAnswer.value = lastLoggedAnswerValue ?? answer

    this.logs.push(log)
    db.addLog(log)
  }

  getPrevAnswer() {
    const prevAnswerValue = this.lastLoggedAnswer.value
    return utilCloneJson(prevAnswerValue)
  }

  replaceLogsArray(newLogArray: TestLog[]) {
    const { id: lastLogId } = newLogArray.at(-1) ?? {}
    this.logId = lastLogId ?? newLogArray.length + 1
    this.logs = newLogArray
  }

  logTestState(
    logType: LogTestStateViaType,
    submittedVia: 'Auto' | 'Manual' = 'Auto',
  ) {
    if (logType === 'testFinished') {
      const currentQueId = this.currentTestState.value.queId
      this.currentQuestion('testFinished', currentQueId)
      this.#createLog(logType, { submittedVia })
    }
    else {
      this.#createLog(logType)
      this.currentQuestion(logType, 0)

      const currentTestState = utilCloneJson(this.currentTestState.value)
      return db.updateCurrentTestState(currentTestState, true)
    }
  }

  currentQuestion(
    via: CurrentQuestionViaType,
    prevQueId: number,
    prevSection: string | null = null,
  ) {
    const details: UnknownRecord = { via }

    if (prevSection)
      details.prevSection = prevSection

    if (via !== 'testStarted' && via !== 'testResumed') {
      details.prevQueId = prevQueId
    }

    if (via !== 'testFinished')
      this.#createLog('currentQuestion', details)

    if (typeof details.prevQueId === 'number') {
      const prevQueId = details.prevQueId
      const prevQuestionData = this.testQuestionsData.value.get(prevQueId)
      if (prevQuestionData)
        db.updateQuestionData(utilCloneJson(prevQuestionData))

      const currentTestState = utilCloneJson(this.currentTestState.value)

      return db.updateCurrentTestState(
        currentTestState,
        via === 'testFinished',
        Boolean(details.prevSection),
      )
    }
  }

  currentAnswer(answer: QuestionAnswer) {
    const prevAnswer = this.getPrevAnswer()
    const currAnswer = utilCloneJson(answer)

    this.#createLog('currentAnswer', { prevAnswer, currentAnswer: currAnswer }, currAnswer)
  }

  answeredSaved(
    via: AnswerSavedViaType,
    prevAnswer: QuestionAnswer,
    prevStatus: QuestionStatus,
  ) {
    this.#createLog('answerSaved', { via, prevAnswer, prevStatus })
  }

  answerCleared(prevAnswer: QuestionAnswer, prevStatus: QuestionStatus) {
    this.#createLog('answerCleared', { prevAnswer, prevStatus })
  }

  getLogs() {
    return this.logs
  }
}

let testLoggerInstance: TestLogger | null = null

export default (freshInit: boolean = false): TestLogger => {
  if (!testLoggerInstance || freshInit) {
    const {
      testSectionsData,
      testQuestionsData,
      currentTestState,
      lastLoggedAnswer,
    } = useCbtTestData()

    testLoggerInstance = new TestLogger(
      testSectionsData,
      testQuestionsData,
      currentTestState,
      lastLoggedAnswer,
    )
  }
  return testLoggerInstance
}
