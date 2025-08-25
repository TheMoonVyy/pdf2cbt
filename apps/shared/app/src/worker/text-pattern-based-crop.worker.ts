import { SEPARATOR } from '#layers/shared/shared/constants'
import { expose as comlinkExpose } from 'comlink'
import type {
  PatternModeParsedConfig,
  ParsedSubjectConfig,
  ParsedSectionConfig,
  ParsedQuestionsConfig,
} from '../pdf-cropper-pattern-mode/parsed-config-for-cropper'

type NormalizedCoordinates = PdfCroppedOverlayCoords

// normalise coordinate which may be relative to page to pdf coordinate units
function getNormalizedCoordinate(coord: string, sideLength: number) {
  const str = coord.trim()
  return str.endsWith('%')
    ? Math.floor((parseInt(str) / 100) * sideLength)
    : parseInt(str)
}

// getNormalizedCoordinate's object variant,
// only parse and return the coordinates provided in coords param
function getNormalizedCoordinates<T extends Partial<AbsOrRelativeOverlayCoords>>(
  coords: T,
  pageDims: { w: number, h: number },
): { [K in keyof T]: number } {
  const result: Partial<NormalizedCoordinates> = {}

  if (typeof coords.l === 'string') {
    result.l = getNormalizedCoordinate(coords.l, pageDims.w)
  }
  if (typeof coords.r === 'string') {
    result.r = getNormalizedCoordinate(coords.r, pageDims.w)
  }
  if (typeof coords.t === 'string') {
    result.t = getNormalizedCoordinate(coords.t, pageDims.h)
  }
  if (typeof coords.b === 'string') {
    result.b = getNormalizedCoordinate(coords.b, pageDims.h)
  }

  return result as { [K in keyof T]: number }
}

// Overload signatures
function getTextCharsOfLineInSearchArea(
  searchArea: NormalizedCoordinates,
  lineData: PageTextLineData,
  pageWidth: number,
  returnTextAsWell?: true
): { chars: PageTextChar[], text: string } | null

function getTextCharsOfLineInSearchArea(
  searchArea: NormalizedCoordinates,
  lineData: PageTextLineData,
  pageWidth: number,
  returnTextAsWell: false
): { chars: PageTextChar[] } | null

function getTextCharsOfLineInSearchArea(
  searchArea: NormalizedCoordinates,
  lineData: PageTextLineData,
  pageWidth: number,
  returnTextAsWell: boolean = true,
) {
  const { l, r, t, b } = searchArea
  const { minY, maxY } = lineData

  if (maxY < t || minY > b) return null

  const charsToSearchIn = l <= 1 && r + 1 >= pageWidth
    ? lineData.chars
    : lineData.chars.filter(char => char.l >= l && char.r <= r && char.t >= t && char.b <= b)

  if (charsToSearchIn.length === 0) return null

  if (returnTextAsWell) {
    const text = charsToSearchIn
      .map(char => char.c)
      .join('')

    return {
      chars: charsToSearchIn,
      text,
    }
  }
  else {
    return {
      chars: charsToSearchIn,
    }
  }
}

function getImageOrVectorAreasInSearchArea(
  searchArea: NormalizedCoordinates,
  imagesOrVectors: NormalizedCoordinates[],
  includeOverflowWithMinT: null | number = null,
) {
  const { l, r, t, b } = searchArea

  return imagesOrVectors.filter((area) => {
    if (typeof includeOverflowWithMinT === 'number') {
      // Include area that overflow the search area provided that it is within the minT limit
      return area.t > includeOverflowWithMinT
        && (area.l >= l && area.r <= r && area.b >= t && area.t <= b)
    }
    // Only include area that is fully inside or exactly overlaps with the search area
    return area.l >= l && area.r <= r && area.t >= t && area.b <= b
  })
}

// Update the area coordinates throughout the config for the given (current) page dimensions
// This is needed because the coordinates may be relative (%) to page dimensions
function updateAreaCoordinatesInConfig(
  subjectsConfig: PatternModeParsedConfig['subjects'],
  page: { num: number, w: number, h: number },
) {
  const pageDims = { w: page.w, h: page.h }

  for (const subjectConf of subjectsConfig) {
    for (const startOrEnd of ['start', 'end'] as const) {
      if (subjectConf[startOrEnd]?.searchIn.pages.has(page.num)) {
        subjectConf[startOrEnd].searchIn.area.parsed = getNormalizedCoordinates(
          subjectConf[startOrEnd].searchIn.area.raw,
          pageDims,
        )
      }
    }

    for (const conf of subjectConf.sections) {
      if (conf.searchIn.pages.has(page.num)) {
        conf.searchIn.area.parsed = getNormalizedCoordinates(conf.searchIn.area.raw, pageDims)
      }

      if (conf.questions.pages.has(page.num)) {
        for (const column of conf.questions.columns) {
          for (const startOrEnd of ['start', 'end'] as const) {
            const searchIn = column[startOrEnd]?.searchIn
            if (!searchIn) continue

            searchIn.parsed = getNormalizedCoordinates(searchIn.raw, pageDims)
          }

          const crop = column.crop
          crop.within.parsed = getNormalizedCoordinates(crop.within.raw, pageDims)

          crop.exactlyTo.parsed.l = crop.exactlyTo.raw.l
            ? getNormalizedCoordinate(crop.exactlyTo.raw.l, pageDims.w)
            : null // use l coordinate from question start text
          crop.exactlyTo.parsed.r = getNormalizedCoordinate(crop.exactlyTo.raw.r, pageDims.w)
        }

        // sort columns by their r coordinate
        conf.questions.columns.sort(
          (a, b) => a.crop.exactlyTo.parsed.r - b.crop.exactlyTo.parsed.r,
        )

        const paragraphQuestionsCommonPart = conf.questions.paragraphQuestionsCommonPart
        if (paragraphQuestionsCommonPart) {
          paragraphQuestionsCommonPart.searchIn.parsed = getNormalizedCoordinates(
            paragraphQuestionsCommonPart.searchIn.raw,
            pageDims,
          )
        }
      }
    }
  }
}

