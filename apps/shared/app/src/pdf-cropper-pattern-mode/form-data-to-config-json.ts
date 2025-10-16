import type {
  PatternModeConfigJson,
  PatternModeSubjectConfigJson,
  PatternModeQuestionsConfigJson,
  PatternModeSectionConfigJson,
  PatternModeQuestionsColumnConfigJson,
  OffsetBy,
} from './config-schema'
import type {
  PatternModeFormData,
  PatternModeFormSubjectsData,
  PatternModeFormSubjectData,
  PatternModeFormSectionData,
  PatternModeFormQuestionsData,
} from './json-config-to-form-data'

function getCropOffsetData(formOffsetBy: NonNullable<OffsetBy>) {
  const offsetBy: OffsetBy = {}
  if (formOffsetBy.l !== 0)
    offsetBy.l = formOffsetBy.l
  if (formOffsetBy.r !== 0)
    offsetBy.r = formOffsetBy.r
  if (formOffsetBy.t !== 0)
    offsetBy.t = formOffsetBy.t
  if (formOffsetBy.b !== 0)
    offsetBy.b = formOffsetBy.b

  return Object.keys(offsetBy).length > 0 ? offsetBy : undefined
}

function getColumnData(
  column: PatternModeFormQuestionsData['columns'][number],
): PatternModeQuestionsColumnConfigJson {
  const { start, end, crop } = column

  let startPattern: PatternModeQuestionsColumnConfigJson['start']['pattern'] | null = null
  if (start.pattern.type === 'regex') {
    startPattern = {
      type: 'regex',
      value: start.pattern.value,
      isCaseSensitive: start.pattern.isCaseSensitive,
    }
  }
  else {
    startPattern = {
      type: 'text',
      prefix: start.pattern.prefix,
      questionRange: start.pattern.questionRange,
      suffix: start.pattern.suffix,
      isCaseSensitive: start.pattern.isCaseSensitive,
      isLeadingZeroesOptional: start.pattern.isLeadingZeroesOptional,
    }
  }

  const jsonData: PatternModeQuestionsColumnConfigJson = {
    start: {
      pattern: startPattern,
      searchIn: start.searchIn,
    },
    end: end.required
      ? { pattern: end.pattern, searchIn: end.searchIn }
      : undefined,
    crop: {
      within: crop.within,
      exactlyTo: {
        l: crop.exactlyTo.l?.trim() || undefined,
        r: crop.exactlyTo.r?.trim(),
      },
      offsetBy: getCropOffsetData(crop.offsetBy),
    },
  }
  return jsonData
}

