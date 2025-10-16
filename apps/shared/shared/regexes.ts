export const pageRegex = /^(?:(?:L[1-9]\d*)|L|[1-9]\d*)$/

export const pageRangeRegex = /^(?:(?:L[1-9]\d*)|L|[1-9]\d*)\s{0,3}-\s{0,3}(?:(?:L[1-9]\d*)|L|[1-9]\d*)$/

export const questionRangeRegex = /^(?<start>\d+)\s{0,3}-\s{0,3}(?<end>\d+)$/

export const absOrRelativeCoordinateRegex = /^\d+(?:\.\d+)?\s?%?$/

export const answerOptionsMcqAndMsqRegex = /^[1-9]\d?$/

export const answerOptionsMsmRegex = /^[1-9]\d?(?:x[1-9]\d?)?$/

export const digitsRegex = /\d+/
