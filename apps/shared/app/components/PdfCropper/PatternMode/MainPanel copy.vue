<script lang="ts" setup>
import { QUESTIONS_NUMBERING_ORDER_OPTIONS } from '#layers/shared/shared/constants'

const numFormat = shallowRef('original')

const questionsNumberingOrderOptions = QUESTIONS_NUMBERING_ORDER_OPTIONS
  .filter(item => item.value !== 'original')

type NameAndPatternData = {
  name: string
  pattern: string
  type: 'regex' | 'text'
  flags: {
    ignoreCase: boolean
    dotAll: boolean
  }
  pages: {
    include: string
    exclude: string
  }
  boundaries: {
    left: string
    right: string
    top: string
    bottom: string
  }
}

type TextModeQuestionsGroup = NameAndPatternData & {
  questions: []
  questionType: QuestionType
  marks: {
    correct: number
    partial: number
    incorrect: number
  }
}

type TextModeSubject = NameAndPatternData & { subjectWithSections: true, sections: TextModeQuestionsGroup[] }
  | TextModeQuestionsGroup & { subjectWithSections: false }

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class ErrorsMsgData {
  constructor(obj: object | null = null) {
    if (obj) Object.assign(this, obj)
  }

  static create<T extends object>(
    augment: Partial<T> | null = null,
  ): ErrorsMsgData & Partial<T> {
    return new this(augment)
  }
}

type SubjectConfig = {
  name: string
  pattern: {
    type: 'regex' | 'text'
    value: string
  }
  searchIn: {
    pages: string
    area: {
      l: string
      r: string
      t: string
      b: string
    }
  }
}

const defaultSubjectConfig: SubjectConfig = {
  name: '',
  pattern: {
    type: 'text',
    value: '',
  },
  searchIn: {
    pages: '1-L',
    area: {
      l: '0',
      r: '100%',
      t: '0',
      b: '100%',
    },
  },
}

const ADD_SUBJECT = '_-ADD_SUBJECT_-' as const
const ADD_SECTION = '_-ADD_SECTION_-' as const

const subjectsConfig = shallowReactive(
  new Map<string, SubjectConfig>([[ADD_SUBJECT, structuredClone(defaultSubjectConfig)]]),
)

const currentSelectedState = reactive({
  subject: ADD_SUBJECT as string,
  section: '',
})

const newSubjectConfig = shallowRef(structuredClone(defaultSubjectConfig))

const currentSubjectConfig = ref(structuredClone(defaultSubjectConfig))

watch(currentSelectedState, (newState, oldState) => {
  if (newState.subject !== oldState.subject) {
    if (newState.subject === ADD_SUBJECT) {
      currentSubjectConfig.value = newSubjectConfig.value
    }
    else if (subjectsConfig.has(newState.subject)) {
      currentSubjectConfig.value = subjectsConfig.get(newState.subject)!
    }
  }
})

const section = reactive<NameAndPatternData>({
  name: '',
  pattern: '',
  type: 'text',
  flags: {
    ignoreCase: false,
    dotAll: false,
  },
  pages: {
    include: '1-L',
    exclude: '',
  },
  boundaries: {
    left: '0',
    right: '100%',
    top: '0',
    bottom: '100%',
  },
})

const config = reactive({
  subjectsData: [],
})

const tooltipContent = {
  searchRegion: {
    pageNums: () =>
      h('div', { class: 'space-y-2' }, [
        h('p', [
          'For numbering, you can use ',
          h('strong', '1, 2, 3...'),
          ' for pages from the beginning, and ',
          h('strong', 'L (= L1), L2, L3...'),
          ' for pages from the end.',
        ]),
        h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
          h('li', [
            h('strong', 'L, L2, L3...'),
            ': Pages counted from the end of the PDF:',
            h('ul', { class: 'list-disc ml-6 mt-1 space-y-1 [&>li]:mb-0.5' }, [
              h('li', [h('strong', 'L or L1'), ': last page']),
              h('li', [h('strong', 'L2'), ': second last page']),
              h('li', [h('strong', 'L3'), ': third last page']),
              h('li', '(and so on)'),
            ]),
          ]),
        ]),
        h('p', 'To specify pages, use these formats:'),
        h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
          h('li', [
            h('strong', 'Range'),
            ': Use p-q format (e.g. 1-10 or 2-L). Both p and q are included.',
          ]),
          h('li', [
            h('strong', 'Specific pages'),
            ': Use comma-separated values (e.g. 2, 4, 7, L3, L).',
          ]),
          h('li', [
            h('strong', 'Mixed format'),
            ': Combine ranges and specific pages (e.g. 1-5, 7, 9-12, L4-L, 13-L).',
          ]),
        ]),
        h('p', 'Case is insensitive so upper and lower case mean the same.'),
      ]),
  },
}

