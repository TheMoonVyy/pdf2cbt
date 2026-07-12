export type GenerateAnswerKeyInternalNatAnswer = Map<number, {
  min: string
  max: string
  value: string
  isRange: boolean
}> // map to treat each item with OR logic

export type GenerateAnswerKeyInternalQuestionData = {
  qNum: number
  type: QuestionType
  answerOptionsCount: {
    rows: number
    cols: number
  }
  answerOptions?: string
  answer: QuestionMsmAnswerType
    | GenerateAnswerKeyInternalNatAnswer
    | Set<number> // for mcq and msq
  isBonus: boolean
  isDropped: boolean
  answerOptionsCounterType: TestResultQuestionData['answerOptionsCounterType']
}

export type GenerateAnswerKeyInternalSubjectsData = GenericSubjectsTree<GenerateAnswerKeyInternalQuestionData>
