<template>
  <div class="flex justify-center items-center gap-8 mt-10">
    <BaseSimpleFileUpload
      accept="application/json,.json"
      label="Select Config"
      invalid-file-type-message="Please select a valid JSON file that was exported from this page."
      icon-name="line-md:cog-filled"
      @upload="handleFileUpload"
    />
    <BaseButton
      label="Download PDF Data"
      variant="warn"
      icon-name="prime:download"
      :disabled="!props.pdfTextData"
      @click="downloadExtractedPdfData"
    />
  </div>
</template>

<script lang="ts" setup>
import regexParser from 'regex-parser'
import patternBasedCropperWorker from '#layers/shared/app/src/worker/text-pattern-based-crop.worker?worker'
import type { PatternBasedCropFn } from '#layers/shared/app/src/worker/text-pattern-based-crop.worker'
import { wrap as comlinkWrap } from 'comlink'
import regexpEscape from 'regexp.escape'
import toRegexRange from 'to-regex-range'

type MakePropertyOptional<T extends object, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type OptionalQuestions = NonNullable<PdfCropperJsonOutput['testConfig']['optionalQuestions']>

const props = defineProps<{
  totalPages: number
  pageImgData: PageImgData
  pdfTextData: PdfTextData | null
}>()

const emit = defineEmits<{
  loadPdfTextData: [pageNums: number[], options: OptionsForGetPdfTextDataMupdfWorkerFn]
}>()

const cropperOverlayDatas = defineModel<Map<string, PdfCroppedOverlayData>>({ required: true })

const overlaysPerQuestionData = defineModel<Map<string, number>>('overlaysPerQuestionData', { required: true })

const optionalQuestions = defineModel<OptionalQuestions>('optionalQuestions', { required: true })

let patternBasedCrop: ReturnType<typeof comlinkWrap<PatternBasedCropFn>> | null = null

const initWorker = () => {
  patternBasedCrop = comlinkWrap<PatternBasedCropFn>(new patternBasedCropperWorker())
}

onMounted(initWorker)

const state = {
  config: null as null | PatternModeConfigJsonData,
}

const downloadExtractedPdfData = () => {
  if (props.pdfTextData)
    utilSaveFile('pdf_data.json', new Blob([JSON.stringify(props.pdfTextData, null, 2)]))
}

const pdfTextDataWatcherHandle = watch(() => props.pdfTextData, runCropper)
pdfTextDataWatcherHandle.pause()

async function handleFileUpload(file: File) {
  state.config = await utilParseJsonFile(file) as PatternModeConfigJsonData

  const pageNums = getPdfPageNumsToSearchIn(state.config.subjects)
  pdfTextDataWatcherHandle.resume()
  const pdfConfig = state.config.pdfConfig
  const options = {
    ignoreElementsGoingOutsidePage: pdfConfig?.ignoreElementsGoingOutsidePage ?? true,
    lineYGroupingRange: pdfConfig?.lineYGroupingRange ?? 4,
  }
  emit('loadPdfTextData', pageNums, options)
}

async function runCropper() {
  if (!state.config || !props.pdfTextData) return
  if (!patternBasedCrop) initWorker()
  if (!patternBasedCrop) return

  pdfTextDataWatcherHandle.pause()

  const rawConfig = utilCloneJson(state.config)
  const parsedSubjectsConfig = getParsedConfigData(rawConfig)
  const { pageImgData, pdfTextData } = props

  optionalQuestions.value = []
  const newOverlays = await patternBasedCrop(parsedSubjectsConfig, utilCloneJson(pdfTextData), utilCloneJson(pageImgData))
  const overlays = cropperOverlayDatas.value
  const overlaysCount = overlaysPerQuestionData.value
  overlaysCount.clear()
  overlays.clear()

  for (const overlay of newOverlays.values()) {
    const { id, queId } = overlay
    overlays.set(id, overlay)

    const count = (overlaysCount.get(queId) || 0) + 1
    overlaysCount.set(queId, count)
  }

  for (const [subjectName, subjectConf] of Object.entries(rawConfig.subjects)) {
    if ('sections' in subjectConf) {
      for (const [sectionName, sectionConf] of Object.entries(subjectConf.sections)) {
        const optQues = parseInt((sectionConf.optionalQuestions || '0') + '')
        if (optQues && !Number.isNaN(optQues)) {
          optionalQuestions.value.push({
            subject: subjectName,
            section: sectionName,
            count: optQues,
          })
        }
      }
    }
  }
}

