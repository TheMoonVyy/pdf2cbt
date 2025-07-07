<script setup lang="ts">
import regexParser from 'regex-parser'
// import test from '@/test.json'
import { SEPARATOR } from '#shared/constants'

type CropSection = {
  subjectPattern: string
  subjectName: string
  sectionPattern: string
  sectionName: string
  questionPattern: string
  numberRange: string // e.g., "1-100"
  questionType: QuestionType
  marks: {
    correct: number
    partial: number
    incorrect: number
  }
  pages: {
    include: string // "1-5"
    exclude: string // "2,4" or "3-6"
  }
  boundaries: {
    left: number
    right: number
    top: number
    bottom: number
  }
}

const section = reactive<CropSection>({
  subjectPattern: '',
  subjectName: '',
  sectionPattern: '',
  sectionName: '',
  questionPattern: '',
  numberRange: '',
  questionType: 'mcq',
  marks: {
    correct: 0,
    partial: 0,
    incorrect: 0,
  },
  pages: {
    include: '',
    exclude: '',
  },
  boundaries: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
})

const { textPatternModeState } = defineProps<{
  textPatternModeState: PdfTextPatternModeState
}>()

const cropperOverlayDatas = defineModel<Map<string, PdfCroppedOverlayData>>({ required: true })

function searchCoords(pdfTextData: PdfTextWithCoords) {
  const state = {
    current: {
      que: null as number | null,
      l: 0,
      r: 0,
      t: 0,
      b: 0,
      page: 0,
    },
    subjectFound: false,
    sectionFound: false,
  }

  const config = textPatternModeState.config
  const { minX, maxX } = config
  const subjectRegex = new RegExp(config.subject)
  const sectionRegex = new RegExp(config.section)
  const questionRegex = regexParser(config.questions)
  const questionEndRegex = regexParser(config.questionsEnd)

  const overlayData: PdfCroppedOverlayData = {
    id: 'Physics Section 1' + SEPARATOR,
    subject: 'Physics',
    section: 'Physics Section 1',
    que: 0,
    type: 'mcq',
    options: 4,
    marks: { cm: 4, pm: 1, im: -1 },
    pdfData: [],
  }

  for (const [pageNum, pageData] of Object.entries(pdfTextData)) {
    for (const column of pageData.columns) {
      for (const line of column) {
        if (!state.subjectFound) {
          if (subjectRegex.test(line.text)) state.subjectFound = true
        }
        else if (!state.sectionFound) {
          if (sectionRegex.test(line.text)) state.sectionFound = true
        }
        else {
          if (typeof state.current.que === 'number' && questionEndRegex.test(line.text)) {
            const b = line.bbox.y
            const { l, t, que } = state.current
            const pdfData: PdfCroppedOverlayData['pdfData'] = [{
              l,
              r: Math.min(pageData.width, maxX),
              t: Math.min(t, b),
              b: Math.max(t, b),
              page: parseInt(pageNum),
            }]

            const newOverlay = structuredClone(overlayData)
            newOverlay.pdfData = pdfData
            const id = newOverlay.id + que.toString()
            newOverlay.id = id
            newOverlay.que = que
            cropperOverlayDatas.value.set(id, newOverlay)
            state.current.que = null
          }

          if (typeof state.current.que !== 'number') {
            const match = questionRegex.exec(line.text)

            if (match && typeof match[1] !== 'undefined') {
              const que = parseInt(match[1], 10)
              if (!isNaN(que) && !cropperOverlayDatas.value.has(overlayData.id + que)) {
                state.current.que = que
                state.current.l = Math.max(0, minX, line.bbox.x)
                state.current.t = line.bbox.y
                state.current.page = parseInt(pageNum)
              }
            }
          }
        }
      }
    }
  }

  const str = JSON.stringify(Object.fromEntries(cropperOverlayDatas.value.entries()), null, 2)
  const blob = new Blob([str], { type: 'application/json' })
  utilSaveFile('Filtered.json', blob)
}

// onMounted(() => {
//   const config = textPatternModeState.config
//   const { minX, maxX } = config
//   const testData = textPatternModeState.pdfTextWithCoords
//   if (!testData) return

//   for (const pageData of Object.values(testData)) {
//     for (let i = 0; i < pageData.columns.length; i++) {
//       const column = pageData.columns[i]!
//       const filteredColumn = column.filter(line => line.bbox.x >= minX && line.bbox.x <= maxX)
//       if (filteredColumn.length !== column.length) {
//         pageData.columns[i] = filteredColumn
//       }
//     }
//   }