function getQuestionsData(
  questionsConfig: PatternModeFormQuestionsData,
): PatternModeQuestionsConfigJson {
  const {
    details: qDetails,
    forBottomCoordinateUseBottom: qForBottomCoordinateUseBottom,
    forTopCoordinateLookUp: qForTopCoordinateLookUp,
    mergeQuestions: qMergeQuestions,
    paragraphQuestions: qParagraphQuestionsCommonPart,
    obtainedQuestionNum,
    columns: qColumns,
  } = questionsConfig

  const qParaExactlyTo = qParagraphQuestionsCommonPart.crop.exactlyTo

  let details: PatternModeQuestionsConfigJson['details'] | null = null
  if (qDetails.type === 'mcq' || qDetails.type === 'msm' || qDetails.type === 'msq') {
    if (qDetails.type === 'msq') {
      details = {
        type: 'msq',
        answerOptions: qDetails.answerOptions,
        marks: {
          cm: qDetails.marks.cm,
          pm: qDetails.marks.pm,
          im: qDetails.marks.im,
        },
        answerOptionsCounterType: {},
      }
    }
    else {
      details = {
        type: qDetails.type,
        answerOptions: qDetails.answerOptions,
        marks: {
          cm: qDetails.marks.cm,
          im: qDetails.marks.im,
        },
        answerOptionsCounterType: {},
      }
    }

    const {
      answerOptionsCounterTypePrimary,
      answerOptionsCounterTypeSecondary,
    } = qDetails

    const answerOptionsCounterType = details.answerOptionsCounterType!
    type AnswerOptionsCounterType = typeof answerOptionsCounterType.primary

    if (answerOptionsCounterTypePrimary !== 'default') {
      answerOptionsCounterType.primary = answerOptionsCounterTypePrimary as AnswerOptionsCounterType
    }
    if (answerOptionsCounterTypeSecondary !== 'default') {
      answerOptionsCounterType.secondary = answerOptionsCounterTypeSecondary as AnswerOptionsCounterType
    }

    if (Object.keys(answerOptionsCounterType).length === 0) {
      delete details.answerOptionsCounterType
    }
  }
  else {
    details = {
      type: qDetails.type,
      marks: {
        cm: qDetails.marks.cm,
        im: qDetails.marks.im,
      },
    }
  }

  const forBottomCoordinateUseBottom = qForBottomCoordinateUseBottom.required
    ? qForBottomCoordinateUseBottom.value
    : undefined

  const forTopCoordinateLookUp = qForTopCoordinateLookUp.required
    ? {
        by: qForTopCoordinateLookUp.by,
        chainBy: qForTopCoordinateLookUp.chainBy || undefined,
        for: qForTopCoordinateLookUp.for,
      }
    : undefined

  const mergeQuestions = qMergeQuestions.required
    ? {
        splitBy: qMergeQuestions.splitBy,
        mergeOnlyIfContainsAny: qMergeQuestions.mergeOnlyIfContainsAny,
      }
    : undefined

  const paragraphQuestions = qParagraphQuestionsCommonPart?.start?.required
    ? {
        start: {
          pattern: qParagraphQuestionsCommonPart.start.pattern,
          searchIn: qParagraphQuestionsCommonPart.start.searchIn,
        },
        end: qParagraphQuestionsCommonPart.end.required
          ? {
              pattern: qParagraphQuestionsCommonPart.end.pattern,
              searchIn: qParagraphQuestionsCommonPart.end.searchIn,
            }
          : undefined,
        crop: {
          exactlyTo: (qParaExactlyTo.l.trim() || qParaExactlyTo.r.trim())
            ? {
                l: qParaExactlyTo.l.trim() || undefined,
                r: qParaExactlyTo.r.trim() || undefined,
              }
            : undefined,
          offsetBy: getCropOffsetData(qParagraphQuestionsCommonPart.crop.offsetBy),
        },
      }
    : undefined

  return {
    pages: questionsConfig.pages,
    details,
    forBottomCoordinateUseBottom,
    forTopCoordinateLookUp,
    obtainedQuestionNum,
    mergeQuestions,
    paragraphQuestions,
    columns: qColumns
      .filter(col => !col.isRemoved)
      .map(getColumnData),
  }
}

export function getSectionData(section: PatternModeFormSectionData): PatternModeSectionConfigJson {
  return {
    pattern: section.pattern,
    searchIn: section.searchIn,
    numOfOptionalQuestions: section.numOfOptionalQuestions,
    questions: getQuestionsData(section.questions),
  }
}

export function getSubjectData(subject: PatternModeFormSubjectData): PatternModeSubjectConfigJson {
  const {
    start,
    subjectHasSections,
    sections,
  } = subject

  const columnDividers = subject.columnDividers || undefined
  const end = subject.end.required
    ? {
        pattern: subject.end.pattern,
        searchIn: subject.end.searchIn,
      }
    : undefined

  if (subjectHasSections) {
    return {
      start,
      end,
      columnDividers: columnDividers || undefined,
      sections: Object.fromEntries(
        Object.values(sections)
          .map((section) => {
            return [section.name, getSectionData(section)]
          }),
      ),
    }
  }
  else {
    return {
      start,
      end,
      columnDividers: columnDividers || undefined,
      questions: getQuestionsData(Object.values(sections)[0]!.questions),
    }
  }
}

export function getSubjectsData(subjects: PatternModeFormSubjectsData): PatternModeConfigJson['subjects'] {
  return Object.fromEntries(
    Object.values(subjects)
      .map((subject) => {
        return [subject.name, getSubjectData(subject)]
      }),
  )
}

export function getConfigJsonFromFormData(formData: PatternModeFormData): PatternModeConfigJson {
  const { settings, subjects } = formData
  return JSON.parse(JSON.stringify({
    settings: {
      ...settings,
      linesToIgnore: settings.linesToIgnore.filter(p => !!p.value.trim()),
    },
    subjects: getSubjectsData(subjects),
  }))
}
