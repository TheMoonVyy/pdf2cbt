<template>
  <UiCard class="mx-4 py-3 grow">
    <UiCardContent class="flex flex-col gap-1 grow">
      <div class="grid grid-cols-9 gap-3 w-full shrink-0">
        <div class="flex gap-4 col-span-3">
          <div class="flex flex-col items-center">
            <UiLabel
              class="text-center text-base"
              for="show_test_data_file_type"
            >
              Data File Type
            </UiLabel>
            <BaseSelect
              id="show_test_data_file_type"
              v-model="selectedFileType"
              :disabled="loadingAndErrorState.isLoading"
              :options="selectOptions"
              trigger-class="text-center w-34"
            />
          </div>
          <BaseButton
            variant="outline"
            size="icon"
            title="Load ZIP from URL"
            icon-name="line-md:link"
            class="mt-6"
            @click="showZipFromUrlDialog = true"
          />
        </div>
        <div class="flex pt-6 justify-center col-span-2">
          <input
            ref="inputElem"
            class="hidden"
            type="file"
            :accept="computedValue.accept"
            @change="fileUploaderState.loadFiles()"
          >
          <BaseButton
            :label="computedValue.maxFilesSelect === 1 ? 'Select File' : 'Select Files'"
            :disabled="(fileUploaderState.files.size >= computedValue.maxFilesSelect) || loadingAndErrorState.isLoading"
            icon-name="line-md:plus"
            @click="fileUploaderState.choose()"
          />
        </div>
        <div class="flex pt-6 justify-center col-span-2">
          <BaseButton
            :label="computedValue.maxFilesSelect === 1 ? 'Load File' : 'Load Files'"
            :disabled="(fileUploaderState.files.size !== computedValue.maxFilesSelect) || loadingAndErrorState.isLoading"
            variant="warn"
            icon-name="prime:upload"
            @click="handleUpload([...fileUploaderState.files.values()])"
          />
        </div>
        <div class="flex pt-6 justify-center col-span-2">
          <BaseButton
            label="Clear Files"
            :disabled="fileUploaderState.files.size === 0"
            variant="destructive"
            icon-name="material-symbols:cancel-outline-rounded"
            @click="fileUploaderState.removeFile()"
          />
        </div>
      </div>
      <div
        v-if="fileUploaderState.files.size === 0"
        class="mt-4 flex flex-col font-semibold justify-center grow items-center rounded-xl px-4 py-8
          border-2 border-dashed border-gray-500 dark:border-gray-400 transition-colors"
        :class="fileUploaderState.isDraggingFiles ? 'border-green-500 dark:border-green-500' : ''"
        @dragenter.prevent="fileUploaderState.isDraggingFiles = true"
        @dragover.prevent
        @dragleave.prevent="fileUploaderState.isDraggingFiles = false"
        @drop.prevent="fileUploaderState.handleFilesDroppedFromDrag($event)"
      >
        <span
          v-for="(msgItem, index) in msgList"
          :key="index"
          class="text-wrap"
          :class="msgItem.class"
        >
          {{ msgItem.msg }}
        </span>
      </div>
      <div
        v-else
        class="flex flex-col grow border rounded-xl border-border pt-2"
      >
        <div
          v-for="[fileType, file] in fileUploaderState.files"
          :key="fileType"
          class="flex gap-3 w-full px-8 py-2 text-base border-b border-input"
        >
          <span class="text-center shrink-0">{{ fileType.toUpperCase() }}</span>
          <span class="shrink-0">{{ formatFileSize(file.size) }}</span>
          <span class="text-wrap grow">{{ file.name }}</span>
          <BaseButton
            class="shrink-0"
            variant="ghost"
            size="icon"
            icon-name="material-symbols:cancel-outline-rounded"
            icon-class="text-red-500"
            icon-size="1.6rem"
            @click="fileUploaderState.removeFile(fileType)"
          />
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
import { DataFileNames } from '#layers/shared/shared/enums'

type FileTypes = 'zip' | 'json'

const props = defineProps<{
  emptySlotContainerClass?: string
  emptySlotTextClass?: string
  rootClass?: string
  contentClass?: string
  zipFileToLoad?: File | null
}>()

const selectedFileType = defineModel<FileTypes>({ required: true })
const showZipFromUrlDialog = defineModel<boolean>('showZipFromUrlDialog', { required: true })

const emit = defineEmits<{
  uploaded: [data: UploadedTestData]
}>()

const selectOptions = [
  { name: 'Zip', value: 'zip' as FileTypes },
  { name: 'PDF + Json', value: 'json' as FileTypes },
]

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

const inputElem = useTemplateRef('inputElem')

const loadingAndErrorState = shallowReactive({
  isLoading: false,
  isUploadError: false,
  msg: '',
  resetState: function () {
    this.isLoading = false
    this.isUploadError = false
    this.msg = ''
  },
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
    return {
      accept: acceptStrings.pdfJson,
      maxFilesSelect: 2,
      errorMsg: errorMsgs.pdfJson,
    }
  }
})

