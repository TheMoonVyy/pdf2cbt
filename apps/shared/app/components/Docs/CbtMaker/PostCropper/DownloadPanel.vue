<template>
  <UiAccordion
    type="multiple"
    :default-value="expandedValues"
    :unmount-on-hide="false"
    class="w-full"
  >
    <UiAccordionItem value="1">
      <UiAccordionTrigger>
        Multiple Downloads
      </UiAccordionTrigger>
      <UiAccordionContent>
        <span class="text-center text-wrap text-gray-500 dark:text-gray-300 mt-4">
          After downloading once,
          you can always change the options above to generate &amp; download again with those options
        </span>
      </UiAccordionContent>
    </UiAccordionItem>
    <UiAccordionItem value="2">
      <UiAccordionTrigger>
        Important NOTE
      </UiAccordionTrigger>
      <UiAccordionContent>
        <p class="text-center text-wrap text-gray-500 dark:text-gray-300 my-5">
          If you want to later on use the zip file via <strong>"zip from url"</strong> feature
          and you are keeping the <strong>zip files</strong> in your <strong>github public repository</strong>
          then your <strong>zip file size should not exceed 20MB</strong> for "zip from url" to work.<br>
          (This is a limitation imposed by jsDelivr,
          which is the provider from where your zip file will be loaded after the website internally
          converts github url to jsDelivr url).
        </p>
      </UiAccordionContent>
    </UiAccordionItem>
  </UiAccordion>
</template>

<script lang="ts" setup>
const {
  expandedValues = [],
} = defineProps<{
  expandedValues?: string[]
}>()
</script>