function validateRegionCoordinatesInput(coords: NameAndPatternData['boundaries']) {
  const errorMsg = ErrorsMsgData.create<NameAndPatternData['boundaries']>()

  const coordRegex = /^\d+(\s*%)?$/
  const parsedNums = {} as Record<keyof NameAndPatternData['boundaries'], number>

  for (const key of Object.keys(coords) as Array<keyof NameAndPatternData['boundaries']>) {
    const val = coords[key].trim()
    if (!coordRegex.test(val)) {
      errorMsg[key] = 'Invalid format'
      continue
    }

    const num = parseInt(val)
    parsedNums[key] = num

    if (val.endsWith('%') && num > 100) {
      errorMsg[key] = 'Percentage value must be between 0 and 100.'
    }
  }

  if (Object.values(errorMsg).some(msg => msg !== '')) return errorMsg

  const { left, right, top, bottom } = coords
  const { left: lNum, right: rNum, top: tNum, bottom: bNum } = parsedNums

  if (left.endsWith('%') === right.endsWith('%')) {
    if (lNum === rNum) {
      errorMsg.left = errorMsg.right = 'Left and Right boundaries can\'t be equal, as then there won\'t be any area/region.'
    }
    else if (lNum > rNum) {
      errorMsg.left = 'Left boundary can\'t be greater than Right boundary.'
      errorMsg.right = 'Right boundary can\'t be less than Left boundary.'
    }
  }

  if (top.endsWith('%') === bottom.endsWith('%')) {
    if (tNum === bNum) {
      errorMsg.top = errorMsg.bottom = 'Top and Bottom boundaries can\'t be equal, as then there won\'t be any area/region.'
    }
    else if (tNum > bNum) {
      errorMsg.top = 'Top boundary can\'t be greater than Bottom boundary.'
      errorMsg.bottom = 'Bottom boundary can\'t be less than Top boundary.'
    }
  }

  return Object.values(errorMsg).every(v => v === '')
    ? true
    : errorMsg
}

