<script setup lang="ts">
import {
  getPromptOutputJsonSchema,
  prettifyError,
  type PromptOutputMetaData,
} from '#layers/shared/app/src/generate-answer-key/prompt-ai-schema'

type NatAnswerEntries = ReturnType<ReturnType<GenerateAnswerKeyInternalNatAnswer['entries']>['toArray']>

// Below comments are for the prompt that is being given to AI

// structure of input json
type PromptInputJsonData = {
  [subjectName: string]: {
    [sectionName: string]: {
      [queNum: number]: {
        t: QuestionType // QuestionType = 'mcq' | 'msq' | 'msm' | 'nat'
        o?: string // total answer options in 'n' format for mcq/msq, in 'rowsxcols' format for msm, undefined for nat. Here, n, rows, cols are natural numbers.
        qRSec: number // Question Number Relative to Section (i.e. in each section it starts from 1)
        qRSub: number // Question Number Relative to Subject (in each subject it starts from 1)
        qRT: number // Question Number Relative to Test (it is continouos and doesn't reset back to 1)
      }
    }
  }
}

// number is natural number corresponding to the sl. num of options
// for example A => 1, B => 2, C => 3...
type McqOrMsqAnswer = Array<number>
type ExactAnswer = number
type RangeAnswer = {
  min: number
  max: number
}
// here array is used for OR logic
// For example, say if answer is 5 or 6 to 7 or -5, then output should be:
// [5, { min: 6, max: 7 }, -5]
// say if answer is just 5, then output is [5]
type NatAnswer = Array<ExactAnswer | RangeAnswer>

// a natural number corresponding to the sl. num of the row
// for example: A => 1, B => 2, ...
// remember instead of A, B, it can be P, Q or something,
// just remember all rows will be present so use the lowest letter as 1 and so on.
type RowNum = number
type ColNum = number // similar logic to Row Num
// in MSM Answer, all rownums must be present with atleast one colNum
type MsmAnswer = Record<RowNum, ColNum[]>

type DroppedAnswer = 'dropped' // When the question is answered as dropped (everyone will be rewarded regardless of whether they attempted it or not)
type BonusAnswer = 'bonus' // when the question is answered as bonus (bonus means only those who attempted it will be rewarded)
type PromptOutputJsonData = {
  [QuestionNumberRelativeToTest: Numberish]: McqOrMsqAnswer | NatAnswer | MsmAnswer | DroppedAnswer | BonusAnswer
}

const {
  sectionsList,
} = defineProps<{
  sectionsList: Array<{
    totalQuestions: number
    subject: string
    name: string
  }>
}>()

const showDialog = defineModel<boolean>({ required: true })

const internalAnswerKeyData = defineModel<GenerateAnswerKeyInternalSubjectsData>(
  'internalAnswerKeyData',
  { required: true },
)

const emit = defineEmits<{
  manualCheck: []
  generateAnswerKey: []
}>()

const promptTextStart = `You are an answer key (of test) data extractor.

Definitions:
- MCQ (Multiple Choice Questions) are questions with one correct option out of n (typically n=4) options.
  Thus answers are generally marked with letters like A, B, C etc.
  Due to some reason, sometimes one or more of them can be correct.
- MSQ (Multiple Select Questions) are questions similar to MCQ but with one or more correct options.
- NAT (Numerical Answer Type) are questions for which answer is numerical value which can be in following formats. 
    - Numerical value can be an exactly value (for example: "5" or "5.8" or "-1").
    - A range (the interval [min, max] where both are included).
    - It can have multiple answers (multiple exact values or multiple ranges or both mixed).
- MSM (Multiple Select Matrix) are questions in row x col matrix,
  where each row has one or more correct answers. Each row must have atleast one correct answer.   

You are given a PDF or an Image containing the answer key (in PDF it is generally around the end of pdf).

Below you are given typescript type and input JSON data info about the subject, section and question:

The typescript type structure is of the JSON given to you:

type PromptInputJsonData = {
  [subjectName: string]: {
    [sectionName: string]: {
      [queNum: number]: {
        t: QuestionType // QuestionType = 'mcq' | 'msq' | 'msm' | 'nat'
        o?: string // total answer options (i.e. A, B, C, D...) in 'n' format for mcq/msq, in 'rowsxcols' format for msm, undefined for nat. Here, n, rows, cols are natural numbers. 
        qRSec: number // Question Number Relative to Section (i.e. in each section it starts from 1)
        qRSub: number // Question Number Relative to Subject (in each subject it starts from 1)
        qRT: number // Question Number Relative to Test (it is continuous and never resets back to 1)
      }
    }
  }
}

The JSON data is:

`