const fileUploaderState = reactive({
  files: new Map<string, File>(),
  isDraggingFiles: false,
  choose: function () {
    this.isDraggingFiles = false
    loadingAndErrorState.resetState()
    inputElem.value?.click()
  },
  removeFile: function (key: string | null = null) {
    this.isDraggingFiles = false
    if (typeof key === 'string') {
      this.files.delete(key)
    }
    else {
      this.files.clear()
    }
  },
  loadFiles: async function (files: FileList | null = null) {
    this.isDraggingFiles = false
    loadingAndErrorState.resetState()
    if (!inputElem.value) return

    if (!files) files = inputElem.value.files
    if (!files) return

    const maxFilesAllowed = computedValue.value.maxFilesSelect
    for (const file of files) {
      if (this.files.size >= maxFilesAllowed) {
        break
      }
      if (maxFilesAllowed === 1) {
        const checkIsZipFile = await utilIsZipFile(file)
        if (checkIsZipFile > 0) {
          this.files.set('zip', file)
        }
        else {
          invalidFilesErrorHandler(
            `Error: Invalid ZIP file\n"${file.name}" is not a valid zip file.\nUpload a valid one.`,
          )
        }
      }
      else {
        const checkIsPdfFile = await utilIsPdfFile(file)
        if (checkIsPdfFile > 0) {
          this.files.set('pdf', file)
        }
        else if (file.type === 'application/json' || file.name.toLowerCase().endsWith('json')) {
          this.files.set('json', file)
        }
      }
    }

    inputElem.value.value = ''
  },
  handleFilesDroppedFromDrag: function (e: DragEvent) {
    this.isDraggingFiles = false
    loadingAndErrorState.resetState()
    const files = e.dataTransfer?.files
    if (!files || files.length === 0) return

    this.loadFiles(files)
  },
})

const msgList = computed(() => {
  const msgs = loadingAndErrorState.msg
    .split('\n')
    .map(m => m.trim())
    .filter(m => !!m)
    .map((m) => {
      let classString = ''
      if (loadingAndErrorState.isUploadError) classString = 'text-red-400'
      else if (loadingAndErrorState.isLoading) classString = 'text-green-500'

      return { msg: m, class: classString }
    })

  if (msgs.length > 0) {
    return msgs
  }

  return [{ msg: 'You can also Drag and Drop File(s) here', class: '' }]
})

const checkForMissingFiles = (pdfFile: unknown, jsonFile: unknown) => {
  const returnObj = {
    isErr: false,
    errMsg: '',
  }

  if (!pdfFile && !jsonFile) {
    returnObj.isErr = true
    returnObj.errMsg = `Missing ${DataFileNames.QuestionsPdf} and ${DataFileNames.DataJson} files in zip`
  }
  else if (!pdfFile) {
    returnObj.isErr = true
    returnObj.errMsg = `Missing ${DataFileNames.QuestionsPdf} file in zip`
  }
  else if (!jsonFile) {
    returnObj.isErr = true
    returnObj.errMsg = `Missing ${DataFileNames.DataJson} file in zip`
  }

  return returnObj
}

function invalidFilesErrorHandler(msg: string) {
  loadingAndErrorState.isLoading = false
  loadingAndErrorState.isUploadError = true
  loadingAndErrorState.msg = msg
}

const emitData = async (data: UploadedTestData) => emit('uploaded', data)

async function handleUpload(uploadedFiles: File[] | File) {
  loadingAndErrorState.isLoading = true
  loadingAndErrorState.msg = 'Please wait, loading file(s)...'

  const files = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles]

  if (selectedFileType.value === 'zip') {
    const zipFile = files[0]
    if (zipFile) {
      utilUnzipTestDataFile(zipFile, 'all')
        .then(data => emitData(data))
        .catch(errMsg => invalidFilesErrorHandler(errMsg))
    }
  }
  else {
    let pdfBuffer: Uint8Array | null = null
    let jsonData: PdfCropperJsonOutput | AnswerKeyJsonOutputBasedOnPdfCropper | null = null

    try {
      for (const file of files) {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          pdfBuffer = new Uint8Array(await file.arrayBuffer())
        }
        else if (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')) {
          jsonData = await utilParseJsonFile(file)
        }
      }

      const status = checkForMissingFiles(pdfBuffer, jsonData)
      if (status.isErr) {
        invalidFilesErrorHandler(status.errMsg)
      }
      else {
        emitData({ pdfBuffer, jsonData: jsonData!, testImageBlobs: null })
      }
    }
    catch (err: unknown) {
      const customMsg = 'Error processing the files'
      const msg = err instanceof Error
        ? customMsg + ':\n' + err.message
        : customMsg
      useErrorToast(customMsg, err)
      invalidFilesErrorHandler(msg)
    }
  }
}

watch(
  () => props.zipFileToLoad,
  (file) => {
    if (file) {
      selectedFileType.value = 'zip'
      handleUpload(file)
    }
  },
)

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`
  }
  else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
}
</script>
