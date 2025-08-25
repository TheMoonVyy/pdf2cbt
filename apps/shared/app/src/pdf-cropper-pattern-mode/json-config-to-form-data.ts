import type {
  PatternModeConfigJson,
  PatternModeSubjectConfigJson,
  PatternModeQuestionsConfigJson,
  PatternModeSectionConfigJson,
  PatternModeQuestionsColumnConfigJson,
} from './config-schema'
import { getQuestionsDetails } from './parsed-config-for-cropper'

type EndConfig = PatternModeSubjectConfigJson['end'] | PatternModeQuestionsColumnConfigJson['end']
type QuestionStartPattern = PatternModeQuestionsColumnConfigJson['start']['pattern']
type QuestionStartPatternFormData = Omit<Extract<QuestionStartPattern, { type: 'regex' }>, 'type'>
  & Omit<Extract<QuestionStartPattern, { type: 'text' }>, 'type'>
  & { type: QuestionStartPattern['type'] }

export type PatternModeFormQuestionDetails = Pick<
  PdfCroppedOverlayData,
  'type'
  | 'answerOptions'
  | 'marks'
  | 'answerOptionsCounterTypePrimary'
  | 'answerOptionsCounterTypeSecondary'
>

function getPatternStartOrEndData(
  endConfig: EndConfig,
  dataFor: 'subject'
): PatternModeSubjectConfigJson['end'] & { required: boolean }

function getPatternStartOrEndData(
  endConfig: EndConfig,
  dataFor?: 'others'
): PatternModeQuestionsColumnConfigJson['end'] & { required: boolean }

function getPatternStartOrEndData(
  endConfig: EndConfig,
  dataFor: 'subject' | 'others' = 'others',
) {
  if (endConfig) {
    return {
      required: true,
      ...endConfig,
    }
  }

  const area = { l: '0', r: '100%', t: '0', b: '100%' }

  return {
    required: false,
    pattern: {
      type: 'text',
      value: '',
      isCaseSensitive: true,
    },
    searchIn: dataFor === 'subject'
      ? { pages: '1-L', area }
      : area,
  }
}

function getColumnData(columnConfig: PatternModeQuestionsColumnConfigJson) {
  const { start, end, crop } = columnConfig
  const pattern = start.pattern as QuestionStartPatternFormData

  const startPattern: QuestionStartPatternFormData = {
    type: pattern.type,
    isCaseSensitive: pattern.isCaseSensitive,
    value: pattern.value?.trim() || '',
    prefix: pattern.prefix || '',
    suffix: pattern.suffix || '',
    questionRange: pattern.questionRange?.trim() || '',
    relaxPaddedZeros: pattern.relaxPaddedZeros || false,
  }
  return {
    start: {
      ...start,
      pattern: startPattern,
    },
    end: getPatternStartOrEndData(end),
    crop: {
      within: crop.within,
      exactlyTo: {
        l: crop.exactlyTo.l?.trim() || '',
        r: crop.exactlyTo.r,
      },
      offsetBy: {
        l: crop.offsetBy?.l || 0,
        r: crop.offsetBy?.r || 0,
        t: crop.offsetBy?.t || 0,
        b: crop.offsetBy?.b || 0,
      },
    },
  }
}

function getQuestionsData(questionsConfig: PatternModeQuestionsConfigJson) {
  const {
    details,
    columns,
    forBottomCoordinateUseBottom,
    forTopCoordinateLookUp,
    mergeQuestions,
    paragraphQuestionsCommonPart,
  } = questionsConfig

  const forBottomCoordinateUseBottomElems = [...new Set(forBottomCoordinateUseBottom)]
  const forTopCoordinateLookUpElems = [...new Set(forTopCoordinateLookUp?.for)]
  const mergeQuestionsSplitBy = [...new Set(mergeQuestions?.splitBy)]
  const mergeOnlyIfContainsAnyElems = [...new Set(mergeQuestions?.mergeOnlyIfContainsAny)]
  return {
    ...questionsConfig,
    details: getQuestionsDetails(details),
    columns: columns.map(getColumnData),
    forBottomCoordinateUseBottom: {
      required: forBottomCoordinateUseBottomElems.length > 0,
      value: forBottomCoordinateUseBottom || [],
    },
    forTopCoordinateLookUp: {
      required: !!forTopCoordinateLookUp?.by && forTopCoordinateLookUpElems.length > 0,
      by: forTopCoordinateLookUp?.by || 0,
      chainBy: forTopCoordinateLookUp?.chainBy || 0,
      for: forTopCoordinateLookUpElems,
    },
    mergeQuestions: {
      required: mergeQuestionsSplitBy.length > 0,
      splitBy: mergeQuestionsSplitBy,
      mergeOnlyIfContainsAny: mergeOnlyIfContainsAnyElems,
    },
    paragraphQuestionsCommonPart: getPatternStartOrEndData(paragraphQuestionsCommonPart),
  }
}

export function getSectionData(sectionName: string, sectionConfig: PatternModeSectionConfigJson) {
  return {
    name: sectionName,
    ...sectionConfig,
    questions: getQuestionsData(sectionConfig.questions),
    numOfOptionalQuestions: sectionConfig.numOfOptionalQuestions || 0,
  }
}

export function getSubjectData(subjectName: string, subjectConfig: PatternModeSubjectConfigJson) {
  const start = subjectConfig.start
  const name = subjectName
  const end = getPatternStartOrEndData(subjectConfig.end, 'subject')
  const columnDividers = subjectConfig.columnDividers?.trim() || ''

  if ('sections' in subjectConfig) {
    return {
      name,
      subjectHasSections: true,
      start,
      end,
      columnDividers,
      sections: Object.entries(subjectConfig.sections)
        .map(([name, section]) => getSectionData(name, section)),
    }
  }

  return {
    name,
    columnDividers,
    subjectHasSections: false,
    start,
    end,
    sections: [{
      name,
      ...structuredClone(start),
      questions: getQuestionsData(subjectConfig.questions),
      numOfOptionalQuestions: 0,
    }],
  }
}

export function getSubjectsData(subjectsConfig: PatternModeConfigJson['subjects']) {
  return Object.entries(subjectsConfig)
    .map(([subjectName, subjectConfig]) => getSubjectData(subjectName, subjectConfig))
}

export function getConfigData(patternModeConfig: PatternModeConfigJson) {
  const { settings, subjects } = patternModeConfig
  return {
    settings: {
      ...settings,
      linesToIgnore: settings.linesToIgnore || [],
    },
    subjects: getSubjectsData(subjects),
  }
}

export type PatternModeFormSectionData = ReturnType<typeof getSectionData>
export type PatternModeFormQuestionsData = ReturnType<typeof getQuestionsData>
export type PatternModeFormSubjectsData = ReturnType<typeof getSubjectsData>
export type PatternModeFormData = ReturnType<typeof getConfigData>
