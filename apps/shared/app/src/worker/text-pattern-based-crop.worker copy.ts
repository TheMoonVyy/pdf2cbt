import { SEPARATOR } from '#layers/shared/shared/constants'
import { expose as comlinkExpose } from 'comlink'

function getAbsoluteCoordinates(
  area: AbsOrRelativeOverlayCoords,
  pageWidth: number,
  pageHeight: number,
) {
  const l = area.l.trim().endsWith('%') ? Math.floor((parseInt(area.l) / 100) * pageWidth) : parseInt(area.l)
  const r = area.r.trim().endsWith('%') ? Math.floor((parseInt(area.r) / 100) * pageWidth) : parseInt(area.r)
  const t = area.t.trim().endsWith('%') ? Math.floor((parseInt(area.t) / 100) * pageHeight) : parseInt(area.t)
  const b = area.b.trim().endsWith('%') ? Math.floor((parseInt(area.b) / 100) * pageHeight) : parseInt(area.b)

  return { l, r, t, b }
}

const getParsedCropTosValue = (coord: string, relativeTo: number) => {
  if (!coord) return null
  const int = parseInt(coord)
  if (coord.endsWith('%')) {
    return Math.floor((int / 100) * relativeTo)
  }
  else {
    return int
  }
}

function updateSearchAreaCoordinates(
  parsedSubjectsConfig: PatternModeParsedSubjectsConfigData,
  pageNum: number,
  pageWidth: number,
  pageHeight: number,
) {
  for (const subjectConf of Object.values(parsedSubjectsConfig)) {
    if (subjectConf.searchIn.pages.has(pageNum)) {
      subjectConf.searchArea = getAbsoluteCoordinates(subjectConf.searchIn.area, pageWidth, pageHeight)
    }

    const questionConfigs = 'sections' in subjectConf
      ? Object.values(subjectConf.sections)
      : [subjectConf]

    for (const conf of questionConfigs) {
      if ('sections' in subjectConf && conf.searchIn.pages.has(pageNum)) {
        conf.searchArea = getAbsoluteCoordinates(conf.searchIn.area, pageWidth, pageHeight)
      }

      if (conf.questions.pages.has(pageNum)) {
        for (const column of conf.questions.columns) {
          column.start.searchArea = getAbsoluteCoordinates(
            column.start.searchInArea,
            pageWidth,
            pageHeight,
          )
          if (column.end) {
            column.end.searchArea = getAbsoluteCoordinates(
              column.end.searchInArea,
              pageWidth,
              pageHeight,
            )
          }
          const cropTo = Object.fromEntries(
            Object.entries(column.cropTo)
              .map(([k, v]) => [k, v.trim()]),
          ) as typeof column.cropTo

          column.parsedCropTo = {
            l: getParsedCropTosValue(cropTo.l, pageWidth),
            r: getParsedCropTosValue(cropTo.r, pageWidth) ?? pageWidth,
            t: getParsedCropTosValue(cropTo.t, pageHeight) ?? 0,
            b: getParsedCropTosValue(cropTo.b, pageHeight) ?? pageHeight,
          }
        }

        conf.questions.columns.sort((a, b) => a.parsedCropTo.r - b.parsedCropTo.r)
      }
    }
  }
}

type State = {
  croppedOverlays: Map<string, PdfCroppedOverlayData>
  subjects: PatternModeParsedSubjectsConfigData[string][]
  sections: PatternModeParsedSectionsConfigData['sections'][string][]
  questions: null | PatternModeParsedQuestionsConfig['questions']
  columnDividers: string
  parsedColumnDividers: number[]
  currentSubject: string | null
  currentSection: string | null
  overlaysPerQuestionCount: Map<string, number>
  currentQuestions: null | {
    column: PatternModeParsedQuestionsConfig['questions']['columns'][number]
    lastLine: {
      t: number
      b: number
    }
    lastQNum: number | null
    mergeNextCrop: boolean
    current: null | { qNum: number, l: number, t: number }
  }
}

