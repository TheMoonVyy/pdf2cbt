interface TimerState {
  pausedAt: number | null
  pausedMs: number
  endTime: number | null
  timer: ReturnType<typeof setInterval> | null
  intervalMs: number
}

export default () => {
  const { currentTestState } = useCbtTestData()

  const timerState: TimerState = {
    pausedAt: null,
    pausedMs: 0,
    endTime: null,
    timer: null,
    intervalMs: 200,
  }

  const updateCountdownSeconds = () => {
    const remainingMs = Math.max(0, (timerState.endTime! + timerState.pausedMs) - Date.now())
    const remainingSeconds = Math.floor(remainingMs / 1000)
    currentTestState.value.remainingSeconds = remainingSeconds
    if (remainingSeconds === 0) {
      stopCountdown()
    }
  }

  const stopCountdown = () => {
    if (timerState.timer) {
      clearInterval(timerState.timer)
      timerState.timer = null
    }
    currentTestState.value.testStatus = 'finished'
  }

  const startCountdown = (durationInSeconds: number, intervalMs: number = 250) => {
    if (!timerState.timer) {
      timerState.endTime = Date.now() + (durationInSeconds * 1000)
      currentTestState.value.testStatus = 'ongoing'
      timerState.intervalMs = intervalMs
      updateCountdownSeconds()
      timerState.timer = setInterval(updateCountdownSeconds, timerState.intervalMs)
    }
  }

  return {
    startCountdown,
    stopCountdown,
  }
}
