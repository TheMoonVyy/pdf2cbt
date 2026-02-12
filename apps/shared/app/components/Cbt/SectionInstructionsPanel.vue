<script lang="ts" setup>
defineProps<{
  instructions: CbtMakerInternalSectionInstructionsData['instructions']
  templateData: CbtInstructionsTemplateSectionData
}>()
</script>

<template>
  <ClientOnly>
    <div
      class="text-black bg-white max-w-fit px-2 pt-1 pb-3 border-black border-2"
      data-cbt-section-instructions
      v-html="// eslint-disable-line vue/no-v-html
        useGetCbtSectionsInstructionsContent(instructions, templateData)"
    />
  </ClientOnly>
</template>

<style>
[data-cbt-section-instructions] {
  font-family: 'Arial';
  font-size: 1.1rem;
  line-height: 1.7rem;
  color: #000;
  background-color: #fff;
}

[data-cbt-section-instructions] h1,
[data-cbt-section-instructions] h2 {
  color: #000;
  font-weight: 600;
  margin: 0;
}

[data-cbt-section-instructions] h1 {
  font-size: 1.5rem;
  margin-top: 0.3rem;
}

[data-cbt-section-instructions] h2 {
  font-size: 1.1rem;
  margin-top: 0.3rem;
}

[data-cbt-section-instructions] td {
  vertical-align: baseline ;
}

/* Lists */
[data-cbt-section-instructions] > ol, [data-cbt-section-instructions] > ul {
  padding-left: 1.1rem;
  margin-top: 10px;
}

:where([data-cbt-section-instructions] ol) {
  list-style-type: decimal;
}

:where([data-cbt-section-instructions] > ul) {
  list-style-type: disc;
}

[data-cbt-section-instructions] > ul > li {
  padding-left: 0.7rem;
}

[data-cbt-section-instructions] table:not(.no-border),
[data-cbt-section-instructions] table:not(.no-border) > * {
  border-width: 1px;
}

[data-cbt-section-instructions] table,
[data-cbt-section-instructions] table > * {
  padding: 0.25rem 0.5rem;
}

[data-cbt-section-instructions] .left {
  margin-left: 0px;
  margin-right: auto;
}

[data-cbt-section-instructions] .center {
  margin-left: auto;
  margin-right: auto;
}

[data-cbt-section-instructions] .right {
  margin-right: 0px;
  margin-left: auto;
}
</style>
