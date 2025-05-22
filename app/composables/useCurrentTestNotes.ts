import { CbtUseState } from '#shared/enums'

export default () => {
  return useState<TestNotes>(CbtUseState.ResultsCurrentTestNotes, () => ({}))
}
