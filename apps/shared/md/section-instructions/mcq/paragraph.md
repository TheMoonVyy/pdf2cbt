{% layout "./layout.liquid" %}

{%- block sectioninfo %}
- This section contains **{{ totalQuestions | toWords | upcase }} ({{ totalQuestions | zeroPad: 2 }})** paragraph based questions.
{%- endblock %}