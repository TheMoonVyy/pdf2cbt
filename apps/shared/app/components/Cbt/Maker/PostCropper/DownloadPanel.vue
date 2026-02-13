<script lang="ts" setup>
import { zip, strToU8, type AsyncZipOptions, type AsyncZippable } from 'fflate'
import { DataFileNames } from '#layers/shared/shared/enums'
import { SEPARATOR, MIME_TYPE } from '#layers/shared/shared/constants'
import {
  cropperOverlayDatasKey,
  downloadDataKey,
  instructionsDataKey,
  outputZipFileNameKey,
  pagesImgDataKey,
  testConfigKey,
} from '../keys'

const preGenerateImagesSelectOptions = [
  { name: 'Yes', value: true },
  { name: 'No', value: false },
]

const tooltipContent = {
  preGenerateImages: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'Pre-Generate Question Images?'),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'Yes'),
          ': Pre-Generates Question Images from PDF now itself to store in zip as png files, ',
          'this will skip the image generation steps in test interface and results page\'s question preview as, ',
          'images in the zip will be used (Recommended).',
        ]),
        h('li', [
          h('strong', 'No'),
          ': Zip will contain the PDF instead of PNGs. ',
          'Generates Question Images from PDF when needed in test interface and results page\'s question preview.\n',
        ]),
      ]),
    ]),

  preGenerateImagesScale: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'Scale/Quality of the generated images, higher the scale, better the quality but takes more resources.'),
      h('p', [
        'This doesn\'t take Device Pixel Ratio into account, ',
        'so if you are using a very high DPI screen, then you can set this to a greater value.',
      ]),
    ]),

  zipCompLevel: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'ZIP Compression Level'),
      h('p', [
        'Range: ',
        h('strong', '0'),
        ' to ',
        h('strong', '9'),
        '.',
      ]),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', '0'),
          ': No compression (files are simply stored as-is, fastest).',
        ]),
        h('li', [
          h('strong', '9'),
          ': Maximum compression (smallest size, but slowest and most CPU intensive).',
        ]),
      ]),
      h('p', [
        'Higher values reduce file size but increase processing time and CPU usage.',
      ]),
      h('p', [
        'Note: PDF and PNG formats typically are already compressed, ',
        'so higher compression levels may not significantly reduce the final ZIP size.',
      ]),
    ]),

}

const testConfig = inject(testConfigKey)!
const instructionsData = inject(instructionsDataKey)!

const downloadData = inject(downloadDataKey)!
const outputZipFileName = inject(outputZipFileNameKey)!
const pagesImgData = inject(pagesImgDataKey)!
const cropperOverlayDatas = inject(cropperOverlayDatasKey)!
const migrateJsonData = useMigrateJsonData()

const settings = usePdfCropperLocalStorageSettings()

const cachedTestData = useCachedTestData()

const generateOutputState = shallowReactive<CbtMakerGenerateOutputState>({
  generatingImages: false,
  generationProgress: 0,
  totalQuestions: 0,
  isGenerated: false,
  preparingOutput: false,
  downloaded: false,
  filesToZip: {},
  imgScale: 0,
  cropperSectionsDataForPreGenerateImages: {},
})

// keep a local generated output
// to avoid generating things that have not changed
const lastGeneratedDataState = shallowReactive({
  isGeneratedOnce: false,
  imgScale: 0,
  filesToZip: {} as AsyncZippable,
  totalQuestions: 0,
})