type QuestionsState = ParsedQuestionsConfig & {
  currentState: null
    | {
      column: ParsedQuestionsConfig['columns'][number]
      lastQNum: number | null
      mergeNextCrop: boolean
      que: null | { qNum: number, l: number, t: number }
      paragraphQues: null | {
        current: null | { t: number, l: number }
        commonOverlayPdfDatas: null | PdfCroppedOverlayData['pdfData'][]
      }
    }
}

type SectionState = Omit<ParsedSectionConfig, 'questions'> & {
  questions: QuestionsState
}

type State = {
  croppedOverlays: Map<string, PdfCroppedOverlayData>
  overlaysPerQuestionCount: Map<string, number>
  subjects: PatternModeParsedConfig['subjects']
  currentSubject: null
    | (
      ParsedSubjectConfig & {
        currentSection: SectionState | null
      }
    )
}

const updateParsedColumnDividers = (state: State, pageWidth: number) => {
  const columnDividers = state.currentSubject?.columnDividers
  if (!columnDividers) return

  if (state.currentSubject) {
    columnDividers.parsed = columnDividers.raw
      .map(str => getNormalizedCoordinate(str, pageWidth))
  }
}

// const getTopCoordFromLookUpRange = (
//   pagePatternData: PagePatternModeData,
//   questionsConfig: QuestionsState,
//   currentLineIndex: number,
//   initialTopCoord: number,
//   areaLimits: { l: number, r: number, t: number },
// ): number => {
//   const lookUp = questionsConfig.forTopCoordinateLookUp

//   if (initialTopCoord <= 0 || !lookUp || lookUp.by <= 0)
//     return initialTopCoord

//   const { l, r, t } = areaLimits

//   console.log(questionsConfig, areaLimits, initialTopCoord)

//   let currentTopCoord = initialTopCoord
//   let lookUpByOrChainBy = lookUp.by
//   let found = false
//   while (currentTopCoord > t) {
//     found = false
//     console.log('loop: ', questionsConfig, areaLimits, initialTopCoord, currentTopCoord)

//     for (const lookUpType of lookUp.for) {
//       if (lookUpType === 'images') {
//         const newTopCoord = currentTopCoord - lookUpByOrChainBy
//         if (newTopCoord <= t)
//           return currentTopCoord

//         const areaConstraints = {
//           l: l,
//           r: r,
//           t: newTopCoord,
//           b: currentTopCoord,
//         }

//         const images = getImageOrVectorAreasInSearchArea(areaConstraints, pagePatternData.images, t)
//         if (images.length > 0) {
//           currentTopCoord = Math.min(...images.map(img => img.t))
//           found = true
//         }
//       }
//       else if (lookUpType === 'vectors') {
//         const newTopCoord = currentTopCoord - lookUpByOrChainBy
//         if (newTopCoord <= t)
//           return currentTopCoord

//         const areaConstraints = {
//           l: l,
//           r: r,
//           t: newTopCoord,
//           b: currentTopCoord,
//         }

//         const vectors = getImageOrVectorAreasInSearchArea(areaConstraints, pagePatternData.vectors, t)
//         console.log(vectors)
//         if (vectors.length > 0) {
//           currentTopCoord = Math.min(...vectors.map(vec => vec.t))
//           found = true
//         }
//       }
//       else if (lookUpType === 'lines') {
//         const newTopCoord = currentTopCoord - lookUpByOrChainBy
//         if (newTopCoord <= t)
//           return currentTopCoord

//         let indexOfLineAboveCurrentLine = currentLineIndex - 1
//         for (; indexOfLineAboveCurrentLine >= 0; indexOfLineAboveCurrentLine--) {
//           const line = pagePatternData.lines[indexOfLineAboveCurrentLine]
//           if (!line) continue

//           if (line.minY < newTopCoord)
//             break
//         }

//         for (; indexOfLineAboveCurrentLine < currentLineIndex; indexOfLineAboveCurrentLine++) {
//           const line = pagePatternData.lines[indexOfLineAboveCurrentLine]
//           if (!line) continue

//           const topCoords = line.chars
//             .filter(char => char.l >= l && char.r <= r && char.b >= newTopCoord)
//             .map(char => char.t)

//           if (topCoords.length > 0) {
//             currentTopCoord = Math.min(...topCoords)
//             found = true
//             currentLineIndex = indexOfLineAboveCurrentLine
//             break
//           }
//         }
//       }
//     }
//     if (found && lookUp.chainBy) {
//       lookUpByOrChainBy = lookUp.chainBy
//     }
//     else {
//       return currentTopCoord
//     }
//   }

//   return Math.max(0, currentTopCoord)
// }

