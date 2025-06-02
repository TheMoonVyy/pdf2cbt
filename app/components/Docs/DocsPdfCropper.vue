<template>
  <div>
    <div class="border border-green-500 rounded-2xl p-4 text-center">
      <h2 class="text-xl font-semibold text-green-500">
        This page/tool is used to define test questions and their locations in the PDF.
      </h2>
      <h3 class="text-lg font-semibold my-4">
        You can watch
        <NuxtLink
          :to="pdfCropperVideoLink"
          class="underline text-green-400"
          target="_blank"
        >this video</NuxtLink>
        to learn how to use this page/tool.
      </h3>
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
                  <li>It allows you to crop specific areas of the PDF that correspond to questions and assign question details to them (i.e. subject, section, question type, marking scheme etc).</li>
                  <li>
                    The <strong>output</strong> from this tool is <strong>essential input for </strong>
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
                  <li>Output of this page/tool is essential for the CBT Interface to display and manage the questions.</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel value="2">
          <AccordionHeader
            class="text-xl"
          >
            <span class="mx-auto">About things on the left panel</span>
          </AccordionHeader>
          <AccordionContent>
            <div class="flex flex-col gap-2 text-left leading-[2.1rem]">
              <div>
                <strong>Current Mode:</strong>
                <ul class="list-disc ml-6">
                  <li>
                    <strong>Crop:</strong> In this mode, you can crop areas of the PDF that contain questions.<br>
                    Two cropping methods, <strong>Line Mode</strong> and <strong>Box Mode</strong> are available for you to choose.
                  </li>
                  <li>
                    <strong>Edit:</strong>
                    Allows you to modify previously cropped regions, you can update either by repositioning or resizing their coordinates, or by updating their question details.<br>
                    <strong>Note:</strong> If you edit a question's subject/section/question-number and there already exists such question then this new one will be merged to it.
                  </li>
                </ul>
              </div>
              <div>
                <strong>Cropper Mode:</strong>
                <ul class="list-disc ml-6">
                  <li>
                    <strong>Line Mode:</strong> Ideal for PDFs with consistent layouts. Allows you to define vertical and horizontal lines to crop questions.
                    <ul class="list-disc ml-6">
                      <li><strong>How it works:</strong> You set the boundaries in the following order: left, right, top, and bottom. After cropping one region, you can continue cropping the next ones using the same left and right boundaries by default. You can skip a region while setting the bottom boundary by right-clicking and selecting <strong>Skip Next Line</strong>, or by holding the <strong>SHIFT key</strong>.</li>
                    </ul>
                  </li>
                  <li><strong>Box Mode:</strong> Works like cropping an image. Simply draw a box around the question to crop it.</li>
                </ul>
              </div>
              <div>
                <strong>Zoom:</strong>
                Adjusts the zoom level of the PDF Viewer.
              </div>
              <div>
                <strong>Page Number:</strong>
                Current Page Number of PDF, you can navigate to any page using this.
              </div>
              <div>
                <strong>Question Details:</strong> See "Question Details" below for info of this.<br>
              </div>
              <div>
                <strong>Crop Coordinates:</strong> Left, Right, Top and Bottom boundaries of the crop area.
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
                <strong>Question Details Header Format Info:</strong><br>
                In <strong>Question Questions [ #q (r) ]</strong> format,<br>
                here q is question number and r is the number of cropped regions/areas/images that are (or will be) in that given question.<br>
                If r = 1, then <strong>(r)</strong> is not shown as that by default implies there are only 1 cropped region (which is what most questions will have).<br>
                So if you see r = 2, then that means that question has (or will have) 2 cropped regions.<br>
              </div>
              <div>
                <strong>Subject Name:</strong>
                <ul class="list-disc ml-6">
                  <li>Enter or Select the subject name from dropdown for the question (e.g. Physics, Chemistry, Mathematics etc).</li>
                  <li>This helps grouping sections by subject.</li>
                </ul>
              </div>
              <div>
                <strong>Section Name:</strong>
                <ul class="list-disc ml-6">
                  <li>Enter or Select the section name from dropdown for that subject (e.g. Physics Section 1, Physics Section 2 etc).</li>
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
                <strong>Marking Scheme:</strong>
                <ul class="list-disc ml-6">
                  <li><strong>Correct:</strong> Marks awarded when the answer is correct.</li>
                  <li><strong>Incorrect:</strong> Marks penalized when the answer is incorrect.</li>
                  <li>
                    <strong>Partial</strong> <strong>(Only for MSQ):</strong> Marks awarded <strong>per correct answer option</strong>.<br>
                    This applies only when your selected options form a subset of the correct answers (i.e., the answer is partially correct).<br>
                    <strong>JEE Advanced</strong> uses the same logic, awarding <strong>+1</strong> per correct option in such cases.<br>
                    For example, if you answered A and B, and the correct answers are A, B, and D,<br>
                    then you'll be awarded 2 x partial marks. If partial marks = +1, then you'll receive 2 x (+1) = +2 marks.
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

        <!-- Context menus and keyboard shortcuts -->
        <AccordionPanel value="5">
          <AccordionHeader
            class="text-xl"
          >
            <span class="mx-auto">Context menus and keyboard shortcuts</span>
          </AccordionHeader>
          <AccordionContent>
            <div class="text-left leading-[2rem]">
              <strong>Context Menu is the menu that pops up when you right click (or long press on touch screens).</strong><br>
              When you will open context menu on the pdf page here, this will show a custom menu options which can be used.<br>
              Options will depend on the mode, and type of action you are currently doing.<br>
              Most options also have keyboard shortcuts for them as well.<br>
              <strong>So here are all options and under what condition they appear and what they do:</strong>
              <ul class="list-disc ml-6 mt-4 [&>li]:mb-3">
                <li>
                  <strong>When on "Crop" mode:</strong>
                  <ul class="list-disc ml-6">
                    <li>
                      <strong>Blur/Unblur Cropped Regions:</strong><br>
                      Toggle Blur for cropped regions, blur strength is decided by <strong>Blur Intensity</strong> settings.
                    </li>
                    <li>
                      <strong>With "Line" Cropper Mode:</strong>
                      <ul class="list-disc ml-6">
                        <li>
                          <strong>Undo Line</strong>
                          ( <Tag
                            value="CTRL + Z"
                            rounded
                            pt:root:class="py-0.5"
                          /> ):<br>
                          Undo the last selection line (boundary) that was set, this menu option doesn't appear if no lines are set.<br>
                          This basically falls back be to previous boundary selection.<br>
                          This will only undo the line, it won't delete/remove the cropped areas (before v1.13.0 undo used to delete it as well).
                        </li>
                        <li>
                          <strong>Skip Next Line</strong>
                          ( <Tag
                            value="hold SHIFT key"
                            rounded
                            pt:root:class="py-0.5"
                          /> ):<br>
                          Signal the tool that you want to skip the next Bottom Line.<br>
                          Effectively to jump over an area your pdf may have that you don't want to be included in the cropped question.<br>
                          <strong>To Cancel this</strong> choose the <strong>Unskip Next Bottom Line</strong> option or just press shift and release it.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>When on "Edit" mode:</strong>
                  <ul class="list-disc ml-6">
                    <li>
                      <strong>Delete</strong>
                      ( <Tag
                        value="Delete key"
                        rounded
                        pt:root:class="py-0.5"
                      /> ):<br>
                      Deletes the selected cropped region. You can't get the deleted region back so use it wisely.
                    </li>
                    <li>
                      <strong>Copy Region</strong>
                      ( <Tag
                        value="CTRL + C"
                        rounded
                        pt:root:class="py-0.5"
                      /> ):<br>
                      Copies the selected region's location (coordinates and page number).<br>
                      You can then Paste it for it to be used in your current question details.<br>
                      Mainly <strong>useful</strong> when you are <strong>cropping Paragraph type question</strong>
                    </li>
                    <li>
                      <strong>Paste Region</strong>
                      ( <Tag
                        value="CTRL + V"
                        rounded
                        pt:root:class="py-0.5"
                      /> ):<br>
                      Pastes the copied region to your current question details.<br>
                      This will create a new cropped region having the location (coordinates and page num) of copied region but having question details of you current question details.<br>
                      Mainly <strong>useful</strong> when you are <strong>cropping Paragraph type question</strong>.
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="6">
          <AccordionHeader
            class="text-xl"
          >
            <span class="mx-auto">Dealing with some special/weird question formats</span>
          </AccordionHeader>
          <AccordionContent>
            <Accordion
              :value="['3']"
              multiple
              lazy
            >
              <AccordionPanel value="1">
                <AccordionHeader class="text-xl">
                  <span class="mx-auto">Image 1</span>
                </AccordionHeader>
                <AccordionContent>
                  <div v-if="!imageLoadingState.isImage1Loaded">
                    Please wait, loading Image 1...
                  </div>
                  <img
                    v-show="imageLoadingState.isImage1Loaded"
                    :src="image1Urls[0]"
                    alt="Image 1"
                    class="max-w-full bg-white"
                    @load="imageLoadingState.isImage1Loaded = true"
                    @error="(e) => {
                      const el = e.target as HTMLImageElement
                      if (el) {
                        el.src = image1Urls[1]!
                        imageLoadingState.isImage1Loaded = true
                      }
                    }"
                  >
                </AccordionContent>
              </AccordionPanel>

              <AccordionPanel value="2">
                <AccordionHeader class="text-xl">
                  <span class="mx-auto">Image 2</span>
                </AccordionHeader>
                <AccordionContent>
                  <div v-if="!imageLoadingState.isImage2Loaded">
                    Please wait, loading Image 2...
                  </div>
                  <img
                    v-show="imageLoadingState.isImage2Loaded"
                    :src="image2Urls[0]"
                    alt="Image 2"
                    class="max-w-full bg-white"
                    @load="imageLoadingState.isImage2Loaded = true"
                    @error="(e) => {
                      const el = e.target as HTMLImageElement
                      if (el) {
                        el.src = image2Urls[1]!
                        imageLoadingState.isImage2Loaded = true
                      }
                    }"
                  >
                </AccordionContent>
              </AccordionPanel>
              <div class="text-left leading-[2rem] pt-5">
                <span class="text-xl font-semibold text-center mx-auto">Edges cases and how to deal with them:</span>
                <ul class="list-decimal ml-6 mt-4 [&>li]:mb-3">
                  <li>
                    <strong>Merging two cropped regions (or areas) into one question:</strong><br>
                    You can merge two cropped regions into one question by given them same <strong>Subject Name</strong>, <strong>Section Name</strong> and <strong>Question Number</strong>.<br>
                    use cases of this is when a question has first part in current page and the other part being in next page.<br>

                    Basically, crop the first part of the question that appears on the current page as usual.<br>
                    Then go to the next page to crop the other part and make sure to use the <strong>same question number</strong> (you'll need to manually decrease it by 1, because it auto-increments after every crop).<br><br>

                    <strong>Example:</strong><br>
                    Say the current question number is 3.<br>
                    You crop the first part on the current page — the question number will be auto-incremented to 4.<br>
                    Now go to the next page and set the question number back to 3, then crop the other part.<br>
                    Both images will now be grouped as one question since they share the same subject, section, and question number.
                  </li>
                  <li>
                    <strong>How to crop questions that are divided by columns using Line Cropper Mode:</strong><br>
                    <strong>Image 1</strong> above is an example of this.<br>
                    We have question 6 to 8 on Left Hand Side and then 9 to 12 on right hand side.<br>
                    Now in Box Cropper Mode, cropping this is not an issue due to its free style nature. But it is in Line Cropper Mode.<br>
                    As Line Cropper works by defining Left, Right Boundaies,
                    you first need to define them on the questions on the left,
                    after we are done cropping from 6 to 8,
                    we need to undo the Left, Right
                    and Top boundaries so that we can set it around the questions on right side.
                    Check <strong>Context Menus</strong> Panel that is given above on how to do it.
                  </li>
                  <li>
                    <strong>How to crop paragraph/table types questions:</strong><br>
                    <strong>Image 2</strong> above is an example of this.<br>
                    A Paragraph/Table type questions typically has a para/table based on which more than 1 questions are given to answer.<br>
                    In <strong>Image 2</strong> you can see we have a table and then Question 13, 14, 15 which are questions based on that table.<br><br>
                    So we have this structure:<br>
                    <span class="text-center mx-auto">
                      ----- Para / Table -----<br>
                      ----- Q 13 -----<br>
                      ----- Q 14 -----<br>
                      ----- Q 15 -----<br>
                    </span><br>
                    We want to convert it into this structure:<br>
                    <span class="text-center mx-auto">
                      ----- Para / Table -----<br>
                      ----- Q 13 -----<br>
                      ----- Para / Table -----<br>
                      ----- Q 14 -----<br>
                      ----- Para / Table -----<br>
                      ----- Q 15 -----<br>
                    </span><br>
                    So we basically want Para/Table part to appear in all 3 questions.<br>
                    Here is how we do it:<br>
                    First Crop the Para giving it question number of 13 in question details.<br>
                    Now Crop Q 13 giving it question number 13 as well, this will merge that para and Q 13 as Question 13.<br>
                    Now switch to <strong>Edit</strong> mode, right click (or long press on touch screens) on that Para/Table cropped region, click on copy to copy its location.<br>
                    Now press the ESC key on keyboard or click on some blank space to unselect any region, and now set question number as 14 in question details, and right click and select paste.<br>
                    This will now make a new region on the same para, making it so that there are two regions on the para (for question 13, and question 14).<br>
                    Now switch back to <strong>Crop</strong> Mode and then crop Q 14 while giving it Question number of 14 (so that para and Q 14 can be merged as Question 14).<br>
                    Repeat the same steps for Q 15 as we did for Q 14, and that's it.
                  </li>
                </ul>
              </div>
            </Accordion>
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
import Image1 from '@/assets/images/pdf-cropper/docs-image-1.svg?no-inline'
import Image2 from '@/assets/images/pdf-cropper/docs-image-2.svg?no-inline'

const { expandedValues = ['3'], multiple = true } = defineProps<{
  expandedValues?: string[]
  multiple?: boolean
}>()

const imageLoadingState = shallowReactive({
  isImage1Loaded: false,
  isImage2Loaded: false,
})

const pdfCropperVideoLink = 'https://www.youtube.com/watch?v=YTzJHUIb8Xs'

const image1Urls = [
  'https://cdn.jsdelivr.net/gh/TheMoonVyy/pdf2cbt/app/assets/images/pdf-cropper/docs-image-1.svg',
  Image1,
]

const image2Urls = [
  'https://cdn.jsdelivr.net/gh/TheMoonVyy/pdf2cbt/app/assets/images/pdf-cropper/docs-image-2.svg',
  Image2,
]

if (!(import.meta.env.VITE_IS_ONLINE)) {
  image1Urls.reverse()
  image2Urls.reverse()
}
</script>
