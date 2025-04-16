import type {
  QuestionAnswer,
  CurrentTestState,
  TestSectionListItem,
  CropperSectionsData,
  TestSectionsData,
  TestSectionsSummary,
  TestSectionKey,
  TestQuestionData,
  QuestionStatus,
  TestSectionsImgUrls,
} from '~/src/types'
import { CbtUseState } from '~/src/types/enums'

const sectionsPrevQuestion: Record<TestSectionKey, number> = {}

const getTestDummyData = () => {
  let questionNum = 1
  const testSectionsdummyData: TestSectionsData = {}
  const testQuestionsDummyData: Map<number, TestQuestionData> = new Map()

  for (const subjectNum of utilRange(1, 4)) {
    const subject = 'Subject' + subjectNum

    for (const sectionNum of utilRange(1, 3)) {
      const section: TestSectionKey = `${subject} Section ${sectionNum}`

      testSectionsdummyData[section] = {}
      const questionsRange = sectionNum === 1 ? 20 : 5
      const recentQuestion = questionNum
      sectionsPrevQuestion[section] = recentQuestion

      for (const secQueId of utilRange(1, questionsRange + 1)) {
        const questionData = {
          secQueId,
          queId: questionNum,
          que: questionNum,
          section,
          type: sectionNum === 1 ? 'mcq' : 'nat',
          answer: null,
          status: 'notVisited',
          timeSpent: 0,
        } as TestQuestionData

        testSectionsdummyData[section][questionNum] = questionData
        testQuestionsDummyData.set(questionNum, questionData)
        questionNum++
      }

      if (subjectNum === 1 && sectionNum === 1) {
        testSectionsdummyData[section][recentQuestion].status = 'notAnswered'
      }
    }
  }

  const statusArray: QuestionStatus[] = ['answered', 'notAnswered', 'marked', 'markedAnswered']
  const dummyStatusArray = [...statusArray, ...statusArray] // Duplicate the statuses

  for (const status of dummyStatusArray) {
    const randomQuestion = 1 + Math.max(1, Math.floor(Math.random() * 20)) // random from 2 to 20
    testSectionsdummyData['Subject1 Section 1'][randomQuestion].status = status
  }

  return { testSectionsdummyData, testQuestionsDummyData }
}

const { testQuestionsDummyData, testSectionsdummyData } = getTestDummyData()

export default () => {
  const testSectionsList = useState<TestSectionListItem[]>(
    CbtUseState.TestSectionsList,
    () => {
      const dummyData = []
      for (const subjectNum of utilRange(1, 4)) {
        const subject = 'Subject' + subjectNum

        for (const sectionNum of utilRange(1, 3)) {
          const name = subject + ' Section ' + sectionNum
          const sectionsItem: TestSectionListItem = { name, subject }

          dummyData.push(sectionsItem)
        }
      }

      return dummyData
    },
  )

  const cropperSectionsData = useState<CropperSectionsData>(
    CbtUseState.CropperSectionsData,
    () => {
      let questionNum = 1
      const dummyData: CropperSectionsData = {}
      for (const subjectNum of utilRange(1, 4)) {
        const subject = 'Subject' + subjectNum

        for (const sectionNum of utilRange(1, 3)) {
          const section = subject + ' Section ' + sectionNum
          dummyData[section] = {}
          const questionsRange = sectionNum === 1 ? 20 : 5

          for (const _ of utilRange(1, questionsRange + 1)) {
            dummyData[section][questionNum] = {
              que: questionNum,
              type: sectionNum === 1 ? 'mcq' : 'nat',
              marks: { cm: 4, im: -1 },
              pdfData: [
                { page: 1, x1: 0, y1: 0, x2: 0, y2: 0 },
              ],
            }

            questionNum++
          }
        }
      }

      return dummyData
    },
  )

  const testSectionsData = useState<TestSectionsData>(
    CbtUseState.TestSectionsData,
    () => testSectionsdummyData,
  )

  const testQuestionsData = useState<Map<number, TestQuestionData>>(
    CbtUseState.TestQuestionsData,
    () => testQuestionsDummyData,
  )

  const testSectionsSummary = useState<TestSectionsSummary>(
    CbtUseState.TestSectionsSummary,
    () => new Map(),
  )

  const currentTestState = useState<CurrentTestState>(
    CbtUseState.CurrentTestState,
    () => {
      return {
        section: 'Subject1 Section 1',
        question: 1,
        queId: 1,
        testDuration: 180 * 60,
        remainingSeconds: null,
        testName: 'Mock Test 1',
        currentQuestionStartTime: 180 * 60,
        testStatus: 'notStarted',
        currentAnswerBuffer: null,
        questionsNumberingOrderType: 'original',
        saveTestData: true,
        sectionsPrevQuestion: sectionsPrevQuestion,
      }
    },
  )

  const testSectionsImgUrls = useState<TestSectionsImgUrls>(
    CbtUseState.TestSectionsImgUrls,
    () => ({}),
  )

  const lastLoggedAnswer = useState<QuestionAnswer>(
    CbtUseState.LastLoggedAnswer,
    () => null,
  )

  return {
    testSectionsList,
    cropperSectionsData,
    currentTestState,
    testSectionsData,
    testQuestionsData,
    lastLoggedAnswer,
    testSectionsImgUrls,
    testSectionsSummary,
  }
}
