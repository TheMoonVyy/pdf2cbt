export default (
  testConfig: AnswerKeyJsonOutputBasedOnPdfCropper['testConfig'],
) => {
  const data: CbtMakerInternalInstructionsData = {
    testInstructions: {
      type: 'default',
      pages: [],
      declaration: '',
    },
    additionalData: {},
  }

  if (testConfig.testInstructions?.type) {
    const type = testConfig.testInstructions?.type
    if (type === 'custom') {
      data.testInstructions = {
        type: 'custom',
        pages: testConfig.testInstructions.pages
          .map((page) => {
            const { title, data } = page
            return { title, data, parsedData: '' }
          }),
        declaration: testConfig.testInstructions.declaration || '',
      }
    }
    else {
      data.testInstructions.type = type
    }
  }

  for (const [subject, subjectData] of Object.entries(testConfig.additionalData || {})) {
    for (const [section, sectionData] of Object.entries(subjectData.sections)) {
      const optionalQuestions = sectionData?.optionalQuestions ?? 0
      const type = sectionData?.instructions?.type || 'none'
      const contentData = type === 'none'
        ? ''
        : ((sectionData?.instructions as { data?: string })?.data || '')

      data.additionalData[subject] ??= { sections: {} }
      data.additionalData[subject]!.sections[section] = {
        optionalQuestions,
        instructions: {
          type,
          data: contentData,
          parsedData: '',
        },
      }
    }
  }

  return data
}
