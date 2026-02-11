<template>
  <div class="text-left leading-8">
    <p>
      Sort Subjects/Sections allows you to reorder the subjects and sections
      in your test according to your preferred order.
    </p>
    <p>
      This is particularly useful when your source PDF has questions in one order
      (e.g., Physics, Chemistry, Maths), but you need them in a different order
      for your test (e.g., Maths, Physics, Chemistry).
    </p>
    <ul class="list-disc ml-6 [&>li]:mt-3">
      <li>
        <strong>Sort Subjects Panel (Left):</strong><br>
        Displays all subjects in your test. To sort subjects:
        <ul class="list-disc pl-6 mt-2">
          <li>Click on a subject to select it (it will be highlighted).</li>
          <li>
            Use the <strong>arrow buttons</strong> to move the subject up or down.
          </li>
          <li>
            Selecting a subject also displays its sections in the right panel.
          </li>
        </ul>
      </li>
      <li>
        <strong>Sort Sections Panel (Right):</strong><br>
        Displays sections for the selected subject. To sort sections:
        <ul class="list-disc pl-6 mt-2">
          <li>First, <strong>select a subject</strong> from the left panel.</li>
          <li>Then click on a section to select it.</li>
          <li>
            Use the <strong>arrow buttons</strong> to move the section up or down within that subject.
          </li>
        </ul>
      </li>
      <li>
        <strong>Applying Changes:</strong><br>
        Once you've reordered subjects and/or sections to your satisfaction,
        click on <strong>Apply Changes & Next</strong> to save the new order.<br>
        The button is only enabled when changes have been made.
      </li>
      <li>
        <strong>No Changes Made:</strong><br>
        If you don't need to reorder anything, you can skip this step
        by clicking on <strong>Next Step</strong>.
      </li>
    </ul>
  </div>
</template>
