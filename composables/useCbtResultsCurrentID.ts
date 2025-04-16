import { CbtUseState } from '~/src/types/enums'

export default () => {
  return useState<number>(CbtUseState.CurrentResultsID, () => 0)
}