const getTopCoordFromLookUpRange = (
  pagePatternData: PagePatternModeData,
  questionsConfig: QuestionsState,
  currentLineIndex: number,
  initialTopCoord: number,
  areaLimits: { l: number, r: number, t: number },
): number => {
  const lookUp = questionsConfig.forTopCoordinateLookUp
  if (initialTopCoord <= 0 || !lookUp || lookUp.by <= 0)
    return initialTopCoord

  const { l, r, t } = areaLimits

  let currentTopCoord = initialTopCoord
  let lookUpByOrChainBy = lookUp.by

  let found = false
  while (currentTopCoord > t) {
    found = false
    const oldTopCoord = currentTopCoord

    for (const lookUpType of lookUp.for) {
      const newTopCoord = currentTopCoord - lookUpByOrChainBy
      if (newTopCoord <= t) return currentTopCoord

      if (lookUpType === 'image') {
        const areaConstraints = { l, r, t: newTopCoord, b: currentTopCoord }
        const images = getImageOrVectorAreasInSearchArea(areaConstraints, pagePatternData.images, t)
        if (images.length > 0) {
          currentTopCoord = Math.min(...images.map(img => img.t))
          found = true
        }
      }
      else if (lookUpType === 'vector') {
        const areaConstraints = { l, r, t: newTopCoord, b: currentTopCoord }
        const vectors = getImageOrVectorAreasInSearchArea(areaConstraints, pagePatternData.vectors, t)

        if (vectors.length > 0) {
          currentTopCoord = Math.min(...vectors.map(vec => vec.t))
          found = true
        }
      }
      else if (lookUpType === 'line' && currentLineIndex > 0) {
        let indexToCheck = currentLineIndex - 1
        for (; indexToCheck >= 0; indexToCheck--) {
          const line = pagePatternData.lines[indexToCheck]
          if (!line) continue
          if (line.maxY < newTopCoord) {
            indexToCheck++
            break
          }
        }
        for (; indexToCheck < currentLineIndex; indexToCheck++) {
          const line = pagePatternData.lines[indexToCheck]
          if (!line) continue

          const topCoords = line.chars
            .filter(char => char.l >= l && char.r <= r && char.b >= newTopCoord && char.c.trim())
            .map(char => char.t)

          if (topCoords.length > 0) {
            currentTopCoord = Math.min(...topCoords)
            currentLineIndex = indexToCheck
            found = true
            break
          }
        }
      }
    }

    if (currentTopCoord >= oldTopCoord) {
      return oldTopCoord
    }

    if (found && lookUp.chainBy)
      lookUpByOrChainBy = lookUp.chainBy
    else
      return currentTopCoord
  }

  return Math.max(0, currentTopCoord)
}

const getBottomCoordForQuestion = (
  questions: QuestionsState,
  pagePatternData: PagePatternModeData,
  initialCoords: NormalizedCoordinates,
  pageWidth: number,
): number => {
  const currentState = questions.currentState
  const currentColumn = currentState?.column
  if (!currentColumn || !currentState) return initialCoords.b

  const bottomCoords: number[] = []
  for (const elemType of questions.forBottomCoordinateUseBottom) {
    if (elemType === 'image') {
      const bottomImages = getImageOrVectorAreasInSearchArea(initialCoords, pagePatternData.images, null)
      if (bottomImages.length > 0) {
        const maxY = Math.max(...bottomImages.map(img => img.b))
        bottomCoords.push(maxY)
      }
    }

    else if (elemType === 'vector') {
      const bottomVectors = getImageOrVectorAreasInSearchArea(initialCoords, pagePatternData.vectors, null)
      if (bottomVectors.length > 0) {
        const maxY = Math.max(...bottomVectors.map(vec => vec.b))
        bottomCoords.push(maxY)
      }
    }

    else if (elemType === 'line') {
      const lines = pagePatternData.lines
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i]!
        if (line.maxY <= initialCoords.t)
          break

        if (line.minY >= initialCoords.b)
          continue

        const lineCharsInArea = getTextCharsOfLineInSearchArea(initialCoords, line, pageWidth, false)

        if (lineCharsInArea) {
          const bCoords = lineCharsInArea.chars.filter(char => char.c.trim()).map(char => char.b)
          const maxY = Math.max(...bCoords)
          bottomCoords.push(maxY)
          break
        }
      }
    }
  }

  if (bottomCoords.length > 0) {
    const maxY = Math.max(...bottomCoords)
    return Math.min(initialCoords.b, maxY)
  }

  return initialCoords.b
}
const getTopCoordForQuestionToBeMerged = (
  pagePatternData: PagePatternModeData,
  initialCoords: NormalizedCoordinates,
  pageWidth: number,
): number => {
  const bottomCoords: number[] = []

  const topImages = getImageOrVectorAreasInSearchArea(initialCoords, pagePatternData.images, null)
  if (topImages.length > 0) {
    const minY = Math.min(...topImages.map(img => img.t))
    bottomCoords.push(minY)
  }

  const topVectors = getImageOrVectorAreasInSearchArea(initialCoords, pagePatternData.vectors, null)
  if (topVectors.length > 0) {
    const minY = Math.min(...topVectors.map(vec => vec.t))
    bottomCoords.push(minY)
  }

  const lines = pagePatternData.lines
  for (const line of lines) {
    if (line.minY >= initialCoords.b)
      break

    const lineCharsInArea = getTextCharsOfLineInSearchArea(initialCoords, line, pageWidth, false)

    if (lineCharsInArea) {
      const tCoords = lineCharsInArea.chars
        .filter(char => char.c.trim())
        .map(char => char.t)
      const minY = Math.min(...tCoords)
      bottomCoords.push(minY)
      break
    }
  }

  if (bottomCoords.length > 0) {
    const minY = Math.min(...bottomCoords)
    return Math.max(initialCoords.t, minY)
  }

  return initialCoords.t
}

