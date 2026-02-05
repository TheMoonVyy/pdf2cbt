import generalMdUrl
  from '#layers/shared/md/test-instructions/general-instructions/default.md?url'

import declarationMdUrl
  from '#layers/shared/md/test-instructions/declarations/default.md?url'

import comedkOtherMdUrl
  from '#layers/shared/md/test-instructions/other-instructions/comedk.md?url'

const cache: {
  general: Record<string, string>
  other: Record<string, string>
  declaration: Record<string, string>
  sections: Record<string, string>
} = {
  general: {},
  other: {},
  declaration: {},
  sections: {},
}

export async function useLoadMdContentOfTestInstructions(
  type: CbtMakerInternalInstructionsData['testInstructions']['type'],
) {
  if (type === 'default') {
    cache
      .general[generalMdUrl] ??= await (await fetch(generalMdUrl)).text()

    cache
      .declaration[declarationMdUrl] ??= await (await fetch(declarationMdUrl)).text()
  }
  else if (type === 'comedk') {
    cache
      .general[generalMdUrl] ??= await (await fetch(generalMdUrl)).text()

    cache
      .other[comedkOtherMdUrl] ??= await (await fetch(comedkOtherMdUrl)).text()

    cache
      .declaration[declarationMdUrl] ??= await (await fetch(declarationMdUrl)).text()
  }
}

export function useCbtParsedTestInstructions(
  testInstructions: MaybeRefOrGetter<CbtMakerInternalInstructionsData['testInstructions']>,
  instructionsTemplateData: MaybeRefOrGetter<CbtInstructionsTemplateData>,
) {
  const instructions = toRef(testInstructions)
  const templateData = toRef(instructionsTemplateData)
  const md = utilMd()
  let cachedType = ''

  return computedAsync(
    async () => {
      const type = instructions.value.type
      if (!type) return null

      if (cachedType !== type) {
        await useLoadMdContentOfTestInstructions(type)
        cachedType = type
      }

      if (!templateData.value) return null

      const imgLinksFootNotes = (instructions.value.imgLinksFootNotes || '')

      const newParsedData: CbtParsedTestInstructions = { pages: [], declaration: '' }
      try {
        if (type === 'custom') {
          newParsedData.declaration = md.render(instructions.value.declaration || '')

          for (const page of instructions.value.pages) {
            const data = await utilGetCbtInstructionsContent(
              page.data + '\n\n' + imgLinksFootNotes,
              templateData.value,
            )

            newParsedData.pages.push({
              title: page.title,
              data,
            })
          }
        }
        else if (type === 'default') {
          newParsedData.pages = [
            {
              title: 'Instructions',
              data: await utilGetCbtInstructionsContent(
                cache.general[generalMdUrl] + '\n\n' + imgLinksFootNotes,
                templateData.value,
              ),
            },
          ]
          newParsedData.declaration = md
            .render(cache.declaration[declarationMdUrl]!)
        }
        else if (type === 'comedk') {
          newParsedData.pages = [
            {
              title: 'Instructions',
              data: await utilGetCbtInstructionsContent(
                cache.general[generalMdUrl] + '\n\n' + imgLinksFootNotes,
                templateData.value,
              ),
            },
            {
              title: 'Other Important Instructions',
              data: await utilGetCbtInstructionsContent(
                cache.other[comedkOtherMdUrl] + '\n\n' + imgLinksFootNotes,
                templateData.value,
              ),
            },
          ]
          newParsedData.declaration = md
            .render(cache.declaration[declarationMdUrl]!)
        }
      }
      catch (err) {
        useErrorToast('Error parsing Test Instructions', err)
      }

      return newParsedData
    },
    null,
  )
}
