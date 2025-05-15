import type { QuestionsImageUrls } from '~/src/types'
import { CbtUseState } from '~/src/types/enums'

type ResultsTestQuestionsImgUrls = {
  [testId: number | string]: QuestionsImageUrls
}

export default () => {
  return useState<ResultsTestQuestionsImgUrls>(CbtUseState.ResultsTestQuestionsImgUrls, () => ({}))
}
