/*
  function that mostly mimics Python's built-in range function
*/
export default function* (start: number, end?: number, step: number = 1) {
  if (end === undefined) {
    end = start
    start = 0
  }

  if (step === 0) {
    throw new Error('Step cannot be zero.')
  }

  if (step > 0) {
    for (let i = start; i < end; i += step) {
      yield i
    }
  }
  else {
    for (let i = start; i > end; i += step) {
      yield i
    }
  }
}
