export default (inputValue: number, minLimit: number, maxLimit: number, descaleFactor: number = 1): number => {
  const unscaledInputValue = descaleFactor === 1
    ? inputValue
    : Math.round(inputValue / descaleFactor)
  return Math.max(minLimit, Math.min(unscaledInputValue, maxLimit))
}