function transformDataToOutputFormat(
  overlays: Map<string, PdfCroppedOverlayInternalData>,
): CbtMakerJsonOutput {
  const pdfCropperData = utilTransformOverlaysToOutputPdfCropperDataFormat(
    overlays,
    pagesImgData,
  )

  const additionalData: TestInterfaceJsonOutput['testConfig']['additionalData'] = {}
  for (const [subject, subjectData] of Object.entries(instructionsData.additionalData)) {
    for (const [section, sectionData] of Object.entries(subjectData.sections)) {
      const { instructions, optionalQuestions } = sectionData

      if (!optionalQuestions && instructions.type === 'none')
        continue

      additionalData[subject] ??= { sections: {} }
      if (instructions.type === 'none') {
        additionalData[subject].sections[section] = {
          optionalQuestions,
        }
      }
      else {
        additionalData[subject].sections[section] = {
          optionalQuestions,
          instructions: { type: instructions.type },
        }
      }
    }
  }

  let testInstructions: TestInterfaceJsonOutput['testConfig']['testInstructions'] = undefined

  const type = instructionsData.testInstructions.type

  if (type !== 'default') {
    testInstructions = { type }
  }

  const outputData = utilCloneJson(downloadData.value.jsonOutputData)
  outputData.testConfig.pdfFileHash = testConfig.pdfFileHash

  outputData.pdfCropperData = pdfCropperData
  outputData.testConfig.additionalData = additionalData
  outputData.testConfig.testInstructions = testInstructions
  migrateJsonData.removeEmptyKeysFromTestConfig(outputData.testConfig)

  return outputData
}

function canLastGeneratedImgsBeUsed() {
  if (!lastGeneratedDataState.isGeneratedOnce)
    return false
  if (lastGeneratedDataState.imgScale !== settings.value.download.imgScale)
    return false

  return !!lastGeneratedDataState.totalQuestions
}

async function generatePdfCropperOutput() {
  const pdfU8Array = downloadData.value.pdfFile
  generateOutputState.isGenerated = false
  cachedTestData.value = null
  generateOutputState.downloaded = false
  generateOutputState.filesToZip = {}
  generateOutputState.preparingOutput = false

  if (!pdfU8Array) return

  const preGenerateImages = settings.value.download.preGenerateImages
  const isUsingLastGeneratedImgs = preGenerateImages && canLastGeneratedImgsBeUsed()

  if (preGenerateImages && !isUsingLastGeneratedImgs) {
    generateOutputState.generatingImages = true
    generateOutputState.generationProgress = 0
    generateOutputState.totalQuestions = 0
    generateOutputState.imgScale = settings.value.download.imgScale
  }
  else {
    generateOutputState.generatingImages = false
    generateOutputState.preparingOutput = true
  }
  await nextTick()

  if (!testConfig.pdfFileHash)
    testConfig.pdfFileHash = await utilGetHash(pdfU8Array)

  if (lastGeneratedDataState.isGeneratedOnce) {
    const json = DataFileNames.DataJson

    if (isUsingLastGeneratedImgs) {
      generateOutputState.preparingOutput = true
      generateOutputState.filesToZip = {
        ...lastGeneratedDataState.filesToZip,
      }
      zipAndSaveOutput()
      return
    }
    generateOutputState.filesToZip[json] = lastGeneratedDataState.filesToZip[json]!

    if (!preGenerateImages) {
      generateOutputState.preparingOutput = true
      generateOutputState.filesToZip[DataFileNames.QuestionsPdf] = pdfU8Array
      zipAndSaveOutput()
      return
    }

    if (preGenerateImages && lastGeneratedDataState.totalQuestions) {
      generateOutputState.totalQuestions = lastGeneratedDataState.totalQuestions
      return
    }
  }

  const jsonData = transformDataToOutputFormat(toRaw(cropperOverlayDatas.value))
  const jsonU8Array = strToU8(JSON.stringify(jsonData, null, 2))

  generateOutputState.filesToZip[DataFileNames.DataJson] = [jsonU8Array, { level: 6 }]

  lastGeneratedDataState.filesToZip = {
    ...generateOutputState.filesToZip,
  }
  if (preGenerateImages) {
    const pdfCropperData = jsonData.pdfCropperData
    const cropperSectionsData: CropperSectionsData = {}

    let totalQuestions = 0
    for (const subjectData of Object.values(pdfCropperData)) {
      for (const [sectionName, sectionData] of Object.entries(subjectData)) {
        cropperSectionsData[sectionName] = sectionData
        totalQuestions += Object.keys(sectionData).length
      }
    }

    generateOutputState.cropperSectionsDataForPreGenerateImages = cropperSectionsData
    generateOutputState.totalQuestions = totalQuestions
  }
  else {
    generateOutputState.filesToZip[DataFileNames.QuestionsPdf] = pdfU8Array
    lastGeneratedDataState.filesToZip[DataFileNames.QuestionsPdf] = pdfU8Array
    zipAndSaveOutput()
  }
}