function parsePageRange(includeStr: string, excludeStr: string) {
  includeStr = includeStr.trim()
  excludeStr = excludeStr.trim()

  const errorMsg = ErrorsMsgData.create<NameAndPatternData['pages']>()
  if (!includeStr) {
    errorMsg.include = 'You can\'t leave this blank'
  }
  if (!excludeStr) {
    errorMsg.exclude = 'You can\'t leave this blank'
  }

  if (errorMsg.include || errorMsg.exclude) return errorMsg

  const pageRegex = /^(L\d*|\d+)$/
  const rangeRegex = /^(\d+|L\d*)[ ]*-[ ]*(\d+|L\d*)$/
  const totalPages = 30

  const parsePageNumStr = (str: string) => {
    if (str.startsWith('L')) {
      const parsedNumStr = str.replace('L', '').trim()
      return parsedNumStr
        ? (totalPages + 1) - parseInt(parsedNumStr)
        : totalPages
    }

    return parseInt(str)
  }

  const parsePages = (str: string) => {
    const parts = str
      .toUpperCase()
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const pageNums = new Set<number>()
    for (const partStr of parts) {
      if (partStr === 'ALL') {
        return new Set([...utilRange(1, totalPages + 1)])
      }
      else if (partStr === 'NONE') {
        return new Set<number>()
      }
      else if (pageRegex.test(partStr)) {
        pageNums.add(parsePageNumStr(partStr))
      }
      else if (rangeRegex.test(partStr)) {
        const [leftStr, rightStr] = partStr.split('-').map(s => s.trim())
        if (!leftStr || !rightStr) return null

        const leftNum = parsePageNumStr(leftStr)
        const rightNum = parsePageNumStr(rightStr)

        const lowerLimit = Math.min(leftNum, rightNum)
        const upperLimit = Math.max(leftNum, rightNum)
        if (lowerLimit === upperLimit) {
          pageNums.add(lowerLimit)
        }
        else {
          utilRange(lowerLimit, upperLimit + 1).forEach(n => pageNums.add(n))
        }
      }
      else {
        return null
      }
    }

    return pageNums
  }

  const pagesToInclude = parsePages(includeStr)
  const pagesToExclude = parsePages(excludeStr)
  if (pagesToInclude && pagesToExclude) {
    const pageNums = [...pagesToInclude].filter(n => !pagesToExclude.has(n)).sort((a, b) => a - b)
    if (pageNums.length > 0) {
      const firstNum = pageNums[0]!
      if (firstNum < 1) {
        errorMsg.include = 'Page number can\'t be less than 1'
      }
      else if (pageNums.at(-1)! > totalPages) {
        errorMsg.include = `Page number can't be greater than total pages (for this PDF total is ${totalPages})`
      }
      else {
        return pageNums
      }
    }
    else {
      errorMsg.include = 'No pages included, verify include and exclude again and make sure atleast one page is included'
    }
  }
  else {
    if (!pagesToInclude) {
      errorMsg.include = 'Invalid Page Number Format'
    }
    if (!pagesToExclude) {
      errorMsg.exclude = 'Invalid Page Number Format'
    }
  }

  return errorMsg
}

function getToggledPatternMode(type: NameAndPatternData['type']) {
  if (type === 'regex') return 'text'
  return 'regex'
}
</script>

