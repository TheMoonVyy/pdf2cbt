{% layout "./layout.liquid" %}

{%- block sectioninfo %}
- This section contains **{{ totalQuestions | toWords | upcase }} ({{ totalQuestions | zeroPad: 2 }})** table based questions of matching type.
{%- endblock %}