const promptTextEnd = `

You need to go through the answer key and the json provided and provide a JSON data in monospace (so that it can be copied).
This is the typescript type structure of the JSON format you need to give:

// number is natural number corresponding to the sl. num of options
// for example A => 1, B => 2, C => 3...
type McqOrMsqAnswer = Array<number>

type ExactAnswer = number
type RangeAnswer = {
  min: number
  max: number
}
// here array is used for OR logic
// For example, say if answer is 5 or 6 to 7 or -5, then output should be:
// [5, { min: 6, max: 7 }, -5]
// say if answer is just 5, then output is [5]
type NatAnswer = Array<ExactAnswer | RangeAnswer>

// a natural number corresponding to the sl. num of the row
// for example: A => 1, B => 2, ...
// remember instead of A, B, it can be P, Q or something,
// just remember all rows will be present so use the lowest letter as 1 and so on.
type RowNum = number
type ColNum = number // similar logic to Row Num
// in MSM Answer, all rownums must be present with atleast one colNum
type MsmAnswer = Record<RowNum, ColNum[]>

type DroppedAnswer = 'dropped' // When the question is answered as dropped (everyone will be rewarded regardless of whether they attempted it or not)
type BonusAnswer = 'bonus' // when the question is answered as bonus (bonus means only those who attempted it will be rewarded)

// Now provide the JSON output as per the given this structure:
type PromptOutputJsonData = {
  [QuestionNumberRelativeToTest: number]: McqOrMsqAnswer | NatAnswer | MsmAnswer | DroppedAnswer | BonusAnswer
}

The output which can be copied should be a valid JSON for javascript's JSON.parse(),
so don't add any comments or such in them, strictly stick to the defined structure.
`

const errorsPromptTextStart = `
There are errors in the JSON output you have given!
Fix it and give full JSON in the output format that was defined before.

Here's the output of the zod schema's z.prettifyError:

`

const promptInputState = shallowReactive({
  isCopied: false,
  text: '',
  promptJsonData: {} as PromptInputJsonData,
})

const promptOutputState = shallowReactive({
  showDialog: false,
  metaData: {} as PromptOutputMetaData,
  parsedData: null as PromptOutputJsonData | null,
})

const errorsState = shallowReactive({
  showDialog: false,
  isCopied: false,
  errors: [] as string[],
})

const aiJsonOutputText = shallowRef('')

const inputPromptCopySignal = useTimeoutFn(
  () => promptInputState.isCopied = false,
  1500,
  {
    immediate: false,
    immediateCallback: false,
  },
)

const errorsPromptCopySignal = useTimeoutFn(
  () => errorsState.isCopied = false,
  1500,
  {
    immediate: false,
    immediateCallback: false,
  },
)

function copyInputPrompt() {
  promptInputState.isCopied = false
  inputPromptCopySignal.stop()
  if (!promptInputState.text.trim()) return

  navigator?.clipboard?.writeText(
    promptInputState.text,
  )
    ?.then(() => {
      promptInputState.isCopied = true
      inputPromptCopySignal.start()
    })
    ?.catch(err => useErrorToast('Error copying prompt into clipboard!', err))
}

function copyErrorsPrompt() {
  errorsState.isCopied = false
  errorsPromptCopySignal.stop()
  if (!errorsState.errors.length) return

  navigator?.clipboard?.writeText(
    errorsPromptTextStart + errorsState.errors.join('\n'),
  )
    ?.then(() => {
      errorsState.isCopied = true
      errorsPromptCopySignal.start()
    })
    ?.catch(err => useErrorToast('Error copying prompt into clipboard!', err))
}

