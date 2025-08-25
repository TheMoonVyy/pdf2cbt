import regexpEscape from 'regexp.escape'
import toRegexRange from 'to-regex-range'
import regexParser from 'regex-parser'
import {
  questionRangeRegex,
} from '#layers/shared/shared/regexes'
import type {
  PatternModeConfigJson,
  PatternModeSubjectConfigJson,
  PatternModeQuestionsConfigJson,
  PatternModeSectionConfigJson,
  PatternModeQuestionsColumnConfigJson,
  SearchArea,
} from './config-schema'
import type { PatternModeFormQuestionDetails } from './json-config-to-form-data'

function getParsedRegexOrTextPattern(
  pattern: PatternModeSubjectConfigJson['start']['pattern'],
  withGlobalFlag: boolean,
): RegExp {
  const re = pattern.type === 'regex'
    ? regexParser(pattern.value)
    : new RegExp(regexpEscape(pattern.value))

  let flags = withGlobalFlag ? 'g' : ''
  flags += pattern.isCaseSensitive ? '' : 'i'

  return new RegExp(re.source, flags)
}

function getParsedQuestionsStartPattern(
  pattern: PatternModeQuestionsColumnConfigJson['start']['pattern'],
) {
  if (pattern.type === 'regex')
    return getParsedRegexOrTextPattern(pattern, true)

  const { prefix, suffix, questionRange, isCaseSensitive, relaxPaddedZeros } = pattern

  const escapedPrefix = prefix && regexpEscape(prefix)
  const escapedSuffix = suffix && regexpEscape(suffix)
  const match = questionRange.match(questionRangeRegex)
  const questionRangePattern = toRegexRange(
    match?.groups?.min ?? 1,
    match?.groups?.max ?? 200,
    { relaxZeros: relaxPaddedZeros, capture: true },
  )

  const flags = isCaseSensitive ? 'g' : 'gi'
  const source = escapedPrefix + questionRangePattern + escapedSuffix
  return new RegExp(source, flags)
}

function getParsedSettings(settingsConfig: PatternModeConfigJson['settings']) {
  const { linesToIgnore } = settingsConfig
  return {
    ...settingsConfig,
    linesToIgnore: (linesToIgnore || [])
      .map(pattern => getParsedRegexOrTextPattern(pattern, false)),
  }
}

function getParsedSearchArea(coords: SearchArea) {
  return {
    raw: { ...coords },
    parsed: { l: 0, r: 0, t: 0, b: 0 },
  }
}

