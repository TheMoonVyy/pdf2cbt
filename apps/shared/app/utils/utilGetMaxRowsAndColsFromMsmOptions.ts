export default (answerOptions: string) => {
  const optionsParts = answerOptions.toLowerCase()
    .split('x')
    .map(Number)
    .filter(n => !Number.isNaN(n))

  const data = {
    rows: 4,
    cols: 4,
  }
  if (optionsParts.length === 0) {
    console.warn('Answer Options is not in current format for MSM question type, defaulting to 4x4')
  }
  else if (optionsParts.length === 1) {
    data.rows = optionsParts[0]!
    data.cols = optionsParts[0]!
  }
  else {
    data.rows = optionsParts[0]!
    data.cols = optionsParts[1]!
  }
  return data
}
