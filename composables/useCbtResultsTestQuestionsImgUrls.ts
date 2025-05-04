import { CbtUseState } from '~/src/types/enums'

type ResultsTestQuestionsImgUrls = {
  [testId: number | string]: {
    [queId: number | string]: string[]
  }
}

export default () => {
  return useState<ResultsTestQuestionsImgUrls>(CbtUseState.ResultsTestQuestionsImgUrls, () => ({}))
}
