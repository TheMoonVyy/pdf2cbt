<template>
  <div>
    <div class="border border-green-500 rounded-2xl p-4 text-center max-w-9/10 xl:max-w-5xl mx-auto">
      <h1 class="text-xl font-semibold text-green-500">
        This page/tool is used to generate the answer key of the test for results to be evaluated.
      </h1>
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
                  <li>
                    It allows you to load test data from the
                    database or upload a ZIP/JSON file from the Test Maker or CBT Interface.
                  </li>
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
                    or upload a <strong>ZIP</strong>/<strong>JSON</strong> file which
                    you got from the Test Maker.
                  </li>
                </ul>
              </div>

              <div>
                <strong>Output:</strong>
                <ul class="list-disc ml-6 mt-1">
                  <li>
                    The tool generates or includes answer key data in
                    a <strong>JSON</strong> or <strong>ZIP</strong> file.
                  </li>
                  <li>
                    If you're using a <strong>ZIP file from Test Maker</strong> as input,
                    you can choose from the following output formats:
                    <ul class="list-disc ml-6 mt-1">
                      <li>
                        <strong>ZIP file:</strong> A ZIP file with the answer key data included.<br>
                        It contains everything from the original input ZIP,
                        so you can safely delete the uploaded file as this replaces it.<br>
                        Usable on the <strong>Test Interface</strong> and <strong>Test Results</strong> pages.
                      </li>
                      <li>
                        <strong>JSON file:</strong> A JSON file with the answer key data included.<br>
                        Usable only on the <strong>Test Results</strong> page
                        and <strong>Test Interface</strong> (need to upload PDF along with it).
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
            Answer Input Interface
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="text-left leading-8">
              Each question is displayed in its card.
              The card shows the question number and type at the top.<br>
              The border is red if answer is not valid and
              yellow when answer is valid.<br><br>

              <strong>For MCQ (Multiple Choice Question) questions:</strong><br>
              You'll see a grid of clickable option buttons.
              Click to select/deselect an option.
              Selected options will be highlighted in green.<br>
              If multiple options are correct then
              select all the correct ones,
              answer will be evaluated using OR logic.<br>
              Example: If you select A and B options as correct answers
              then when you choose either A or B option during test,
              it will be correct.<br><br>

              <strong>For MSQ (Multiple Select Question) questions:</strong><br>
              You'll see a grid of clickable option buttons. Click to select/deselect an option.
              Selected options will be highlighted in green.<br><br>

              <strong>For MSM (Multiple Select Matrix) questions:</strong><br>
              You'll see a grid of rows and columns with checkboxes.
              Check the boxes corresponding to your correct answers.<br>
              Answer is valid when at least one checkbox is checked in each row.<br><br>

              <strong>For NAT (Numerical Answer Type) questions:</strong><br>
              <ul class="list-disc ml-6">
                <li>
                  <strong>Single value:</strong> Enter the number directly in the single input field. Decimals are supported (e.g., 0.5, -3.14).
                </li>
                <li>
                  <strong>Range mode:</strong> Click on the range toggle button
                  (icon with letter R on it) to switch to range mode.
                  This should show two input fields separated by "To".
                  Enter minimum and maximum values,
                  both inclusive (mathematically it is the internal [min, max]).<br>
                  Example: If the correct answer is any number from 10 to 20 (inclusive),
                  enter 10 in the first field and 20 in the second field.
                </li>
                <li>
                  <strong>Multiple answers:</strong> Click the "OR" button to add alternative answers.
                  You can combine multiple single values, ranges, or both.<br>
                  Examples:
                  <ul class="list-disc ml-6">
                    <li>
                      If the answer can be 5, 10, or 15:
                      Enter 5, then click OR and enter 10, then click downmost OR and enter 15.
                    </li>
                    <li>
                      If the answer can be 5 OR between 10 and 20:
                      Enter 5 in the first field, click OR,
                      then toggle Range mode of new field and enter 10 and 20.
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            <div class="text-left leading-8 mt-3">
              <strong>Special answers:</strong><br>
              <strong>DROPPED</strong> and <strong>BONUS</strong> are
              two special answers you can use to mark questions.<br>
              Since they don't have any official definition, we use our own, which is as follows:
              <ul class="list-disc ml-6">
                <li>
                  <strong>DROPPED</strong>: Full marks are awarded for this question,
                  regardless of whether you attempted it in the test or not.
                </li>
                <li>
                  <strong>BONUS</strong>: Full marks are awarded for this question
                  only if you attempted (i.e. answered) it in the test.
                </li>
              </ul>
              At the bottom of each question card,
              you'll see "Bonus" and "Dropped" toggle buttons.
              Click to mark the question accordingly (click again to deselect it).
            </div>
          </UiAccordionContent>
        </UiAccordionItem>

        <UiAccordionItem value="3">
          <UiAccordionTrigger>
            Steps for Generating Answer Key
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="text-left leading-8">
              <ul class="list-decimal ml-6 [&>li]:mb-3">
                <li>
                  <strong>Load Test Data:</strong><br>
                  Load test data from the database (if shown) or
                  upload a ZIP/JSON file containing test data.
                </li>
                <li>
                  <strong>Sort Sections Order (Optional):</strong><br>
                  If needed, reorder the sections list.<br>
                  Click "Start" when ready to proceed to answering questions.
                </li>
                <li>
                  <strong>Enter Correct Answers:</strong><br>
                  For each question, select/enter the correct answer.<br>
                  Use the "Bonus" or "Dropped" buttons if applicable.<br>
                  Navigate through sections using the Previous/Next section buttons.
                </li>
                <li>
                  <strong>Generate Output:</strong><br>
                  When all answers are valid,
                  click the "Generate Answer Key" button to create the output file.
                </li>
                <li>
                  <strong>Download Output:</strong><br>
                  Choose your preferred format (ZIP or JSON) and
                  download the generated file.
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
</script>