const checkIfContainsElemsToConsiderMergeCrop = (
  mergeOnlyIfContainsAny: QuestionsState['mergeQuestions']['mergeOnlyIfContainsAny'],
  pagePatternData: PagePatternModeData,
  coords: PdfCroppedOverlayCoords,
) => {
  for (const elemType of mergeOnlyIfContainsAny) {
    if (elemType === 'line') {
      for (const line of pagePatternData.lines) {
        if (line.minY > coords.b) break // lines are sorted

        const hasChar = line.chars
          .some((char) => {
            return char.l >= coords.l
              && char.r <= coords.r
              && char.t >= coords.t
              && char.b <= coords.b
              && char.c.trim()
          })
        if (hasChar)
          return true
      }
    }
    else {
      let areasToLookIn: PdfCroppedOverlayCoords[]
      if (elemType === 'image')
        areasToLookIn = pagePatternData.images
      else
        areasToLookIn = pagePatternData.vectors

      const isThereImagesInsideQuestionArea = areasToLookIn
        .some((area) => {
          return area.l >= coords.l
            && area.r <= coords.r
            && area.t >= coords.t
            && area.b <= coords.b
        })

      if (isThereImagesInsideQuestionArea)
        return true
    }
  }

  return false
}

function endQuestion(
  state: State,
  pagePatternData: PagePatternModeData,
  initialBottomCoord: number,
  page: { num: number, w: number, h: number },
) {
  const currentSubject = state.currentSubject
  const currentSection = currentSubject?.currentSection
  const questions = currentSection?.questions
  const currentState = questions?.currentState
  const currentColumn = currentState?.column

  if (!currentState?.que || !currentColumn || !questions || !currentSubject || !currentSection) return

  const coords = {
    l: currentColumn.crop.exactlyTo.parsed.l ?? currentState.que.l,
    r: currentColumn.crop.exactlyTo.parsed.r || page.w,
    t: Math.max(currentColumn.crop.within.parsed.t, currentState.que.t),
    b: Math.min(currentColumn.crop.within.parsed.b, initialBottomCoord),
  }

  coords.b = getBottomCoordForQuestion(questions, pagePatternData, coords, page.w)

  if (currentState.mergeNextCrop) {
    const oldTopCoord = coords.t
    coords.t = getTopCoordForQuestionToBeMerged(pagePatternData, coords, page.w)
    console.log(currentState.que.qNum, 'Merging crop coords', oldTopCoord, '->', coords.t)
    if (oldTopCoord === coords.t) {
      const shouldMerge = checkIfContainsElemsToConsiderMergeCrop(
        questions.mergeQuestions.mergeOnlyIfContainsAny,
        pagePatternData,
        coords,
      )
      console.log('Checking for merge...', shouldMerge, coords, currentState.que.qNum)

      if (!shouldMerge) {
      // area is empty as per config preference so discard this overlay
        currentState.mergeNextCrop = false
        currentState.que = null
        return
      }
    }
  }

  const que = currentState.que.qNum
  const queId = `${currentSection || currentSubject}${SEPARATOR}${que}`

  const pdfDatas: PdfCroppedOverlayData['pdfData'][] = []
  const existingQueImgNum = state.overlaysPerQuestionCount.get(queId)
  let imgNum = 0

  if (
    questions.paragraphQuestionsCommonPart
    && typeof existingQueImgNum !== 'number'
    && currentState.paragraphQues?.commonOverlayPdfDatas?.length
  ) {
    const commonOverlayPdfDatas = currentState.paragraphQues.commonOverlayPdfDatas
    pdfDatas.push(...structuredClone(commonOverlayPdfDatas))
  }
  else if (typeof existingQueImgNum === 'number') {
    if (
      questions.obtainedQuestionNum.whenDuplicate === 'merge'
      || currentState.mergeNextCrop
      || currentState.paragraphQues?.commonOverlayPdfDatas?.length
    ) {
      imgNum = existingQueImgNum
    }
    else if (questions.obtainedQuestionNum.whenDuplicate === 'replace') {
      for (const oldImgNum of utilRange(1, existingQueImgNum + 1)) {
        const existingId = queId + SEPARATOR + oldImgNum
        state.croppedOverlays.delete(existingId)
      }
      state.overlaysPerQuestionCount.delete(queId)
    }
  }

  pdfDatas.push({
    page: page.num,
    l: Math.max(0, coords.l + currentColumn.crop.offsetBy.l),
    r: Math.min(page.w, coords.r + currentColumn.crop.offsetBy.r),
    t: Math.max(0, coords.t + currentColumn.crop.offsetBy.t),
    b: Math.min(page.h, coords.b + currentColumn.crop.offsetBy.b),
  })

  for (const pdfData of pdfDatas) {
    imgNum++

    const id = queId + SEPARATOR + imgNum
    const questionData: PdfCroppedOverlayData = {
      queId,
      id,
      subject: currentSubject.name,
      section: currentSection.name,
      que,
      imgNum,
      pdfData,
      ...structuredClone(questions.details),
    }

    state.croppedOverlays.set(id, questionData)
  }
  state.overlaysPerQuestionCount.set(queId, imgNum)

  currentState.mergeNextCrop = false
}

