<template>
  <div>
    <div class="border border-green-500 rounded-2xl p-4 text-center max-w-9/10 xl:max-w-5xl mx-auto">
      <h1 class="text-xl font-semibold text-green-500">
        This page/tool is used to generate the answer key of the test for results to be evaluated.
      </h1>
      <h2 class="text-lg font-semibold my-4">
        Though this is pretty easy to use, but here's a
        <NuxtLink
          to="https://www.youtube.com/watch?v=L0EWtvrZNYE"
          class="underline text-green-400"
          target="_blank"
        >video</NuxtLink>
        on using this tool just in case.
      </h2>
      <UiAccordion
        type="multiple"
        :default-value="expandedValues"
        :unmount-on-hide="false"
        class="w-full"
      >
        <UiAccordionItem value="1">
          <UiAccordionTrigger>
            About This Page/Tool
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="flex flex-col gap-4 text-left leading-8">
              <div>
                <strong>Purpose:</strong>
                <ul class="list-disc ml-6">
                  <li>This tool is designed to generate answer key data for your test.</li>
                  <li>It allows you to load test data from the database or upload a ZIP/JSON file from the PDF Cropper or CBT Interface.</li>
                  <li>The generated answer key is used to evaluate your test results.</li>
                </ul>
              </div>
              <div>
                <strong>Input File:</strong>
                <ul class="list-disc ml-6 mt-1">
                  <li>
                    If test data without an answer key is found in the database,
                    you'll automatically be shown those tests.<br>
                    You can either select one to generate the answer key for,
                    or upload a <strong>ZIP</strong>/<strong>JSON</strong> file which you got from the PDF Cropper.
                  </li>
                </ul>
              </div>

              <div>
                <strong>Output:</strong>
                <ul class="list-disc ml-6 mt-1">
                  <li>
                    The tool generates or includes answer key data in a <strong>JSON</strong> or <strong>ZIP</strong> file.
                  </li>
                  <li>
                    If you're using a <strong>ZIP file from PDF Cropper</strong> as input, you can choose from the following output formats:
                    <ul class="list-disc ml-6 mt-1">
                      <li>
                        <strong>ZIP file:</strong> A ZIP file with the answer key data included.<br>
                        It contains everything from the original input ZIP, so you can safely delete the uploaded file as this replaces it.<br>
                        Usable on the <strong>Test Interface</strong> and <strong>Test Results</strong> pages.
                      </li>
                      <li>
                        <strong>JSON file:</strong> A JSON file containing only the answer key data.<br>
                        Usable only on the <strong>Test Results</strong> page.
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </UiAccordionContent>
        </UiAccordionItem>

        <UiAccordionItem value="2">
          <UiAccordionTrigger>
            Info about the table
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="flex flex-col gap-4 text-left leading-8">
              <div>
                <strong>Columns are:</strong>
                <ul class="list-disc ml-6 mt-1">
                  <li>
                    <strong>Q. Num:</strong> The question number as per the question numbering order you selected (default is original order).
                  </li>
                  <li>
                    <strong>Q. Type:</strong> The type of question (e.g., MCQ, MSQ, NAT, MSM).<br>
                    In MCQ, MSQ &amp; MSM types, you will additionally see a bracket with number in it,
                    this is answer options in that question (e.g. 4 or 4x4)
                  </li>
                  <li>
                    <strong>Input Answer:</strong> The input field where you enter the correct answer(s).
                  </li>
                  <li>
                    <strong>Parsed Answer:</strong> The interpreted answer based on your input.
                    <strong>null</strong> indicates missing or invalid answer in input answer field.
                  </li>
                </ul>
              </div>
            </div>
          </UiAccordionContent>
        </UiAccordionItem>

        <UiAccordionItem value="3">
          <UiAccordionTrigger>
            Input Answer formats
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="text-left leading-8">
              The following are the formats for how you should enter answers in the input field:<br>
              (Note: upper case or lower case mean the same for alphabets,
              i.e. the input answer field is case-insensitive)
              <ul class="list-disc ml-6">
                <li>
                  <strong>MCQ question type:</strong>
                  <ul class="list-disc ml-6">
                    <li>
                      Say the correct answer is Option C,
                      then you can enter <strong>C</strong>,
                      or its corresponding number, which is 3 (A = 1, B = 2...).
                    </li>
                    <li>
                      <strong>(OR logic)</strong>
                      Say the correct answer is <strong>Option C or D</strong>,
                      then enter <strong>CD</strong> (or 34).
                    </li>
                    <li>Any other characters will be filtered/ignored.</li>
                  </ul>
                </li>
                <li>
                  <strong>MSQ question type:</strong>
                  <ul class="list-disc ml-6">
                    <li>
                      Say the correct answers are <strong>Options A, B, and D</strong>,
                      then enter <strong>ABD</strong> (or 124).
                    </li>
                    <li>Any other characters will be filtered/ignored.</li>
                  </ul>
                </li>
                <li>
                  <strong>NAT question type:</strong>
                  <ul class="list-disc ml-6">
                    <li>
                      You can enter the number directly; decimals are also supported.<br>
                      (Note: you can't use decimals without a leading integer,
                      for example, <strong>.5</strong> is invalid; use <strong>0.5</strong> instead.)
                    </li>
                    <li>
                      <strong>(OR logic)</strong>
                      If the correct answer is <strong>5 or -5 or 10</strong>,
                      use the <strong>or</strong> keyword: <strong>5 or -5 or 10</strong>.
                    </li>
                    <li>
                      <strong>(Number Range)</strong>
                      If the correct answer is <strong>5 to 10</strong>,
                      use the <strong>to</strong> keyword: <strong>5 to 10</strong>.<br>
                      (Note: both 5 and 10 are inclusive. In math terms, it's the interval [5, 10].)
                    </li>
                    <li>
                      You can combine both OR logic and Range logic,
                      for example: <strong>5 to 10 or -10 to -5</strong>.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>MSM question type:</strong><br>
                  Consider the following as the correct answers to an MSM question:
                  <CbtResultsQuestionPanelMsmQuestionTypeDiv
                    :question-data="dummyQuestionData"
                    is-use-default-ui-settings
                    :font-size-factor="0.7"
                    class="max-w-sm my-2 gap-1.5!"
                  />
                  The correct input answer for the above is exactly:
                  <ul class="list-disc ml-6">
                    <li>
                      <strong>A-PQT, B-QSU, C-P, D-PQRSTU</strong>.
                    </li>
                    <li>
                      As you can see, with respect to "-",
                      the left side is the row and the right side represents the columns,
                      each row separated by a comma.
                    </li>
                    <li>
                      You can also use the corresponding numbers instead of alphabets.<br>
                      For example, the above can also be entered as:
                      <strong>1-125, 2-246, 3-1, 4-123456</strong>.<br>
                      You are free to mix alphabets and numbers.
                      For example, for the 1st row:
                      <strong>A-125</strong> or <strong>A-P25</strong> or <strong>1-PQ5</strong>, etc.
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            <div class="text-left leading-8 mt-3">
              <strong>Special keywords as answers:</strong><br>
              <strong>DROPPED</strong> and <strong>BONUS</strong> are
              two special keywords you can enter as the answer in the input field.<br>
              Since they don't have any official definition, we use our own, which is as follows:
              <ul class="list-disc ml-6">
                <li>
                  <strong>DROPPED</strong>: Full marks are awarded for this question,
                  regardless of whether you attempted it in the test or not.
                </li>
                <li>
                  <strong>BONUS</strong>: Full marks are awarded for this question
                  only if you attempted it in the test.
                </li>
              </ul>
            </div>
          </UiAccordionContent>
        </UiAccordionItem>

        <UiAccordionItem value="4">
          <UiAccordionTrigger>
            Steps for Generating Answer Key
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="text-left leading-8">
              <ul class="list-decimal ml-6 [&>li]:mb-3">
                <li>
                  <strong>Load Test Data:</strong><br>
                  Load test data from the database (if shown) or upload a ZIP/JSON file containing test data.
                </li>
                <li>
                  <strong>Enter Correct Answers:</strong><br>
                  Enter correct answers in the input answer field, navigate through all questions until none of the answer is missing or invalid.
                </li>
                <li>
                  <strong>Generate Output:</strong><br>
                  When all answers are valid, you click on the "Generate Answer Key" button to create the output file.
                </li>
                <li>
                  <strong>Download Output:</strong><br>
                  Download the generated file from one of the formats available to you.
                </li>
              </ul>
            </div>
          </UiAccordionContent>
        </UiAccordionItem>
      </UiAccordion>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { expandedValues = ['3'] } = defineProps<{
  expandedValues?: string[]
}>()

const dummyAnswer = {
  1: [1, 2, 5],
  2: [2, 4, 6],
  3: [1],
  4: [1, 2, 3, 4, 5, 6],
}

const dummyQuestionData: TestResultQuestionData = {
  queId: 1,
  oriQueId: 1,
  secQueId: 1,
  subject: 'Dummy',
  section: 'Dummy',
  status: 'answered',
  timeSpent: 10,
  marks: { cm: 2, im: -1 },
  pdfData: [],
  type: 'msm',
  answerOptions: '4x6',
  answer: dummyAnswer,
  result: {
    status: 'correct',
    correctAnswer: dummyAnswer,
    marks: 8,
    accuracyNumerator: 1,
  },
}
</script>
