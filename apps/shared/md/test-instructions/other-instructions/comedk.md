&nbsp;
&nbsp;

|Sl. No. | Name of Sections | No. of Questions | Time |
| :------------: | :----------- | :------------: | :-----------: |
{%- for subject in subjects %}
| {{subject.slNum}} | {{subject.name}} | {{subject.totalQuestions}} | {% if forloop.first %} Total Time of {{testDuration}} Minutes{% else %}^^{% endif %}|
{%- endfor %}
&nbsp;

1. **Please ensure that you are seated at the computer terminal allotted to you. Please check whether your photograph is appearing on the system that you are allotted.**

2. Candidates can attempt any question from **1 to {{totalQuestions}}** at any point of time within the given **{{testDuration}} minutes**.

3. The questions will be displayed on the screen one at a time.

4. Each question will have 4 alternatives, out of which only one will be the correct answer.

5. In order to see all the answer options, for a few questions candidate may have to scroll down for complete view of the options.

6. The test will be made available only in **English language**.

7. The candidates are requested to follow the instructions of the "Invigilator" carefully. If any candidate does not follow the instructions / rules, it would be treated as a case of misconduct / adoption of unfair means and such a candidate would be liable for debarment from appearing for examinations for a period.

8. Please note:
    a) Candidates will not be allowed to "finally submit" unless they have exhausted the actual test time which is **{{testDuration}} minutes**.
    b) Under no circumstances should a candidate click on any of the ‘keyboard keys’ once the exam starts as this will lock the exam.

&nbsp;
&nbsp;

**All The Best!!!** {.text-center}