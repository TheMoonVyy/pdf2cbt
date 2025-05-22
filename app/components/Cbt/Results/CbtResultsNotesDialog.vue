<template>
  <Dialog
    v-model:visible="showNotesDialog"
    modal
    maximizable
    class="min-w-64 sm:min-w-lg lg:min-w-xl"
    header="Notes"
    pt:header:class="py-2"
  >
    <template #header>
      <div class="grow flex justify-between items-center mr-3 sm:mr-5">
        <h3 class="text-xl mx-auto select-none">
          Question {{ displayQuestionNumber }} Notes
        </h3>
        <div class="flex gap-2 sm:gap-4">
          <BaseButton
            variant="text"
            severity="danger"
            rounded
            raised
            title="Delete Note"
            :disabled="!currentNotes"
            @click="deleteCurrentNote"
          >
            <template #icon>
              <Icon
                name="material-symbols:delete"
                class="text-2xl"
              />
            </template>
          </BaseButton>
          <BaseButton
            variant="text"
            severity="warn"
            rounded
            raised
            title="Discard Changes"
            :disabled="disableDiscardButton"
            @click="currentNotes = testNotes?.[currentTestId]?.[currentQuestionId] || ''"
          >
            <template #icon>
              <Icon
                name="material-symbols:device-reset"
                class="text-2xl"
              />
            </template>
          </BaseButton>
        </div>
      </div>
    </template>
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab
          value="view"
          class="py-3!"
        >
          View
        </Tab>
        <Tab
          value="edit"
          class="py-3!"
        >
          Edit
        </Tab>
      </TabList>
      <TabPanels class="px-0!">
        <TabPanel value="view">
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="prose prose-neutral dark:prose-invert dark:text-white prose-a:text-sky-400 max-w-none"
            v-html="compiledNotesHtml"
          />
        </TabPanel>
        <TabPanel value="edit">
          <Textarea
            v-model.trim="currentNotes"
            rows="10"
            auto-resize
            class="w-full dark:bg-neutral-800 dark:text-white"
            :placeholder="placeholderText"
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Dialog>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import Textarea from '@/src/volt/Textarea.vue'
import Tabs from '@/src/volt/Tabs.vue'
import TabList from '@/src/volt/TabList.vue'
import Tab from '@/src/volt/Tab.vue'
import TabPanels from '@/src/volt/TabPanels.vue'
import TabPanel from '@/src/volt/TabPanel.vue'
import { db } from '@/src/db/cbt-db'

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

const currentTestId = useCbtResultsCurrentID()

const activeTab = shallowRef<'edit' | 'view'>('edit')

const currentNotes = shallowRef('')

const testNotes = reactive<{
  [testId: string | number]: { [queId: string | number]: string } | null
}>({ 0: {} })

const md = MarkdownIt({
  breaks: true,
  linkify: true,
  typographer: true,
})

const compiledNotesHtml = shallowRef('')

const disableDiscardButton = computed(() => {
  const testId = currentTestId.value
  const currentSavedNotes = testNotes[testId]?.[currentQuestionId]

  if (typeof currentSavedNotes === 'string') {
    if (currentSavedNotes === currentNotes.value) {
      return true
    }
    return false
  }
  return !currentNotes.value
})

watch(showNotesDialog, async (isShowDialog) => {
  const testId = currentTestId.value
  let currentTestNotes = testNotes[testId]

  if (isShowDialog) {
    if (!currentTestNotes) {
      currentTestNotes = await db.getTestNotes(testId)
      testNotes[testId] = currentTestNotes
    }

    if (currentTestNotes) {
      currentNotes.value = currentTestNotes[currentQuestionId] || ''
    }

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
  const currentSavedNotes = testNotes[testId]?.[currentQuestionId]
  if (typeof currentSavedNotes === 'string') {
    db.replaceTestQuestionNotes(testId, currentQuestionId, '')
      .then(() => {
        testNotes![testId]![currentQuestionId] = ''
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