const setParsedColumnDividers = (state: State, pageWidth: number) => {
  const columnDividers = state.columnDividers
  state.parsedColumnDividers = []

  if (!columnDividers) return

  const getAbsCoord = (s: string) => {
    if (s.endsWith('%'))
      return Math.floor((parseInt(s) / 100) * pageWidth)
    else
      return parseInt(s)
  }

  const dividers = columnDividers.split(',').map(s => getAbsCoord(s.trim()))
  if (dividers.length > 0) {
    state.parsedColumnDividers = dividers
  }
}

const getTopCoordFromTopCoordLookUpRange = (
  pageLines: PageTextLineData[],
  currentLineIndex: number,
  topCoordlookUpRange: number,
  currentTopCoord: number,
  minL: number,
  maxR: number,
): number => {
  const leastY = currentTopCoord - topCoordlookUpRange
  if (leastY <= 0 || currentLineIndex <= 0 || topCoordlookUpRange <= 0)
    return currentTopCoord

  let indexOfTopMostLineInRange = currentLineIndex - 1
  for (; indexOfTopMostLineInRange >= 0; indexOfTopMostLineInRange--) {
    const line = pageLines[indexOfTopMostLineInRange]
    if (!line) continue

    if (line.minY < leastY)
      break
  }

  for (; indexOfTopMostLineInRange < currentLineIndex; indexOfTopMostLineInRange++) {
    const topLine = pageLines[indexOfTopMostLineInRange]
    if (!topLine) continue

    const topCoords = topLine.chars
      .filter(char => char.l > minL && char.r < maxR && char.b >= leastY)
      .map(char => char.t)

    if (topCoords.length > 0) {
      return Math.min(...topCoords)
    }
  }

  return currentTopCoord
}

const setLastLineCoords = (
  currentQuestions: NonNullable<State['currentQuestions']>,
  lastLineData: PageTextLineData,
) => {
  const r = currentQuestions.column.parsedCropTo.r
  const l = currentQuestions.column.parsedCropTo.l ?? currentQuestions?.current?.l
  if (typeof l !== 'number' || typeof r !== 'number')
    return

  const filteredLineData = lastLineData.chars.filter(char => char.l >= l && char.r <= r)
  if (filteredLineData.length === 0)
    return

  currentQuestions.lastLine.t = Math.min(...filteredLineData.map(char => char.t))
  currentQuestions.lastLine.b = Math.max(...filteredLineData.map(char => char.b))
}

function endQuestion(
  state: State,
  endLineTopCoord: number,
  pageImages: PdfTextData[number]['images'],
  pageNum: number,
  pageWidth: number,
  pageHeight: number,
) {
  const { currentSubject, currentSection, currentQuestions, questions } = state
  if (!currentSubject || !currentSection || !questions || !currentQuestions?.current) return

  const coords = {
    l: currentQuestions.column.parsedCropTo.l ?? currentQuestions.current.l,
    r: currentQuestions.column.parsedCropTo.r ?? pageWidth,
    t: Math.max(currentQuestions.column.parsedCropTo.t, currentQuestions.current.t),
    b: Math.min(currentQuestions.column.parsedCropTo.b, endLineTopCoord),
  }

  if (questions.useLastLineOrImageForBottomCoordinate) {
    const lastLineBottomCoord = currentQuestions.lastLine.b
    const imagesInsideQuestionArea = pageImages
      .filter(area => area.l >= coords.l && area.r <= coords.r && area.t >= coords.t && area.b <= coords.b)

    const highestBottomCoord = Math.max(lastLineBottomCoord, ...imagesInsideQuestionArea.map(image => image.b))
    coords.b = Math.min(coords.b, highestBottomCoord)
  }

  const queId = `${currentSection || currentSubject}${SEPARATOR}${currentQuestions.current.qNum}`
  const existingQueImgNum = state.overlaysPerQuestionCount.get(queId)
  let imgNum = 1
  if (typeof existingQueImgNum === 'number') {
    if (questions.duplicateQuestion === 'merge' || currentQuestions.mergeNextCrop) {
      imgNum = existingQueImgNum + 1
    }
    else if (questions.duplicateQuestion === 'replace') {
      for (const oldImgNum of utilRange(1, existingQueImgNum + 1)) {
        const existingId = queId + SEPARATOR + oldImgNum
        state.croppedOverlays.delete(existingId)
      }
      state.overlaysPerQuestionCount.delete(queId)
    }
  }

  const id = queId + SEPARATOR + imgNum
  const questionData: PdfCroppedOverlayData = {
    queId,
    id,
    subject: currentSubject,
    section: currentSection,
    que: currentQuestions.current.qNum,
    imgNum,
    pdfData: {
      page: pageNum,
      l: Math.max(0, coords.l + currentQuestions.column.offsetBy.l),
      r: Math.min(pageWidth, coords.r + currentQuestions.column.offsetBy.r),
      t: Math.max(0, coords.t + currentQuestions.column.offsetBy.t),
      b: Math.min(pageHeight, coords.b + currentQuestions.column.offsetBy.b),
    },
    ...structuredClone(questions.details),
  }

  state.croppedOverlays.set(id, questionData)
  state.overlaysPerQuestionCount.set(queId, imgNum)

  currentQuestions.mergeNextCrop = false
  return { queId, id }
}

