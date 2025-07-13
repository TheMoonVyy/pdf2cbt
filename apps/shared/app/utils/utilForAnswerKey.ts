export const utilConvertNumberToChar = (
  num: number,
  startingChar: string = 'A',
) => String.fromCharCode(startingChar.charCodeAt(0) + num - 1)

// stringify Answer without mutating answer (i.e. when it is an array or object)
export const utilStringifyAnswer = (
  answer: QuestionAnswer,
  questionType: QuestionType,
  sortArray: boolean = false,
  optionsJoinSeparator: string = ', ',
  rowsJsonSeparator = '\n',
) => {
  if (answer === null) return 'null'

  if (Array.isArray(answer)) {
    const answerArray = sortArray ? answer.toSorted() : answer
    if (questionType === 'mcq') {
      return answerArray.map(n => utilConvertNumberToChar(n)).join(' or ')
    }
    return answerArray.map(n => utilConvertNumberToChar(n)).join(optionsJoinSeparator)
  }
  else if (typeof answer === 'number') {
    return utilConvertNumberToChar(answer)
  }
  else if (typeof answer === 'string') {
    if (answer.toUpperCase().includes('DROPPED'))
      return 'DROPPED'

    if (answer.toUpperCase().includes('BONUS'))
      return 'Bonus'

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
  else if (questionType === 'msm') {
    const formatedRowsStrs: string[] = []

    for (const [rowNumStr, cols] of Object.entries(answer)) {
      const colsArray = sortArray ? cols.toSorted() : cols

      const colsChars = colsArray.map(n => utilConvertNumberToChar(n, 'P'))
      if (colsChars.length > 0) {
        const rowChar = utilConvertNumberToChar(parseInt(rowNumStr))
        const formattedRowStr = `${rowChar}: ${colsChars.join(optionsJoinSeparator)}`
        formatedRowsStrs.push(formattedRowStr)
      }
    }

    if (formatedRowsStrs.length === 0)
      return 'null'

    return formatedRowsStrs.join(rowsJsonSeparator)
  }
}