function getParsedColumn(column: PatternModeQuestionsColumnConfigJson) {
  const { start, end, crop } = column
  return {
    start: {
      pattern: getParsedQuestionsStartPattern(start.pattern),
      searchIn: getParsedSearchArea(start.searchIn),
    },
    end: end
      ? {
          pattern: getParsedRegexOrTextPattern(end.pattern, false),
          searchIn: getParsedSearchArea(end.searchIn),
        }
      : undefined,
    crop: {
      within: {
        raw: { ...crop.within },
        parsed: {
          t: 0,
          b: 0,
        },
      },
      exactlyTo: {
        raw: { ...crop.exactlyTo },
        parsed: {
          l: null as null | number | undefined,
          r: 0,
        },
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

export function getQuestionsDetails(details: PatternModeQuestionsConfigJson['details']) {
  const marks: PatternModeFormQuestionDetails['marks'] = {
    cm: details.marks.cm,
    pm: 'pm' in details.marks ? details.marks.pm : 1,
    im: details.marks.im,
  }
  let answerOptions = '4'
  if ('answerOptions' in details) {
    answerOptions = details.answerOptions
  }

  let answerOptionsCounterTypePrimary = 'default'
  let answerOptionsCounterTypeSecondary = 'default'
  if ('answerOptionsCounterType' in details) {
    answerOptionsCounterTypePrimary = details.answerOptionsCounterType?.primary || 'default'
    answerOptionsCounterTypeSecondary = details.answerOptionsCounterType?.secondary || 'default'
  }
  return {
    type: details.type,
    answerOptions,
    marks,
    answerOptionsCounterTypePrimary,
    answerOptionsCounterTypeSecondary,
  } satisfies PatternModeFormQuestionDetails
}

function getParsedQuestions(
  questions: PatternModeQuestionsConfigJson,
  totalPages: number,
) {
  const pages = utilParsePdfPageNumbers(questions.pages, totalPages)
  const columns = questions.columns.map(getParsedColumn)
  const details = getQuestionsDetails(questions.details)

  const paragraphQuestionsCommonPart = questions.paragraphQuestionsCommonPart
    ? {
        pattern: getParsedRegexOrTextPattern(questions.paragraphQuestionsCommonPart.pattern, false),
        searchIn: getParsedSearchArea(questions.paragraphQuestionsCommonPart.searchIn),
      }
    : undefined

  const forTopCoordinateLookUpBy = Math.max(0, questions.forTopCoordinateLookUp?.by || 0)
  const forTopCoordinateLookUp = {
    by: forTopCoordinateLookUpBy,
    chainBy: forTopCoordinateLookUpBy
      ? Math.max(0, questions.forTopCoordinateLookUp?.chainBy || 0)
      : 0,
    for: new Set(
      forTopCoordinateLookUpBy && Array.isArray(questions.forTopCoordinateLookUp?.for)
        ? questions.forTopCoordinateLookUp.for
        : [],
    ),
  }

  const mergeQuestionsSplitBy = new Set(
    Array.isArray(questions.mergeQuestions?.splitBy)
      ? questions.mergeQuestions.splitBy
      : [],
  )

  return {
    ...questions,
    pages,
    details,
    forTopCoordinateLookUp,
    forBottomCoordinateUseBottom: new Set(
      Array.isArray(questions.forBottomCoordinateUseBottom)
        ? questions.forBottomCoordinateUseBottom
        : [],
    ),
    mergeQuestions: {
      splitBy: mergeQuestionsSplitBy,
      mergeOnlyIfContainsAny: new Set(
        Array.isArray(questions.mergeQuestions?.mergeOnlyIfContainsAny) && mergeQuestionsSplitBy.size > 0
          ? questions.mergeQuestions.mergeOnlyIfContainsAny
          : [],
      ),
    },
    paragraphQuestionsCommonPart,
    columns,
  }
}

function getParsedSection(
  sectionName: string,
  section: PatternModeSectionConfigJson,
  totalPages: number,
) {
  const questions = getParsedQuestions(section.questions, totalPages)
  const pattern = getParsedRegexOrTextPattern(section.pattern, true)
  const searchIn = {
    pages: utilParsePdfPageNumbers(section.searchIn.pages, totalPages),
    area: getParsedSearchArea(section.searchIn.area),
  }
  return {
    name: sectionName,
    pattern,
    searchIn,
    questions,
  }
}

function getParsedSubject(
  subjectName: string,
  subject: PatternModeSubjectConfigJson,
  totalPages: number,
) {
  const start = {
    pattern: getParsedRegexOrTextPattern(subject.start.pattern, true),
    searchIn: {
      pages: utilParsePdfPageNumbers(subject.start.searchIn.pages, totalPages),
      area: getParsedSearchArea(subject.start.searchIn.area),
    },
  }

  const end = subject.end
    ? {
        pattern: getParsedRegexOrTextPattern(subject.end.pattern, true),
        searchIn: {
          pages: utilParsePdfPageNumbers(subject.end.searchIn.pages, totalPages),
          area: getParsedSearchArea(subject.end.searchIn.area),
        },
      }
    : undefined

  const columnDividersRaw = (subject.columnDividers || '')
    .split(',')
    .map(s => s.trim())

  const columnDividers = {
    raw: columnDividersRaw,
    parsed: [] as number[],
  }

  if ('sections' in subject) {
    const sections = Object.entries(subject.sections)
      .map(([sectionName, section]) => getParsedSection(sectionName, section, totalPages))
    return {
      name: subjectName,
      start,
      end,
      columnDividers,
      sections,
    }
  }
  else {
    const questions = getParsedQuestions(subject.questions, totalPages)
    return {
      name: subjectName,
      start,
      end,
      columnDividers,
      sections: [{
        name: subjectName,
        ...structuredClone(start),
        questions,
      }],
    }
  }
}

export function getPatternModeParsedConfig(config: PatternModeConfigJson, totalPages: number) {
  const settings = getParsedSettings(config.settings)
  const subjects = Object.entries(config.subjects)
    .map(([subjectName, subject]) => getParsedSubject(subjectName, subject, totalPages))

  return {
    settings,
    subjects,
  }
}

export type PatternModeParsedConfig = ReturnType<typeof getPatternModeParsedConfig>
export type ParsedSubjectConfig = PatternModeParsedConfig['subjects'][number]
export type ParsedSectionConfig = ParsedSubjectConfig['sections'][number]
export type ParsedQuestionsConfig = ParsedSectionConfig['questions']
