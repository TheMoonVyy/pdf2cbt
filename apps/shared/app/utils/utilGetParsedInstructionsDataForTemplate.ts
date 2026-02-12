import {
  QUESTION_TYPES_IN_WORDS,
  ANSWER_OPTIONS_COUNTER_VALUES,
  type AnswerOptionsCounterTypes,
} from '#layers/shared/shared/constants'
import { answerOptionsMsmCaptureRegex } from '#layers/shared/shared/regexes'

export default (
  pdfCropperData: CropperOutputData,
  instructionsData: CbtMakerInternalInstructionsData,
  testName: string,
  testDuration: number,
  uiSettings: CbtUiSettings,
  icons: ReturnType<typeof useCbtInterfaceIcons>['value'],
) => {
  const defaultOptionsCounterType = uiSettings.questionPanel.answerOptionsFormat.mcqAndMsq.counterType
  const defaultMsmRowOptionsCounterType = uiSettings.questionPanel.answerOptionsFormat.msm.row.counterType
  const defaultMsmColOptionsCounterType = uiSettings.questionPanel.answerOptionsFormat.msm.col.counterType

  const getSectionData = (
    name: string,
    slNum: number,
    subjectName: string,
    sectionData: CropperOutputData[string][string],
  ): CbtInstructionsTemplateSectionData => {
    const questions = Object.values(sectionData)
    const totalQuestions = questions.length

    const question = questions[0]!
    const questionType = question.type
    const questionTypeInWords = QUESTION_TYPES_IN_WORDS[questionType]
    const questionMarks = {
      correct: question.marks.cm,
      incorrect: question.marks.im,
      partial: question.marks.pm ?? 0,
      max: question.marks.max ?? question.marks.cm,
    }

    const optionalQuestions = instructionsData
      .additionalData?.[subjectName]?.sections?.[name]?.optionalQuestions || 0

    let maxMarks = 0
    const quesToCount = (questions.length - optionalQuestions)
    for (let i = 1; i <= quesToCount; i++) {
      const q = questions[i - 1]!
      maxMarks += q.marks.max ?? q.marks.cm
    }

    let answerOptions: CbtInstructionsTemplateSectionData['answerOptions'] = undefined
    if (question.type === 'msm' || question.type === 'mcq' || question.type === 'msq') {
      const match = answerOptionsMsmCaptureRegex
        .exec(question.answerOptions || '4')

      const rowsCount = Number(match?.groups?.rows || '4')

      if (question.type === 'msm') {
        const colsCount = Number(match?.groups?.cols || (rowsCount + ''))

        const rowsCounterType = question
          .answerOptionsCounterType?.primary || defaultMsmRowOptionsCounterType

        const colsCounterType = question
          .answerOptionsCounterType?.secondary || defaultMsmColOptionsCounterType

        const rowsChars = ANSWER_OPTIONS_COUNTER_VALUES[rowsCounterType as AnswerOptionsCounterTypes]
          .slice(0, rowsCount)

        const colsChars = ANSWER_OPTIONS_COUNTER_VALUES[colsCounterType as AnswerOptionsCounterTypes]
          .slice(0, colsCount)

        answerOptions = {
          rows: {
            count: rowsCount,
            chars: rowsChars,
          },
          cols: {
            count: colsCount,
            chars: colsChars,
          },
        }
      }
      else {
        const rowsCounterType = question
          .answerOptionsCounterType?.primary || defaultOptionsCounterType

        const rowsChars = ANSWER_OPTIONS_COUNTER_VALUES[rowsCounterType as AnswerOptionsCounterTypes]
          .slice(0, rowsCount)

        answerOptions = {
          rows: {
            count: rowsCount,
            chars: rowsChars,
          },
          cols: {
            count: rowsCount,
            chars: rowsChars,
          },
        }
      }
    }
    else {
      answerOptions = {
        rows: { count: 5, chars: ANSWER_OPTIONS_COUNTER_VALUES['upper-pqrs'].slice(0, 5) },
        cols: { count: 5, chars: ANSWER_OPTIONS_COUNTER_VALUES['upper-pqrs'].slice(0, 5) },
      }
    }

    return {
      name,
      slNum,
      questionType,
      questionTypeInWords,
      answerOptions,
      totalQuestions,
      maxMarks,
      questionMarks,
      optionalQuestions,
    }
  }

  const getSubjectData = (
    name: string,
    slNum: number,
    subjectData: CropperOutputData[string],
  ): CbtInstructionsTemplateSubjectData => {
    const sections = Object.entries(subjectData)
      .map(([sectionName, sectionData], idx) => getSectionData(sectionName, idx + 1, name, sectionData))

    const firstSection = sections[0]!
    const totalSections = sections.length
    let totalQuestions = 0
    let maxMarks = 0

    let questionType: CbtInstructionsTemplateSubjectData['questionType'] = firstSection.questionType
    let questionMarks: CbtInstructionsTemplateSubjectData['questionMarks'] = firstSection.questionMarks

    for (const section of sections) {
      totalQuestions += section.totalQuestions
      maxMarks += section.maxMarks

      if (questionType && section.questionType !== questionType) {
        questionType = undefined
      }

      if (
        questionMarks
        && (questionMarks.correct !== section.questionMarks.correct
          || questionMarks.incorrect !== section.questionMarks.incorrect
          || questionMarks.partial !== section.questionMarks.partial
          || questionMarks.max !== section.questionMarks.max
        )
      ) {
        questionMarks = undefined
      }
    }

    return {
      name,
      slNum,
      questionType,
      questionTypeInWords: questionType ? firstSection.questionTypeInWords : undefined,
      totalQuestions,
      maxMarks,
      questionMarks,
      totalSections,
      sections,
    }
  }

  const subjects = Object.entries(pdfCropperData)
    .map(([subjectName, subjectData], idx) => getSubjectData(subjectName, idx + 1, subjectData))

  const firstSubject = subjects[0]!
  let totalQuestions = 0
  let maxMarks = 0
  let totalSections = 0

  let questionType: CbtInstructionsTemplateSubjectData['questionType'] = firstSubject.questionType
  let questionMarks: CbtInstructionsTemplateSubjectData['questionMarks'] = firstSubject.questionMarks

  for (const subject of subjects) {
    totalQuestions += subject.totalQuestions
    maxMarks += subject.maxMarks
    totalSections += subject.totalSections

    if (questionType && subject.questionType !== questionType) {
      questionType = undefined
    }

    if (
      !subject.questionMarks
      || (questionMarks
        && (questionMarks.correct !== subject.questionMarks.correct
          || questionMarks.incorrect !== subject.questionMarks.incorrect
          || questionMarks.partial !== subject.questionMarks.partial
          || questionMarks.max !== subject.questionMarks.max
        )
      )
    ) {
      questionMarks = undefined
    }
  }

  return utilCloneJson({
    testName,
    testDuration,
    testDurationInHours: testDuration / 60,
    icons,
    totalSubjects: subjects.length,
    totalSections,
    totalQuestions,
    questionMarks,
    questionType,
    questionTypeInWords: questionType ? firstSubject.questionTypeInWords : undefined,
    maxMarks,
    subjects,
  }) satisfies CbtInstructionsTemplateData
}
