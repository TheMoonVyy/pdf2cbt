{% layout "../../layout.liquid", questionInfoTypeMsg: "a **POSITIVE NUMERICAL VALUE**" %}

{%- block sectioninfo %}
- This section contains **{{ totalQuestions | toWords | upcase }} ({{ totalQuestions | zeroPad: 2 }})** paragraph-based questions.
{%- endblock %}
