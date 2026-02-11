{% layout "../../layout.liquid", questionInfoTypeMsg: "a **SINGLE DIGIT INTEGER** ranging from 0 to 9, both inclusive", typeMsg: "integer" %}

{%- block sectioninfo %}
- This section contains **{{ totalQuestions | toWords | upcase }} ({{ totalQuestions | zeroPad: 2 }})** paragraph-based questions.
{%- endblock %}