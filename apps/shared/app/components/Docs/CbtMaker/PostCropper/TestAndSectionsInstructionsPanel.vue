<template>
  <div class="text-left leading-8">
    <p>
      Test and Section-wise Instructions allow you to configure the instructions
      that candidates see during the test.
    </p>
    <p>
      The panel is divided into two tabs:
    </p>
    <ul class="list-disc ml-6 [&>li]:mt-3">
      <li>
        <strong>Test Instructions:</strong> Instructions shown before the test starts.
      </li>
      <li>
        <strong>Section-wise Instructions:</strong> Instructions shown at the first question
        of each section (especially useful for JEE Advanced format tests).
      </li>
    </ul>

    <h3 class="text-lg font-semibold mt-6 mb-3">
      Test Instructions Tab
    </h3>
    <p>
      Test Instructions are displayed before the test begins. They provide candidates
      with general information about the exam format, marking scheme, and other important details.
    </p>
    <ul class="list-disc ml-6 [&>li]:mt-3">
      <li>
        <strong>Format Selection:</strong><br>
        Choose the test instructions format from the dropdown:
        <ul class="list-disc pl-6 mt-2">
          <li><strong>Default:</strong> Standard test instructions suitable for most exams.</li>
          <li><strong>COMEDK:</strong> Instructions formatted specifically for COMEDK exam format.</li>
        </ul>
      </li>
      <li>
        <strong>Preview:</strong><br>
        A preview of the selected instructions format is shown below the selection dropdown.
        This allows you to verify how the instructions will appear.
      </li>
    </ul>

    <h3 class="text-lg font-semibold mt-6 mb-3">
      Section-wise Instructions Tab
    </h3>
    <p>
      Section-wise Instructions are displayed at the first question of each section.
      They inform candidates about the answer format and marking scheme specific to that section.
      This is commonly used in exams like JEE Advanced.
    </p>
    <ul class="list-disc ml-6 [&>li]:mt-3">
      <li>
        <strong>Section Selection:</strong><br>
        Each section in your test is displayed as a separate card.
        The header shows the section name and its question type
        (e.g., (MCQ) Physics Section 1).
        <p class="mt-2">
          <em>Note: The question type for each section is automatically determined
            from the first question in that section.</em>
        </p>
      </li>
      <li>
        <strong>Instruction Type Selection:</strong><br>
        For each section, select the appropriate instruction type from the dropdown menu.
        The available options are filtered based on the section's question type
        (which is derived from the first question in the section).
      </li>
      <li>
        <strong>No Section Instructions:</strong><br>
        Select "none" if you don't want to show any specific instructions for that section.
      </li>
    </ul>

    <h3 class="text-lg font-semibold mt-6 mb-3">
      Note:
    </h3>
    <ul class="list-disc ml-6 [&>li]:mt-3">
      <li>
        <strong>Changes are auto-saved:</strong> Any selections you make are automatically saved
        and applied when you proceed to the next step.
      </li>
    </ul>
  </div>
</template>