function downloadGeneratedZipFile() {
  const file = cachedTestData.value?.file
  if (!file) return

  utilSaveFile(outputZipFileName.value + '.zip', file)
  generateOutputState.downloaded = true
}

function zipAndSaveOutput() {
  const filesToZip = generateOutputState.filesToZip

  if (Object.keys(filesToZip).length === 0) {
    generateOutputState.preparingOutput = false
    return
  }

  zip(
    filesToZip,
    { level: settings.value.download.zipCompLevel as AsyncZipOptions['level'] },
    (err, compressedZip) => {
      if (err) {
        useErrorToast('Error creating zip file:', err)
        generateOutputState.preparingOutput = false
        return
      }

      const outputBlob = new Blob(
        [compressedZip as unknown as Uint8Array<ArrayBuffer>],
        { type: MIME_TYPE.zip },
      )

      const time = Date.now()
      cachedTestData.value = {
        by: 'cbt-maker',
        file: new File(
          [outputBlob],
          utilGetFileNameForCachedTestData('CBT-Maker', time),
          { type: outputBlob.type },
        ),
        time,
      }
      generateOutputState.preparingOutput = false
      generateOutputState.isGenerated = true
      lastGeneratedDataState.isGeneratedOnce = true
    },
  )
}

async function addImageBlobsToZipAndSaveOutput(testImageBlobs: TestImageBlobs) {
  lastGeneratedDataState.totalQuestions = generateOutputState.totalQuestions
  lastGeneratedDataState.imgScale = generateOutputState.imgScale

  generateOutputState.generatingImages = false
  generateOutputState.totalQuestions = 0
  generateOutputState.preparingOutput = true

  for (const [sectionName, sectionData] of Object.entries(testImageBlobs)) {
    for (const [questionNum, questionData] of Object.entries(sectionData)) {
      for (let i = 0; i < questionData.length; i++) {
        const imageBlob = questionData[i]
        if (!imageBlob) continue

        const imageBuffer = new Uint8Array(await imageBlob.arrayBuffer())
        const sectionNameWithSeparator = sectionName + SEPARATOR
        const questionNameWithSeparator = questionNum + SEPARATOR

        const filename = `${sectionNameWithSeparator}${questionNameWithSeparator}${i + 1}.png`
        generateOutputState.filesToZip[filename] = imageBuffer
        lastGeneratedDataState.filesToZip[filename] = imageBuffer
      }
    }
  }

  zipAndSaveOutput()
}

onMounted(() => {
  generateOutputState.downloaded = false
})
</script>