// common function to search for subject or section
const subjectOrSectionSearchHelper = (
  pattern: RegExp,
  lineData: PageTextLineData,
  pageWidth: number,
  searchArea: NormalizedCoordinates,
  parsedColumnDividers: number[],
  columnIndex: number,
) => {
  const textInSearchArea = getTextCharsOfLineInSearchArea(searchArea, lineData, pageWidth)
  if (!textInSearchArea) return null
  // console.log(pageNum, configName, config, searchAreaData, state)

  let firstMatchedChar: PageTextChar | null = null
  if (parsedColumnDividers.length === 0) {
    const matchStartIndex = textInSearchArea.text.search(pattern)
    if (matchStartIndex >= 0) {
      firstMatchedChar = textInSearchArea.chars[matchStartIndex]!
    }
  }
  else {
    for (const match of textInSearchArea.text.matchAll(pattern)) {
      const firstChar = textInSearchArea.chars[match.index]
      if (!firstChar) continue

      if (columnIndex === 0) { // first column
        const maxR = parsedColumnDividers[0]!
        if (firstChar.l > maxR)
          continue
      }
      else if (columnIndex === parsedColumnDividers.length) { // is last column
        const l = parsedColumnDividers[columnIndex - 1]!
        if (firstChar.l < l)
          continue
      }
      else { // neither first nor last column, somewhere in between
        const l = parsedColumnDividers[columnIndex - 1]!
        const r = parsedColumnDividers[columnIndex]!
        if (firstChar.l < l || firstChar.l > r)
          continue
      }

      firstMatchedChar = firstChar
      break
    }
  }

  return firstMatchedChar
}

const searchForSubject = (
  state: State,
  lineData: PageTextLineData,
  columnIndex: number,
  page: { num: number, w: number, h: number },
) => {
  const subjects = state.subjects
  if (subjects.length === 0) return

  for (let i = 0; i < subjects.length; i++) {
    const subConf = subjects[i]!
    if (!subConf.start.searchIn.pages.has(page.num)) continue
    const firstMatchedChar = subjectOrSectionSearchHelper(
      subConf.start.pattern,
      lineData,
      page.w,
      subConf.start.searchIn.area.parsed,
      state.currentSubject?.columnDividers.parsed || [],
      columnIndex,
    )

    if (firstMatchedChar) {
      return {
        firstMatchedChar,
        subjectIndex: i,
      }
    }

    // if (state.currentQuestions?.current) {
    //   endQuestion(state, firstMatchedChar.t, pageImages, pageNum, pageWidth, pageHeight)
    // }

    // if (configName === 'subjects') {
    //   const subjectConfig = state.subjects[configIndex]!

    //   if ('sections' in subjectConfig) {
    //     state.sections = Object.values(subjectConfig.sections)
    //     state.questions = null
    //     state.currentQuestions = null
    //   }
    //   else {
    //     state.sections = []
    //     state.questions = subjectConfig.questions
    //     const column = state.questions.columns[columnIndex]
    //     state.currentQuestions = column
    //       ? {
    //           column,
    //           lastLine: null,
    //           mergeNextCrop: false,
    //           lastQNum: null,
    //           current: null,
    //           paragraphQues: subjectConfig.questions.paragraphQuestions
    //             ? { commonOverlayPdfDatas: null, current: null }
    //             : null,
    //         }
    //       : null
    //   }

    //   state.currentSubject = subjectConfig.name
    //   state.currentSection = null
    //   state.columnDividers = subjectConfig.columnDividers || ''
    //   updateParsedColumnDividers(state, pageWidth)
    // }
    // else {
    //   const sectionConfig = state.sections[configIndex]!

    //   state.currentSection = sectionConfig.name
    //   state.questions = sectionConfig.questions

    //   const column = state.questions.columns[columnIndex]
    //   state.currentQuestions = column
    //     ? {
    //         column,
    //         lastLine: null,
    //         mergeNextCrop: false,
    //         lastQNum: null,
    //         current: null,
    //         paragraphQues: sectionConfig.questions.paragraphQuestions
    //           ? { commonOverlayPdfDatas: null, current: null }
    //           : null,
    //       }
    //     : null
    // }

    // indexOfConfigToRemove = configIndex
    // break
  }
}

const searchForSection = (
  state: State,
  lineData: PageTextLineData,
  columnIndex: number,
  page: { num: number, w: number, h: number },
) => {
  const sections = state.currentSubject?.sections
  if (!sections || sections.length === 0) return

  for (let i = 0; i < sections.length; i++) {
    const secConf = sections[i]!
    if (!secConf.searchIn.pages.has(page.num)) continue

    const firstMatchedChar = subjectOrSectionSearchHelper(
      secConf.pattern,
      lineData,
      page.w,
      secConf.searchIn.area.parsed,
      state.currentSubject?.columnDividers.parsed || [],
      columnIndex,
    )

    if (firstMatchedChar) {
      return {
        firstMatchedChar,
        sectionIndex: i,
      }
    }
  }
}

const searchForParagraphQuestionCommonOverlay = (
  state: State,
  lineData: PageTextLineData,
  pageWidth: number,
) => {
  const questions = state.currentSubject?.currentSection?.questions
  const para = questions?.paragraphQuestionsCommonPart

  if (!para || questions.currentState?.paragraphQues?.current)
    return

  const searchAreaData = getTextCharsOfLineInSearchArea(para.searchIn.parsed, lineData, pageWidth)
  if (!searchAreaData || searchAreaData.chars.length === 0) return

  const matchIndex = searchAreaData.text.search(para.pattern)
  if (matchIndex < 0) return

  const l = searchAreaData.chars[matchIndex]!.l
  const tCoords = searchAreaData.chars
    .filter(char => char.c.trim())
    .map(char => char.t)

  const t = Math.min(...tCoords)
  return { l, t }
}