function prepareAndLoadPromptData() {
  const newPromptJsonData: PromptInputJsonData = {}
  const newPromptOutputMetaData: PromptOutputMetaData = {}

  // As sections can be sorted and hence not grouped under same subject,
  // this record stores the questions count of its subject
  const subjectQuestionsCounts: Record<string, number> = {}
  let testQueNum = 0

  for (const section of sectionsList) {
    const { name: sectionName, subject: subjectName } = section

    const currentSection: PromptInputJsonData[string][string] = {}

    const questions = Object.values(
      internalAnswerKeyData.value?.[subjectName]?.[sectionName] ?? {},
    )

    const subjectFirstQRT = subjectQuestionsCounts[subjectName] ?? 0

    questions.forEach((question, idx) => {
      const { type, qNum, answerOptionsCount } = question
      let o: string | undefined = undefined

      if (type === 'mcq' || type === 'msq') {
        o = String(answerOptionsCount.rows)
      }
      else if (type === 'msm') {
        o = `${answerOptionsCount.rows}x${answerOptionsCount.cols}`
      }

      const qRSec = idx + 1
      const qRSub = subjectFirstQRT + qRSec
      const qRT = testQueNum + qRSec

      currentSection[qNum] = {
        t: type,
        o,
        qRSec,
        qRSub,
        qRT,
      }

      newPromptOutputMetaData[qRT] = {
        subject: subjectName,
        section: sectionName,
        qNum,
        type,
        answerOptionsCount,
      }
    })

    subjectQuestionsCounts[subjectName] = subjectFirstQRT + questions.length
    testQueNum += questions.length

    newPromptJsonData[subjectName] ??= {}
    newPromptJsonData[subjectName][sectionName] = currentSection
  }

  promptInputState.promptJsonData = newPromptJsonData
  promptOutputState.metaData = newPromptOutputMetaData

  promptInputState.text = promptTextStart
    + JSON.stringify(newPromptJsonData, null, 2)
    + promptTextEnd
}

function validatePromptOutputJsonText() {
  let json: object | null = null
  try {
    json = JSON.parse(aiJsonOutputText.value.trim())
  }
  catch (err) {
    const errString = err?.toString?.() || ''
    if (errString) {
      errorsState.errors = ['JSON is not in valid format', errString]
    }
    else {
      errorsState.errors = ['JSON is not in valid format']
    }
    errorsState.showDialog = true
    return
  }

  if (!json) {
    errorsState.errors = ['JSON data is null!']
    errorsState.showDialog = true
    return
  }

  const promptOutputJsonSchema = getPromptOutputJsonSchema(promptOutputState.metaData)

  const parsedData = promptOutputJsonSchema.safeParse(json)

  if (!parsedData.success) {
    errorsState.errors = prettifyError(parsedData.error).split('\n')
    errorsState.showDialog = true
    return
  }

  promptOutputState.parsedData = parsedData.data
  promptOutputState.showDialog = true
}

function loadOutputJsonToInternalAnswerKeyData() {
  const data = promptOutputState.parsedData
  if (!data) return

  for (const [qRT, question] of Object.entries(promptOutputState.metaData)) {
    const { type, subject, section, qNum } = question

    const qAnswer = data[qRT]
    const internalQuestion = internalAnswerKeyData.value[subject]?.[section]?.[qNum]
    if (!qAnswer || !internalQuestion) continue

    if (qAnswer === 'bonus') {
      internalQuestion.isBonus = true
      internalQuestion.isDropped = false
      continue
    }

    if (qAnswer === 'dropped') {
      internalQuestion.isDropped = true
      internalQuestion.isBonus = false
      continue
    }

    if (type === 'mcq' || type === 'msq') {
      internalQuestion.answer = new Set(qAnswer as number[])
    }
    else if (type === 'nat') {
      const answers: NatAnswerEntries = (qAnswer as NatAnswer).map((a, idx) => {
        const key = idx + 1
        if (typeof a === 'number') {
          return [
            key,
            {
              min: '',
              max: '',
              value: String(a),
              isRange: false,
            },
          ]
        }

        return [
          key,
          {
            min: String(a.min),
            max: String(a.max),
            value: '',
            isRange: true,
          },
        ]
      })

      internalQuestion.answer = new Map(answers)
    }
    else {
      internalQuestion.answer = qAnswer as MsmAnswer
    }

    internalQuestion.isDropped = false
    internalQuestion.isBonus = false
  }
}

function onManuallyCheck() {
  loadOutputJsonToInternalAnswerKeyData()
  emit('manualCheck')
  showDialog.value = false
}

function onGenerateAnswerKey() {
  loadOutputJsonToInternalAnswerKeyData()
  emit('generateAnswerKey')
  showDialog.value = false
}

onMounted(() => {
  prepareAndLoadPromptData()
})
</script>

