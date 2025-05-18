import { CbtUseState } from '#shared/enums'

export default () => {
  return useState<number>(CbtUseState.CurrentResultsID, () => 0)
}
