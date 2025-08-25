<script lang="ts" setup>
import { QUESTIONS_NUMBERING_ORDER_OPTIONS } from '#layers/shared/shared/constants'

type PatternType = 'regex' | 'text'

type QuestionsDetails = Pick<
  PdfCroppedOverlayData,
  'type' | 'answerOptions' | 'marks' | 'answerOptionsCounterTypePrimary' | 'answerOptionsCounterTypeSecondary'
>

type BaseConfig = {
  pattern: {
    type: PatternType
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

type QuestionsConfig = {
  cropTo: BaseConfig['searchIn']['area']
  start: BaseConfig
  end: BaseConfig
}

type SectionConfig = BaseConfig & {
  name: string
  questionDetails: QuestionsDetails
  questions: QuestionsConfig
}

type SubjectConfig = BaseConfig & {
  name: string
  sections: SectionConfig
}

const questionsNumberingOrderOptions = QUESTIONS_NUMBERING_ORDER_OPTIONS
  .filter(item => item.value !== 'original')

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
              h('li', [h('strong', 'L2'), ': second last second page']),
              h('li', [h('strong', 'L3'), ': last third page']),
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

function getToggledPatternMode(type: PatternType) {
  if (type === 'regex') return 'text'
  return 'regex'
}
</script>

<template>
  <div class="flex flex-col w-full h-full grow">
    <UiTabs v-model="currentSelectedState.subject">
      <UiScrollArea class="w-full border-b">
        <BaseTabsListWithIndicator class="flex flex-nowrap gap-x-2 px-6 max-w-max">
          <template
            v-for="(subjectName, idx) in subjectsConfig.keys()"
            :key="idx"
          >
            <BaseTabsTriggerWithIndicator
              v-if="subjectName !== ADD_SUBJECT"
              :value="subjectName"
              class="cursor-pointer p-2.5 text-base"
            >
              {{ subjectName }}
            </BaseTabsTriggerWithIndicator>
          </template>
          <BaseTabsTriggerWithIndicator
            :value="ADD_SUBJECT"
            class="cursor-pointer p-2.5 text-base"
          >
            Add Subject
          </BaseTabsTriggerWithIndicator>
        </BaseTabsListWithIndicator>
        <UiScrollBar orientation="horizontal" />
      </UiScrollArea>
    </UiTabs>
  </div>
</template>
