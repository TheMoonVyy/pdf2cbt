{% layout "../../layout.liquid", questionInfoTypeMsg: "a **NON-NEGATIVE INTEGER**", typeMsg: "integer" %}

{%- block sectioninfo %}
- This section contains **{{ totalQuestions | toWords | upcase }} ({{ totalQuestions | zeroPad: 2 }})** paragraph based questions.
{%- endblock %}