const endParagraphQuestionCommonOverlay = (
  state: State,
  pagePatternData: PagePatternModeData,
  page: { num: number, w: number, h: number },
  initialCoords: {
    l: number | null
    r: number | null
    b: number
  },
) => {
  const questions = state.currentSubject?.currentSection?.questions
  const currentState = questions?.currentState
  const para = currentState?.paragraphQues
  const currentColumn = currentState?.column
  if (!questions || !currentState || !currentColumn || !para?.current)
    return

  const coords = {
    l: currentColumn.crop.exactlyTo.parsed.l ?? (initialCoords.l || 0),
    r: currentColumn.crop.exactlyTo.parsed.r ?? (initialCoords.r || page.w),
    t: Math.max(0, currentColumn.crop.within.parsed.t, currentState.paragraphQues?.current?.t || 0),
    b: Math.min(page.h, currentColumn.crop.within.parsed.b, initialCoords.b),
  }

  coords.b = getBottomCoordForQuestion(questions, pagePatternData, coords, page.w)

  if (currentState.mergeNextCrop) {
    const oldTopCoord = coords.t
    coords.t = getTopCoordForQuestionToBeMerged(pagePatternData, coords, page.w)
    if (oldTopCoord === coords.t) {
      const shouldMerge = checkIfContainsElemsToConsiderMergeCrop(
        questions.mergeQuestions.mergeOnlyIfContainsAny,
        pagePatternData,
        coords,
      )

      if (!shouldMerge) {
      // area is empty as per config preference so discard this overlay
        currentState.mergeNextCrop = false
        para.current = null
        return
      }
    }
  }

  if (!para.commonOverlayPdfDatas || !currentState.mergeNextCrop)
    para.commonOverlayPdfDatas = []

  para.commonOverlayPdfDatas.push({ ...coords, page: page.num })

  para.current = null
  currentState.mergeNextCrop = false
}

const searchForQuestions = (
  state: State,
  pagePatternData: PagePatternModeData,
  lineIndex: number,
  page: { num: number, w: number, h: number },
) => {
  const lineData = pagePatternData.lines[lineIndex]
  if (!lineData) return

  const currentSection = state.currentSubject?.currentSection
  const questions = currentSection?.questions
  const currentState = questions?.currentState
  const currentColumn = currentState?.column
  if (
    !currentSection
    || !currentColumn
    || !questions?.pages.has(page.num)
  ) return

  if (currentState.que && currentColumn.end) {
    const end = currentColumn.end
    const searchAreaData = getTextCharsOfLineInSearchArea(end.searchIn.parsed, lineData, page.w)
    if (searchAreaData) {
      if (end.pattern.test(searchAreaData.text)) {
        const tCoords = searchAreaData.chars
          .filter(char => char.c.trim())
          .map(char => char.t)
        const minY = Math.min(...tCoords)
        endQuestion(state, pagePatternData, minY, page)
        currentState.que = null
      }
      end.pattern.lastIndex = 0
    }
  }

  if (currentState.paragraphQues && !currentState.paragraphQues.current) {
    const coords = searchForParagraphQuestionCommonOverlay(state, lineData, page.w)
    if (coords) {
      endQuestion(state, pagePatternData, coords.t, page)
      currentState.paragraphQues.current = coords

      currentState.paragraphQues.commonOverlayPdfDatas = null
      currentState.mergeNextCrop = false
      currentState.que = null
    }
  }

  const start = currentColumn.start
  const searchAreaData = getTextCharsOfLineInSearchArea(start.searchIn.parsed, lineData, page.w)
  // console.log(pageNum, lineIndex, searchAreaData, state)

  for (const match of searchAreaData?.text.matchAll(start.pattern) ?? []) {
    const startChar = searchAreaData!.chars[match.index]
    if (!startChar) continue

    let qNum = parseInt(match[1] || '', 10)

    if (Number.isNaN(qNum)) {
      qNum = (currentState.lastQNum ?? 0) + 1
    }
    else if (
      questions.obtainedQuestionNum.nextQNumMustBeOneNumGreater
      && typeof currentState.lastQNum === 'number'
      && qNum !== currentState.lastQNum + 1
    ) {
      continue
    }
    const queId = `${currentSection.name}${SEPARATOR}${qNum}`
    if (state.overlaysPerQuestionCount.has(queId)
      && questions.obtainedQuestionNum.whenDuplicate === 'ignore') continue

    let minY = lineData.minY
    const areaConstraints = {
      l: currentColumn.crop.exactlyTo.parsed.l ?? startChar.l,
      t: currentState.que?.t || 0,
      r: currentColumn.crop.exactlyTo.parsed.r || page.w,
    }

    minY = getTopCoordFromLookUpRange(pagePatternData, questions, lineIndex, minY, areaConstraints)

    if (currentState.que) {
      if (currentState.mergeNextCrop)
        currentState.que.l = startChar.l

      endQuestion(state, pagePatternData, minY, page)
      currentState.que = null
    }

    if (currentState.paragraphQues?.current) {
      const initialCoords = {
        l: Math.min(currentState.paragraphQues.current.l, startChar.l),
        r: null,
        b: minY,
      }
      endParagraphQuestionCommonOverlay(state, pagePatternData, page, initialCoords)
    }

    currentState.que = {
      qNum,
      l: startChar.l,
      t: minY,
    }
    currentState.lastQNum = qNum

    break
  }
}
// const searchForQuestions = (
//   state: State,
//   lines: PageTextLineData[],
//   lineIndex: number,
//   pageImages: PdfPagesPatternModeData[number]['images'],
//   pageNum: number,
//   pageWidth: number,
//   pageHeight: number,
// ) => {
//   const lineData = lines[lineIndex]
//   if (!lineData) return

