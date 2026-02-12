export default (
  testConfig: AnswerKeyJsonOutputBasedOnPdfCropper['testConfig'],
): CbtMakerInternalInstructionsData => {
  const data: CbtMakerInternalInstructionsData = {
    testInstructions: {
      type: 'default',
      pages: [],
      declaration: '',
    },
    additionalData: {},
  }

  if (testConfig.testInstructions?.type) {
    data.testInstructions.type = testConfig.testInstructions.type
  }

  for (const [subject, subjectData] of Object.entries(testConfig.additionalData || {})) {
    for (const [section, sectionData] of Object.entries(subjectData.sections)) {
      const optionalQuestions = sectionData?.optionalQuestions ?? 0
      const type = sectionData?.instructions?.type || 'none'

      data.additionalData[subject] ??= { sections: {} }
      data.additionalData[subject]!.sections[section] = {
        optionalQuestions,
        instructions: {
          type,
        },
      }
    }
  }

  return data
}
