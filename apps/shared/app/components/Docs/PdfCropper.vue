<template>
  <div>
    <div class="border border-green-500 rounded-2xl p-4 text-center text-foreground bg-background">
      <h1 class="text-xl font-semibold text-green-500">
        This page/tool is used to define test questions and their locations in the PDF.
      </h1>
      <h2 class="text-lg font-semibold my-4">
        You can watch
        <NuxtLink
          :to="pdfCropperVideoLink"
          class="underline text-green-400"
          target="_blank"
        >this video</NuxtLink>
        to learn how to use this page/tool.
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
            <div class="flex flex-col gap-4 text-left leading-[2rem]">
              <div>
                <strong>Purpose:</strong>
                <ul class="list-disc ml-6">
                  <li>
                    This tool is designed to help you define test questions and their locations within a PDF.
                  </li>
                  <li>
                    It allows you to crop specific areas of the PDF that correspond to questions
                    and assign details to them (e.g. subject, section, question type, marking scheme, etc.).
                  </li>
                  <li>
                    The <strong>output</strong> from this tool is an <strong>essential input for </strong>
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
                  <li>
                    You need a <strong>PDF file </strong>
                    containing the questions you want to usefor the mock test.
                  </li>
                </ul>
              </div>
              <div>
                <strong>Output:</strong>
                <ul class="list-disc ml-6">
                  <li>
                    The tool mainly generates a <strong>JSON</strong> file containing the
                    <strong>cropper data</strong> (also referred to as <strong>test data</strong>).
                  </li>
                  <li>
                    <UiBadge variant="info">
                      Recommended
                    </UiBadge>
                    When you choose <strong>ZIP</strong> as the output:
                    <ul class="list-disc ml-6">
                      <li>
                        <UiBadge variant="info">
                          Recommended
                        </UiBadge>
                        <strong> With Pre-generate Images</strong>: ZIP will contain <strong>JSON and PNG</strong> files.
                      </li>
                      <li>
                        <strong>Without Pre-generated Images</strong>:
                        The ZIP will contain <strong>JSON</strong> and the uploaded <strong>PDF</strong>.
                      </li>
                    </ul>
                  </li>
                  <li>
                    If you choose <strong>JSON</strong> as the output,
                    it will include only the JSON file.
                  </li>
                  <li>
                    This output is essential for the CBT Interface to
                    properly display and manage the questions.
                  </li>
                </ul>
              </div>
            </div>
          </UiAccordionContent>
        </UiAccordionItem>

        <UiAccordionItem value="2">
          <UiAccordionTrigger>
            About things on the left panel
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="flex flex-col gap-2 text-left leading-[2.1rem]">
              <div>
                <strong>Current Mode:</strong>
                <ul class="list-disc ml-6">
                  <li>
                    <strong>Crop:</strong> In this mode,
                    you can crop areas of the PDF that contain questions.<br>
                    Two cropping methods,
                    <strong>Line Mode</strong> and <strong>Box Mode</strong> are available for you to choose from.
                  </li>
                  <li>
                    <strong>Edit:</strong>
                    Allows you to modify previously cropped regions.<br>
                    You can update them by repositioning/resizing the crop area,
                    or by changing the question details.<br>
                    <strong>Note:</strong> If you edit a question's subject, section, or number and
                    another question with the same details already exists,
                    then the two will be <strong>merged</strong>.
                  </li>
                </ul>
              </div>
              <div>
                <strong>Cropper Mode:</strong>
                <ul class="list-disc ml-6">
                  <li>
                    <strong>Line Mode:</strong> Ideal for PDFs with consistent layouts.
                    This mode lets you define vertical and horizontal lines to crop questions.
                    <ul class="list-disc ml-6">
                      <li>
                        <strong>How it works:</strong> You set the boundaries in this order:
                        left, right, top, and bottom. After cropping one region,
                        the left and right boundaries are reused by default.
                        You can skip a region when setting the bottom boundary by
                        right-clicking and selecting
                        <strong>Skip Next Bottom Line</strong>,
                        or by holding the <strong>SHIFT key</strong>.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Box Mode:</strong> Works like image cropping.
                    Simply draw a box around the question to define the crop area.
                  </li>
                </ul>
              </div>
              <div>
                <strong>Zoom:</strong>
                Adjusts the zoom level of the PDF viewer.
              </div>
              <div>
                <strong>Page Number:</strong>
                Displays the current page number. You can navigate to any page using this.
              </div>
              <div>
                <strong>Question Details:</strong>
                See the “Question Details” section below for more information.
              </div>
              <div>
                <strong>Crop Coordinates:</strong>
                Displays the left, right, top, and bottom boundaries of the crop area.
              </div>
              <div>
                <strong>Generate Output:</strong>
                Once you're done cropping, click this to generate the tool's output.
                The result can be used directly in the CBT Interface.
              </div>
            </div>
          </UiAccordionContent>
        </UiAccordionItem>

        <!-- Question Details -->
        <UiAccordionItem value="3">
          <UiAccordionTrigger>
            Question Details
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="flex flex-col gap-4 text-left leading-[2rem]">
              <div>
                <strong>Question Details Header Format Info:</strong><br>
                The format <strong>Question Details [ #q (r) ]</strong> means:<br>
                <strong>q</strong> is the question number, and <strong>r</strong> is the number of
                cropped regions/areas/images that are (or will be) assigned to that question.<br>
                If <strong>r = 1</strong>, then <strong>(r)</strong> is not shown,
                as most questions requires only one region.<br>
                If you see <strong>(r = 2)</strong>,
                it means the question has (or will have) 2 cropped regions.
              </div>

              <div>
                <strong>Subject Name:</strong>
                <ul class="list-disc ml-6">
                  <li>
                    Select or enter the subject name for the question
                    (e.g. Physics, Chemistry, Mathematics, etc.).
                  </li>
                  <li>This helps in grouping sections by subject.</li>
                </ul>
              </div>

              <div>
                <strong>Section Name:</strong>
                <ul class="list-disc ml-6">
                  <li>
                    Select or enter the section name for that subject
                    (e.g. Physics Section 1, Physics Section 2, etc.).
                  </li>
                  <li>
                    If your <strong>test format does not use sections</strong>
                    (e.g. COMEDK, BITSAT), then you can <strong>leave this blank</strong>.
                  </li>
                  <li>
                    <UiBadge variant="warn">
                      IMPORTANT NOTE
                    </UiBadge>
                    If you enter a section name, make sure it's unique across all sections,
                    even those in other subjects.<br>
                    It is recommended to follow the <strong>"SubjectName Section SectionNumber"</strong> format (e.g. Physics Section 1) as
                    the subject name keeps it unique across subjects,
                    and the section number ensures uniqueness within the subject.
                  </li>
                  <li>This groups questions by section.</li>
                </ul>
              </div>

              <div>
                <strong>Question Number:</strong>
                <ul class="list-disc ml-6">
                  <li>This number must be unique within a section.</li>
                  <li>
                    <UiBadge variant="info">
                      Recommended
                    </UiBadge>
                    It's recommended to use the same question number as in your source PDF.
                    This helps you map questions easily.<br>
                    If you're wondering about following your target exam's numbering style,
                    for example, in <strong>JEE Main</strong>,
                    the question numbers are continuous across sections (i.e. from Q1 to Q75)
                    but say your source PDF has separate numbering (1-25, 1-25, 1-25) then don't worry as
                    CBT Interface provides an option to reformat how numbering appears during test configuration.
                  </li>
                </ul>
              </div>
              <div>
                <strong>Question Type:</strong>
                <ul class="list-disc ml-6">
                  <li><strong>MCQ:</strong> Multiple Choice Question, only one correct option.</li>
                  <li><strong>MSQ:</strong> Multiple Select Question, one or more correct options.</li>
                  <li><strong>NAT:</strong> Numerical Answer Type, answer is a number (integer or decimal).</li>
                  <li>
                    <strong>MSM:</strong> Multiple Select Matrix,
                    this is a question format used by JEE Advanced uptill 2015.<br>
                    In this format, you have 2 columns say column A and column B,
                    options in column A can match with one or more options of column B.
                    So it basically is one to many (or one) matching.
                    If you look carefully this basically becomes a matrix, where rows options in column A and columns are options in column B.
                  </li>
                </ul>
              </div>
              <div>
                <strong>Answer Options:</strong>
                <ul class="list-disc ml-6">
                  <li>
                    Specifies total answer options for MCQ, MSQ, and MSM question types.<br>
                    For <strong>MCQ</strong> and <strong>MSQ</strong> types,
                    input a number (e.g. 4 for A, B, C, D).<br>
                    For <strong>MSM</strong> type, input total rows (options in column 1)
                    and total columns (options in column 2) in mxn format respectively (e.g. 4x6, which gives A to D as rows and P to U as columns).<br>
                    Also in <strong>MSM</strong> type, for square matrix,
                    while you can use mxn (m = n) format, you can also enter just m (e.g. 4x4 or just 4).
                  </li>
                </ul>
              </div>

              <div>
                <strong>Marking Scheme:</strong>
                <ul class="list-disc ml-6">
                  <li>
                    <strong>Correct:</strong> Marks awarded for a correct answer. For MSM type, this is marks awarded per correct row.
                  </li>
                  <li><strong>Incorrect:</strong> Marks deducted for an incorrect answer. For MSM type, this is marks deducted per incorrect row.</li>
                  <li>
                    <strong>Partial (Only for MSQ):</strong> Marks awarded
                    <strong>per correct option</strong>.<br>
                    This applies when the selected options are a subset of the correct ones
                    (i.e. partially correct).<br>
                    For example, <strong>JEE Advanced</strong> uses this logic, awarding
                    <strong>+1</strong> per correct option.<br>
                    If the correct answers are A, B, and D, and you select A and B,
                    then you'll receive 2 x partial marks.
                    If partial marks = +1, you'll receive <strong>+2</strong>.
                  </li>
                </ul>
              </div>
            </div>
          </UiAccordionContent>
        </UiAccordionItem>

        <!-- Steps for Using the PDF Cropper -->
        <UiAccordionItem value="4">
          <UiAccordionTrigger>
            Steps for Using the PDF Cropper
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="text-left leading-[2rem]">
              <ul class="list-decimal ml-6 [&>li]:mb-3">
                <li>
                  <strong>Upload the PDF:</strong><br>
                  Upload your PDF file by clicking on
                  <strong>Select a PDF</strong> at the top of the page.<br>
                  Wait for the PDF to load completely.
                </li>
                <li>
                  <strong>Crop Questions:</strong><br>
                  Navigate to the page containing the question you want to crop.<br>
                  Use the cropping tool to define the question area.<br>
                  Fill in the details for the cropped question, such as
                  subject name, section name, question type, and marks.<br>
                  Repeat this process for all questions in the PDF.
                </li>
                <li>
                  <strong>Generate Output:</strong><br>
                  Once all questions are cropped, click the <strong>Generate Output</strong>
                  button at the bottom of the Left Panel (you may need to scroll down).<br>
                  A Generate Output dialog will open, choose the options/settings you want.<br>
                  Download the generated file.
                </li>
                <li>
                  <strong>Use the Output File:</strong><br>
                  Use the generated file in the Test Interface to give your test
                  (you will need to generate answer key data after the test),
                  or first go to the Generate Answer Key page to generate the answer key data
                  and then use the file it provides to give the test.
                </li>
              </ul>
            </div>
          </UiAccordionContent>
        </UiAccordionItem>

        <!-- Text Pattern Based Cropper -->
        <UiAccordionItem value="5">
          <UiAccordionTrigger>
            Text Pattern Based Cropper
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="text-center mx-auto leading-[2rem] text-lg">
              Please refer to <NuxtLink
                to="/updates?v=1.27.0"
                class="underline text-green-400"
                target="_blank"
              >release notes</NuxtLink> of text pattern based cropper.
            </div>
          </UiAccordionContent>
        </UiAccordionItem>

        <!-- Bulk Edit -->
        <UiAccordionItem value="6">
          <UiAccordionTrigger>
            Bulk Edit (Includes Optional Questions)
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="text-left leading-[2rem]">
              <p>
                Bulk Edit allows you to set or change data on a group of questions, sections, or subjects.
              </p>
              <p>
                While all fields are self-explanatory on the Bulk Edit dialog itself,
                the following points provide more clarity:
              </p>
              <ul class="list-disc ml-6 [&>li]:mt-3">
                <li>
                  Data fields that will be changed after applying changes are highlighted in green.
                </li>
                <li>
                  When you click on "Load Data" after selecting a group/bulk,
                  the tool fetches existing data fields for the selection.<br>
                  If a data field has the same value across all questions,
                  it will be loaded as the initial value.<br>
                  If even one question has a different value for that field,
                  it will be shown as "No Changes" or left empty.
                </li>
                <li>
                  Changes are applied logically.
                  For example, if your bulk includes both MCQ and NAT questions,
                  and you change the number of answer options to 6,
                  this change will only apply to MCQs.<br>
                  Since NAT questions don't have answer options, that field is ignored for them.
                </li>
                <li>
                  <strong>Optional Questions (JEE Main pre-2025 format)</strong>:<br>
                  You can set sections that contain optional questions via Bulk Edit.<br>
                  First, crop all the questions. Once done, open Bulk Edit.<br>
                  On Bulk Edit, select the section that should have optional questions and load it.<br>
                  Set the <strong>Optional Questions</strong> field
                  to the number of optional questions in that section,
                  for <strong>JEE Mains pre-2025 format</strong> it is <strong>5</strong>.<br>
                  Apply the changes and repeat the same for other relevant sections.
                </li>
                <li>
                  <strong>Swapping Subject/Section:</strong><br>
                  If you want to change the current subject or section name to one that already exists,<br>
                  then the process is similar to how we rename a file.<br>
                  For example:<br>

                  Suppose the current subject is <strong>Chemistry</strong>
                  and the section is <strong>Chemistry Section 2</strong>.<br>
                  You want to change it to <strong>Physics</strong> and <strong>Physics Section 2</strong>,
                  which already exist.<br>
                  Follow these steps:
                  <ul class="list-disc pl-6 mt-2">
                    <li>Select the <strong>Physics Section 2</strong> group and load it.</li>
                    <li>
                      Temporarily rename <strong>Physics</strong> and <strong>Physics Section 2</strong>
                      to something else, say <strong>Temp Subject</strong> and <strong>Temp Section</strong>, then apply the changes.
                    </li>
                    <li>
                      Now load <strong>Chemistry Section 2</strong>.
                      Rename it to <strong>Physics</strong> and <strong>Physics Section 2</strong>, then apply the changes.
                    </li>
                    <li>
                      The goal has been achieved.
                      Now, the section we named <strong>Temp Subject</strong> &amp; <strong>Temp Section</strong>
                      can be renamed to something else.<br>
                      For example, if the goal was swapping,
                      then rename <strong>Temp Subject</strong> &amp; <strong>Temp Section</strong>
                      back to <strong>Chemistry</strong> &amp; <strong>Chemistry Section 2</strong> respectively,
                      and apply the changes.
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </UiAccordionContent>
        </UiAccordionItem>

        <!-- Context menus and keyboard shortcuts -->
        <UiAccordionItem value="7">
          <UiAccordionTrigger>
            Context menus and keyboard shortcuts
          </UiAccordionTrigger>
          <UiAccordionContent>
            <div class="text-left leading-[2rem]">
              <strong>Context Menu is the menu that pops up when you right-click (or long-press on touch screens).</strong><br>
              When you open the context menu on the PDF page here,
              it will show custom menu options you can use.<br>
              Options depend on the current mode and the action you are performing.<br>
              Most options also have keyboard shortcuts.<br>
              <strong>Here are all the options, the conditions under which they appear, and what they do:</strong>
              <ul class="list-disc ml-6 mt-4 [&>li]:mb-3">
                <li>
                  <strong>When in "Crop" mode:</strong>
                  <ul class="list-disc ml-6">
                    <li>
                      <strong>Blur/Unblur Cropped Regions:</strong><br>
                      Toggle blur for cropped regions; blur strength is controlled by the
                      <strong>Blur Intensity</strong> setting.
                    </li>
                    <li>
                      <strong>With "Line" Cropper Mode:</strong>
                      <ul class="list-disc ml-6">
                        <li>
                          <strong>Undo Last Line</strong>
                          ( <UiBadge variant="success">
                            CTRL + Z
                          </UiBadge> ):<br>
                          Undo the last selection line (boundary) set.
                          This reverts to the previous boundary selection.<br>
                          Note: This only undoes the line; it doesn't delete cropped areas
                          (before v1.12.0, undo would delete them as well).
                        </li>
                        <li>
                          <strong>Skip Next Bottom Line</strong>
                          ( <UiBadge variant="success">
                            hold SHIFT
                          </UiBadge> ):<br>
                          Signal the tool to skip the next bottom line.<br>
                          Use this to jump over parts of the PDF
                          you don't want included in the cropped question.<br>
                          <strong>To cancel this,</strong> choose
                          <strong>Unskip Next Bottom Line</strong>
                          or simply press and release Shift key.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>When in "Edit" mode:</strong>
                  <ul class="list-disc ml-6">
                    <li>
                      <strong>Copy Region</strong>
                      ( <UiBadge variant="success">
                        CTRL + C
                      </UiBadge> ):<br>
                      Copies the selected region's location (coordinates and page number).<br>
                      You can then paste it into your current question details.<br>
                      Mainly <strong>useful</strong> when cropping <strong>Paragraph type questions</strong>.
                    </li>
                    <li>
                      <strong>Paste Region</strong>
                      ( <UiBadge variant="success">
                        CTRL + V
                      </UiBadge> ):<br>
                      Pastes the copied region into your current question details.<br>
                      This creates a new cropped region with the copied location
                      but uses the current question details.<br>
                      Mainly <strong>useful</strong> when cropping <strong>Paragraph type questions</strong>.
                    </li>
                    <li>
                      <strong>Delete Region</strong>
                      ( <UiBadge variant="success">
                        Delete key
                      </UiBadge> ):<br>
                      Deletes the selected cropped region.
                      This action is irreversible, so use it carefully.
                    </li>
                    <li>
                      <strong>Delete all on...</strong><br>
                      <strong>Current Page:</strong>Deletes all cropped regions that are on current page.<br>
                      <strong>All Pages</strong>Deletes all cropped regions on all pages (effectively clearing everything).
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </UiAccordionContent>
        </UiAccordionItem>

        <UiAccordionItem value="8">
          <UiAccordionTrigger>
            Dealing with some special/weird question formats
          </UiAccordionTrigger>
          <UiAccordionContent>
            <UiAccordion
              type="multiple"
              :default-value="['3']"
              class="w-full"
            >
              <UiAccordionItem value="1">
                <UiAccordionTrigger>
                  Image 1
                </UiAccordionTrigger>
                <UiAccordionContent>
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
                </UiAccordionContent>
              </UiAccordionItem>

              <UiAccordionItem value="2">
                <UiAccordionTrigger>
                  Image 2
                </UiAccordionTrigger>
                <UiAccordionContent>
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
                </UiAccordionContent>
              </UiAccordionItem>
              <div class="text-left leading-[2rem] pt-5">
                <span class="text-xl font-semibold text-center mx-auto">
                  Edge cases and how to deal with them:
                </span>
                <ul class="list-decimal ml-6 mt-4 [&>li]:mb-3">
                  <li>
                    <strong>Merging two cropped regions (or areas) into one question:</strong><br>
                    You can merge two cropped regions into one question by giving them the same
                    <strong>Subject Name</strong>, <strong>Section Name</strong>,
                    and <strong>Question Number</strong>.<br>
                    This is useful when a question's parts span across multiple pages.<br>
                    Crop the first part on the current page as usual.<br>
                    Then go to the next page to crop the other part and
                    make sure to use the <strong>same question number</strong>
                    (you'll need to manually decrease it by 1,
                    because it auto-increments after every crop).<br><br>
                    <strong>Example:</strong><br>
                    Say the current question number is 3.<br>
                    You crop the first part on the current page,
                    the tool will auto-increment the question number by 1 making it 4.<br>
                    Now go to the next page and set the question number back to 3,
                    then crop the other part.<br>
                    Both images will now be grouped as one question
                    since they share the same subject, section, and question number.
                  </li>
                  <li>
                    <strong>How to crop questions divided by columns using Line Cropper Mode:</strong><br>
                    <strong>Image 1</strong> above is an example.<br>
                    Questions 6 to 8 are on the left side and 9 to 12 on the right side.<br>
                    In Box Cropper Mode, cropping this is easy due to its free-style nature,
                    but it's trickier in Line Cropper Mode.<br>
                    Since Line Cropper works by defining left and right boundaries,
                    you first set them for the questions on the left.<br>
                    After cropping questions 6 to 8, you need to undo the left, right
                    and top boundaries to set new ones around the questions on the right side.<br>
                    Check the <strong>Context Menus</strong> panel above for instructions on how to do this.
                  </li>
                  <li>
                    <strong>How to crop paragraph/table type questions:</strong><br>
                    <strong>Image 2</strong> above shows an example.<br>
                    Paragraph or table type questions usually have a paragraph/table
                    followed by multiple questions based on it.<br>
                    In <strong>Image 2</strong>, you see a table followed by Questions 13, 14, and 15.<br><br>
                    The original structure is:<br>
                    ----- Para / Table -----<br>
                    ----- Q 13 -----<br>
                    ----- Q 14 -----<br>
                    ----- Q 15 -----<br><br>

                    We want to convert it into:<br>

                    ----- Para / Table -----<br>
                    ----- Q 13 -----<br>
                    ----- Para / Table -----<br>
                    ----- Q 14 -----<br>
                    ----- Para / Table -----<br>
                    ----- Q 15 -----<br><br>

                    So we want the Para/Table to appear in each question.<br>
                    Here's how we do it:<br>
                    First, crop the Para and give it question number 13.<br>
                    Then crop Q13, also assigning it question number 13,
                    this merges the Para and Q13 as one question.<br>
                    Switch to <strong>Edit</strong> mode, right-click (or long-press on touch)
                    the Para/Table cropped region, and copy its location.<br>
                    Press ESC or click blank space to unselect, set the question number to 14,
                    then right-click and paste.<br>
                    This creates a new region on the same Para for question 14.<br>
                    Switch back to <strong>Crop</strong> mode,
                    crop Q14 with question number 14 to merge it with the Para.<br>
                    Repeat the same for Q15.<br>
                    That's it!
                  </li>
                </ul>
              </div>
            </UiAccordion>
          </UiAccordionContent>
        </UiAccordionItem>
      </UiAccordion>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Image1 from '#layers/shared/app/assets/images/pdf-cropper/docs-image-1.svg?no-inline'
import Image2 from '#layers/shared/app/assets/images/pdf-cropper/docs-image-2.svg?no-inline'

const { expandedValues = ['3', '5'] } = defineProps<{
  expandedValues?: string[]
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

const _isBuildForWebsite = useRuntimeConfig().public.isBuildForWebsite as string | boolean
const isBuildForWebsite = _isBuildForWebsite !== 'true' && _isBuildForWebsite !== true

if (isBuildForWebsite) {
  image1Urls.reverse()
  image2Urls.reverse()
}
</script>
