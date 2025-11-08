<template>
  <UiDialog
    v-model:open="showDialog"
  >
    <UiDialogContent>
      <UiDialogHeader>
        <UiDialogTitle class="mx-auto">
          Upload Existing File(s) To Edit
        </UiDialogTitle>
      </UiDialogHeader>
      <UiDialogDescription>
        Upload PDF and ZIP/JSON files downloaded from PDF Cropper OR Answer Key Page.<br>
        If ZIP file contains PDF file (when images not pre-generated) then no need to upload PDF file.
      </UiDialogDescription>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-5 my-3">
        <BaseSimpleFileUpload
          accept="application/zip,application/json,.zip,.json"
          :label="uploadedFiles.zipOrJsonFile ? 'Change JSON/ZIP file' : 'Select ZIP/JSON file'"
          :variant="uploadedFiles.zipOrJsonFile ? 'success' : 'help'"
          invalid-file-type-message="Please select a valid PDF file."
          @upload="(file) => uploadedFiles.zipOrJsonFile = file"
        />
        <BaseSimpleFileUpload
          accept="application/pdf,.pdf"
          :label="uploadedFiles.pdfFile ? 'Change PDF file' : 'Select PDF file'"
          :variant="uploadedFiles.pdfFile ? 'success' : 'help'"
          invalid-file-type-message="Please select a valid PDF file."
          @upload="(file) => uploadedFiles.pdfFile = file"
        />
      </div>
      <UiDialogFooter>
        <BaseButton
          label="Load Files"
          :disabled="!uploadedFiles.zipOrJsonFile"
          variant="warn"
          @click="loadFiles"
        />
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
type EmitedData = {
  pdfBuffer: Uint8Array
  jsonData: PdfCropperJsonOutput | AnswerKeyJsonOutputBasedOnPdfCropper
  filename: string
}
const showDialog = defineModel<boolean>({ required: true })

const uploadedFiles = shallowReactive({
  pdfFile: null as File | null,
  zipOrJsonFile: null as File | null,
})

const emit = defineEmits<{
  uploadedData: [data: EmitedData]
}>()

const migrateJsonData = useMigrateJsonData()

async function loadFiles() {
  const { pdfFile, zipOrJsonFile } = uploadedFiles
  if (!zipOrJsonFile) return

  let pdfBuffer: Uint8Array | null = null
  let jsonData: PdfCropperJsonOutput | AnswerKeyJsonOutputBasedOnPdfCropper | null = null
  try {
    if (pdfFile) {
      const pdfFileCheck = await utilIsPdfFile(pdfFile)
      if (pdfFileCheck > 0)
        pdfBuffer = new Uint8Array(await pdfFile.arrayBuffer())
    }

    const zipCheckStatus = await utilIsZipFile(zipOrJsonFile)
    if (zipCheckStatus > 0) {
      const unzipped = await utilUnzipTestDataFile(zipOrJsonFile, 'json-and-maybe-pdf')
      jsonData = unzipped.jsonData
      pdfBuffer = unzipped.pdfBuffer
    }
    else {
      jsonData = await utilParseJsonFile(zipOrJsonFile)
    }

    if (!pdfBuffer) {
      if (pdfFile) {
        const pdfFileCheck = await utilIsPdfFile(pdfFile)
        if (pdfFileCheck > 0) {
          pdfBuffer = new Uint8Array(await pdfFile.arrayBuffer())
        }
        else {
          throw new Error(`${pdfFile.name} is not a valid PDF file`)
        }
      }
      else {
        const msg = zipCheckStatus > 0
          ? `PDF is not present in the ZIP file, you need to upload the PDF file separately.`
          : 'Please also upload the PDF file.'
        throw new Error(msg)
      }
    }

    if (!jsonData) {
      throw new Error('JSON Data is not found or is invalid.')
    }

    if (!jsonData.pdfCropperData) {
      throw new Error(
        'PDf Cropper Data is not found in JSON data. '
        + 'Make sure you are uploading file downloaded from PDF Cropper Page or Generate Answer Key Page.',
      )
    }
    jsonData = 'testAnswerKey' in jsonData
      ? migrateJsonData.answerKeyData(jsonData) as AnswerKeyJsonOutputBasedOnPdfCropper
      : migrateJsonData.pdfCropperData(jsonData)

    if (Object.keys(jsonData.pdfCropperData).length > 0) {
      const filenameParts = zipOrJsonFile.name.split('.')
      filenameParts.pop()
      const filename = filenameParts.join('.')
      emit('uploadedData', { pdfBuffer, jsonData, filename })
      showDialog.value = false
    }
  }
  catch (err) {
    useErrorToast('Error loading files', err, undefined, false)
  }
}
</script>
