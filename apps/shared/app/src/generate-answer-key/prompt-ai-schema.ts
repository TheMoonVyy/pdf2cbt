import { z } from 'zod'

export type PromptOutputMetaData = {
  [qNumRelativeToTest: Numberish]: Pick<
    GenerateAnswerKeyInternalQuestionData, 'type' | 'answerOptionsCount' | 'qNum'
  > & { subject: string, section: string }
}

export function getPromptOutputJsonSchema(outputMetaData: PromptOutputMetaData) {
  const totalQuestions = Object.keys(outputMetaData).length

  const questionKeySchema = z.string()
    .refine((key) => {
      const num = Number(key)
      return Number.isInteger(num) && num >= 1 && num <= totalQuestions
    }, {
      error: `key must be question number (integer) relative to test (1-${totalQuestions})`,
    })

  return z.record(questionKeySchema, z.any()).superRefine((val, ctx) => {
    const provided = Object.keys(val).length

    if (provided !== totalQuestions) {
      ctx.addIssue({
        code: 'custom',
        message: `JSON must contain answers for ${totalQuestions} questions (got ${provided}).`,
      })
    }

    for (let i = 1; i <= totalQuestions; i++) {
      const key = String(i)
      if (!(key in val)) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: `Missing answer for question ${key}.`,
        })
      }
    }

    for (const [qNum, answer] of Object.entries(val)) {
      const meta = outputMetaData[qNum]
      if (!meta) continue
      if (answer === 'dropped' || answer === 'bonus') continue

      const { type, answerOptionsCount, subject, section } = meta
      const rows = answerOptionsCount.rows
      const cols = answerOptionsCount.cols

      const label = `Q${qNum} (${subject}/${section}/${type.toUpperCase()})`

      if ((type === 'mcq' || type === 'msq')) {
        if (!Array.isArray(answer)) {
          ctx.addIssue({
            code: 'custom',
            path: [qNum],
            message: `${label}: expected array of option numbers (1-${rows}).`,
          })
          continue
        }

        if (answer.length === 0) {
          ctx.addIssue({
            code: 'custom',
            path: [qNum],
            message: `${label}: at least one option required.`,
          })
          continue
        }

        if (answer.length > rows) {
          ctx.addIssue({
            code: 'custom',
            path: [qNum],
            message: `${label}: cannot have more than ${rows} option(s).`,
          })
          continue
        }

        const seen = new Set<number>()

        answer.forEach((opt, i) => {
          const optPath = [qNum, i]

          if (!Number.isSafeInteger(opt)) {
            ctx.addIssue({
              code: 'custom',
              path: optPath,
              message: `${label}: option must be integer.`,
            })
            return
          }

          if (opt < 1 || opt > rows) {
            ctx.addIssue({
              code: 'custom',
              path: optPath,
              message: `${label}: option must be 1-${rows}.`,
            })
          }

          if (seen.has(opt)) {
            ctx.addIssue({
              code: 'custom',
              path: optPath,
              message: `${label}: duplicate option ${opt}.`,
            })
          }

          seen.add(opt)
        })
      }

      else if (type === 'nat') {
        if (!Array.isArray(answer)) {
          ctx.addIssue({
            code: 'custom',
            path: [qNum],
            message: `${label}: expected array of numbers or ranges.`,
          })
          continue
        }

        if (answer.length === 0) {
          ctx.addIssue({
            code: 'custom',
            path: [qNum],
            message: `${label}: at least one value required.`,
          })
        }

        answer.forEach((a, i) => {
          const natPath = [qNum, i]

          if (typeof a === 'number') return

          if (!a || typeof a !== 'object') {
            ctx.addIssue({
              code: 'custom',
              path: natPath,
              message: `${label}: value must be number or { min, max }.`,
            })
            return
          }

          if (typeof a.min !== 'number' || typeof a.max !== 'number') {
            ctx.addIssue({
              code: 'custom',
              path: natPath,
              message: `${label}: range must contain numeric min and max.`,
            })
            return
          }
        })
      }

      else if (type === 'msm') {
        if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
          ctx.addIssue({
            code: 'custom',
            path: [qNum],
            message: `${label}: expected object with rows 1-${rows}.`,
          })
          continue
        }

        const keys = Object.keys(answer)
        const requiredRows = Array.from({ length: rows }, (_, i) => i + 1)
        const seenRows = new Set<number>()

        for (const key of keys) {
          const r = Number(key)

          if (!Number.isSafeInteger(r) || r < 1 || r > rows) {
            ctx.addIssue({
              code: 'custom',
              path: [qNum, key],
              message: `${label}: row must be integer 1-${rows}.`,
            })
            continue
          }

          if (seenRows.has(r)) {
            ctx.addIssue({
              code: 'custom',
              path: [qNum, key],
              message: `${label}: duplicate row ${r}.`,
            })
            continue
          }

          seenRows.add(r)
        }

        for (const r of requiredRows) {
          if (!seenRows.has(r)) {
            ctx.addIssue({
              code: 'custom',
              path: [qNum, String(r)],
              message: `${label}: missing row ${r}.`,
            })
          }
        }

        if (seenRows.size !== rows) continue

        for (const r of requiredRows) {
          const colsArr = (answer as Record<string, unknown>)[r]
          const rowPath = [qNum, String(r)]

          if (!Array.isArray(colsArr)) {
            ctx.addIssue({
              code: 'custom',
              path: rowPath,
              message: `${label}: row ${r} must be array of columns (1-${cols}).`,
            })
            continue
          }

          if (colsArr.length === 0) {
            ctx.addIssue({
              code: 'custom',
              path: rowPath,
              message: `${label}: row ${r} must have >= 1 column.`,
            })
          }

          const seenCols = new Set<number>()

          colsArr.forEach((c, i) => {
            const colPath = [...rowPath, i]

            if (!Number.isSafeInteger(c)) {
              ctx.addIssue({
                code: 'custom',
                path: colPath,
                message: `${label}: column must be integer.`,
              })
              return
            }

            if (c < 1 || c > cols) {
              ctx.addIssue({
                code: 'custom',
                path: colPath,
                message: `${label}: column must be 1-${cols}.`,
              })
              return
            }

            if (seenCols.has(c)) {
              ctx.addIssue({
                code: 'custom',
                path: colPath,
                message: `${label}: duplicate column ${c} in row ${r}.`,
              })
              return
            }

            seenCols.add(c)
          })
        }
      }
    }
  })
}

export const prettifyError = z.prettifyError
