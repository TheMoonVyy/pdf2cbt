export default (timeStr: string): number => {
  const timeParts = timeStr.split(':').reverse()
  let totalSeconds = 0

  for (let i = 0; i < timeParts.length; i++) {
    totalSeconds += parseInt(timeParts[i]) * Math.pow(60, i)
  }

  return totalSeconds
}
