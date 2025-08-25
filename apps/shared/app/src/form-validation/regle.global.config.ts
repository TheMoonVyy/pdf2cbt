import { defineRegleConfig, type RegleCustomFieldStatus } from '@regle/core'
import { required, withMessage } from '@regle/rules'
import { pagesRule, absOrRelativeCoordRule, answerOptionsRule } from './custom-rules/rules'

export const { useRegle: useCustomRegle, inferRules: inferCustomRules } = defineRegleConfig({
  rules: () => ({
    /** Customizing default message */
    required: withMessage(required, 'This is required.'),
    /** Registering custom rules */
    pagesRule,
    absOrRelativeCoordRule,
    answerOptionsRule,
  }),
  /** Registering custom properties */
  shortcuts: {
    fields: {
      $isRequired: field => field.$rules.required?.$active ?? false,
    },
    nested: {
      $isEmpty: nest => Object.keys(nest.$fields).length === 0,
    },
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldProp<T = any> = RegleCustomFieldStatus<typeof useCustomRegle, T> | undefined
