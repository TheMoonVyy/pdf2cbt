import { QUESTION_STATUS_FULL_LABELS } from '#layers/shared/shared/constants'

export default (iconsUrls: ReturnType<typeof useCbtInterfaceIcons>['value']) => {
  let content = ''
  for (const [iconName, iconUrl] of Object.entries(iconsUrls)) {
    let iconTitle = ''
    if (iconName in QUESTION_STATUS_FULL_LABELS) {
      iconTitle = QUESTION_STATUS_FULL_LABELS[iconName as keyof typeof QUESTION_STATUS_FULL_LABELS]
    }
    else {
      iconTitle = utilKeyToLabel(iconName)
    }
    content += `[${iconName}]: ${iconUrl}`
    if (iconTitle)
      content += ` "${iconTitle}"`
    content += '\n'
  }

  return content
}
