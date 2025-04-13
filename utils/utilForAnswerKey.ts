import type { QuestionAnswer } from '~/src/types'

export const utilConvertNumberToChar = (num: number) => String.fromCharCode(64 + num)

// stringify Answer without mutating answer (i.e. when it is an array for msq)
export const utilStringifyAnswer = (
  answer: QuestionAnswer,
  joinSeparator: string = ', ',
  sortArray: boolean = false,
) => {
  if (answer === null) return 'null'

  if (Array.isArray(answer)) {
    const answerArray = sortArray ? answer.toSorted() : answer
    return answerArray.map(utilConvertNumberToChar).join(joinSeparator)
  }
  else if (typeof answer === 'number') {
    return utilConvertNumberToChar(answer)
  }

  return `${answer}`
}
