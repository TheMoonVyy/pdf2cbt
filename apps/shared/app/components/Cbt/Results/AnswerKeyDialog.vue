<template>
  <UiDialog
    v-model:open="visibility"
  >
    <UiDialogContent class="max-w-md gap-3">
      <UiDialogHeader>
        <UiDialogTitle class="mx-auto">
          {{
            isForReevaluation
              ? 'Re-evaluate Test Results'
              : 'Test Answer Key Data is Not Found!'
          }}
        </UiDialogTitle>
      </UiDialogHeader>

      <span class="text-center">
        {{ isForReevaluation
          ? 'The test you want to re-evaluate is:'
          : 'Test Answer Key Data was not found for this test:'
        }}
      </span>
      <div class="flex flex-row justify-center flex-wrap gap-6 p-2 sm:px-4 md:px-8">
        <CbtResultsOverviewCard
          :test-result-overview="testResultOverview!"
          read-only
        />
      </div>
      <span class="m-2">
        You can load the answer key data below or if you don't have it then click on
        <span class="text-green-500 font-bold underline">
          <NuxtLink
            :to="{
              path: '/cbt/generate-answer-key',
              query: testId ? { test_id: testId } : undefined,
            }"
            target="_blank"
          >Generate Answer Key</NuxtLink>
        </span>
        to create one (this will open generate answer key page and load this test).
      </span>

      <span
        v-if="!isForReevaluation"
        class="mt-2 mb-2"
      >
        After that you can come back here just to be greeted by this same message again and
        then load the file to check results for your test!
      </span>
      <div class="flex mb-3 mx-auto justify-center">
        <BaseSimpleFileUpload
          accept="application/json,application/zip,.json,.zip"
          :label="'Select Answer Key Data'"
          invalid-file-type-message="Please select a valid JSON or ZIP file from Generate Answer Key Page."
          icon-name="line-md:plus"
          @upload="handleFileUpload"
        />
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
type TestAnswerKeyJsonData = {
  testAnswerKey: TestAnswerKeyData
}

const visibility = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  upload: [data: TestAnswerKeyJsonData]
}>()

defineProps<{
  testResultOverview: TestResultOverview
  isForReevaluation?: boolean
  testId?: number
}>()

const emitData = (data: TestAnswerKeyJsonData) => {
  emit('upload', data)
  visibility.value = false
}

async function handleFileUpload(file: File) {
  try {
    const zipCheckStatus = await utilIsZipFile(file)
    if (zipCheckStatus > 0) {
      const data = await utilUnzipTestDataFile(file, 'json-only')
      if ('testAnswerKey' in (data.jsonData || {})) {
        emitData(data.jsonData as TestAnswerKeyJsonData)
      }
      else {
        useErrorToast('Selected ZIP file does not contain Answer Key data (testAnswerKey).')
      }
    }
    else {
      const data = await utilParseJsonFile(file)
      if (data?.testAnswerKey) {
        emitData(data)
      }
      else {
        useErrorToast('Selected JSON file does not contain Answer Key data (testAnswerKey).')
      }
    }
  }
  catch (err) {
    useErrorToast('Failed to load Answer Key Data file:', err)
  }
}
</script>
