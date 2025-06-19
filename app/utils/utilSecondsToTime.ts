export default (
  totalSeconds: number,
  format: 'mmm:ss' | 'hh:mm:ss' = 'hh:mm:ss',
  round: boolean = false,
): string => {
  if (round) totalSeconds = Math.round(totalSeconds)

  if (format === 'mmm:ss') {
    if (totalSeconds <= 0) return '0:00'

    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  else {
    if (totalSeconds <= 0) return '00:00:00'

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor(totalSeconds / 60) % 60
    const seconds = totalSeconds % 60

    return `${
      hours.toString().padStart(2, '0')
    }:${
      minutes.toString().padStart(2, '0')
    }:${
      seconds.toString().padStart(2, '0')
    }`
  }
}