function extractSubStringAndPadWithSpaces(str: string, startIndex: number, endIndex: number) {
  if (startIndex === endIndex) {
    return ' '.repeat(str.length)
  }

  const sub = str.slice(startIndex, endIndex)
  return ' '.repeat(startIndex) + sub + ' '.repeat(str.length - endIndex)
}

function dividePageTextByColumns(
  dividers: number[],
  pageLines: PageTextLineData[],
) {
  if (dividers.length === 0) {
    pageLines.forEach(line => delete line.columns)
    return
  }

  for (const line of pageLines) {
    const chars = line.chars
    const columns: Required<PageTextLineData['columns']> = []

    let start = 0
    let end = 0
    for (const colR of dividers) {
      for (; end < chars.length; end++) {
        const char = chars[end]!

        if (char.l >= colR) break
      }
      columns.push(extractSubStringAndPadWithSpaces(line.text, start, end))
      start = end
    }

    end = line.text.length
    columns.push(extractSubStringAndPadWithSpaces(line.text, start, end))

    line.columns = columns
  }
}

async function patternBasedCrop(
  config: PatternModeParsedConfigData,
  pdfTextData: PdfTextData,
  pagesData: PageImgData,
) {
  const state: State = {
    croppedOverlays: new Map(),
    subjects: Object.values(config),
    sections: [],
    questions: null,
    columnDividers: '',
    parsedColumnDividers: [],
    overlaysPerQuestionCount: new Map(),
    currentSubject: null,
    currentSection: null,
    currentQuestions: null,
  }

  for (const [pageNumStr, pageTextData] of Object.entries(pdfTextData)) {
    const pageNum = parseInt(pageNumStr)
    const { width: pageWidth, height: pageHeight } = pagesData[pageNum]!
    updateSearchAreaCoordinates(config, pageNum, pageWidth, pageHeight)
    setParsedColumnDividers(state, pageWidth)

    const { lines, images } = pageTextData

    dividePageTextByColumns(state.parsedColumnDividers, lines)

    let columnIndex = 0
    for (let i = 0; i < lines.length; i++) {
      if (Array.isArray(state.questions?.columns) && state.currentQuestions?.column) {
        const newColumn = state.questions.columns[columnIndex]
        if (newColumn) {
          state.currentQuestions.column = newColumn
        }
      }

      const lineData = lines[i]!
      let text = lineData.columns?.[columnIndex] ?? lineData.text

      const subjectOrSectionLineText = lineData.text
      for (const group of ['subjects', 'sections'] as const) {
        const matchedIndex = state[group]
          .findIndex((c) => {
            const result = c.patternValue.test(subjectOrSectionLineText)
            c.patternValue.lastIndex = 0
            return result
          })

        if (matchedIndex >= 0) {
          const {
            patternValue,
            searchIn: { pages },
            searchArea,
          } = state[group][matchedIndex]!

          if (pages.has(pageNum)) {
            for (const match of subjectOrSectionLineText.matchAll(patternValue)) {
              const startIndex = match.index
              const endIndex = startIndex + match[0]!.length - 1

              const startChar = lineData.chars[startIndex]!
              const endChar = lineData.chars[endIndex]!

              if (
                startChar.l >= searchArea.l
                && endChar.r <= searchArea.r
                && Math.min(startChar.t, endChar.t) >= searchArea.t
                && Math.max(startChar.b, endChar.b) <= searchArea.b
              ) {
                if (state.parsedColumnDividers.length > 0) {
                  if (columnIndex === 0) { // first column
                    const maxR = state.parsedColumnDividers[0]!
                    if (startChar.l > maxR)
                      continue
                  }
                  else if (columnIndex === state.parsedColumnDividers.length) { // is last column
                    const l = state.parsedColumnDividers[columnIndex - 1]!
                    if (startChar.l < l)
                      continue
                  }
                  else { // not first or last column, somewhere in between
                    const l = state.parsedColumnDividers[columnIndex - 1]!
                    const r = state.parsedColumnDividers[columnIndex]!
                    if (startChar.l < l || startChar.l > r)
                      continue
                  }
                }

                if (state.currentQuestions?.current) {
                  endQuestion(state, startChar.l, images, pageNum, pageWidth, pageHeight)
                }

                if (group === 'subjects') {
                  const subjectConfig = state.subjects.splice(matchedIndex, 1)[0]!

                  if ('sections' in subjectConfig) {
                    state.sections = Object.values(subjectConfig.sections)
                    state.questions = null
                    state.currentQuestions = null
                  }
                  else {
                    state.sections = []
                    state.questions = subjectConfig.questions
                    const column = state.questions.columns[columnIndex]
                    state.currentQuestions = column
                      ? {
                          column,
                          lastLine: { t: -Infinity, b: Infinity },
                          mergeNextCrop: false,
                          lastQNum: null,
                          current: null,
                        }
                      : null
                  }

                  state.currentSubject = subjectConfig.name
                  state.currentSection = null
                  state.columnDividers = subjectConfig.columnDividers || ''
                  setParsedColumnDividers(state, pageWidth)
                  dividePageTextByColumns(state.parsedColumnDividers, lines)
                  text = lineData.columns?.[columnIndex] ?? lineData.text
                }
                else {
                  const sectionConfig = state.sections.splice(matchedIndex, 1)[0]!
                  state.currentSection = sectionConfig.name
                  state.questions = sectionConfig.questions

                  const column = state.questions.columns[columnIndex]
                  state.currentQuestions = column
                    ? {
                        column,
                        lastLine: { t: -Infinity, b: Infinity },
                        mergeNextCrop: false,
                        lastQNum: null,
                        current: null,
                      }
                    : null
                }
                break
              }
            }
          }
        }
      }

      const { currentSubject, currentSection, questions, currentQuestions } = state
      if (currentSubject && currentQuestions?.column && questions?.pages.has(pageNum)) {
        if (currentQuestions.current && currentQuestions.column.end) {
          const end = currentQuestions.column.end

          for (const match of text.matchAll(end.patternValue)) {
            const startIndex = match.index
            const endIndex = startIndex + match[0]!.length - 1

            const startChar = lineData.chars[startIndex]!
            const endChar = lineData.chars[endIndex]!

            if (
              startChar.l >= end.searchArea.l
              && endChar.r <= end.searchArea.r
              && Math.min(startChar.t, endChar.t) >= end.searchArea.t
              && Math.max(startChar.b, endChar.b) <= end.searchArea.b
            ) {
              endQuestion(state, lineData.minY, images, pageNum, pageWidth, pageHeight)
              currentQuestions.current = null
              break
            }
          }
        }
        const start = currentQuestions.column.start

        for (const match of text.matchAll(start.patternValue)) {
          const startIndex = match.index
          const endIndex = startIndex + match[0]!.length - 1

          const startChar = lineData.chars[startIndex]!
          const endChar = lineData.chars[endIndex]!

          if (
            startChar.l >= start.searchArea.l
            && endChar.r <= start.searchArea.r
            && Math.min(startChar.t, endChar.t) >= start.searchArea.t
            && Math.max(startChar.b, endChar.b) <= start.searchArea.b
          ) {
            const qNum = parseInt(match[1] || '')

            if (Number.isNaN(qNum))
              continue

            const queId = `${currentSection || currentSubject}${SEPARATOR}${qNum}`
            if (state.overlaysPerQuestionCount.has(queId) && state.questions?.duplicateQuestion === 'ignore')
              continue
            if (
              questions.nextQuestionMustBeOneQNumGreater
              && typeof currentQuestions.lastQNum === 'number'
              && qNum !== currentQuestions.lastQNum + 1
            ) {
              continue
            }

            let minY = lineData.minY
            if (questions.considerImageTopCoordinateForQuestionStart) {
              const startLineCoords = {
                l: startChar.l,
                t: lineData.minY,
                b: lineData.maxY,
                r: currentQuestions.column.parsedCropTo.r ?? pageWidth,
              }
              const imagesOverlappingOnStartLine = images
                .filter(img =>
                  !(
                    img.r <= startLineCoords.l
                    || img.l >= startLineCoords.r
                    || img.b <= startLineCoords.t
                    || img.t >= startLineCoords.b
                  ),
                )
              const topmostOverlappingImageTCoord = imagesOverlappingOnStartLine
                .reduce((min, img) => Math.min(min, img.t), Infinity)

              minY = Math.min(lineData.minY, topmostOverlappingImageTCoord)
            }

            if (questions.topCoordRangeTolookUpTextForQuestionStart && i) {
              minY = getTopCoordFromTopCoordLookUpRange(
                lines,
                i,
                questions.topCoordRangeTolookUpTextForQuestionStart,
                minY,
                currentQuestions.column.parsedCropTo.l ?? startChar.l,
                currentQuestions.column.parsedCropTo.r,
              )
            }

            if (currentQuestions.current) {
              if (currentQuestions.mergeNextCrop)
                currentQuestions.current.l = startChar.l

              endQuestion(state, minY, images, pageNum, pageWidth, pageHeight)
              currentQuestions.current = null
            }

            currentQuestions.current = {
              qNum,
              l: startChar.l,
              t: minY,
            }
            currentQuestions.lastQNum = qNum
            break
          }
        }

        setLastLineCoords(currentQuestions, lineData)
      }

      if (i === lines.length - 1 // is last line of page
        && questions?.columns
        && (columnIndex + 1) < questions.columns.length
      ) {
        columnIndex++
        i = -1
        if (currentQuestions?.current) {
          endQuestion(state, pageHeight, images, pageNum, pageWidth, pageHeight)
          if (state.questions?.mergeQuestionsByColumns) {
            currentQuestions.current.t = 0
            currentQuestions.current.l = currentQuestions.column.parsedCropTo.r + 2
            currentQuestions.mergeNextCrop = true
          }
          else {
            currentQuestions.current = null
          }
        }
      }
    }

    if (state.currentQuestions?.current) {
      endQuestion(state, pageHeight, images, pageNum, pageWidth, pageHeight)
      if (state.questions?.mergeQuestionsByPages) {
        state.currentQuestions.current.t = 0
        state.currentQuestions.mergeNextCrop = true
      }
      else {
        state.currentQuestions.current = null
      }
    }
  }

  const { croppedOverlays } = state

  return croppedOverlays
}

export type PatternBasedCropFn = typeof patternBasedCrop

comlinkExpose(patternBasedCrop)
