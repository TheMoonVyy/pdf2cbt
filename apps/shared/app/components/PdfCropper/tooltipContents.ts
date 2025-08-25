import { h } from 'vue'

export const pagesTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'For numbering, you can use ',
    h('strong', '1, 2, 3...'),
    ' for pages from the beginning and ',
    h('strong', 'L (= L1), L2, L3...'),
    ' for pages from the end.',
  ]),
  h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
    h('li', [
      h('strong', 'L, L2, L3...'),
      ' (pages counted from the end):',
      h('ul', { class: 'list-disc ml-6 mt-1 space-y-1 [&>li]:mb-0.5' }, [
        h('li', [h('strong', 'L or L1'), ': last page']),
        h('li', [h('strong', 'L2'), ': second last page']),
        h('li', [h('strong', 'L3'), ': third last page']),
        h('li', 'and so on...'),
      ]),
    ]),
  ]),
  h('p', 'To specify pages, use these formats:'),
  h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
    h('li', [
      h('strong', 'Range'),
      ': p-q format, both p and q are included.',
      h('br'),
      'e.g. "1-10" or "2-L"',
    ]),
    h('li', [
      h('strong', 'Specific pages'),
      ': comma-separated values.',
      h('br'),
      'e.g. "2, 4, 7, L3, L"',
    ]),
    h('li', [
      h('strong', 'Mixed'),
      ': combine ranges and specific pages.',
      h('br'),
      'e.g. "1-5, 7, 9-12, L4-L, 13-L"',
    ]),
  ]),
  h('p', 'Case is insensitive so upper and lower case mean the same.'),
])

export const subjectEndTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', [
    'This is optional as typically next subject\'s start '
    + 'indicates the end of the current subject.',
    h('br'),
    'This is useful when PDF contains solutions/answers '
    + 'after subject.',
    h('br'),
    'Heading of solutions/answers '
    + 'can be used for end pattern to prevent the tool '
    + 'from cropping the solutions as questions.',
  ]),
])

export const partialMarkingTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p',
    h('strong', 'If you want JEE Advanced format then use +1 as partial marking.'),
  ),
  h('p', 'While JEE Advanced format looks complex, the logic for partial marking in a nutshell is:'),
  h('p', 'marks awarded = no. of partically correct answer * 1.'),
  h('p', { class: 'mt-3' }, [
    'Look at their format properly, you will notice you get +1 for each option you answer correctly',
    ' (when the case is of "partially correct").',
  ]),
])

export const answerOptionsCounterTypeTooltipContent = () => h('div', { class: 'space-y-2' }, [
  h('p', 'Counter type to use while showing options in test interface and question preview (of results page).'),
  h('p', 'If "Default" is selected then uses the counter type as it is in test interface\'s UI Settings & Customization.'),
])
