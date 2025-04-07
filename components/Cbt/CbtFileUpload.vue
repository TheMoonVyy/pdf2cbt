<template>
  <FileUpload
    :accept="computedValue.accept"
    :custom-upload="true"
    :multiple="computedValue.maxFilesSelect > 1"
    :invalid-file-type-message="computedValue.errorMsg"
    :pt:root:class="'flex flex-col [&>input[type=file]]:hidden w-full ' + (rootClass ?? '')"
    pt:header:class="p-4"
    :pt:content:class="`flex flex-col grow m-2 px-4 py-2 gap-3
      border border-dashed rounded-lg transition-colors border-gray-300
      data-[p-highlight=true]:border-2 data-[p-highlight=true]:border-green-500 `
      + (contentClass ?? '')"
    @uploader="(e) => handleUpload(e.files)"
  >
    <template #header="scope">
      <div class="grid grid-cols-4 gap-5 w-full">
        <div class="flex flex-col items-center w-full">
          <label
            class="text-center text-base"
            for="show_test_data_file_type"
          >
            Data File Type
          </label>
          <Select
            v-model="selectedFileType"
            label-id="show_test_data_file_type"
            :options="props.fileOptions"
            :disabled="loadingAndErrorState.isLoading"
            option-label="name"
            option-value="value"
            :fluid="true"
            pt:root:class="w-full"
            pt:label:class="text-center"
          />
        </div>
        <div class="flex pt-6 justify-center">
          <BaseButton
            :label="computedValue.maxFilesSelect === 1 ? 'Select File' : 'Select Files'"
            :disabled="(scope.files.length >= computedValue.maxFilesSelect) || loadingAndErrorState.isLoading"
            class="dark:text-surface-900"
            :fluid="true"
            @click="() => {
              loadingAndErrorState.isUploadError = false
              scope.chooseCallback()
            }"
          >
            <template #icon>
              <Icon
                name="prime:plus"
                size="1.4rem"
              />
            </template>
          </BaseButton>
        </div>
        <div class="flex pt-6 justify-center">
          <BaseButton
            :label="computedValue.maxFilesSelect === 1 ? 'Load File' : 'Load Files'"
            :disabled="(scope.files.length !== computedValue.maxFilesSelect) || loadingAndErrorState.isLoading"
            :fluid="true"
            severity="warn"
            @click="scope.uploadCallback()"
          >
            <template #icon>
              <Icon
                name="prime:upload"
                size="1.4rem"
              />
            </template>
          </BaseButton>
        </div>
        <div class="flex pt-6 justify-center">
          <BaseButton
            label="Clear Files"
            :disabled="scope.files.length === 0"
            severity="danger"
            :fluid="true"
            @click="scope.clearCallback()"
          >
            <template #icon>
              <Icon
                name="material-symbols:cancel-outline-rounded"
                size="1.4rem"
              />
            </template>
          </BaseButton>
        </div>
      </div>
    </template>
    <template #fileremoveicon>
      <Icon
        name="mdi:close-circle"
        size="1.8rem"
        class="text-red-400 cursor-pointer hover:text-red-300"
      />
    </template>
    <template #empty>
      <div
        class="flex grow relative"
        :class="props.emptySlotContainerClass"
      >
        <span
          class="absolute left-1/2 -translate-x-1/2 text-lg text-nowrap"
          :class="props.emptySlotTextClass"
        >
          <template v-if="loadingAndErrorState.isLoading || loadingAndErrorState.isUploadError">
            {{ loadingAndErrorState.msg }}
          </template>
          <template v-else>You can also drag and drop file(s) here.</template>
        </span>
      </div>
    </template>
  </FileUpload>
</template>

<script lang="ts" setup>
import { unzip, strFromU8 } from 'fflate'
import { DataFileNames } from '~/src/types/enums'

interface EmitData {
  pdfFile: Uint8Array | null
  jsonData: Record<string, unknown>
}

const props = defineProps<{
  fileOptions: { name: string, value: string }[]
  fileTypes: 'zip-or-pdfjson' | 'zip-or-json'
  emptySlotContainerClass?: string
  emptySlotTextClass?: string
  rootClass?: string
  contentClass?: string
  validationFunction?: (data: EmitData) => Promise<boolean>
}>()

const selectedFileType = defineModel<string>({ required: true })

const emit = defineEmits<{
  onUploaded: [data: EmitData]
}>()

const acceptStrings = {
  zip: '.zip,application/zip',
  json: '.json,application/json',
  pdfJson: '.pdf,.json,application/pdf,application/json',
}

const errorMsgs = {
  zip: 'Please select a valid .zip file.',
  json: 'Please select a valid .json file.',
  pdfJson: 'Please select valid .pdf and .json files.',
}

const loadingAndErrorState = shallowReactive({
  isLoading: false,
  isUploadError: false,
  msg: '',
})

const computedValue = computed(() => {
  if (selectedFileType.value === 'zip') {
    return {
      accept: acceptStrings.zip,
      maxFilesSelect: 1,
      errorMsg: errorMsgs.zip,
    }
  }
  else {
    if (props.fileTypes === 'zip-or-json') {
      return {
        accept: acceptStrings.json,
        maxFilesSelect: 1,
        errorMsg: errorMsgs.json,
      }
    }
    else {
      return {
        accept: acceptStrings.pdfJson,
        maxFilesSelect: 2,
        errorMsg: errorMsgs.pdfJson,
      }
    }
  }
})

const checkForMissingFiles = (pdfFile: unknown, jsonFile: unknown) => {
  const returnObj = {
    isErr: false,
    errMsg: '',
  }

  if (!pdfFile && !jsonFile && props.fileTypes !== 'zip-or-json') {
    returnObj.isErr = true
    returnObj.errMsg = `Missing ${DataFileNames.questionsPdf} and ${DataFileNames.dataJson} files in zip`
  }
  else if (!pdfFile && props.fileTypes !== 'zip-or-json') {
    returnObj.isErr = true
    returnObj.errMsg = `Missing ${DataFileNames.questionsPdf} file in zip`
  }
  else if (!jsonFile) {
    returnObj.isErr = true
    returnObj.errMsg = `Missing ${DataFileNames.dataJson} file in zip`
  }

  return returnObj
}

const invalidFilesErrorHandler = (msg: string) => {
  loadingAndErrorState.isLoading = false
  loadingAndErrorState.isUploadError = true
  loadingAndErrorState.msg = msg
}

async function unzipFile(zipFile: File | Blob) {
  const zipU8Array = new Uint8Array(await zipFile.arrayBuffer())

  return new Promise<{
    pdfFile: Uint8Array | null
    jsonData: Record<string, unknown>
  }>((resolve, reject) => {
    unzip(zipU8Array, (err, files) => {
      if (err) {
        reject(err.message)
        return
      }

      const pdfFile = files[DataFileNames.questionsPdf] ?? null
      const jsonFile = files[DataFileNames.dataJson]

      const status = checkForMissingFiles(pdfFile, jsonFile)
      if (status.isErr) {
        reject(status.errMsg)
      }

      const jsonData = JSON.parse(strFromU8(jsonFile))
      resolve({ pdfFile, jsonData })
    })
  })
}

const emitData = async (
  data: EmitData,
) => {
  if (props.validationFunction) {
    props.validationFunction(data)
      .then(() => emit('onUploaded', data))
      .catch(errMsg => invalidFilesErrorHandler(errMsg))
  }
  else {
    emit('onUploaded', data)
  }
}

const handleUpload = async (uploadedFiles: File[] | File) => {
  loadingAndErrorState.isLoading = true
  loadingAndErrorState.msg = 'Please wait, loading file(s)...'

  const isFileTypeZip = selectedFileType.value === 'zip'

  const files = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles]

  if (isFileTypeZip) {
    const zipFile = files[0]
    unzipFile(zipFile)
      .then(data => emitData(data))
      .catch(errMsg => invalidFilesErrorHandler(errMsg))
  }
  else {
    let pdfFile: Uint8Array | null = null
    let jsonData: Record<string, unknown> | null = null

    try {
      for (const file of files) {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          pdfFile = new Uint8Array(await file.arrayBuffer())
        }
        else if (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')) {
          jsonData = await utilParseJsonFile(file)
        }
      }

      const status = checkForMissingFiles(pdfFile, jsonData)
      if (status.isErr) {
        invalidFilesErrorHandler(status.errMsg)
      }
      else {
        emitData({ pdfFile, jsonData: jsonData! })
      }
    }
    catch (err: unknown) {
      const customMsg = 'An unknown error occurred while processing the files'
      const msg = err instanceof Error
        ? customMsg + ':\n' + err.message
        : customMsg
      console.error(customMsg, err)
      invalidFilesErrorHandler(msg)
    }
  }
}
</script>
