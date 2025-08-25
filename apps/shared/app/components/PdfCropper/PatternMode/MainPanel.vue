<script setup lang="ts">
const model = ref<PatternMode>({
  subjects: [
    {
      name: 'Physics',
      question_pattern: { pattern: 'Q', is_regex: false, is_case_sensitive: false },
      search_area: { page_idx: 0, rect: [0, 0, 100, 100] },
    },
  ],
})

const { r$, form } = usePatternModeFormStore()

const errors = ref<Record<string, any>>({})

function addSubject() {
  model.value.subjects.push({
    name: 'New Subject',
    question_pattern: { pattern: '', is_regex: false, is_case_sensitive: false },
    search_area: { page_idx: 0, rect: [0, 0, 100, 100] },
  })
}

function removeSubject(index: number) {
  model.value.subjects.splice(index, 1)
}

function onSubmit() {
  const result = patternModeSchema.safeParse(model.value)
  if (!result.success) {
    errors.value = result.error.flatten().fieldErrors
  }
  else {
    errors.value = {}
    console.log(result.data)
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <UiAccordion
      type="multiple"
      class="w-full"
    >
      <UiAccordionItem
        v-for="(subject, idx) in model.subjects"
        :key="idx"
        :value="`subject-${idx}`"
      >
        <UiAccordionTrigger>{{ subject.name || 'New Subject' }}</UiAccordionTrigger>
        <UiAccordionContent>
          <PdfCropperPatternModeSubject v-model="model.subjects[idx]" />
          <UiButton
            type="button"
            variant="destructive"
            @click="removeSubject(idx)"
          >
            Remove Subject
          </UiButton>
        </UiAccordionContent>
      </UiAccordionItem>
    </UiAccordion>

    <UiButton
      type="button"
      @click="addSubject"
    >
      Add Subject
    </UiButton>
    <UiButton type="submit">
      Save
    </UiButton>
    <p
      v-if="errors.subjects"
      class="text-red-500 text-sm"
    >
      {{ errors.subjects }}
    </p>
  </form>
</template>
