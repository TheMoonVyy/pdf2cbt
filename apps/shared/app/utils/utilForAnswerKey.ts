export const utilConvertNumberToChar = (
  num: number,
  startingChar: string = 'A',
) => String.fromCharCode(startingChar.charCodeAt(0) + num - 1)

type Separators = {
  mcq?: string
  msq?: string
  nat?: string
  msm?: {
    cols?: string
    rows?: string
    rowColIndicator?: string
  }
}

// stringify Answer without mutating answer (i.e. when it is an array or object)
export const utilStringifyAnswer = (
  answer: QuestionAnswer,
  questionType: QuestionType,
  sortArray: boolean = false,
  separators: Separators = {},
) => {
  if (answer === null) return 'null'

  if (Array.isArray(answer)) {
    const answerArray = sortArray ? answer.toSorted((a, b) => a - b) : answer
    if (questionType === 'mcq') {
      return answerArray.map(n => utilConvertNumberToChar(n)).join(separators.mcq ?? ' or ')
    }
    return answerArray.map(n => utilConvertNumberToChar(n)).join(separators.msq ?? ', ')
  }
  else if (typeof answer === 'number') {
    return utilConvertNumberToChar(answer)
  }
  else if (typeof answer === 'string') {
    if (answer.toUpperCase().includes('DROPPED'))
      return 'DROPPED'

    if (answer.toUpperCase().includes('BONUS'))
      return 'BONUS'

    const maybeRanges = answer
      .toUpperCase()
      .replace('OR', ',')
      .split(',')

    const results: string[] = []

    for (const maybeRange of maybeRanges) {
      if (maybeRange.includes('TO')) {
        results.push(maybeRange.replace('TO', ' to '))
      }
      else if (maybeRange.trim()) {
        results.push(maybeRange.trim())
      }
    }
    return results.join(separators.nat ?? ' or ')
  }
  else if (questionType === 'msm') {
    const formatedRowsStrs: string[] = []

    for (const [rowNumStr, cols] of Object.entries(answer)) {
      const colsArray = sortArray ? cols.toSorted((a, b) => a - b) : cols

      const colsChars = colsArray.map(n => utilConvertNumberToChar(n, 'P'))
      if (colsChars.length > 0) {
        const rowChar = utilConvertNumberToChar(parseInt(rowNumStr))
        const colsString = colsChars.join(separators.msm?.cols ?? ', ')
        const formattedRowStr = `${rowChar}${separators.msm?.rowColIndicator ?? ': '}${colsString}`
        formatedRowsStrs.push(formattedRowStr)
      }
    }

    if (formatedRowsStrs.length === 0)
      return 'null'

    return formatedRowsStrs.join(separators.msm?.rows ?? '\n')
  }
  return 'null'
}