<template>
  <UiCard class="gap-2">
    <UiCardHeader class="mb-4">
      <UiCardTitle class="text-xl font-bold text-center">
        Generate and Download CBT Data
      </UiCardTitle>
    </UiCardHeader>
    <UiCardContent class="px-6">
      <div class="flex w-full gap-2">
        <div class="flex flex-col gap-2 grow">
          <UiLabel
            for="generate_output_filename"
          >
            File Name
          </UiLabel>
          <UiInput
            id="generate_output_filename"
            v-model.trim="outputZipFileName"
            class="md:text-base h-10 text-center"
            type="text"
          />
        </div>
      </div>
      <div
        class="flex justify-between my-6"
      >
        <div class="flex flex-col gap-1 w-50">
          <div class="flex gap-2 justify-center">
            <UiLabel
              for="pre_generate_images"
            >
              Pre-Generate Images
            </UiLabel>
            <IconWithTooltip
              :content="tooltipContent.preGenerateImages"
              icon-size="1.25rem"
            />
          </div>
          <BaseSelect
            id="pre_generate_images"
            v-model="settings.download.preGenerateImages"
            :options="preGenerateImagesSelectOptions"
          />
        </div>
        <div class="flex flex-col justify-center gap-1 w-36">
          <div class="flex gap-2 justify-center">
            <UiLabel
              for="pre_generate_image_scale"
            >
              Img Scale
            </UiLabel>
            <IconWithTooltip
              :content="tooltipContent.preGenerateImagesScale"
              icon-size="1.25rem"
            />
          </div>
          <BaseInputNumber
            id="pre_generate_image_scale"
            v-model="settings.download.imgScale"
            :disabled="!settings.download.preGenerateImages"
            :min="0.5"
            :max="5"
            :step="0.1"
          />
        </div>
        <div class="flex flex-col justify-center gap-1 w-40">
          <div class="flex gap-2 justify-center">
            <UiLabel
              for="zip_comp_level"
            >
              ZIP Comp Level
            </UiLabel>
            <IconWithTooltip
              :content="tooltipContent.zipCompLevel"
              icon-size="1.25rem"
            />
          </div>
          <BaseInputNumber
            id="zip_comp_level"
            v-model="settings.download.zipCompLevel"
            :min="0"
            :max="9"
            :step="1"
          />
        </div>
      </div>
      <div
        v-if="!generateOutputState.generatingImages"
        class="flex flex-col items-center w-full mt-6 mb-4 gap-6 mx-auto"
      >
        <BaseButton
          label="Generate CBT Data"
          icon-name="mdi:rocket-launch"
          icon-size="1.5rem"
          class="w-fit"
          @click="generatePdfCropperOutput"
        />
        <BaseButton
          v-if="generateOutputState.isGenerated && cachedTestData"
          class="w-fit"
          icon-name="line-md:download"
          icon-size="1.5rem"
          label="Download Generated ZIP"
          @click="downloadGeneratedZipFile"
        />
      </div>
      <div class="flex flex-col items-center mb-2 text-center">
        <span
          v-show="generateOutputState.generatingImages"
          class="font-semibold"
        >
          Please wait, generating images...<br>
        </span>
        <span
          v-if="generateOutputState.generatingImages && generateOutputState.generationProgress > 0"
          class="my-4 text-lg font-semibold text-cyan-400"
        >
          Currently generating {{ generateOutputState.generationProgress }} of {{ generateOutputState.totalQuestions }} questions...<br>
        </span>
        <p
          v-show="generateOutputState.generatingImages"
          class="mt-2"
        >
          If generating progress is stuck,
          then click on cancel below and try again with a lower img scale value<br><br>
          If even with a lower scale value,
          it is stuck then cancel again and just download without pre generated images
          (i.e. select "No" above)<br><br>
        </p>
        <span v-show="generateOutputState.preparingOutput">
          Generating...
        </span>
        <span v-show="generateOutputState.downloaded">
          Downloaded!
        </span>
      </div>
      <div
        v-if="generateOutputState.generatingImages"
        class="flex justify-center mb-3"
      >
        <BaseButton
          variant="warn"
          label="Cancel Generation"
          @click="() => {
            generateOutputState.generatingImages = false
            generateOutputState.totalQuestions = 0
          }"
        />
      </div>
      <LazyGenerateTestImages
        v-if="generateOutputState.generatingImages && (generateOutputState.totalQuestions > 0)"
        :pdf-uint8-array="downloadData.pdfFile"
        :question-img-scale="generateOutputState.imgScale"
        :cropper-sections-data="generateOutputState.cropperSectionsDataForPreGenerateImages"
        @current-question-progress="(questionNum) => generateOutputState.generationProgress = questionNum"
        @image-blobs-generated="addImageBlobsToZipAndSaveOutput"
      />
    </UiCardContent>
  </UiCard>
</template>
