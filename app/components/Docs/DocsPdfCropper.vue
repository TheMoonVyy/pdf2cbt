<template>
  <div>
    <div class="border border-green-500 rounded-2xl p-4 text-center">
      <h2 class="text-xl font-semibold text-green-500">
        This page/tool is used to define test questions and their locations in the PDF.
      </h2>
      <Accordion
        :value="expandedValues"
        :multiple="multiple"
      >
        <AccordionPanel value="1">
          <AccordionHeader
            class="text-xl"
          >
            <span class="mx-auto">About This Page/Tool</span>
          </AccordionHeader>
          <AccordionContent>
            <div class="flex flex-col gap-4 text-left leading-[2rem]">
              <div>
                <strong>Purpose:</strong>
                <ul class="list-disc ml-6">
                  <li>This tool is designed to help you define test questions and their locations in a PDF.</li>
                  <li>It allows you to crop specific areas of the PDF that correspond to questions and assign question details (metadata) to them (i.e. subject, section, question type, marking scheme etc).</li>
                  <li>
                    The <strong>output</strong> from this tool is essential <strong>input for </strong>
                    <NuxtLink
                      to="/cbt/interface"
                      class="underline text-green-400"
                      target="_blank"
                    >CBT Interface</NuxtLink>.
                  </li>
                </ul>
              </div>
              <div>
                <strong>Input File:</strong>
                <ul class="list-disc ml-6">
                  <li>You need a <strong>PDF file</strong> containing the questions you want to give mock test for.</li>
                </ul>
              </div>
              <div>
                <strong>Output:</strong>
                <ul class="list-disc ml-6">
                  <li>The tool mainly generates a <strong>JSON</strong> file containing the <strong>cropper data</strong> (also known as <strong>test data</strong>).</li>
                  <li>
                    <Tag
                      severity="info"
                      value="Recommended"
                      rounded
                      pt:root:class="py-0.5"
                    />
                    When you choose <strong>ZIP</strong> as output:
                    <ul class="list-disc ml-6">
                      <li>
                        <Tag
                          severity="info"
                          value="Recommended"
                          rounded
                          pt:root:class="py-0.5"
                        />
                        <strong> With Pre Generate Images</strong>: ZIP will contain <strong>JSON and PNG</strong> files.
                      </li>
                      <li><strong>Without Pre Generate Images</strong>: ZIP will contain <strong>JSON and PDF</strong> (the one you upload).</li>
                    </ul>
                  </li>
                  <li>When you choose <strong>JSON</strong> as output, it will just be a JSON file.</li>
                  <li>Output of this page/tool is essential for the CBT Interface to display and manage the questions accurately.</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel value="2">
          <AccordionHeader
            class="text-xl"
          >
            <span class="mx-auto">Settings Info (The left Panel)</span>
          </AccordionHeader>
          <AccordionContent>
            <div class="flex flex-col gap-4 text-left leading-[2rem]">
              <div>
                <strong>Settings:</strong>
                <ul class="list-disc ml-6">
                  <li>
                    <strong>Cropper Mode:</strong>
                    <ul class="list-disc ml-6">
                      <li><strong>Line Mode:</strong> Ideal for PDFs with consistent layouts. Allows you to define vertical and horizontal lines to crop questions.</li>
                      <li><strong>Box Mode:</strong> Works like cropping an image. Draw a box around the question to crop it.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Scale:</strong>
                    Adjusts the zoom level of the PDF for better visibility while cropping.
                  </li>
                </ul>
              </div>
              <div>
                <strong>Current Page Actions:</strong>
                <ul class="list-disc ml-6">
                  <li><strong>Prev Page:</strong> Navigates to the previous page of the PDF. Disabled if the current page has any cropped regions.</li>
                  <li><strong>Next Page:</strong> Navigates to the next page of the PDF.</li>
                  <li><strong>Undo:</strong> Undo the last crop action.</li>
                  <li><strong>Clear All:</strong> Clears all cropped questions on the current page.</li>
                  <li><strong>Skip Next (y2) Coordinate:</strong> (Only for Line Mode) Skips the next vertical (y2) coordinate, useful for jumping over irrelevant parts.</li>
                </ul>
              </div>
              <div>
                <strong>Crop Coordinates:</strong>
                <ul class="list-disc ml-6">
                  <li><strong>X1:</strong> The left boundary of the crop area.</li>
                  <li><strong>Y1:</strong> The top boundary of the crop area.</li>
                  <li><strong>X2:</strong> The right boundary of the crop area.</li>
                  <li><strong>Y2:</strong> The bottom boundary of the crop area.</li>
                  <li><strong>Set Crop:</strong> Set the crop area defined by the coordinates.</li>
                </ul>
              </div>
              <div>
                <strong>Question Details:</strong> See "Question Details" below for info of this.<br>
              </div>
              <div>
                <strong>Generate Output:</strong> After you are done cropping, click on this to generate the output of this tool so that you can use it on CBT Interface.
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>

        <!-- Question Details -->
        <AccordionPanel value="3">
          <AccordionHeader
            class="text-xl"
          >
            <span class="mx-auto">Question Details</span>
          </AccordionHeader>
          <AccordionContent>
            <div class="flex flex-col gap-4 text-left leading-[2rem]">
              <div>
                <strong>Subject Name:</strong>
                <ul class="list-disc ml-6">
                  <li>Enter the subject name for the question (e.g. Physics, Chemistry, Mathematics etc).</li>
                  <li>This helps grouping sections by subject.</li>
                </ul>
              </div>
              <div>
                <strong>Section Name:</strong>
                <ul class="list-disc ml-6">
                  <li>Enter the section name within the subject (e.g. Physics Section 1, Physics Section 2 etc).</li>
                  <li>If your <strong>test format has no concept of sections</strong> like JEE has, for example in COMEDK, BITSAT etc then <strong>leave the section name blank</strong>.</li>
                  <li>
                    <Tag
                      severity="warn"
                      value="IMPORTANT NOTE"
                      rounded
                      pt:root:class="py-0.5"
                    />:
                    If you enter a section name, make sure the section name is unique across all sections even sections of other subjects.<br>
                    Hence it is recommended to use the "SubjectName Section 1" etc format to name it, as Subject name keeps the section unique among sections of other subjects and section number makes it unique among sections in its own subject.
                  </li>
                  <li>This groups questions by section.</li>
                </ul>
              </div>
              <div>
                <strong>Question Type:</strong>
                <ul class="list-disc ml-6">
                  <li><strong>MCQ:</strong> Multiple Choice Question, i.e. single correct option in question.</li>
                  <li><strong>MSQ:</strong> Multiple Select Question, i.e. one or more correct options in question.</li>
                  <li>
                    <strong>NAT:</strong> Numerical Answer Type, i.e. a real number (can be integer or with demicals).
                  </li>
                </ul>
              </div>
              <div>
                <strong>Answer Options:</strong>
                <ul class="list-disc ml-6">
                  <li>Only for MCQ and MSQ, specify the number of answer options (e.g. 4 for A, B, C, D).</li>
                </ul>
              </div>
              <div>
                <strong>Question Number:</strong>
                <ul class="list-disc ml-6">
                  <li>Number of the question, this number has to be unique within that section.</li>
                  <li>
                    <Tag
                      severity="info"
                      value="Recommended"
                      rounded
                      pt:root:class="py-0.5"
                    />
                    It is recommened to enter the same question number as it is in your source pdf,
                    this will help you in identifying which question corresponds to which.<br>
                    If you are wondering about keeping the question numbering format similar to your target exam,
                    for example say for JEE Mains,
                    which has 75 questions they follow the format where question number is continuous (cumulative) across sections
                    (i.e. 1st question is Q No. 1 and 75th question is Q No. 75)
                    but your source has it differently (i.e. they have 1-25, 1-25, 1-25 numbering),
                    then don't worry as changing the numbering format is provided as a setting option in CBT Interface.
                  </li>
                </ul>
              </div>
              <div>
                <strong>Marking Scheme:</strong>
                <ul class="list-disc ml-6">
                  <li><strong>Correct:</strong> Marks awarded when answer is correct.</li>
                  <li>
                    <strong>Incorrect:</strong> Numerical Answer Type, i.e. a real number (can be integer or with demicals).
                  </li>
                  <li>
                    <strong>Partial: </strong>
                    <strong>(Only for MSQ)</strong> Marks awarded <strong>per correct answer option</strong>.<br>
                    This is used only when your answers is a subset of correct answers (case of partially correct).<br>
                    <strong>JEE Advanced uses</strong> the same logic and they use <strong>+1</strong> as partial mark per correct answer option
                    (when case of partially correct).<br>
                    For example say you answered A, B as answers in test and correct answers are A, B, D,
                    then you will be awared 2 x "partial marks" marks, if "partial marks" is +1 then 2 x (+1) = 2 marks awarded.
                  </li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>

        <!-- Steps for Using the PDF Cropper -->
        <AccordionPanel value="4">
          <AccordionHeader
            class="text-xl"
          >
            <span class="mx-auto">Steps for Using the PDF Cropper</span>
          </AccordionHeader>
          <AccordionContent>
            <div class="text-left leading-[2rem]">
              <ul class="list-decimal ml-6 [&>li]:mb-3">
                <li>
                  <strong>Upload the PDF:</strong><br>
                  Upload your PDF file by clicking on <strong>Select a PDF</strong> that is on at the top of the page.<br>
                  Wait for the PDF to load completely.
                </li>
                <li>
                  <strong>Crop Questions:</strong><br>
                  Navigate to the page containing the question you want to crop.<br>
                  Use the cropping tool to define the question area.<br>
                  Fill in the details for the cropped question, such as subject name, section name, question type, and marks.<br>
                  Repeat this process for all questions in the PDF.
                </li>
                <li>
                  <strong>Generate Output:</strong><br>
                  Once all questions are cropped, click on the "Generate Output" button that is at the bottom of the Left Panel (you may need to scroll down for that).<br>
                  A Generate Output Dialog will open, just choose the options/settings you want.<br>
                  Download the generated file.
                </li>
                <li>
                  <strong>Use the Output File:</strong><br>
                  Use the generated file in the Test Interface to give your test (in this case you will have to generate answer key data after the test) or first go to Generate Answer Key page to generate answer key data and then use the file it gives to give the test.
                </li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Accordion from '@/src/volt/Accordion.vue'
import AccordionPanel from '@/src/volt/AccordionPanel.vue'
import AccordionHeader from '@/src/volt/AccordionHeader.vue'
import AccordionContent from '@/src/volt/AccordionContent.vue'
import Tag from '@/src/volt/Tag.vue'

const { expandedValues = ['3'], multiple = true } = defineProps<{
  expandedValues?: string[]
  multiple?: boolean
}>()
</script>
