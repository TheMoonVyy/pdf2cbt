const specificPageRegex = /^(\d+|L\d*)$/
const pageRangeRegex = /^(\d+|L\d*) *- *(\d+|L\d*)$/

export default (pageInputFieldString: string, totalPages: number) => {
  pageInputFieldString = pageInputFieldString.trim().toUpperCase()

  const parsePageNumStr = (str: string) => {
    if (str.startsWith('L')) {
      const parsedNumStr = str.replace('L1', '').replace('L', '').trim()
      return parsedNumStr
        ? (totalPages + 1) - parseInt(parsedNumStr)
        : totalPages
    }

    return parseInt(str)
  }

  const parts = pageInputFieldString
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const pageNums = new Set<number>()
  for (const partStr of parts) {
    if (specificPageRegex.test(partStr)) {
      pageNums.add(parsePageNumStr(partStr))
    }
    else if (pageRangeRegex.test(partStr)) {
      const [leftStr, rightStr] = partStr.split('-').map(s => s.trim())

      const leftNum = parsePageNumStr(leftStr!)
      const rightNum = parsePageNumStr(rightStr!)

      const lowerLimit = Math.min(leftNum, rightNum)
      const upperLimit = Math.max(leftNum, rightNum)
      if (lowerLimit === upperLimit) {
        pageNums.add(lowerLimit)
      }
      else {
        utilRange(lowerLimit, upperLimit + 1).forEach(n => pageNums.add(n))
      }
    }
  }

  return pageNums
}
