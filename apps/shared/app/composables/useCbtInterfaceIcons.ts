import answeredIcon from '#layers/shared/app/assets/icons/ques-answered.svg?no-inline'
import notAnsweredIcon from '#layers/shared/app/assets/icons/ques-notAnswered.svg?no-inline'
import notVisitedIcon from '#layers/shared/app/assets/icons/ques-notVisited.svg?no-inline'
import markedIcon from '#layers/shared/app/assets/icons/ques-marked.svg?no-inline'
import markedAnsweredIcon from '#layers/shared/app/assets/icons/ques-markedAnswered.svg?no-inline'
import arrowUpIcon from '#layers/shared/app/assets/icons/arrow-up.svg?no-inline'
import arrowDownIcon from '#layers/shared/app/assets/icons/arrow-down.svg?no-inline'

type IconsUrls = { [K in (keyof QuesIcons)]: string } & {
  scrollUp: string
  scrollDown: string
}

let cache: ComputedRef<IconsUrls> | null = null
let uiSettings: ReturnType<typeof useCbtSettings>['uiSettings'] | null = null

export default () => {
  uiSettings ??= useCbtSettings().uiSettings

  return cache ??= computed(() => {
    const quesIcons = uiSettings?.value?.questionPalette.quesIcons

    return {
      answered: quesIcons?.answered.image || answeredIcon,
      notAnswered: quesIcons?.notAnswered.image || notAnsweredIcon,
      notVisited: quesIcons?.notVisited.image || notVisitedIcon,
      marked: quesIcons?.marked.image || markedIcon,
      markedAnswered: quesIcons?.markedAnswered.image || markedAnsweredIcon,
      scrollUp: arrowUpIcon,
      scrollDown: arrowDownIcon,
    }
  })
}
