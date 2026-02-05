<script lang="ts" setup>
import {
  QUESTION_STATUS_FULL_LABELS,
} from '#layers/shared/shared/constants'

const props = defineProps<{
  panelWidth: number
  isForCbtInterfaceDialog?: boolean
  instructionsData: CbtMakerInternalInstructionsData
  jsonData: Omit<CbtIntructionsDataForTemplate, 'testInstructions' | 'additionalData'>
}>()

const emit = defineEmits<{
  startTest: []
}>()

const mdContent = `
Please read the instructions carefully{.text-center}

&nbsp;
**_General Instructions:_**

1. Total duration of examination is {{testDuration}} minutes.
2. The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.
3. The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
    - ![ =40x40][notVisited]{.inline-block} You have not visited the question yet.  
    - ![ =40x40][notAnswered]{.inline-block} You have not answered the question.   
    - ![ =40x40][answered]{.inline-block} You have answered the question.   
    - ![ =40x40][marked]{.inline-block} You have NOT answered the question, but have marked the question for review.   
    - ![ =40x40][markedAnswered]{.inline-block} The question(s) "Answered and Marked for Review" will be considered for evaluation.   
    - The Marked for Review status for a question simply indicates that you would like to look at that question again.  
4. You can click on the ">" arrow which appears to the left of question palette to collapse the question palette thereby maximizing the question window. To view the question palette again, you can click on "< " which appears on the right side of question window.
5. You can click on your "Profile" image on top right corner of your screen to change the language during the exam for entire question paper. On clicking of Profile image you will get a drop-down to change the question content to the desired language.
6. You can click on ![ =40x40][scrollDown]{.inline-block} to navigate to the bottom and ![ =40x40][scrollUp]{.inline-block} to navigate to the top of the question area, without scrolling.

&nbsp;
**_Navigating to a Question:_**  

7. To answer a question, do the following:
    1. Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.
    2. Click on **Save & Next** to save your answer for the current question and then go to the next question.
    3. Click on **Mark for Review & Next** to save your answer for the current question, mark it for review, and then go to the next question.
{.list-[lower-alpha]!}

&nbsp;
**_Answering a Question:_**

8. Procedure for answering a multiple choice type question:
    1. To select your answer, click on the button of one of the options
    2. To deselect your chosen answer, click on the button of the chosen option again or click on the **Clear Response** button
    3. To change your chosen answer, click on the button of another option
    4. To save your answer, you MUST click on the **Save & Next** button
    5. To mark the question for review, click on the **Mark for Review & Next** button.
{.list-[lower-alpha]!}

9. To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.

&nbsp;
**_Navigating through sections:_**

10.  Sections in this question paper are displayed on the top bar of the screen. Questions in a section can be viewed by clicking on the section name. The section you are currently viewing is highlighted.
11.  After clicking the Save & Next button on the last question for a section, you will automatically be taken to the first question of the next section.
12.  You can shuffle between sections and questions anytime during the examination as per your convenience only during the time stipulated.
13.  Candidate can view the corresponding section summary as part of the legend that appears in every section above the question palette.

&nbsp;
**_Instruction for images:_**

14. To zoom the image provided in the question roll over it.
`

// BREAK PAGE

// |             |          Grouping           ||
// First Header  | Second Header | Third Header |
//  ------------ | :-----------: | -----------: |
// Content       |          *Long Cell*        ||
// Content       |   **Cell**    |         Cell |
// New section   |     More      |         Data |
// And more      | With an escaped '\\|'       ||

const instructions = reactive<CbtInstructionsParsedConfig>({
  pages: [
    {
      title: 'Instructions',
      body: mdContent,
      parsedBody: '',
      footer: '',
    },
    {
      title: 'Other Important Instructions',
      body: mdContent,
      parsedBody: '',
      footer: `
        I have read and understood the instructions.
        All computer hardware allotted to me are in proper working condition.
        I declare  that I am not in possession of / not wearing /
        not  carrying any prohibited gadget like mobile phone,
        bluetooth  devices  etc. /any prohibited material with me into the Examination Hall.
        I agree that in case of not adhering to the instructions,
        I shall be liable to be debarred from this Test and/or to disciplinary action,
        which may include ban from future Tests / Examinations
      `,
    },
  ],
})

const isDeclarationChecked = shallowRef(false)

const currentPage = reactive({
  index: 0,
  data: instructions.pages[0]!,
})

function changeCurrentPage(newIndex: number) {
  const data = instructions.pages[newIndex]
  if (!data) return

  currentPage.index = newIndex
  currentPage.data = data
}

async function parseAndRenderInstructions() {
  try {
    const {
      pdfCropperData,
      testName = 'Mock Test',
      testDuration = 180,
    } = props.jsonData

    const templateData = utilGetParsedInstructionsDataForTemplate(
      pdfCropperData,
      props.instructionsData,
      testName,
      testDuration,
    )
    for (const page of instructions.pages) {
      if (!page.body.trim()) continue
      let body = page.body + '\n\n'
      for (const [iconName, iconUrl] of Object.entries(templateData.icons)) {
        let iconTitle = ''
        if (iconName in QUESTION_STATUS_FULL_LABELS) {
          iconTitle = QUESTION_STATUS_FULL_LABELS[iconName as keyof typeof QUESTION_STATUS_FULL_LABELS]
        }
        else {
          iconTitle = utilKeyToLabel(iconName)
        }
        body += `[${iconName}]: ${iconUrl}`
        if (iconTitle)
          body += ` "${iconTitle}"`
        body += '\n'
      }

      page.parsedBody = await utilGetCbtInstructionsContent(body, templateData)
    }
  }
  catch (err) {
    useErrorToast('Error Parsing and Rendering Test Instructions Data:', err)
  }
}

