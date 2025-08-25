import {
  minValue,
  required,
  decimal,
  requiredIf,
  maxValue,
  withMessage,
} from '@regle/rules'
import { useCustomRegle } from '#layers/shared/app/src/form-validation/regle.global.config'
import {
  pagesRule,
  absOrRelativeCoordRule,
  answerOptionsRule,
} from '#layers/shared/app/src/form-validation/custom-rules/rules'
import {
  type PatternModeFormData,
  getConfigData,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/json-config-to-form-data'
import defaultFormData from '#layers/shared/app/assets/json/fiitjee-mcq31-msq4-mcq31-nat40-new.json'
import type {
  PatternModeConfigJson,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/config-schema'
// const defaultFormValues: PatternModeFormData = {
//   settings: {
//     yCoordinateGroupingRangeForLine: 5,
//     ignoreElementsGoingOutsidePage: true,
//     linesToIgnore: [],
//   },
//   subjects: [
//     {
//       name: '',
//       start: {
//         pattern: {
//           type: 'text',
//           value: '',
//           isCaseSensitive: true,
//         },
//         searchIn: {
//           pages: '1-L',
//           area: {
//             l: '0',
//             r: '100%',
//             t: '0',
//             b: '100%',
//           },
//         },
//       },
//       subjectHasSections: true,
//       end: {
//         required: false,
//         pattern: {
//           type: 'text',
//           value: '',
//           isCaseSensitive: true,
//         },
//         searchIn: {
//           pages: '1-L',
//           area: {
//             l: '0',
//             r: '100%',
//             t: '0',
//             b: '100%',
//           },
//         },
//       },
//       columnDividers: '',
//       sections: [{
//         name: 'H',
//         pattern: {
//           type: 'text',
//           value: '',
//           isCaseSensitive: true,
//         },
//         searchIn: {
//           pages: '1-L',
//           area: {
//             l: '0',
//             r: '100%',
//             t: '0',
//             b: '100%',
//           },
//         },
//         questions: {
//           pages: '1-L',
//           details: {
//             type: 'mcq',
//             answerOptions: '4',
//             marks: {
//               cm: 4,
//               pm: 1,
//               im: -1,
//             },
//             answerOptionsCounterTypePrimary: 'default',
//             answerOptionsCounterTypeSecondary: 'default',
//           },
//           obtainedQuestionNum: {
//             whenDuplicate: 'ignore',
//             nextQNumMustBeOneNumGreater: true,
//           },
//           numOfOptionalQuestions: 0,
//         },
//       }],
//     },
//   ],
// }

const defaultFormValues: PatternModeFormData = getConfigData(defaultFormData.patternModeConfig as PatternModeConfigJson)

const patternAndSearchInRules = {
  pattern: {
    value: { required },
  },
  searchIn: {
    pages: { required, pagesRule },
    area: {
      l: { required, absOrRelativeCoordRule },
      r: { required, absOrRelativeCoordRule },
      t: { required, absOrRelativeCoordRule },
      b: { required, absOrRelativeCoordRule },
    },
  },
}

const getRegleInit = (formData: Ref<PatternModeFormData>) => useCustomRegle(formData, () => {
  return {
    subjects: {
      $each: (subject) => {
        const isSubjectEndRequired = () => subject.value.end.required
        const isSubjectHasSections = () => subject.value.subjectHasSections

        return {
          name: { required },
          start: {
            ...patternAndSearchInRules,
          },
          end: {
            pattern: {
              value: { required: requiredIf(isSubjectEndRequired) },
            },
            searchIn: {
              pages: { required: requiredIf(isSubjectEndRequired), pagesRule },
              area: {
                l: { required: requiredIf(isSubjectEndRequired), absOrRelativeCoordRule },
                r: { required: requiredIf(isSubjectEndRequired), absOrRelativeCoordRule },
                t: { required: requiredIf(isSubjectEndRequired), absOrRelativeCoordRule },
                b: { required: requiredIf(isSubjectEndRequired), absOrRelativeCoordRule },
              },
            },
          },
          sections: {
            $each: (section) => {
              const isParaRequired = () =>
                section.value.questions.paragraphQuestionsCommonPart.required

              const isTopCoordLookUpRequired = () =>
                section.value.questions.forTopCoordinateLookUp.required

              const isMergeQuestionsRequired = () =>
                section.value.questions.mergeQuestions?.required
              return {
                name: { required: requiredIf(isSubjectHasSections) },
                pattern: {
                  value: { required: requiredIf(isSubjectHasSections) },
                },
                searchIn: {
                  pages: { required: requiredIf(isSubjectHasSections), pagesRule },
                  area: {
                    l: { required: requiredIf(isSubjectHasSections), absOrRelativeCoordRule },
                    r: { required: requiredIf(isSubjectHasSections), absOrRelativeCoordRule },
                    t: { required: requiredIf(isSubjectHasSections), absOrRelativeCoordRule },
                    b: { required: requiredIf(isSubjectHasSections), absOrRelativeCoordRule },
                  },
                },
                numOfOptionalQuestions: { minValue: minValue(0) },
                questions: {
                  pages: { required, pagesRule },
                  details: {
                    type: { required },
                    answerOptions: {
                      required: requiredIf(() => section.value.questions.details.type !== 'nat'),
                      answerOptionsRule: answerOptionsRule(() => section.value.questions.details.type),
                    },
                    marks: {
                      cm: { required, minValue: minValue(1) },
                      im: { required, maxValue: maxValue(0) },
                      pm: { required: requiredIf(() => section.value.questions.details.type === 'msq') },
                    },
                  },
                  forTopCoordinateLookUp: {
                    by: { required: requiredIf(isTopCoordLookUpRequired), minValue: minValue(1) },
                    chainBy: { minValue: minValue(0) },
                    for: {
                      required: withMessage(
                        requiredIf(isTopCoordLookUpRequired),
                        'At least one option must be selected',
                      ),
                    },
                  },
                  mergeQuestions: {
                    splitBy: {
                      required: withMessage(
                        requiredIf(isMergeQuestionsRequired),
                        'At least one option must be selected',
                      ),
                    },
                  },
                  paragraphQuestionsCommonPart: {
                    pattern: {
                      value: { required: requiredIf(isParaRequired) },
                    },
                    searchIn: {
                      l: { required: requiredIf(isParaRequired), absOrRelativeCoordRule },
                      r: { required: requiredIf(isParaRequired), absOrRelativeCoordRule },
                      t: { required: requiredIf(isParaRequired), absOrRelativeCoordRule },
                      b: { required: requiredIf(isParaRequired), absOrRelativeCoordRule },
                    },
                  },
                  columns: {
                    $each: (column) => {
                      const isColumnEndRequired = () => column.value.end.required
                      const isQuestionStartPatternTypeRegex = () => column.value.start.pattern.type === 'regex'
                      const isQuestionStartPatternTypeText = () => column.value.start.pattern.type === 'text'
                      return {
                        start: {
                          pattern: {
                            value: { required: requiredIf(isQuestionStartPatternTypeRegex) },
                            questionRange: { required: requiredIf(isQuestionStartPatternTypeText) },
                          },
                          searchIn: patternAndSearchInRules.searchIn.area,
                        },
                        end: {
                          pattern: {
                            value: { required: requiredIf(isColumnEndRequired) },
                          },
                          searchIn: {
                            l: { required: requiredIf(isColumnEndRequired), absOrRelativeCoordRule },
                            r: { required: requiredIf(isColumnEndRequired), absOrRelativeCoordRule },
                            t: { required: requiredIf(isColumnEndRequired), absOrRelativeCoordRule },
                            b: { required: requiredIf(isColumnEndRequired), absOrRelativeCoordRule },
                          },
                        },
                        crop: {
                          within: {
                            t: { required, absOrRelativeCoordRule },
                            b: { required, absOrRelativeCoordRule },
                          },
                          exactlyTo: {
                            l: { absOrRelativeCoordRule },
                            r: { required, absOrRelativeCoordRule },
                          },
                          offsetBy: {
                            l: { decimal },
                            r: { decimal },
                            t: { decimal },
                            b: { decimal },
                          },
                        },
                      }
                    },
                  },
                },
              }
            },
          },
        }
      },
    },
  }
})

let form: Ref<PatternModeFormData> | null = null
let r$: ReturnType<typeof getRegleInit>['r$'] | null = null

export default () => {
  form ??= ref<PatternModeFormData>(utilCloneJson(defaultFormValues))

  r$ ??= getRegleInit(form).r$

  return {
    r$,
    form,
  }
}
