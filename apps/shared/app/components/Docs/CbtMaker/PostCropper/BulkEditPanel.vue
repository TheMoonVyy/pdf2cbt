<template>
  <div class="text-left leading-8">
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
</template>