function getPdfPageNumsToSearchIn(configData: PatternModeSubjectsConfig, totalPages: number = props.totalPages) {
  let pageNums = new Set<number>()

  for (const subjectConfig of Object.values(configData)) {
    if (pageNums.size === totalPages)
      break

    const subjectPages = utilParsePdfPageNumbers(subjectConfig.searchIn.pages, totalPages)
    pageNums = new Set([...pageNums, ...subjectPages])

    if ('sections' in subjectConfig) {
      for (const sectionConfig of Object.values(subjectConfig.sections)) {
        if (pageNums.size === totalPages)
          break

        const sectionPages = utilParsePdfPageNumbers(sectionConfig.searchIn.pages, totalPages)
        pageNums = new Set([...pageNums, ...sectionPages])

        if (pageNums.size === totalPages)
          break

        const questionPages = utilParsePdfPageNumbers(sectionConfig.questions.pagesToSearchIn, totalPages)
        pageNums = new Set([...pageNums, ...questionPages])
      }
    }
    else if (pageNums.size !== totalPages) {
      const questionPages = utilParsePdfPageNumbers(subjectConfig.questions.pagesToSearchIn, totalPages)
      pageNums = new Set([...pageNums, ...questionPages])
    }
  }

  return [...pageNums].sort((a, b) => a - b)
}

