<template>
  <div
    class="flex flex-col grow min-h-0 py-8 overflow-auto
      dark:bg-surface-900 dark:text-surface-0 border-t-2 border-surface-700"
  >
    <h1 class="text-2xl font-bold text-center text-green-500">
      Turn PDF of Questions into interactive CBT (Computer Based Test)
    </h1>

    <div class="flex flex-col w-full items-center gap-6 mt-10 px-4 max-w-4xl mx-auto text-center">
      <div class="w-full border border-green-500 rounded-2xl p-4">
        <p class="text-lg font-semibold text-left">
          <Icon
            name="material-symbols:rocket-launch"
            size="1.4rem"
            class="text-green-400"
          />
          Features of this project/website:
        </p>
        <ul class="list-disc list-outside mt-2 text-left ml-8">
          <li class="mt-2">
            Turn PDF of Questions into interactive real exam-like CBT and view detailed analysis of your test.
          </li>
          <li class="mt-2">
            <strong>100% free with no ads, no login, no email/phone needed.</strong><br>
            You just need a PDF with questions and a modern browser (any version from 2023 or later is recommended)<br>
            Recommended to use Firefox or Chromium based browsers (chrome, brave, ms edge etc).
          </li>
          <li class="mt-2">
            <strong>None of your data is sent to server</strong>. All Data is stored and accessed from your own storage (using browser's IndexedDB API).<br>
            The use of server is to only send the webpage to your browser via internet.<br>
            You are free to use fully offline version by following the instructions on project's
            <NuxtLink
              to="https://github.com/TheMoonVyy/pdf2cbt"
              class="underline text-green-400"
              target="_blank"
            >
              Github Repo
            </NuxtLink>.<br>
            Though it is recommended to use the website version as it is always up-to-date with any updates/features.
          </li>
          <li class="mt-2">
            Test is auto-saved, so you continue where you left off if your test was interrupted (like due to electricity cut, browser closed etc)
          </li>
        </ul>
      </div>
      <p class="text-lg font-semibold">
        You can follow these steps on how to use this project/website:
      </p>
      <!-- Step 1 -->
      <div class="w-full border border-green-500 rounded-2xl p-4">
        <h2 class="text-xl font-semibold text-green-500">
          1. Crop Questions from PDF
        </h2>
        <p class="mt-2 text-left">
          Use the
          <NuxtLink
            to="/pdf-cropper"
            class="underline text-green-400"
            target="_blank"
          >
            PDF Cropper
          </NuxtLink>
          to upload your PDF containing questions and mark each question area along with its details like subject name, section name, and question type (MCQ, MSQ, NAT) etc.
        </p>
        <p class="mt-2 text-left">
          You can choose between <strong>Line mode</strong> and <strong>Box mode</strong> for cropping:
        </p>
        <ul class="list-disc list-inside mt-2 text-left ml-4">
          <li>
            <strong>Line mode</strong> is ideal if your PDF has questions in a consistent layout. It helps reduce repetitive work.
          </li>
          <li>
            <strong>Box mode</strong> works like cropping an image — simply draw a box around the question to crop it.
          </li>
        </ul>
        <p class="mt-2 text-left">
          You can also watch this demo video on how to use it:
          <NuxtLink
            to="https://www.youtube.com/watch?v=JlzG9X_Z1NU"
            class="underline text-green-400"
            target="_blank"
          >
            📺 PDF Cropper Demo Video
          </NuxtLink>
        </p>
        <p class="mt-2 text-left">
          After cropping, click on <strong>Generate Output</strong> to download the cropper data. You can choose to:
        </p>
        <ul class="list-disc list-inside mt-2 text-left ml-4">
          <li>
            Download a <strong>JSON file</strong> containing only the cropper data.
          </li>
          <li>
            Download a <strong>ZIP file</strong> that includes both the original PDF and the JSON cropper data.
          </li>
        </ul>
        <p class="mt-2 text-left">
          This data is essential for the
          <NuxtLink
            to="/cbt/interface"
            class="underline text-green-400"
            target="_blank"
          >
            Test Interface
          </NuxtLink>
          to display and manage the questions accurately.
        </p>
        <p class="mt-3 text-left">
          <strong>NOTE:</strong><br>
          If your PDF has question that is split across two pages, you can merge two cropped images into a single question like this:<br><br>

          When two or more cropped images have the <strong>same question details</strong> (subject, section, and question number), they are treated as part of the <strong>same question</strong>.<br><br>

          Basically, crop the half part of the question that appears on the current page as usual.<br>
          Then go to the next page and make sure to use the <strong>same question number</strong> (you'll need to manually decrease it by 1, because it auto-increments after every crop).<br><br>

          <strong>Example:</strong><br>
          Say the current question number is <code>3</code>.<br>
          You crop the first half on the current page — the question number will be auto-increments to <code>4</code>.<br>
          Now go to the next page and set the question number back to <code>3</code>, then crop the second half.<br>
          Both images will now be grouped as one question since they share the same subject, section, and question number.
        </p>
      </div>
      <!-- After Step 1 -->
      <div class="w-full border border-yellow-400 rounded-2xl p-4">
        <p class="text-left">
          You might be wondering — the PDF cropper only defines the questions and their cropped images. But what about the correct answers for evaluation?
        </p>
        <p class="mt-2 text-left">
          That's where the
          <NuxtLink
            to="/cbt/generate-answer-key"
            class="underline text-green-400"
            target="_blank"
          >
            Generate Answer Key
          </NuxtLink>
          page comes in. It lets you enter the correct answers, which are later used to evaluate your test.
        </p>
      </div>

      <!-- Step 2 -->
      <div class="w-full border border-green-500 rounded-2xl p-4">
        <h2 class="text-xl font-semibold text-green-500">
          2. Generate Answer Key Data and then take the Test or vice versa
        </h2>
        <p class="mt-2 text-left">
          Now, thanks to the flexibility of pdf2cbt, you've got two paths you can choose:
        </p>
        <ul class="list-disc list-inside mt-2 text-left ml-4">
          <li>
            Generate the answer key data <strong>before</strong> taking the test (here's a video if needed:
            <NuxtLink
              to="https://www.youtube.com/watch?v=cC1qvaBqgk0"
              class="underline text-green-400"
              target="_blank"
            >
              📺Generate Answer key before taking the test
            </NuxtLink>
            ):
            <ul class="list-decimal list-outside mt-2 text-left ml-10">
              <li>
                For this path, you will require the file downloaded from
                <NuxtLink
                  to="/pdf-cropper"
                  class="underline text-green-400"
                  target="_blank"
                >
                  PDF Cropper
                </NuxtLink>.
              </li>
              <li class="mt-1">
                Go to <NuxtLink
                  to="/cbt/generate-answer-key"
                  class="underline text-green-400"
                  target="_blank"
                >
                  Generate Answer Key
                </NuxtLink>
                and upload the zip/json file.
                After this the rest of the steps is common with the path 2 as well, so it is mentioned below.
              </li>
            </ul>
          </li>
          <li class="mt-2">
            Or, take the test <strong>first</strong>, then generate the answer key later (here's a video if needed:
            <NuxtLink
              to="https://www.youtube.com/watch?v=OQrqFVrpb0k"
              class="underline text-green-400"
              target="_blank"
            >
              📺Generate Answer key after taking the test
            </NuxtLink>
            ):
            <ul class="list-decimal list-outside mt-2 text-left ml-10">
              <li>
                First take the test, the process for that is mentioned in "Taking the Test" step. After submitting the test you should be on results page.
                As you have not generated answer key data, page will let you know you need to generate it.
              </li>
              <li class="mt-1">
                Go to <NuxtLink
                  to="/cbt/generate-answer-key"
                  class="underline text-green-400"
                  target="_blank"
                >
                  Generate Answer Key
                </NuxtLink>
                and page will inform you that it has found a test which doesn't have answer key data in it.
                Click on the test card (the card with details of test with green border)
                and then click on "Load Selected Test".
              </li>
            </ul>
          </li>
        </ul>

        <p class="mt-4 text-left">
          These steps are common to both method (
          <NuxtLink
            to="https://www.youtube.com/watch?v=L0EWtvrZNYE"
            class="underline text-green-400"
            target="_blank"
          >
            📺Video of generating answer key data
          </NuxtLink>
          ):
        </p>
        <ul class="list-disc list-outside mt-2 text-left ml-8">
          <li>
            Now you should be seeing "Sort Sections Order" & "Questions Numbering Order", these two are optional and you can use it if you want, the end result has no effect as they serve just visual use.
          </li>
          <li class="mt-2">
            Click on "Start", and you should be on the page's table-like layout.<br>
          </li>
          <li class="mt-2">
            Columns are:
            <p>
              <strong>Q. Num</strong> → number of the question.<br>
              <strong>Q. Type</strong> → The type of the question, i.e. MCQ, MSQ, NAT.<br>
              In MCQ & MSQ, the number in the bracket is the total options and hence max options in that question (this is the options you had entered in pdf cropper page).<br>
              <strong>Input Answer</strong> → This is the input area you will be entering correct answers in.<br>
              <strong>Parsed Answer</strong> → This will show the output of answer you have inputted.<br>
              “null” implies nothing.
            </p>
          </li>
          <li class="mt-2">
            You can now enter the correct answers to the questions, and see the "Parsed Answer" to know how it is interpreted.<br>
            You can use a, b, c, d... for mcq/msq or you can also use 1, 2, 3, 4... to denote a, b, c, d... so that you can navigate the process via just the numpad.<br>
            You can press Arrow Up to move to the row above, and Arrow down or enter key to move to next row.<br>
            Only when all answers are valid you can move to next section, keep going till the end and click on "Generate Answer Key Data" to download the file.
          </li>
        </ul>
        <p class="mt-3 text-left">
          <strong>NOTE:</strong><br>
          Althrough you will rarely require it but "dropped" &amp; "bonus" are two special keywords you can use as the answer as well<br><br>
          There is too much confusion on what dropped/bonus really means, hence the project has its own definition, use the one you want based on these condition:<br>
        </p>
        <ul class="list-disc list-outside mt-2 text-left ml-8">
          <li class="mt-2">
            <strong>DROPPED:</strong> Correct marks of that question is given <strong>irrespective</strong> of whether you have answered the question or not.
          </li>
          <li class="mt-2">
            <strong>BONUS:</strong> Correct marks of that question is given <strong>only if</strong> you have answered the question.
          </li>
        </ul>
      </div>

      <!-- Step 3 -->
      <div class="w-full border border-green-500 rounded-2xl p-4">
        <h2 class="text-xl font-semibold text-green-500">
          3. Take the Test
        </h2>
        <p class="mt-2 text-left">
          Now here comes the real star of the project,
          <NuxtLink
            to="/cbt/interface"
            class="underline text-green-400"
            target="_blank"
          >
            CBT Interface
          </NuxtLink>
          . (here's a video of this:
          <NuxtLink
            to="https://www.youtube.com/watch?v=_pLhi6fh6bA"
            class="underline text-green-400"
            target="_blank"
          >
            📺Video of CBT Interface
          </NuxtLink>
          ):
        </p>
        <ul class="list-disc list-outside mt-2 text-left ml-8">
          <li class="mt-2">
            Test Interface requires the zip file (or pdf & json file) of PDF Cropper.<br>
            If you had generated answer key data, and chose "zip" or "json (merged)" as the format, then you can upload this file instead. As the zip or json (merged) is nothing but cropper data with answer key data also in it
          </li>
          <li class="mt-2">
            Do set the settings like time duration of test, test name etc under the "Test Settings" section.
          </li>
          <li class="mt-2">
            Load that zip file (or pdf & json file) in the test interface.
          </li>
          <li class="mt-2">
            After loading file(s), you will have <strong>Sort Sections Order</strong> & <strong>Questions Numbering Order</strong>:<br>
            <ul class="list-disc list-outside mt-2 text-left ml-10">
              <li class="mt-2">
                <strong>Sort Sections Order:</strong> As it speaks for itself, it allows you to sort the order of how the sections appear.
                This is useful if your pdf didn't have subject/sections in the order of how it is given in the real exam.
                For Example, JEE mains has Maths, Physics, Chemistry as the order of subjects, so if your pdf had subjects in PCM order then you can change it to MPC order.
              </li>
              <li class="mt-2">
                <strong>Questions Numbering Order:</strong> Now if you changed the order of sections or you may have questions in your pdf which has a different numbering order as it is in the real exam.
                So for example, your pdf has PCM where each has numbering like 1-25, 1-25, 1-25, now JEE Mains has numbering order of 1-75, yes they are continuing the numbering.<br><br>
                Using this, you can redefine how the question numbers appear as follows:
                <ul class="list-disc list-outside mt-2 text-left ml-10">
                  <li>
                    <strong>Original:</strong> Just uses the original numbering as it is in the uploaded file (cropper data).
                  </li>
                  <li>
                    <strong>Cumulative:</strong> Numbering is started with 1, and keeps continuing across sections.<br>
                    For Example: If you have 75 questions, then numbering will start with 1 and end with 75 (1-75).
                    This is what JEE mains uses.
                  </li>
                  <li>
                    <strong>Section-wise:</strong> Numbering resets to 1 in each section.
                    For Example: If you have 3 sections having 25 questions each, then numbering of questions in each section will be 1-25, 1-25, 1-25.
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li class="mt-2">
            (OPTIONAL) You can optionally customize the UI of Test Interface (here's a video on this
            <NuxtLink
              to="https://www.youtube.com/watch?v=k9is0TJBkgQ"
              class="underline text-green-400"
              target="_blank"
            >
              📺 Customize UI of CBT Interface
            </NuxtLink>
            ).<br>
            This is especially helpful if you are phone, as you can make space for question panel by resizing other parts of UI.<br>
            If you are on phone, take a look at "Customize UI" -> "Main Layout" -> "Main Layout Size", you can change the value to resize the whole layout to fit to your screen.
          </li>
          <li class="mt-2">
            After that click on Prepare Test, this will start preparing question images from the pdf and cropper data.
            After it is done, you can start the test.
          </li>
          <li class="mt-2">
            You can submit the test (if you chose submit btn to be enabled), or the test will automatically be submitted when test time is up.
          </li>
          <li class="mt-2">
            After Test is submitted you should be on the
            <NuxtLink
              to="/cbt/results"
              class="underline text-green-400"
              target="_blank"
            >
              CBT Results
            </NuxtLink>
            page.
          </li>
          <li class="mt-2">
            Now depending on your path:<br>
            <ul class="list-disc list-outside mt-2 text-left ml-10">
              <li class="mt-2">
                If <strong>answer key data is in the file</strong> you uploaded on Test Interface, then results will be generated and shown to you right away!<br>
              </li>
              <li class="mt-1">
                If <strong>answer key data is not in the file</strong>, then results page will let you know that you need answer key data to evaluate your test.
                You can follow what it says, and generate the answer key data. Once you have the answer key data, you can come back to results page to load the data and results will be generated for your test!
              </li>
            </ul>
          </li>
        </ul>
        <p class="mt-3 text-left">
          <strong>NOTE:</strong><br>
          The Profile details part of the Test Interface (the one at top-right corner with profile pic and username) also acts as a secret button, which can also be accessed while you are in the test:<br>
        </p>
        <ul class="list-disc list-outside mt-2 text-left ml-8">
          <li class="mt-2">
            <strong>Click/Tap on it:</strong> Will toggle fullscreen mode.
          </li>
          <li class="mt-2">
            <strong>Long Click/Tap:</strong> Will open up UI Settings which you use to change question images size if they appear big or small to you.
          </li>
        </ul>
      </div>

      <!-- Step 4 -->
      <div class="w-full border border-green-500 rounded-2xl p-4">
        <h2 class="text-xl font-semibold text-green-500">
          4. See Results
        </h2>
        <p class="mt-2 text-left">
          Just straight up take a look at
          <NuxtLink
            to="/cbt/results"
            class="underline text-green-400"
            target="_blank"
          >
            Test Results
          </NuxtLink>
          page.
        </p>
        <p class="text-left mt-2">
          These are the sections the results page has and their features:
        </p>
        <ul class="list-disc list-outside mt-2 text-left ml-8">
          <li class="mt-2">
            <strong>Test Results:</strong> Shows results for your currently selected test. This further has:
            <ul class="list-disc list-outside mt-2 text-left ml-8">
              <li class="mt-2">
                <strong>Summary:</strong> Contains summaries of your test, and interactive charts.
              </li>
              <li class="mt-2">
                <strong>Detailed:</strong> You can view detailed result on your test, this part has questions and summaries in tabular format which you can be filtered, sorted by time spent, colored by result (correct, incorrect, etc) or question status (answered, not answered, etc)
              </li>
            </ul>
          </li>
          <li class="mt-2">
            <strong>My Tests:</strong> Shows all your tests, you can view them again whenever you want. You can also export and import your tests if you need a backup.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
