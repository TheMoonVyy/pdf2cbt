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
  startOrEndConfig: EndConfig,
  dataFor: 'subject'
): PatternModeSubjectConfigJson['end'] & { required: boolean }

function getPatternStartOrEndData(
  startOrEndConfig: EndConfig,
  dataFor?: 'others'
): PatternModeQuestionsColumnConfigJson['end'] & { required: boolean }

function getPatternStartOrEndData(
  startOrEndConfig: EndConfig,
  dataFor: 'subject' | 'others' = 'others',
) {
  if (startOrEndConfig) {
    return {
      required: true,
      ...startOrEndConfig,
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
    isLeadingZeroesOptional: pattern.isLeadingZeroesOptional || false,
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
    isRemoved: false,
  }
}

function getQuestionsData(questionsConfig: PatternModeQuestionsConfigJson) {
  const {
    details,
    columns,
    forBottomCoordinateUseBottom,
    forTopCoordinateLookUp,
    mergeQuestions,
    paragraphQuestions,
  } = questionsConfig

  const paraCrop = paragraphQuestions?.crop

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
    paragraphQuestions: {
      start: getPatternStartOrEndData(paragraphQuestions?.start),
      end: getPatternStartOrEndData(paragraphQuestions?.end),
      crop: {
        exactlyTo: {
          l: paraCrop?.exactlyTo?.l?.trim() || '',
          r: paraCrop?.exactlyTo?.r?.trim() || '',
        },
        offsetBy: {
          l: paraCrop?.offsetBy?.l || 0,
          r: paraCrop?.offsetBy?.r || 0,
          t: paraCrop?.offsetBy?.t || 0,
          b: paraCrop?.offsetBy?.b || 0,
        },
      },
    },
  }
}

export function getSectionData(sectionName: string, sectionConfig: PatternModeSectionConfigJson) {
  return {
    name: sectionName,
    ...sectionConfig,
    id: Date.now() + Math.random(),
    questions: getQuestionsData(sectionConfig.questions),
    numOfOptionalQuestions: sectionConfig.numOfOptionalQuestions || 0,
  }
}

export function getSubjectData(subjectName: string, subjectConfig: PatternModeSubjectConfigJson) {
  const start = subjectConfig.start
  const name = subjectName
  const end = getPatternStartOrEndData(subjectConfig.end, 'subject')
  const columnDividers = subjectConfig.columnDividers?.trim() || ''

  const subjectId = Date.now() + Math.random()

  if ('sections' in subjectConfig) {
    return {
      name,
      subjectHasSections: true,
      id: subjectId,
      start,
      end,
      columnDividers,
      sections: Object.fromEntries(
        Object.entries(subjectConfig.sections)
          .map(([name, section]) => {
            const sectionData = getSectionData(name, section)
            return [sectionData.id, sectionData]
          }),
      ),
    }
  }

  const sectionId = Date.now() + Math.random()
  return {
    name,
    columnDividers,
    subjectHasSections: false,
    id: subjectId,
    start,
    end,
    sections: {
      [sectionId]: {
        name,
        ...structuredClone(start),
        questions: getQuestionsData(subjectConfig.questions),
        numOfOptionalQuestions: 0,
        id: sectionId,
      },
    },
  }
}

export type PatternModeFormSubjectData = ReturnType<typeof getSubjectData>

export function getSubjectsData(subjectsConfig: PatternModeConfigJson['subjects']) {
  return Object.fromEntries(
    Object.entries(subjectsConfig)
      .map(([subjectName, subjectConfig]) => {
        const subjectData = getSubjectData(subjectName, subjectConfig)
        return [subjectData.id, subjectData]
      }),
  ) as Record<PropertyKey, PatternModeFormSubjectData>
}

export function getConfigFormDataFromJson(patternModeConfig: PatternModeConfigJson) {
  const { settings, subjects } = patternModeConfig
  const linesToIgnore = structuredClone(settings.linesToIgnore || [])
  linesToIgnore.push({
    type: 'text',
    value: '',
    isCaseSensitive: true,
  })
  return {
    settings: {
      ...settings,
      calculateCharacterBoundariesPrecisely: !!settings.calculateCharacterBoundariesPrecisely,
      linesToIgnore,
    },
    subjects: getSubjectsData(subjects),
  }
}

export type PatternModeFormSectionData = ReturnType<typeof getSectionData>
export type PatternModeFormQuestionsData = ReturnType<typeof getQuestionsData>
export type PatternModeFormSubjectsData = ReturnType<typeof getSubjectsData>
export type PatternModeFormData = ReturnType<typeof getConfigFormDataFromJson>