function getParsedConfigData(
  configJsonData: PatternModeConfigJsonData,
  totalPages: number = props.totalPages,
) {
  const getEmptySearchArea = () => ({ l: 0, r: 0, t: 0, b: 0 })

  const getPatternRegex = (
    patternObj: PatternModeCommonConfig['pattern'] | PatternModeQuestionsStartAndEndPatternType,
  ) => {
    if (patternObj.type === 'regex') {
      const re = regexParser(patternObj.value)
      return re.global ? re : new RegExp(re.source, 'g' + re.flags)
    }
    else if ('questionRange' in patternObj) {
      const { prefix, suffix, questionRange, isCaseSensitive, relaxPaddedZeros } = patternObj
      const escapedPrefix = regexpEscape(prefix)
      const escapedSuffix = regexpEscape(suffix)
      const [min, max] = questionRange.split('-').map(v => v.trim())
      const questionRangePattern = toRegexRange(min!, max, { relaxZeros: relaxPaddedZeros, capture: true })

      const flags = isCaseSensitive ? 'g' : 'gi'
      const source = escapedPrefix + questionRangePattern + escapedSuffix
      return new RegExp(source, flags)
    }
    else {
      const { value, isCaseSensitive } = patternObj
      const flags = isCaseSensitive ? 'g' : 'gi'
      return new RegExp(regexpEscape(value), flags)
    }
  }

  const getParsedQuestionsConfig = (
    containerConfig: PatternModeQuestionsConfig,
  ): PatternModeParsedQuestionsConfig => {
    const { questionsDetails, questions } = containerConfig
    const {
      type,
      marks,
      answerOptions,
      answerOptionsCounterType,
    } = questionsDetails

    const {
      pagesToSearchIn,
      useLastLineOrImageForBottomCoordinate,
      considerImageTopCoordinateForQuestionStart,
      mergeQuestionsByPages,
      mergeQuestionsByColumns,
      ignoreMergingAreaNotContainingAnyTextOrImage,
      nextQuestionMustBeOneQNumGreater,
      topCoordRangeTolookUpTextForQuestionStart,
      duplicateQuestion,
      paragraphQuestions,
    } = questions

    const parsedQuestionsConfig: PatternModeParsedQuestionsConfig = {
      questions: {
        pages: utilParsePdfPageNumbers(pagesToSearchIn, totalPages),
        details: {
          type: type,
          marks: {
            pm: 1,
            ...marks,
          },
          answerOptions: answerOptions || '4',
          answerOptionsCounterTypePrimary: answerOptionsCounterType?.primary || 'default',
          answerOptionsCounterTypeSecondary: answerOptionsCounterType?.secondary || 'default',
        },
        useLastLineOrImageForBottomCoordinate: useLastLineOrImageForBottomCoordinate || false,
        considerImageTopCoordinateForQuestionStart: considerImageTopCoordinateForQuestionStart || false,
        mergeQuestionsByColumns: mergeQuestionsByColumns || false,
        mergeQuestionsByPages: mergeQuestionsByPages || false,
        ignoreMergingAreaNotContainingAnyTextOrImage: ignoreMergingAreaNotContainingAnyTextOrImage || false,
        nextQuestionMustBeOneQNumGreater: nextQuestionMustBeOneQNumGreater || false,
        topCoordRangeTolookUpTextForQuestionStart: topCoordRangeTolookUpTextForQuestionStart || 0,
        duplicateQuestion: duplicateQuestion || 'ignore',
        columns: [],
      },
    }

    if (paragraphQuestions) {
      parsedQuestionsConfig.questions.paragraphQuestions = {
        patternValue: getPatternRegex(paragraphQuestions.pattern),
        searchInArea: paragraphQuestions.searchArea,
        searchArea: getEmptySearchArea(),
      }
    }

    const parsedColumns = parsedQuestionsConfig.questions.columns
    for (const column of questions.columns) {
      const parsedColumn: (typeof parsedColumns)[number] = {
        cropTo: column.cropTo,
        parsedCropTo: {
          l: null,
          r: 0,
          t: 0,
          b: 0,
        },
        offsetBy: column.offsetBy,
        start: {
          patternValue: getPatternRegex(column.start.pattern),
          searchInArea: column.start.searchArea,
          searchArea: getEmptySearchArea(),
        },
      }

      if (column.end) {
        parsedColumn.end = {
          patternValue: getPatternRegex(column.end.pattern),
          searchInArea: column.end.searchArea,
          searchArea: getEmptySearchArea(),
        }
      }
      parsedColumns.push(parsedColumn)
    }

    return parsedQuestionsConfig
  }

  const parsedSubjectsConfig: PatternModeParsedSubjectsConfigData = {}
  for (const [subjectName, subjectConfig] of Object.entries(configJsonData.subjects)) {
    const { pattern, searchIn } = subjectConfig
    const subjectRegex = getPatternRegex(pattern)
    const subjectSearchIn = {
      ...searchIn,
      pages: utilParsePdfPageNumbers(searchIn.pages, totalPages),
    }

    const parsedSubjectConfig: PatternModeParsedSubjectsConfigData[string] = {
      name: subjectName,
      patternValue: subjectRegex,
      searchIn: subjectSearchIn,
      searchArea: getEmptySearchArea(),
      columnDividers: subjectConfig.columnDividers,
      sections: {},
    }

    if ('sections' in subjectConfig) {
      const parsedSectionsConfig = parsedSubjectConfig.sections

      for (const [sectionName, sectionConfig] of Object.entries(subjectConfig.sections)) {
        const { pattern, searchIn } = sectionConfig

        const parsedSectionConfig: PatternModeParsedSectionsConfigData['sections'][string] = {
          name: sectionName,
          patternValue: getPatternRegex(pattern),
          searchIn: {
            ...searchIn,
            pages: utilParsePdfPageNumbers(searchIn.pages, totalPages),
          },
          searchArea: getEmptySearchArea(),
          ...getParsedQuestionsConfig(sectionConfig),
        }

        parsedSectionsConfig[sectionName] = parsedSectionConfig
      }
    }
    else {
      Object.assign(parsedSubjectConfig, getParsedQuestionsConfig(subjectConfig))
      const _parsedSubjectConfig = parsedSubjectConfig as MakePropertyOptional<typeof parsedSubjectConfig, 'sections'>
      delete _parsedSubjectConfig.sections
    }

    parsedSubjectsConfig[subjectName] = parsedSubjectConfig
  }

  const parsedConfig: PatternModeParsedConfigData = {
    subjects: parsedSubjectsConfig,
    pdfConfig: {
      linesToIgnore: [...new Set(configJsonData.pdfConfig?.linesToIgnore || undefined)],
    },
  }

  return parsedConfig
}
</script>
