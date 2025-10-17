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

export function getQuestionStartRegexRangePattern(patternData: {
  range: string
  isLeadingZeroesOptional: boolean | undefined
}) {
  const match = patternData.range.trim().match(questionRangeRegex)
  const minText = match?.groups?.start ?? '1'
  const maxText = match?.groups?.end ?? '200'

  const regexRangeOptions = {
    capture: true,
    relaxZeros: !!patternData.isLeadingZeroesOptional,
  }

  const range = toRegexRange(minText, maxText, regexRangeOptions)
    .replace(/^\(/, '')
    .replace(/\)$/, '')

  const regexRange = range
    .split('|')
    .reverse()
    .join('|')

  return `(${regexRange})`
}

function getParsedQuestionsStartPattern(
  pattern: PatternModeQuestionsColumnConfigJson['start']['pattern'],
) {
  if (pattern.type === 'regex')
    return getParsedRegexOrTextPattern(pattern, true)

  const { prefix, suffix, questionRange, isCaseSensitive, isLeadingZeroesOptional } = pattern

  const escapedPrefix = '^\\s*' + (prefix && regexpEscape(prefix))
  const escapedSuffix = suffix && regexpEscape(suffix)
  const questionRangePattern = getQuestionStartRegexRangePattern({
    range: questionRange,
    isLeadingZeroesOptional,
  })

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

function getCropOffsetData(
  offsetBy: NonNullable<PatternModeQuestionsColumnConfigJson['crop']>['offsetBy'],
) {
  return {
    l: offsetBy?.l || 0,
    r: offsetBy?.r || 0,
    t: offsetBy?.t || 0,
    b: offsetBy?.b || 0,
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
      offsetBy: getCropOffsetData(crop.offsetBy),
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

  const paraPart = questions.paragraphQuestions
  const paragraphQuestions = paraPart
    ? {
        start: {
          pattern: getParsedRegexOrTextPattern(paraPart.start.pattern, false),
          searchIn: getParsedSearchArea(paraPart.start.searchIn),
        },
        end: paraPart.end
          ? {
              pattern: getParsedRegexOrTextPattern(paraPart.end.pattern, false),
              searchIn: getParsedSearchArea(paraPart.end.searchIn),
            }
          : undefined,
        crop: {
          exactlyTo: {
            raw: { ...paraPart.crop?.exactlyTo },
            parsed: {
              l: null as null | number | undefined,
              r: null as null | number | undefined,
            },
          },
          offsetBy: getCropOffsetData(paraPart.crop.offsetBy),
        },
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
    paragraphQuestions,
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
  const numOfOptionalQuestions = section.numOfOptionalQuestions || 0
  return {
    name: sectionName,
    pattern,
    searchIn,
    questions,
    numOfOptionalQuestions,
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
    .filter(s => !!s)

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
        numOfOptionalQuestions: 0,
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

export function getPageNumsFromParsedConfig(
  parsedConfig: PatternModeParsedConfig,
) {
  const pageNums = new Set<number>()

  for (const subject of parsedConfig.subjects) {
    subject.start.searchIn.pages.forEach(page => pageNums.add(page))
    subject.end?.searchIn.pages.forEach(page => pageNums.add(page))

    for (const section of subject.sections) {
      section.searchIn.pages.forEach(page => pageNums.add(page))
      section.questions.pages.forEach(page => pageNums.add(page))
    }
  }

  const sortedPageNums = Array.from(pageNums).sort((a, b) => a - b)
  return sortedPageNums
}
