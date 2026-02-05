import {
  QUESTION_TYPES_IN_WORDS,
} from '#layers/shared/shared/constants'

export default (
  pdfCropperData: CropperOutputData,
  instructionsData: CbtMakerInternalInstructionsData,
  testName: string,
  testDuration: number,
) => {
  const getSectionData = (
    name: string,
    slNum: number,
    subjectName: string,
    sectionData: CropperOutputData[string][string],
  ): CbtInstructionsTemplateSectionData => {
    const questions = Object.values(sectionData)
    const totalQuestions = questions.length

    const question = questions[0]!
    const questionType = question!.type.toUpperCase() as keyof typeof QUESTION_TYPES_IN_WORDS
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

    return {
      name,
      slNum,
      questionType,
      questionTypeInWords,
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
    icons: useCbtInterfaceIcons().value,
    totalSubjects: subjects.length,
    questionType,
    questionTypeInWords: questionType ? firstSubject.questionTypeInWords : undefined,
    totalSections,
    totalQuestions,
    questionMarks,
    maxMarks,
    subjects,
  }) satisfies CbtInstructionsTemplateData
}
