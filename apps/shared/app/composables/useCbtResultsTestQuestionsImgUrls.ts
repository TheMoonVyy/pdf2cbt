import { CbtUseState } from '#layers/shared/shared/enums'

type ResultsTestQuestionsImgUrls = {
  [testId: number | string]: QuestionsImageUrls
}

export default () => {
  return useState<ResultsTestQuestionsImgUrls>(CbtUseState.ResultsTestQuestionsImgUrls, () => ({}))
}
