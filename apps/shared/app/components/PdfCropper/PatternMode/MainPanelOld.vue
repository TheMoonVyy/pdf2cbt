<script lang="ts" setup>
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

const MAIN_CONFIG = useId()

const config = reactive({
  subjectsData: [],
})

const currentSelectedState = reactive({
  subject: MAIN_CONFIG,
  section: '',
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
  <div class="flex flex-col w-full grow pb-50">
    <UiTabs
      v-model="currentSelectedState.subject"
      class="border-b border-border"
    >
      <UiScrollArea class="w-full border-b">
        <BaseTabsListWithIndicator class="flex flex-nowrap gap-x-2 px-6 max-w-max">
          <BaseTabsTriggerWithIndicator
            :value="MAIN_CONFIG"
            class="cursor-pointer p-2.5 text-base"
          >
            Main Config
          </BaseTabsTriggerWithIndicator>
          <BaseTabsTriggerWithIndicator
            v-for="(subjectName, idx) in config.subjectsData"
            :key="idx"
            :value="subjectName"
            class="cursor-pointer p-2.5 text-base"
          >
            {{ subjectName }}
          </BaseTabsTriggerWithIndicator>
          <BaseTabsTriggerWithIndicator
            value=""
            class="cursor-pointer p-2.5 text-base"
          >
            New Subject
          </BaseTabsTriggerWithIndicator>
        </BaseTabsListWithIndicator>
        <UiScrollBar orientation="horizontal" />
      </UiScrollArea>
      <UiTabsContent value="">
        h
      </UiTabsContent>
    </UiTabs>
    <UiCard class="space-y-6 mt-4 px-2">
      <UiCardContent class="flex flex-col w-full gap-6 divide-y px-0">
        <div class="flex gap-8 items-center justify-center px-4 pb-4">
          <div class="flex flex-col gap-4">
            <p class="text-sm text-muted-foreground">
              Final name shown in output data.
            </p>
            <BaseFloatLabel
              label="Subject Name"
              label-id="subjectName"
              label-class="start-1/2! -translate-x-1/2"
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
                :label="`${utilKeyToLabel(section.type)} Pattern`"
                label-id="subjectPattern"
                label-class="start-1/2! -translate-x-1/2"
              >
                <UiInput
                  id="subjectPattern"
                  v-model="section.pattern"
                  class="rounded-l-none rounded-r-none text-center"
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

        <div class="flex flex-col items-center justify-center gap-4 pb-4">
          <p class="text-center font-semibold">
            Crop Region/Area Configuration
          </p>

          <div class="flex gap-6 border rounded-md divide-x">
            <!-- Page Filtering -->
            <div class="flex flex-col items-center gap-1 py-2 px-4">
              <div class="flex items-center justify-center gap-2">
                <span>Pages to Consider</span>
                <IconWithTooltip
                  :content="tooltipContent.searchRegion.pageNums"
                  icon-size="1.25rem"
                />
              </div>
              <p class="text-sm text-muted-foreground text-center col-span-2">
                All other pages will be ignored.
              </p>
              <div class="flex flex-col gap-5 mt-4">
                <BaseFloatLabel
                  label="Include"
                  label-class="start-1/2! -translate-x-1/2"
                >
                  <UiInput
                    v-model="section.pages.include"
                    placeholder="e.g. 1-5,7"
                    class="text-center"
                  />
                </BaseFloatLabel>
                <BaseFloatLabel
                  label="Exclude"
                  label-class="start-1/2! -translate-x-1/2"
                >
                  <UiInput
                    v-model="section.pages.exclude"
                    placeholder="e.g. 2,4"
                    class="text-center"
                  />
                </BaseFloatLabel>
              </div>
            </div>

            <!-- Clip-In Boundary Area -->
            <div class="flex flex-col items-center gap-1 py-2 px-4">
              <p class="text-center font-medium col-span-2">
                Clip-In Area
              </p>
              <p class="text-sm text-muted-foreground text-center col-span-2">
                Content will be restricted within these boundaries.
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

        <div class="flex flex-col items-center justify-center gap-4">
          <p class="text-center font-semibold">
            Search Area Configuration
          </p>
          <div class="flex gap-6 border rounded-md divide-x">
            <div class="flex flex-col items-center gap-1 py-2 px-4">
              <div class="flex items-center justify-center gap-2">
                <span>Page Numbers to</span>
                <IconWithTooltip
                  :content="tooltipContent.searchRegion.pageNums"
                  icon-size="1.25rem"
                />
              </div>
              <p class="text-sm text-muted-foreground text-center col-span-2">
                narrow down pages to search.
              </p>
              <div class="flex flex-col gap-5 mt-4">
                <BaseFloatLabel
                  label="Include"
                  label-class="start-1/2! -translate-x-1/2"
                >
                  <UiInput
                    v-model="section.pages.include"
                    placeholder="e.g. 1-5,7"
                    class="text-center"
                  />
                </BaseFloatLabel>
                <BaseFloatLabel
                  label="Exclude"
                  label-class="start-1/2! -translate-x-1/2"
                >
                  <UiInput
                    v-model="section.pages.exclude"
                    placeholder="e.g. 2,4"
                    class="text-center"
                  />
                </BaseFloatLabel>
              </div>
            </div>
            <div class="flex flex-col items-center gap-1 py-2 px-4">
              <p class="text-center font-medium col-span-2">
                Region Boundaries
              </p>
              <p class="text-sm text-muted-foreground text-center col-span-2">
                to narrow down search region/area.
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

    <UiButton
      class="w-full"
      @click="console.log(parsePageRange(section.pages.include, section.pages.exclude), validateRegionCoordinatesInput(section.boundaries))"
    >
      Save Subject
    </UiButton>
  </div>
</template>
