export const utilConvertNumberToChar = (num: number) => String.fromCharCode(64 + num)

// stringify Answer without mutating answer (i.e. when it is an array for msq)
export const utilStringifyAnswer = (
  answer: QuestionAnswer,
  arrayJoinSeparator: string = ', ',
  sortArray: boolean = false,
) => {
  if (answer === null) return 'null'

  if (Array.isArray(answer)) {
    const answerArray = sortArray ? answer.toSorted() : answer
    return answerArray.map(utilConvertNumberToChar).join(arrayJoinSeparator)
  }
  else if (typeof answer === 'number') {
    return utilConvertNumberToChar(answer)
  }
  else {
    if (answer.includes('TO')) {
      return answer.replace('TO', ' to ')
    }
    else if (answer.includes(',')) {
      return answer.split(',').join(' or ')
    }
  }

  return `${answer}`
}
