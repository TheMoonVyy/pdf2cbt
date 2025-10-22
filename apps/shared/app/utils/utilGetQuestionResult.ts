type ValidQuestionResult = Omit<QuestionResult, 'status'> & { status: ValidQuestionResultStatus }

// function to evaluate a question and return QuestionResult
export default (
  questionData: TestInterfaceQuestionData,
  questionCorrectAnswer: QuestionAnswer,
): ValidQuestionResult => {
  const { type, status, answer } = questionData
  const marks = {
    max: Math.abs(questionData.marks.max || 0),
    cm: Math.abs(questionData.marks.cm),
    pm: Math.abs(questionData.marks.pm ?? 0),
    im: Math.abs(questionData.marks.im) * -1,
  }

  const result: ValidQuestionResult = {
    marks: 0,
    status: 'notAnswered',
    correctAnswer: questionCorrectAnswer,
    accuracyNumerator: 0,
  }

  if (questionCorrectAnswer === 'DROPPED') {
    result.marks = marks.max || marks.cm
    result.status = 'dropped'
    return result
  }

  if (status === 'answered' || status === 'markedAnswered') {
    if (questionCorrectAnswer === 'BONUS') {
      result.marks = marks.max || marks.cm
      result.status = 'bonus'
      return result
    }

    if (type === 'mcq') {
      if (answer === questionCorrectAnswer
        || (Array.isArray(questionCorrectAnswer) && questionCorrectAnswer.includes(answer as number))
      ) {
        result.marks = marks.cm
        result.status = 'correct'
        result.accuracyNumerator = 1
      }
      else {
        result.marks = marks.im
        result.status = 'incorrect'
      }
    }
    else if (type === 'nat') {
      const answerFloat = parseFloat(answer + '')
      const correctAnswerStr = questionCorrectAnswer + ''
      const maybeRangesAnswerStrs = correctAnswerStr.split(',').map(n => n.trim())
      for (const maybeRangeAnswerStr of maybeRangesAnswerStrs) {
        if (maybeRangeAnswerStr.includes('TO')) { // range of correct answers
          const [lowerLimit, upperLimit] = maybeRangeAnswerStr.split('TO').map(n => parseFloat(n.trim()))

          if (answerFloat <= upperLimit! && answerFloat >= lowerLimit!) {
            result.marks = marks.cm
            result.status = 'correct'
            result.accuracyNumerator = 1
            return result
          }
        }
        else if (parseFloat(maybeRangeAnswerStr) === answerFloat) { // just one correct answer
          result.marks = marks.cm
          result.status = 'correct'
          result.accuracyNumerator = 1
          return result
        }
      }
      // If none of the above matched, answer is incorrect
      result.marks = marks.im
      result.status = 'incorrect'
      return result
    }
    else if (type === 'msm') {
      // user answer's checkboxes in row has to match that of correct answer's row's
      // (marks is given on per row basis)
      const userAnswerEntries = Object.entries(answer as QuestionMsmAnswerType)
        .filter(([_, cols]) => cols.length > 0)
      const correctAnswerEntries = Object.entries(questionCorrectAnswer as QuestionMsmAnswerType)
        .filter(([_, cols]) => cols.length > 0)

      const correctAnswer = Object.fromEntries(correctAnswerEntries)

      const partialAccuracyDenominator = correctAnswerEntries.length || 1
      let partialAccuracyNumerator = 0

      const questionResultRowsStatus = new Set<'correct' | 'incorrect'>()
      for (const [rowKey, userAnswerRowValues] of userAnswerEntries) {
        const correctAnswerRowValues = correctAnswer[rowKey]

        if (correctAnswerRowValues
          && (new Set(correctAnswerRowValues).size === new Set(userAnswerRowValues).size)
          && correctAnswerRowValues.every(n => userAnswerRowValues.includes(n))
        ) {
          result.marks += marks.cm
          questionResultRowsStatus.add('correct')
          partialAccuracyNumerator++
        }
        else {
          result.marks += marks.im
          questionResultRowsStatus.add('incorrect')
        }
      }

      if (questionResultRowsStatus.size === 1) {
        result.status = questionResultRowsStatus.values().toArray()[0]!
      }
      else {
        result.status = 'partial'
      }

      if (result.status === 'correct') {
        result.accuracyNumerator = 1
      }
      else if (result.status === 'partial') {
        const relAccNum = (partialAccuracyNumerator / partialAccuracyDenominator) * 100
        result.accuracyNumerator = Math.round(relAccNum) / 100
      }
    }
    else { // type is msq
      const userAnswers = new Set(answer as number[])
      const correctAnswers = new Set(questionCorrectAnswer as number[])

      // here subset also includes same/equal to correctAnswers as well (not proper subset)
      const isUserAnswersSubsetOfCorrectAnswers = [...userAnswers].every(a => correctAnswers.has(a))

      if (isUserAnswersSubsetOfCorrectAnswers) {
        if (userAnswers.size === correctAnswers.size) {
          result.marks = marks.cm
          result.status = 'correct'
          result.accuracyNumerator = 1
        }
        else {
          result.marks = marks.pm * userAnswers.size
          result.status = 'partial'
          result.accuracyNumerator = Math.round((userAnswers.size / correctAnswers.size) * 100) / 100
        }
      }
      else {
        result.marks = marks.im
        result.status = 'incorrect'
      }
    }
  }

  return result
}
