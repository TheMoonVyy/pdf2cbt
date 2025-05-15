import type { QuestionsImageUrls, TestImageBlobs, TestQuestionData } from '~/src/types'

export default (
  testImageBlobs: TestImageBlobs,
  questionsRelationData: Map<number | string, TestQuestionData>
    | [string | number, { que: number | string, section: string }][],
): QuestionsImageUrls => {
  const questionsImageUrls: QuestionsImageUrls = {}

  for (const [queId, data] of questionsRelationData) {
    const { que, section } = data
    questionsImageUrls[queId] = []
    testImageBlobs[section][que].forEach((blob) => {
      questionsImageUrls[queId].push(URL.createObjectURL(blob))
    })
  }

  return questionsImageUrls
}
