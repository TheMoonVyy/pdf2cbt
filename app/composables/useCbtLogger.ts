import { db } from '@/src/db/cbt-db'

type UnknownRecord = Record<string, unknown>

let testLoggerInstance: TestLogger | null = null

class TestLogger {
  logs: TestLog[] = []
  logId: number = 1
  testSectionsData: Ref<TestSectionsData>
  testQuestionsData: Ref<Map<number, TestQuestionData>>
  currentTestState: Ref<CurrentTestState>
  lastLoggedAnswer: Ref<QuestionAnswer>

  constructor(
    testSectionsData: Ref<TestSectionsData>,
    testQuestionsData: Ref<Map<number, TestQuestionData>>,
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
    const timestamp = Date.now() // in unix time
    const testTime = this.currentTestState.value.remainingSeconds!

    const currentQueId = this.currentTestState.value.queId

    const currentQuestionData = this.testQuestionsData.value.get(currentQueId)!
    const currentAnswer = currentQuestionData.answer

    const answer = Array.isArray(currentAnswer) ? [...currentAnswer] : currentAnswer

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
        timeSpent: currentQuestionData.timeSpent,
      },
    }

    if (details !== null) log.actionDetails = details

    this.lastLoggedAnswer.value = lastLoggedAnswerValue !== undefined
      ? lastLoggedAnswerValue
      : answer

    this.logs.push(log)
    db.addLog(log)
  }

  getPrevAnswer() {
    const prevAnswerValue = this.lastLoggedAnswer.value
    return Array.isArray(prevAnswerValue) ? [...prevAnswerValue] : prevAnswerValue
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

      const ogCurrentTestState = this.currentTestState.value
      const currentTestState = toRaw(ogCurrentTestState)
      return db.updateCurrentTestState(currentTestState, true)
        .catch('DataCloneError',
          () => db.updateCurrentTestState(JSON.parse(JSON.stringify(currentTestState)), true),
        )
    }
  }

  currentQuestion(
    via: CurrentQuestionViaType,
    prevQueId: number,
    prevSection: TestSectionKey | null = null,
  ) {
    const details: UnknownRecord = { via }

    if (prevSection) details.prevSection = prevSection
    if (via !== 'testStarted' && via !== 'testResumed') {
      details.prevQueId = prevQueId
    }

    if (via !== 'testFinished') this.#createLog('currentQuestion', details)

    if (typeof details.prevQueId === 'number') {
      const prevQueId = details.prevQueId
      const prevQuestionData = this.testQuestionsData.value.get(prevQueId)
      if (prevQuestionData) db.updateQuestionData(prevQuestionData)

      const ogCurrentTestState = this.currentTestState.value
      const currentTestState = toRaw(ogCurrentTestState)

      return db.updateCurrentTestState(
        currentTestState,
        via === 'testFinished',
        Boolean(details.prevSection),
      ).catch('DataCloneError',
        () => db.updateCurrentTestState(
          JSON.parse(JSON.stringify(currentTestState)),
          via === 'testFinished',
          Boolean(details.prevSection),
        ),
      )
    }
  }

  currentAnswer(answer: QuestionAnswer) {
    const prevAnswer = this.getPrevAnswer()
    const currAnswer = Array.isArray(answer) ? [...answer] : answer

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
