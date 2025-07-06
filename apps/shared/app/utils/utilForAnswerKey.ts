export const utilConvertNumberToChar = (num: number) => String.fromCharCode(64 + num)

// stringify Answer without mutating answer (i.e. when it is an array )
export const utilStringifyAnswer = (
  answer: QuestionAnswer,
  questionType: QuestionType,
  sortArray: boolean = false,
  arrayJoinSeparator: string = ', ',
) => {
  if (answer === null) return 'null'

  if (Array.isArray(answer)) {
    const answerArray = sortArray ? answer.toSorted() : answer
    if (questionType === 'mcq') {
      return answerArray.map(utilConvertNumberToChar).join(' or ')
    }
    return answerArray.map(utilConvertNumberToChar).join(arrayJoinSeparator)
  }
  else if (typeof answer === 'number') {
    return utilConvertNumberToChar(answer)
  }
  else {
    const maybeRanges = answer.split(',')
    const results: string[] = []

    for (const maybeRange of maybeRanges) {
      if (maybeRange.includes('TO')) {
        results.push(maybeRange.replace('TO', ' to '))
      }
      else if (maybeRange.trim()) {
        results.push(maybeRange.trim())
      }
    }
    return results.join(' or ')
  }
}
