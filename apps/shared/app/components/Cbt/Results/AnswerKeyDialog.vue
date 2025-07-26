<template>
  <UiDialog
    v-model:open="visibility"
    header="Test Answer Key Data is Not Found!"
  >
    <UiDialogContent class="max-w-md">
      <UiDialogHeader>
        <UiDialogTitle class="mx-auto">
          Test Answer Key Data is Not Found!
        </UiDialogTitle>
      </UiDialogHeader>

      <h4 class="text-center">
        Test Answer Key Data was not found for this test:
      </h4>
      <div class="flex flex-row justify-center flex-wrap gap-6 py-4 px-2 sm:px-4 md:px-8">
        <CbtResultsOverviewCard
          :test-result-overview="testResultOverview!"
          read-only
        />
      </div>
      <h4 class="m-2">
        You can load it now or if you don't have it then go to
        <span class="text-green-500 font-bold underline">
          <NuxtLink to="/cbt/generate-answer-key">Generate Answer Key</NuxtLink>
        </span>
        page to generate one.
      </h4>
      <h4 class="m-2">
        After that you can come back here just to be greeted by this same message again and
        then load the file to check results for your test!
      </h4>
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
import { unzip, strFromU8 } from 'fflate'
import { DataFileNames } from '#layers/shared/shared/enums'

type TestAnswerKeyJsonData = {
  testAnswerKey: TestAnswerKeyData
}

const visibility = defineModel<boolean>('visibility', {
  default: true,
})

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

async function unzipFile(zipFile: File | Blob) {
  const zipU8Array = new Uint8Array(await zipFile.arrayBuffer())

  return new Promise<Record<string, unknown>>((resolve, reject) => {
    unzip(zipU8Array, (err, files) => {
      if (err) {
        reject(err.message)
        return
      }

      const jsonFile = files[DataFileNames.DataJson]
      if (jsonFile) {
        const jsonData = JSON.parse(strFromU8(jsonFile))
        resolve(jsonData)
      }
      else {
        reject('Error "data.json" file (Answer Key Data) is not found inside zip file')
      }
    })
  })
}

async function handleFileUpload(file: File) {
  if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
    const data = await unzipFile(file)
    if (data.testAnswerKey) {
      emitData(data as TestAnswerKeyJsonData)
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