onBeforeMount(() => parseAndRenderInstructions())
</script>

<template>
  <ClientOnly>
    <div>
      <div
        class="px-2.5 text-lg font-bold py-2 h-10 sticky top-0 z-10
          secondary-theme text-zinc-500!"
      >
        {{ currentPage.data.title }}
      </div>

      <div
        v-for="(instruction, index) in instructions.pages"
        v-show="currentPage.index === index"
        :key="index"
        class="overflow-y-auto max-h-[calc(100vh-10rem)]"
      >
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="max-w-none mt-4 mb-10"
          data-cbt-instructions
          v-html="instruction.parsedBody"
        />
      </div>

      <div
        v-if="!isForCbtInterfaceDialog"
        class="px-5 pt-1 pb-4 flex flex-col justify-end h-30 z-10
          border-t border-gray-400"
      >
        <div
          v-show="currentPage.data.footer.trim()"
          class="flex gap-2 text-xs mb-2.5"
        >
          <input
            id="instructions-panel-declaration"
            v-model="isDeclarationChecked"
            type="checkbox"
          >
          <label
            for="instructions-panel-declaration"
            class="cursor-pointer"
          >
            {{ currentPage.data.footer }}
          </label>
        </div>
        <div class="grid grid-cols-3">
          <BaseButton
            v-show="currentPage.index > 0"
            class="mr-auto col-start-1 gap-0.5 h-10 px-5 rounded-none
              primary-theme-btn-hover bg-white border border-slate-400
              transition delay-30 duration-100 ease-in-out"
            label="Previous"
            label-class="text-[0.95rem]"
            icon-name="material-symbols:arrow-back-ios-new"
            icon-size="1.1rem"
            @click="changeCurrentPage(currentPage.index - 1)"
          />
          <BaseButton
            v-show="(currentPage.index + 1) >= instructions.pages.length"
            class="mx-auto col-start-2 h-10 px-5 rounded-none primary-theme-btn
              border border-slate-400 transition delay-30 duration-100 ease-in-out"
            label="I am ready to begin"
            label-class="text-xs"
            :disabled="!isDeclarationChecked"
            @click="emit('startTest')"
          />
          <BaseButton
            v-show="(currentPage.index + 1) < instructions.pages.length"
            class="ml-auto col-start-3 gap-0.5 flex-row-reverse h-10.5 px-5
              primary-theme-btn-hover bg-whie border border-slate-400
              rounded-none transition delay-30 duration-100 ease-in-out"
            label="Next"
            label-class="text-[0.95rem]"
            icon-name="material-symbols:arrow-forward-ios"
            icon-size="1.1rem"
            @click="changeCurrentPage(currentPage.index + 1)"
          />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style>
[data-cbt-instructions] {
  font-family: 'serif';
  font-size: 1rem;
  line-height: 1.4rem;
  color: #000;
  padding: 0 30px;
  background-color: #fff;
}

[data-cbt-instructions] h1,
[data-cbt-instructions] h2 {
  color: #000;
  font-weight: 600;
  margin: 0;
}

[data-cbt-instructions] h1 {
  font-size: 1.5rem;
}

[data-cbt-instructions] h2 {
  font-size: 1.15rem;
  margin-top: 25px;
}

/* Lists */
[data-cbt-instructions] ol, [data-cbt-instructions] ul {
  padding-left: 30px;
  margin-top: 10px;
}

[data-cbt-instructions] > ul, [data-cbt-instructions] > ol {
  padding-left: 40px;
}

[data-cbt-instructions] ul:not([class]) {
  padding-left: 20px;
}

:where([data-cbt-instructions] ol) {
  list-style-type: decimal;
}

[data-cbt-instructions] ol li {
  padding: 6px 3px;
  font-size: 1rem;
  margin-bottom: 0;
}

/* Icon list (status legend-style) */
[data-cbt-instructions] ol.iconList {
  list-style: none;
  margin: 10px 0;
  padding: 0;
}

[data-cbt-instructions] table,
[data-cbt-instructions] table thead,
[data-cbt-instructions] table th,
[data-cbt-instructions] table tr,
[data-cbt-instructions] table td,
[data-cbt-instructions] table tbody {
  border-width: 1px;
  padding: 3px 8px;
}

[data-cbt-instructions] table {
  margin-left: auto;
  margin-right: auto;
}

[data-cbt-instructions] .left {
  margin-left: 0px;
  margin-right: auto;
}

[data-cbt-instructions] .center {
  margin-left: auto;
  margin-right: auto;
}

[data-cbt-instructions] .right {
  margin-right: 0px;
  margin-left: auto;
}

[data-cbt-instructions] ol.iconList li {
  display: flex;
  align-items: center;
  font-size: 1rem;
  padding: 7px 0;
}

[data-cbt-instructions] .statusIco {
  width: 20px;
  height: 20px;
  background-position: center;
  display: inline-block;
  vertical-align: middle;
}

[data-cbt-instructions] .iconDesc {
  margin-left: 8px;
}

/* Emphasized / important text */
[data-cbt-instructions] .impText {
  color: red;
  font-weight: 600;
  line-height: 1.4em;
}
</style>
