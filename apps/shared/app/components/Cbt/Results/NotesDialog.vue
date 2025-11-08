<template>
  <UiDialog
    v-model:open="showNotesDialog"
    class="min-w-64 sm:min-w-lg lg:min-w-xl"
  >
    <UiDialogContent class="pt-2 gap-2 z-51">
      <UiDialogHeader>
        <UiDialogTitle class="flex ml-0 mr-5">
          <span class="text-xl mx-auto flex items-center">
            Question {{ displayQuestionNumber }} Notes
          </span>
          <div class="flex gap-4 mr-12 sm:gap-6">
            <BaseButton
              class="disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant="outline"
              size="icon"
              title="Delete Note"
              icon-name="material-symbols:delete"
              icon-class="text-red-400"
              icon-size="1.5rem"
              :disabled="!currentNotes"
              @click="deleteCurrentNote"
            />
            <BaseButton
              class="disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant="outline"
              size="icon"
              title="Discard Changes"
              icon-name="material-symbols:device-reset"
              icon-class="text-orange-400"
              icon-size="1.5rem"
              :disabled="disableDiscardButton"
              @click="currentNotes = testNotes[currentQuestionId] || ''"
            />
          </div>
        </UiDialogTitle>
      </UiDialogHeader>
      <UiTabs
        v-model="activeTab"
        class="border-b border-border mt-5"
      >
        <UiTabsList class="grid w-full grid-cols-2 h-11">
          <UiTabsTrigger
            v-for="key in (['view', 'edit'] as const)"
            :key="key"
            :value="key"
            class="cursor-pointer text-lg"
          >
            {{ utilKeyToLabel(key) }}
          </UiTabsTrigger>
        </UiTabsList>

        <UiTabsContent value="view">
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="prose prose-neutral dark:prose-invert dark:text-white prose-a:text-sky-400 max-w-none"
            v-html="compiledNotesHtml"
          />
        </UiTabsContent>
        <UiTabsContent value="edit">
          <UiTextarea
            v-model.trim="currentNotes"
            rows="18"
            :placeholder="placeholderText"
          />
        </UiTabsContent>
      </UiTabs>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
const homePageLink = useRequestURL().origin

const placeholderText = `#### You can write notes for this question here (also supports markdown format).
Here are some examples in markdown:
**Bold text**
*Italic text*
~~Strikethrough~~
- Bullet list item 1
- Bullet list item 2
1. Numbered item 1
2. Numbered item 2

> Blockquote

[Link to homepage](${homePageLink})

---
Feel free to write notes here!`

const showNotesDialog = defineModel<boolean>({ required: true })

const { currentQuestionId, displayQuestionNumber } = defineProps<{
  currentQuestionId: number | string
  displayQuestionNumber: number | string
}>()

const db = useDB()

const currentTestId = useCbtResultsCurrentID()

const testNotes = useCurrentTestNotes()

const activeTab = shallowRef<'edit' | 'view'>('edit')

const currentNotes = shallowRef('')

const md = utilMd()

const compiledNotesHtml = shallowRef('')

const disableDiscardButton = computed(() => {
  const currentSavedNotes = testNotes.value[currentQuestionId]

  if (typeof currentSavedNotes === 'string') {
    return currentSavedNotes === currentNotes.value
  }
  return !currentNotes.value
})

watch(showNotesDialog, async (isShowDialog) => {
  const testId = currentTestId.value
  const currentTestNotes = testNotes.value

  if (isShowDialog) {
    currentNotes.value = currentTestNotes[currentQuestionId] || ''
    activeTab.value = currentNotes.value ? 'view' : 'edit'
  }
  else if (currentTestNotes) {
    const currentSavedNotes = currentTestNotes[currentQuestionId]
    const currentNote = currentNotes.value
    if (typeof currentSavedNotes === 'string') {
      if (currentSavedNotes !== currentNote) {
        db.replaceTestQuestionNotes(testId, currentQuestionId, currentNote)
          .then(() => currentTestNotes![currentQuestionId] = currentNote)
      }
    }
    else if (currentNote) {
      db.replaceTestQuestionNotes(testId, currentQuestionId, currentNote)
        .then(() => currentTestNotes![currentQuestionId] = currentNote)
    }
  }
})

watchEffect(() => {
  if (activeTab.value === 'view') {
    compiledNotesHtml.value = md.render(currentNotes.value || placeholderText)
  }
})

const deleteCurrentNote = () => {
  const testId = currentTestId.value
  const currentSavedNotes = testNotes.value[currentQuestionId]
  if (typeof currentSavedNotes === 'string') {
    db.replaceTestQuestionNotes(testId, currentQuestionId, '')
      .then(() => {
        testNotes.value[currentQuestionId] = ''
        currentNotes.value = ''
      })
  }
  else {
    currentNotes.value = ''
  }
}
</script>

<style>
.prose li::marker {
  color: var(--color-white) !important;
}
.prose p {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
}
.prose hr {
  margin-top: 1em;
  margin-bottom: 1em;
}
</style>
