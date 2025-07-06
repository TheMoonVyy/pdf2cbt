interface TimerState {
  pausedAt: number | null
  pausedMs: number
  endTime: number | null
  timerID: ReturnType<typeof setInterval> | null
  intervalMs: number
}

export default () => {
  const { currentTestState } = useCbtTestData()

  const timerState: TimerState = {
    pausedAt: null,
    pausedMs: 0,
    endTime: null,
    timerID: null,
    intervalMs: 250,
  }

  const updateCountdownSeconds = () => {
    const remainingMs = Math.max(0, (timerState.endTime! + timerState.pausedMs) - Date.now())
    const remainingSeconds = Math.floor(remainingMs / 1000)
    currentTestState.value.remainingSeconds = remainingSeconds
    if (remainingSeconds === 0) {
      stopCountdown()
    }
  }

  const stopCountdown = (isCalledForClearUp: boolean = false) => {
    if (timerState.timerID) {
      clearInterval(timerState.timerID)
      timerState.timerID = null
    }
    if (!isCalledForClearUp) currentTestState.value.testStatus = 'finished'
  }

  const startCountdown = (durationInSeconds: number, intervalMs: number = 250) => {
    if (!timerState.timerID) {
      timerState.endTime = Date.now() + (durationInSeconds * 1000)
      currentTestState.value.testStatus = 'ongoing'
      timerState.intervalMs = intervalMs
      updateCountdownSeconds()
      timerState.timerID = setInterval(updateCountdownSeconds, timerState.intervalMs)
    }
  }

  const pauseCountdown = () => {
    if (timerState.timerID) {
      clearInterval(timerState.timerID)
      timerState.timerID = null
      timerState.pausedAt = Date.now()
    }
  }

  const resumeCountdown = () => {
    if (timerState.pausedAt) {
      timerState.pausedMs += Date.now() - timerState.pausedAt
      timerState.pausedAt = null
      updateCountdownSeconds()
      timerState.timerID = setInterval(updateCountdownSeconds, timerState.intervalMs)
    }
  }

  return {
    startCountdown,
    pauseCountdown,
    resumeCountdown,
    stopCountdown,
  }
}