<template>
  <UiDialog
    v-model:open="showDialog"
    modal
  >
    <UiDialogContent
      class="max-w-full md:max-w-2xl py-3"
    >
      <UiDialogHeader>
        <UiDialogTitle class="text-xl font-bold text-center">
          Prompt AI to extract answers from PDF/Image
        </UiDialogTitle>

        <UiDialogDescription>
          Copy the prompt below and paste it into an AI (ChatGPT, Gemini, etc)
          along with your answer key PDF or screenshot.<br>
          The AI should return a JSON. Paste that JSON in the second box
          to generate the answer key.
        </UiDialogDescription>
      </UiDialogHeader>

      <UiScrollArea class="max-h-128 w-full pb-6">
        <div class="flex flex-col gap-5 items-center">
          <div class="flex gap-8 px-4 w-full">
            <!-- Prompt textarea -->
            <div class="flex flex-col flex-1 space-y-2">
              <div class="flex items-center gap-5 justify-center">
                <label class="text-base">
                  Prompt to give to AI
                </label>

                <BaseButton
                  size="iconXs"
                  variant="outline"
                  icon-name="mdi:content-copy"
                  icon-size="1rem"
                  :class="promptInputState.isCopied ? 'hover:text-green-400 text-green-400' : ''"
                  title="Copy Prompt to clipboard"
                  @click="copyInputPrompt"
                />
              </div>

              <UiTextarea
                v-model="promptInputState.text"
                readonly
                class="min-h-30 font-mono text-xs bg-accent/30"
              />
            </div>

            <!-- AI output textarea -->
            <div class="flex flex-col flex-1 space-y-2">
              <label class="text-base mx-auto">
                Paste output JSON
              </label>

              <UiTextarea
                v-model="aiJsonOutputText"
                placeholder="Paste the JSON returned by the AI here..."
                class="min-h-30 font-mono text-xs"
              />
            </div>
          </div>

          <BaseButton
            icon-name="material-symbols:check-circle-outline"
            label="Validate Output"
            :disabled="!aiJsonOutputText.trim()"
            @click="validatePromptOutputJsonText"
          />
        </div>

        <!-- Error Dialog -->
        <UiDialog
          v-model:open="errorsState.showDialog"
          modal
        >
          <UiDialogContent class="max-w-full md:max-w-2xl py-3">
            <UiDialogHeader>
              <UiDialogTitle class="text-xl font-bold text-center">
                Output is not in valid format!
              </UiDialogTitle>

              <UiDialogDescription>
                Click the copy button below to copy the prompt that describes the errors to AI.
                Then go back (by closing this dialog) and paste the new output (by replacing the old one).
              </UiDialogDescription>
            </UiDialogHeader>

            <UiScrollArea class="max-h-128 w-full pb-6">
              <div class="flex flex-col gap-5 items-center">
                <div class="flex items-center gap-5 justify-center">
                  <label class="text-base">
                    Errors in Output
                  </label>

                  <BaseButton
                    size="iconXs"
                    variant="outline"
                    icon-name="mdi:content-copy"
                    icon-size="1rem"
                    :class="errorsState.isCopied ? 'hover:text-green-400 text-green-400' : ''"
                    title="Copy Prompt to clipboard"
                    @click="copyErrorsPrompt"
                  />
                </div>

                <p>
                  <template
                    v-for="(err, idx) in errorsState.errors"
                    :key="idx"
                  >
                    <br v-if="!err.trim().startsWith('→')">{{ err }}
                  </template>
                </p>
              </div>
            </UiScrollArea>
          </UiDialogContent>
        </UiDialog>

        <!-- Output Dialog -->
        <UiDialog
          v-model:open="promptOutputState.showDialog"
          modal
        >
          <UiDialogContent class="max-w-full md:max-w-2xl py-3">
            <UiDialogHeader>
              <UiDialogTitle class="text-xl font-bold text-center">
                Output is logically valid
              </UiDialogTitle>
            </UiDialogHeader>

            <div class="text-base space-y-2">
              <p>
                The Output is logically valid,
                though that doesn't mean answers are 100% accurate.
              </p>
              <p>
                For example, if a MCQ question has option "A" as answer but output is option B,
                B is still logically correct but not the right answer!
              </p>
              <p>
                To be fully sure, you can load the output to manually
                check the answers and correct them if found incorrect.
              </p>
            </div>

            <UiDialogFooter class="my-2 gap-x-8!">
              <BaseButton
                label="Manually Check"
                icon-name="mdi:tab-find"
                @click="onManuallyCheck"
              />
              <BaseButton
                label="Generate anyway"
                variant="warn"
                icon-name="mdi:rocket-launch"
                @click="onGenerateAnswerKey"
              />
            </UiDialogFooter>
          </UiDialogContent>
        </UiDialog>
      </UiScrollArea>
    </UiDialogContent>
  </UiDialog>
</template>
