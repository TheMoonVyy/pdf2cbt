{% layout "./layout.liquid" %}

{%- block sectioninfo %}
- This section contains **{{ totalQuestions | toWords | upcase }} ({{ totalQuestions | zeroPad: 2 }})** Matching List Sets.
{%- endblock %}
{%- block questioninfo %}
- Each Set has **ONE** Multiple Choice Question.
- Each Set has **TWO** lists: **List-I** and **List-II**. The codes for the lists have choices  {{ answerOptions.rows.chars | joinInEnglish: '(', ')' }} out of which **ONLY ONE** is correct
{%- endblock %}
{%- block eachquestion %}
- For each question, choose the option corresponding to the correct combination.
{%- endblock %}