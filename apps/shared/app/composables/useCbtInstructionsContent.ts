import type { Liquid } from 'liquidjs'

const md = utilMd()
let liquidEngine: InstanceType<typeof Liquid> | null = null

const triggerLoadingOfLiquidEngine = () => {
  if (!liquidEngine) {
    const { $getCbtLiquidEngine } = useNuxtApp()
    const engine = $getCbtLiquidEngine()
    if (engine)
      liquidEngine = engine
  }
}

export const useGetCbtTestInstructionsContent = (
  type: CbtMakerInternalInstructionsData['testInstructions']['type'],
  templateData: CbtInstructionsTemplateData,
  imgLinksFootNotes: string,
): CbtParsedTestInstructions => {
  triggerLoadingOfLiquidEngine()

  const parsedData = {
    pages: [{ title: 'Instructions', data: '' }],
    declaration: '',
  }
  if (!liquidEngine) return parsedData

  try {
    const basePath = 'test-instructions'
    if (type === 'default') {
      const page1 = md.render(
        liquidEngine.renderFileSync(
          `${basePath}/general-instructions/default.md`,
          templateData,
        ) + '\n\n' + imgLinksFootNotes,
      )

      const declaration = md.render(
        liquidEngine.renderFileSync(
          `${basePath}/declarations/default.md`,
          templateData,
        ) + '\n\n' + imgLinksFootNotes,
      )

      parsedData.declaration = declaration
      parsedData.pages = [
        {
          title: 'Instructions',
          data: page1,
        },
      ]
    }
    else if (type === 'comedk') {
      const page1 = md.render(
        liquidEngine.renderFileSync(
          `${basePath}/general-instructions/comedk.md`,
          templateData,
        ) + '\n\n' + imgLinksFootNotes,
      )

      const page2 = md.render(
        liquidEngine.renderFileSync(
          `${basePath}/other-instructions/comedk.md`,
          templateData,
        ) + '\n\n' + imgLinksFootNotes,
      )

      const declaration = md.render(
        liquidEngine.renderFileSync(
          `${basePath}/declarations/default.md`,
          templateData,
        ),
      )

      parsedData.declaration = declaration
      parsedData.pages = [
        {
          title: 'Instructions',
          data: page1,
        },
        {
          title: 'Other Important Instructions',
          data: page2,
        },
      ]
    }
  }
  catch (err) {
    useErrorToast('Error rendering Test Instructions', err)
  }

  return parsedData
}

export const useGetCbtSectionsInstructionsContent = (
  instructionData: CbtMakerInternalSectionInstructionsData['instructions'],
  templateData: CbtInstructionsTemplateSectionData,
) => {
  triggerLoadingOfLiquidEngine()
  if (!liquidEngine) return ''

  try {
    const qType = templateData.questionType
    const instType = instructionData.type

    const filePath = `section-instructions/${qType}/${instType}.md`
    return md.render(liquidEngine.renderFileSync(filePath, templateData))
  }
  catch (err) {
    useErrorToast('Error while rendering Section Instructions', err)
  }

  return ''
}