//   const { currentSubject, currentSection, questions, currentQuestions } = state
//   if (!currentSubject || !currentQuestions?.column || !questions?.pages.has(pageNum)) return

//   if (currentQuestions.current && currentQuestions.column.end) {
//     const end = currentQuestions.column.end
//     const searchAreaData = getTextCharsOfLineInSearchArea(end.searchArea, lineData, pageWidth)
//     if (searchAreaData) {
//       if (end.patternValue.test(searchAreaData.text)) {
//         const minY = Math.min(...searchAreaData.chars.map(char => char.t))
//         endQuestion(state, minY, pageImages, pageNum, pageWidth, pageHeight)
//         currentQuestions.current = null
//       }
//       end.patternValue.lastIndex = 0
//     }
//   }

//   if (currentQuestions.paragraphQues && !currentQuestions.paragraphQues.current) {
//     const coords = searchForParagraphQuestionCommonOverlay(state, lineData, pageWidth)
//     if (coords) {
//       endQuestion(state, coords.t, pageImages, pageNum, pageWidth, pageHeight)
//       currentQuestions.paragraphQues.current = coords

//       currentQuestions.paragraphQues.commonOverlayPdfDatas = null
//       currentQuestions.mergeNextCrop = false
//       currentQuestions.current = null
//     }
//   }

//   const start = currentQuestions.column.start
//   const searchAreaData = getTextCharsOfLineInSearchArea(start.searchArea, lineData, pageWidth)
//   // console.log(pageNum, lineIndex, searchAreaData, state)

//   for (const match of searchAreaData?.text.matchAll(start.patternValue) ?? []) {
//     const startChar = searchAreaData!.chars[match.index]
//     if (!startChar) continue

//     const qNum = parseInt(match[1] || '')

//     if (Number.isNaN(qNum)) continue

//     const queId = `${currentSection || currentSubject}${SEPARATOR}${qNum}`
//     if (state.overlaysPerQuestionCount.has(queId)
//       && state.questions?.duplicateQuestion === 'ignore') continue

//     if (
//       questions.nextQuestionMustBeOneQNumGreater
//       && typeof currentQuestions.lastQNum === 'number'
//       && qNum !== currentQuestions.lastQNum + 1
//     ) {
//       continue
//     }

//     let minY = lineData.minY
//     if (questions.considerImageTopCoordinateForQuestionStart) {
//       const startLineCoords = {
//         l: startChar.l,
//         t: minY,
//         b: lineData.maxY,
//         r: currentQuestions.column.parsedCropTo.r ?? pageWidth,
//       }
//       const imagesOverlappingOnStartLine = pageImages
//         .filter(img =>
//           !(
//             img.r <= startLineCoords.l
//             || img.l >= startLineCoords.r
//             || img.b <= startLineCoords.t
//             || img.t >= startLineCoords.b
//           ),
//         )
//       const topmostOverlappingImageTCoord = imagesOverlappingOnStartLine
//         .reduce((min, img) => Math.min(min, img.t), Infinity)

//       minY = Math.min(lineData.minY, topmostOverlappingImageTCoord)
//     }

//     if (questions.topCoordRangeTolookUpTextForQuestionStart && lineIndex) {
//       minY = getTopCoordFromTopCoordLookUpRange(
//         lines,
//         lineIndex,
//         questions.topCoordRangeTolookUpTextForQuestionStart,
//         minY,
//         currentQuestions.column.parsedCropTo.l ?? startChar.l,
//         currentQuestions.column.parsedCropTo.r,
//       )
//     }

//     if (currentQuestions.current) {
//       if (currentQuestions.mergeNextCrop)
//         currentQuestions.current.l = startChar.l

//       endQuestion(state, minY, pageImages, pageNum, pageWidth, pageHeight)
//       currentQuestions.current = null
//     }

//     if (currentQuestions.paragraphQues?.current) {
//       endParagraphQuestionCommonOverlay(state, minY, pageImages, pageNum, pageWidth, pageHeight, startChar.l)
//     }

//     currentQuestions.current = {
//       qNum,
//       l: startChar.l,
//       t: minY,
//     }
//     currentQuestions.lastQNum = qNum

//     break
//   }

//   if (questions.useLastLineOrImageForBottomCoordinate || currentQuestions.mergeNextCrop) {
//     console.log('line: ', lineIndex + 1, lineData, currentQuestions)
//     setLastLineCoords(currentQuestions, lineData)
//   }
// }