<template>
  <div class="flex flex-col w-full h-full grow">
    <UiTabs v-model="currentSelectedState.subject">
      <UiScrollArea class="w-full border-b">
        <BaseTabsListWithIndicator class="flex flex-nowrap gap-x-2 px-6 max-w-max">
          <BaseTabsTriggerWithIndicator
            v-for="(subjectName, idx) in config.subjectsData"
            :key="idx"
            :value="subjectName"
            class="cursor-pointer p-2.5 text-base"
          >
            {{ subjectName }}
          </BaseTabsTriggerWithIndicator>
          <BaseTabsTriggerWithIndicator
            :value="ADD_SUBJECT"
            class="cursor-pointer p-2.5 text-base"
          >
            Add Subject
          </BaseTabsTriggerWithIndicator>
        </BaseTabsListWithIndicator>
        <UiScrollBar orientation="horizontal" />
      </UiScrollArea>
      <UiTabsContent :value="ADD_SUBJECT">
        <UiCard class="py-2 hidden">
          <UiCardHeader>
            <UiCardTitle class="mx-auto text-lg">
              Does Subject has Multiple Sections?
            </UiCardTitle>
            <UiCardDescription class="text-center text-white text-base">
              Sections like how JEE format has.<br>
              <p class="text-yellow-400 mt-2">
                Warning:
              </p>
              Once decided you can't change/edit this info for this subject<br>
              (you can delete &amp; create a new one though)
            </UiCardDescription>
          </UiCardHeader>
          <UiCardContent class="flex flex-col sm:flex-row gap-8 items-center justify-center pb-4">
            <BaseButton
              label="Yes"
            />
            <BaseButton
              label="No"
              variant="warn"
            />
          </UiCardContent>
        </UiCard>
      </UiTabsContent>
    </UiTabs>
    <UiScrollArea class="h-full">
      <div class="flex flex-col w-full gap-6 px-0 pb-15">
        <UiCard class="py-3 gap-4">
          <UiCardHeader>
            <UiCardTitle class="mx-auto text-xl">
              Subject Config
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <div class="flex gap-8 items-center justify-center px-4 pb-4">
              <div class="flex flex-col gap-4">
                <p class="text-sm text-muted-foreground">
                  Final name shown in output data.
                </p>
                <BaseFloatLabel
                  label="Subject Name"
                  label-id="subjectName"
                  label-class="start-1/2! -translate-x-1/2"
                  required
                >
                  <UiInput
                    id="subjectName"
                    v-model="section.name"
                    class="text-center"
                  />
                </BaseFloatLabel>
              </div>
              <div class="flex flex-col gap-4">
                <p class="text-sm text-muted-foreground">
                  {{ utilKeyToLabel(section.type) }} pattern to find subject start location.
                </p>
                <div class="flex items-center justify-center">
                  <BaseButton
                    class="rounded-r-none"
                    variant="outline"
                    size="icon"
                    :icon-name="section.type === 'regex'
                      ? 'material-symbols:regular-expression'
                      : 'my-icon:txt'"
                    icon-size="1.6rem"
                    icon-class="text-green-400"
                    @click="section.type = getToggledPatternMode(section.type)"
                  />
                  <BaseFloatLabel
                    :label="`Subject-start ${utilKeyToLabel(section.type)} Pattern`"
                    label-id="subjectPattern"
                    label-class="start-1/2! -translate-x-1/2"
                    required
                  >
                    <UiInput
                      id="subjectPattern"
                      v-model="section.pattern"
                      class="rounded-l-none rounded-r-none text-center min-w-54"
                    />
                  </BaseFloatLabel>
                  <BaseButton
                    v-if="section.type === 'text'"
                    class="rounded-l-none"
                    variant="outline"
                    size="icon"
                    icon-name="material-symbols:match-case-rounded"
                    :icon-class="section.flags.ignoreCase ? '' : 'text-green-400'"
                    icon-size="1.6rem"
                    @click="section.flags.ignoreCase = !section.flags.ignoreCase"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col items-center justify-center gap-4 pb-5">
              <p class="text-center font-semibold">
                Config to narrow down Subject Start Text Pattern search area
              </p>
              <div class="flex gap-6 border rounded-md divide-x">
                <div class="flex flex-col items-center gap-1 py-2 px-4">
                  <div class="flex items-center justify-center gap-2">
                    <span>Page Numbers</span>
                    <IconWithTooltip
                      :content="tooltipContent.searchRegion.pageNums"
                      icon-size="1.25rem"
                    />
                  </div>
                  <p class="text-sm text-muted-foreground text-center col-span-2">
                    to only search in these pages.
                  </p>
                  <div class="flex flex-col gap-5 mt-4">
                    <BaseFloatLabel
                      label="Include"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.pages.include"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Exclude"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.pages.exclude"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                  </div>
                </div>
                <div class="flex flex-col items-center gap-1 py-2 px-4">
                  <p class="text-center font-medium col-span-2">
                    Search Boundaries
                  </p>
                  <p class="text-sm text-muted-foreground text-center col-span-2">
                    to only search in this area of pages
                  </p>
                  <div class="grid grid-cols-2 gap-5 mt-4">
                    <BaseFloatLabel
                      label="Left"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.left"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Right"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.right"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Top"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.top"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Bottom"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.bottom"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                  </div>
                </div>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
        <UiCard class="py-3 gap-4">
          <UiCardHeader>
            <UiCardTitle class="mx-auto text-xl">
              Questions Config
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="gap-5">
            <div class="flex gap-6 border mx-auto sm:px-4 rounded-md divide-x">
              <div class="flex flex-col items-center gap-1 py-2 px-4">
                <div class="flex items-center justify-center gap-2">
                  <span>Questions pattern</span>
                  <IconWithTooltip
                    :content="tooltipContent.searchRegion.pageNums"
                    icon-size="1.25rem"
                  />
                </div>
                <p class="text-sm text-muted-foreground text-center col-span-2">
                  to only search in these pages.
                </p>
                <p class="mt-3">
                  Start {{ utilKeyToLabel(section.type) }} Pattern
                </p>
                <div class="flex items-center gap-3 mt-3 justify-center w-full sm:w-92">
                  <BaseButton
                    variant="outline"
                    size="icon"
                    :icon-name="section.type === 'regex'
                      ? 'material-symbols:regular-expression'
                      : 'my-icon:txt'"
                    icon-size="1.6rem"
                    icon-class="text-green-400"
                    @click="section.type = getToggledPatternMode(section.type)"
                  />
                  <template v-if="section.type === 'regex'">
                    <BaseFloatLabel
                      v-slot="{ id }"
                      label="Pattern"
                      label-class="start-1/2! -translate-x-1/2"
                      class="grow"
                      required
                    >
                      <UiInput
                        :id="id"
                        v-model="section.pattern"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <div class="flex gap-3">
                      <BaseFloatLabel
                        v-slot="{ id }"
                        label="Ordering Format"
                        label-class="start-1/2! -translate-x-1/2"
                        class="min-w-36"
                      >
                        <BaseSelect
                          :id="id"
                          v-model="numFormat"
                          :options="questionsNumberingOrderOptions"
                        />
                      </BaseFloatLabel>
                    </div>
                  </template>
                  <template v-else>
                    <BaseButton
                      variant="outline"
                      size="icon"
                      icon-name="material-symbols:match-case-rounded"
                      :icon-class="section.flags.ignoreCase ? '' : 'text-green-400'"
                      icon-size="1.6rem"
                      @click="section.flags.ignoreCase = !section.flags.ignoreCase"
                    />
                    <BaseFloatLabel
                      label="Prefix"
                      label-id="questionsPatternPrefix"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        id="questionsPatternPrefix"
                        v-model="section.pattern"
                        class="text-center w-16"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Q. Num Range"
                      label-id="questionsPatternQNumRange"
                      label-class="start-1/2! -translate-x-1/2"
                      required
                    >
                      <UiInput
                        id="questionsPatternQNumRange"
                        v-model="section.pattern"
                        class="text-center w-32"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Suffix"
                      label-id="questionsPatternSuffix"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        id="questionsPatternSuffix"
                        v-model="section.pattern"
                        class="text-center w-16"
                      />
                    </BaseFloatLabel>
                  </template>
                </div>
                <div class="flex gap-3 text-center items-center text-nowrap mt-4">
                  Search in:
                  <div class="grid grid-cols-4 gap-5">
                    <BaseFloatLabel
                      label="Left"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.left"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Right"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.right"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Top"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.top"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Bottom"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.bottom"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                  </div>
                </div>
                <div class="flex gap-3 text-center items-center text-nowrap mt-4">
                  Crop to:
                  <div class="grid grid-cols-4 gap-5">
                    <BaseFloatLabel
                      label="Left"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.left"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Right"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.right"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Top"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.top"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Bottom"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.bottom"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                  </div>
                </div>
                <p class="mt-5">
                  End {{ utilKeyToLabel(section.type) }} Pattern
                </p>
                <div class="flex items-center justify-center mt-3">
                  <BaseButton
                    class="rounded-r-none"
                    variant="outline"
                    size="icon"
                    :icon-name="section.type === 'regex'
                      ? 'material-symbols:regular-expression'
                      : 'my-icon:txt'"
                    icon-size="1.6rem"
                    icon-class="text-green-400"
                    @click="section.type = getToggledPatternMode(section.type)"
                  />
                  <BaseFloatLabel
                    v-slot="{ id }"
                    :label="`End ${utilKeyToLabel(section.type)} Pattern`"
                    label-class="start-1/2! -translate-x-1/2"
                  >
                    <UiInput
                      :id="id"
                      v-model="section.pattern"
                      class="rounded-l-none rounded-r-none text-center min-w-54"
                    />
                  </BaseFloatLabel>
                  <BaseButton
                    v-if="section.type === 'text'"
                    class="rounded-l-none"
                    variant="outline"
                    size="icon"
                    icon-name="material-symbols:match-case-rounded"
                    :icon-class="section.flags.ignoreCase ? '' : 'text-green-400'"
                    icon-size="1.6rem"
                    @click="section.flags.ignoreCase = !section.flags.ignoreCase"
                  />
                </div>
                <div class="flex gap-3 text-center items-center text-nowrap mt-4">
                  Search in:
                  <div class="grid grid-cols-4 gap-5">
                    <BaseFloatLabel
                      label="Left"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.left"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Right"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.right"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Top"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.top"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                    <BaseFloatLabel
                      label="Bottom"
                      label-class="start-1/2! -translate-x-1/2"
                    >
                      <UiInput
                        v-model="section.boundaries.bottom"
                        class="text-center"
                      />
                    </BaseFloatLabel>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-6 border mx-auto sm:px-4 rounded-md divide-x">
              <div class="flex flex-col items-center gap-1 py-2 px-4">
                <div class="flex items-center justify-center gap-2">
                  <span>Page Numbers</span>
                  <IconWithTooltip
                    :content="tooltipContent.searchRegion.pageNums"
                    icon-size="1.25rem"
                  />
                </div>
                <p class="text-sm text-muted-foreground text-center col-span-2">
                  to only search in these pages.
                </p>
                <div class="flex flex-col gap-5 mt-4">
                  <BaseFloatLabel
                    label="Include"
                    label-class="start-1/2! -translate-x-1/2"
                  >
                    <UiInput
                      v-model="section.pages.include"
                      class="text-center"
                    />
                  </BaseFloatLabel>
                  <BaseFloatLabel
                    label="Exclude"
                    label-class="start-1/2! -translate-x-1/2"
                  >
                    <UiInput
                      v-model="section.pages.exclude"
                      class="text-center"
                    />
                  </BaseFloatLabel>
                </div>
              </div>
              <div class="flex flex-col items-center gap-1 py-2 px-4">
                <p class="text-center font-medium col-span-2">
                  Search Boundaries
                </p>
                <p class="text-sm text-muted-foreground text-center col-span-2">
                  to only search in this area of pages
                </p>
                <div class="grid grid-cols-2 gap-5 mt-4">
                  <BaseFloatLabel
                    label="Left"
                    label-class="start-1/2! -translate-x-1/2"
                  >
                    <UiInput
                      v-model="section.boundaries.left"
                      class="text-center"
                    />
                  </BaseFloatLabel>
                  <BaseFloatLabel
                    label="Right"
                    label-class="start-1/2! -translate-x-1/2"
                  >
                    <UiInput
                      v-model="section.boundaries.right"
                      class="text-center"
                    />
                  </BaseFloatLabel>
                  <BaseFloatLabel
                    label="Top"
                    label-class="start-1/2! -translate-x-1/2"
                  >
                    <UiInput
                      v-model="section.boundaries.top"
                      class="text-center"
                    />
                  </BaseFloatLabel>
                  <BaseFloatLabel
                    label="Bottom"
                    label-class="start-1/2! -translate-x-1/2"
                  >
                    <UiInput
                      v-model="section.boundaries.bottom"
                      class="text-center"
                    />
                  </BaseFloatLabel>
                </div>
              </div>
            </div>
            <div class="flex flex-col items-center gap-1 px-4 pt-2 pb-5">
              <div class="flex items-center justify-center gap-2">
                <span>Pages to find questions for this subject</span>
                <IconWithTooltip
                  :content="tooltipContent.searchRegion.pageNums"
                  icon-size="1.25rem"
                />
              </div>
              <p class="text-sm text-muted-foreground text-center col-span-2">
                Cropper will skip looking for questions in pages that are not included.
              </p>
              <div class="flex gap-5 mt-4">
                <BaseFloatLabel
                  label="Include"
                  label-class="start-1/2! -translate-x-1/2"
                  required
                >
                  <UiInput
                    v-model="section.pages.include"
                    class="text-center"
                  />
                </BaseFloatLabel>
                <BaseFloatLabel
                  label="Exclude"
                  label-class="start-1/2! -translate-x-1/2"
                >
                  <UiInput
                    v-model="section.pages.exclude"
                    class="text-center"
                  />
                </BaseFloatLabel>
              </div>
            </div>
          </UiCardContent>
        </UiCard>

        <BaseButton
          class="mx-auto"
          label="Save Subject"
          @click="console.log(parsePageRange(section.pages.include, section.pages.exclude), validateRegionCoordinatesInput(section.boundaries))"
        />
      </div>
    </UiScrollArea>
  </div>
</template>
