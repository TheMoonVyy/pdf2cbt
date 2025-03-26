import type {
  TestSectionsData,
  CurrentTestState,
  TestSectionKey,
  QuestionAnswer,
  TestLog,
  QuestionStatus,
} from '~/src/types/'
import { db } from '~/src/db/cbt-db'

type TestLogType = 'currentQuestion' | 'answerSaved' | 'currentAnswer' | 'answerCleared'

type UnknownRecord = Record<string, unknown>

let testLoggerInstance: TestLogger | null = null

class TestLogger {
  logs: TestLog[] = []
  logId: number = 1
  testSectionsData: Ref<TestSectionsData>
  currentTestState: Ref<CurrentTestState>
  lastLoggedAnswer: Ref<QuestionAnswer>

  constructor(
    testSectionsData: Ref<TestSectionsData>,
    currentTestState: Ref<CurrentTestState>,
    lastLoggedAnswer: Ref<QuestionAnswer>,
  ) {
    this.testSectionsData = testSectionsData
    this.currentTestState = currentTestState
    this.lastLoggedAnswer = lastLoggedAnswer
  }

  #createLog(
    type: TestLogType,
    details: Record<string, unknown> | null = null,
    lastLoggedAnswerValue: QuestionAnswer | undefined = undefined,
  ) {
    const timestamp = Date.now()
    const testTime = this.currentTestState.value.remainingSeconds!

    const section = this.currentTestState.value.section
    const question = this.currentTestState.value.question
    const currentQuestionData = this.testSectionsData.value[section][question]
    const currentAnswer = currentQuestionData.answer

    const answer = Array.isArray(currentAnswer) ? [...currentAnswer] : currentAnswer

    const log: TestLog = {
      id: this.logId++,
      timestamp,
      testTime,
      type,
      current: {
        queId: currentQuestionData.queId,
        section,
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

  currentQuestion(
    via: 'save&next' | 'previous' | 'mfr' | 'palette' | 'sectionBtn' | 'testStart',
    prevQueId: number,
    prevSection: TestSectionKey | null = null,
  ) {
    const details: UnknownRecord = { via }

    if (prevSection) details.prevSection = prevSection
    if (via !== 'testStart') details.prevQueId = prevQueId

    this.#createLog('currentQuestion', details)
  }

  currentAnswer(answer: QuestionAnswer) {
    const prevAnswer = this.getPrevAnswer()
    const currAnswer = Array.isArray(answer) ? [...answer] : answer

    this.#createLog('currentAnswer', { prevAnswer, currentAnswer: currAnswer }, currAnswer)
  }

  answeredSaved(
    via: 'save&next' | 'mfr',
    prevAnswer: QuestionAnswer,
    prevStatus: QuestionStatus,
  ) {
    this.#createLog('answerSaved', { via, prevAnswer, prevStatus })
  }

  answerCleared(prevAnswer: QuestionAnswer, prevStatus: QuestionStatus) {
    this.#createLog('answerCleared', { prevAnswer, prevStatus })
  }
}

export default (freshInit: boolean = false): TestLogger => {
  if (!testLoggerInstance || freshInit) {
    const { testSectionsData, currentTestState, lastLoggedAnswer } = useCbtTestData()
    testLoggerInstance = new TestLogger(testSectionsData, currentTestState, lastLoggedAnswer)
  }
  return testLoggerInstance
}
