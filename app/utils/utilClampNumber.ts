export default (inputValue: number, minLimit: number, maxLimit: number, scaleFactor: number = 1): number => {
  return Math.max(minLimit, Math.min(Math.round(inputValue / scaleFactor), maxLimit))
}
