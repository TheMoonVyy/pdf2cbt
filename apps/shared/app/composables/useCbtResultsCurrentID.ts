import { CbtUseState } from '#layers/shared/shared/enums'

export default () => {
  return useState<number>(CbtUseState.CurrentResultsID, () => 0)
}
