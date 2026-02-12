{% layout "./layout.liquid" %}

{%- block sectioninfo %}
- This section contains **{{ totalQuestions | toWords | upcase }} ({{ totalQuestions | zeroPad: 2 }})** Matching List Sets.
{%- endblock %}
{%- block questioninfo %}
- Each Set has **ONE** Multiple Select Question.
- Each Set has **TWO** lists: **List-I** and **List-II**. The codes for the lists have choices {{ answerOptions.rows.chars | joinInEnglish: '(', ')' }} out of which **ONE OR MORE THAN ONE** of these {{ answerOptions.rows.chars | toWords | downcase }} option(s) is(are) correct answer(s).
{%- endblock %}
{%- block eachquestion %}
- For each question, choose the option corresponding to the correct combination.
{%- endblock %}