async function patternBasedCrop(
  subjectsConfig: PatternModeParsedConfig['subjects'],
  pdfPagesPatternModeData: PdfPagesPatternModeData,
  pagesData: PageImgData,
) {
  const state: State = {
    croppedOverlays: new Map(),
    overlaysPerQuestionCount: new Map(),
    subjects: subjectsConfig,
    currentSubject: null,
  }

  for (const [pageNumStr, pageTextData] of Object.entries(pdfPagesPatternModeData)) {
    const pageNum = parseInt(pageNumStr)
    const { width: pageWidth, height: pageHeight } = pagesData[pageNum]!
    const pageNumAndDims = { num: pageNum, w: pageWidth, h: pageHeight }
    updateAreaCoordinatesInConfig(subjectsConfig, pageNumAndDims)
    updateParsedColumnDividers(state, pageWidth)

    const lines = pageTextData.lines

    let columnIndex = 0
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const lineData = lines[lineIndex]!

      if (Array.isArray(state.currentSubject?.currentSection?.questions.columns)
        && state.currentSubject?.currentSection?.questions.currentState?.column) {
        const newColumn = state.currentSubject.currentSection.questions.columns[columnIndex]
        if (newColumn) {
          state.currentSubject.currentSection.questions.currentState.column = newColumn
        }
      }

      // search for end of current subject
      if (state.currentSubject?.end) {
        const end = state.currentSubject.end
        if (end.searchIn.pages.has(pageNum)) {
          const searchAreaData = getTextCharsOfLineInSearchArea(
            end.searchIn.area.parsed,
            lineData,
            pageWidth,
          )
          if (searchAreaData) {
            if (end.pattern.test(searchAreaData.text)) {
              const que = state.currentSubject?.currentSection?.questions.currentState?.que
              if (que) {
                const tCoords = searchAreaData.chars
                  .filter(char => char.c.trim())
                  .map(char => char.t)
                const initialBottomCoord = Math.min(...tCoords)
                endQuestion(state, pageTextData, initialBottomCoord, pageNumAndDims)
              }
              state.currentSubject = null
            }
          }
        }
      }

      const subjectFoundData = searchForSubject(state, lineData, columnIndex, pageNumAndDims)
      if (subjectFoundData) {
        const { firstMatchedChar, subjectIndex } = subjectFoundData
        const subject = state.subjects.splice(subjectIndex, 1)[0]!

        endQuestion(state, pageTextData, firstMatchedChar.t, pageNumAndDims)

        state.currentSubject = {
          ...subject,
          currentSection: null,
        }
      }

      if (state.currentSubject?.sections) {
        const sectionFoundData = searchForSection(state, lineData, columnIndex, pageNumAndDims)
        if (sectionFoundData) {
          const { firstMatchedChar, sectionIndex } = sectionFoundData
          const section = state.currentSubject.sections.splice(sectionIndex, 1)[0]!

          endQuestion(state, pageTextData, firstMatchedChar.t, pageNumAndDims)

          state.currentSubject.currentSection = {
            ...section,
            questions: {
              ...section.questions,
              currentState: {
                que: null,
                column: section.questions.columns[columnIndex] || section.questions.columns[0]!,
                lastQNum: null,
                mergeNextCrop: false,
                paragraphQues: null,
              },
            },
          }
        }
      }

      searchForQuestions(state, pageTextData, lineIndex, pageNumAndDims)

      if (lineIndex >= lines.length - 1) { // is last line of page
        const questions = state.currentSubject?.currentSection?.questions
        const columns = questions?.columns
        if (!questions || !columns) continue

        const columnDividers = state.currentSubject!.columnDividers.parsed
        if ((columnIndex + 1) >= Math.min(questions.columns.length, columnDividers.length + 1))
          continue

        if (questions.currentState?.que) {
          endQuestion(state, pageTextData, pageHeight, pageNumAndDims)

          if (questions.mergeQuestions.splitBy.has('columns')) {
            questions.currentState.que.t = 0
            questions.currentState.que.l = Math.max(
              questions.currentState.column.crop.exactlyTo.parsed.r,
              columnDividers[columnIndex] || 0,
            )
            questions.currentState.mergeNextCrop = true
          }
          else {
            questions.currentState.que = null
          }
        }

        if (questions.currentState?.paragraphQues?.current) {
          const initialCoords = {
            l: null,
            r: null,
            b: pageHeight,
          }
          endParagraphQuestionCommonOverlay(state, pageTextData, pageNumAndDims, initialCoords)

          if (questions.mergeQuestions.splitBy.has('columns')) {
            questions.currentState.paragraphQues.current = { t: 0, l: 0 }
            questions.currentState.mergeNextCrop = true
          }
        }

        columnIndex++
        lineIndex = -1 // loop current page lines from start again for next column
      }
    }

    const questions = state.currentSubject?.currentSection?.questions
    const currentState = questions?.currentState
    if (!questions || !currentState) continue

    if (currentState.que) {
      endQuestion(state, pageTextData, pageHeight, pageNumAndDims)
      console.log('End of page reached for question', currentState.que.qNum, questions.mergeQuestions)
      if (questions.mergeQuestions.splitBy.has('pages')) {
        currentState.que.t = 0
        currentState.mergeNextCrop = true
      }
      else {
        currentState.que = null
      }
    }

    if (currentState?.paragraphQues?.current) {
      const initialCoords = {
        l: null,
        r: null,
        b: pageHeight,
      }
      endParagraphQuestionCommonOverlay(state, pageTextData, pageNumAndDims, initialCoords)

      if (questions.mergeQuestions.splitBy.has('pages')) {
        currentState.paragraphQues.current = { t: 0, l: 0 }
        currentState.mergeNextCrop = true
      }
    }
  }

  const { croppedOverlays } = state

  return croppedOverlays
}

export type PatternBasedCropFn = typeof patternBasedCrop

comlinkExpose(patternBasedCrop)
