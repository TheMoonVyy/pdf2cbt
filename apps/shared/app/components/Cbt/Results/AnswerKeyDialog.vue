<template>
  <UiDialog
    v-model:open="visibility"
  >
    <UiDialogContent class="max-w-md">
      <UiDialogHeader>
        <UiDialogTitle class="mx-auto">
          Test Answer Key Data is Not Found!
        </UiDialogTitle>
      </UiDialogHeader>

      <span class="text-center">
        Test Answer Key Data was not found for this test:
      </span>
      <div class="flex flex-row justify-center flex-wrap gap-6 py-4 px-2 sm:px-4 md:px-8">
        <CbtResultsOverviewCard
          :test-result-overview="testResultOverview!"
          read-only
        />
      </div>
      <span class="m-2">
        You can load it now or if you don't have it then go to
        <span class="text-green-500 font-bold underline">
          <NuxtLink to="/cbt/generate-answer-key">Generate Answer Key</NuxtLink>
        </span>
        page to generate one.
      </span>
      <span class="mt-2">
        After that you can come back here just to be greeted by this same message again and
        then load the file to check results for your test!
      </span>
      <div class="flex my-5 mx-auto justify-center">
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
}>()

const emitData = (data: TestAnswerKeyJsonData) => {
  emit('upload', data)
  visibility.value = false
}

async function handleFileUpload(file: File) {
  const zipCheckStatus = await utilIsZipFile(file)
  if (zipCheckStatus > 0) {
    const data = await utilUnzipTestDataFile(file, 'json-only')
    if ('testAnswerKey' in (data.jsonData || {})) {
      emitData(data.jsonData as TestAnswerKeyJsonData)
    }
  }
  else {
    const data = await utilParseJsonFile(file)
    if (data.testAnswerKey) {
      emitData(data)
    }
  }
}
</script>