//   searchCoords(testData)
// })

function submitForm() {
  console.log('Section data:', JSON.stringify(section, null, 2))
}
</script>

<template>
  <UiDialog default-open>
    <UiDialogContent class="max-w-3xl">
      <UiDialogHeader>
        <UiDialogTitle>Configure Crop Section</UiDialogTitle>
        <UiDialogDescription>
          Enter text patterns, marks, ranges, and boundaries for this section.
        </UiDialogDescription>
      </UiDialogHeader>

      <form
        class="space-y-6"
        @submit.prevent="submitForm"
      >
        <!-- Patterns and Names -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <UiLabel for="subjectPattern">
              Subject Pattern
            </UiLabel>
            <UiInput
              id="subjectPattern"
              v-model="section.subjectPattern"
            />
          </div>
          <div>
            <UiLabel for="subjectName">
              Subject Name
            </UiLabel>
            <UiInput
              id="subjectName"
              v-model="section.subjectName"
            />
          </div>

          <div>
            <UiLabel for="sectionPattern">
              Section Pattern
            </UiLabel>
            <UiInput
              id="sectionPattern"
              v-model="section.sectionPattern"
            />
          </div>
          <div>
            <UiLabel for="sectionName">
              Section Name
            </UiLabel>
            <UiInput
              id="sectionName"
              v-model="section.sectionName"
            />
          </div>

          <div>
            <UiLabel for="questionPattern">
              Question Pattern
            </UiLabel>
            <UiInput
              id="questionPattern"
              v-model="section.questionPattern"
            />
          </div>
          <div>
            <UiLabel for="numberRange">
              Question Number Range
            </UiLabel>
            <UiInput
              id="numberRange"
              v-model="section.numberRange"
              placeholder="e.g. 1-100"
            />
          </div>

          <div>
            <UiLabel>Question Type</UiLabel>
            <UiSelect v-model="section.questionType">
              <UiSelectTrigger>
                <UiSelectValue placeholder="Choose type" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem value="mcq">
                  MCQ
                </UiSelectItem>
                <UiSelectItem value="msq">
                  MSQ
                </UiSelectItem>
                <UiSelectItem value="nat">
                  NAT
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>
        </div>

        <!-- Marking Scheme -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <UiLabel for="correct">
              Marks: Correct
            </UiLabel>
            <BaseInputNumber
              id="correct"
              v-model="section.marks.correct"
            />
          </div>
          <div>
            <UiLabel for="partial">
              Marks: Partial
            </UiLabel>
            <BaseInputNumber
              id="partial"
              v-model="section.marks.partial"
            />
          </div>
          <div>
            <UiLabel for="incorrect">
              Marks: Incorrect
            </UiLabel>
            <BaseInputNumber
              id="incorrect"
              v-model="section.marks.incorrect"
            />
          </div>
        </div>

        <!-- Page Ranges -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <UiLabel for="pagesInclude">
              Pages to Search
            </UiLabel>
            <UiInput
              id="pagesInclude"
              v-model="section.pages.include"
              placeholder="e.g. 1-5,7"
            />
          </div>
          <div>
            <UiLabel for="pagesExclude">
              Pages to Exclude
            </UiLabel>
            <UiInput
              id="pagesExclude"
              v-model="section.pages.exclude"
              placeholder="e.g. 2,4 or 3-6"
            />
          </div>
        </div>

        <!-- Boundaries -->
        <div class="grid grid-cols-4 gap-4">
          <div>
            <UiLabel for="left">
              Left
            </UiLabel>
            <BaseInputNumber
              id="left"
              v-model="section.boundaries.left"
            />
          </div>
          <div>
            <UiLabel for="right">
              Right
            </UiLabel>
            <BaseInputNumber
              id="right"
              v-model="section.boundaries.right"
            />
          </div>
          <div>
            <UiLabel for="top">
              Top
            </UiLabel>
            <BaseInputNumber
              id="top"
              v-model="section.boundaries.top"
            />
          </div>
          <div>
            <UiLabel for="bottom">
              Bottom
            </UiLabel>
            <BaseInputNumber
              id="bottom"
              v-model="section.boundaries.bottom"
            />
          </div>
        </div>

        <!-- Save button -->
        <UiButton
          type="submit"
          class="w-full"
        >
          Save Section
        </UiButton>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
