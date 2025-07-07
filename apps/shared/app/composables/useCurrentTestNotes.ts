import { CbtUseState } from '#layers/shared/shared/enums'

export default () => {
  return useState<TestNotes>(CbtUseState.ResultsCurrentTestNotes, () => ({}))
}
