import { SEPARATOR } from '#layers/shared/shared/constants'
import { expose as comlinkExpose } from 'comlink'
import type { PatternModeParsedConfig } from '~~/shared/schema/pdf-cropper-pattern-mode'

type ParsedSubjectConfig = PatternModeParsedConfig['subjects'][number]
type ParsedSectionConfig = ParsedSubjectConfig['sections'][number]
type ParsedQuestionsConfig = ParsedSectionConfig['questions']

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

function getTextAndCharsOfSearchArea(
  searchArea: NormalizedCoordinates,
  lineData: PageTextLineData,
  pageWidth: number,
) {
  const { l, r, t, b } = searchArea
  const { minY, maxY } = lineData

  if (maxY < t || minY > b) return null

  const charsToSearchIn = l <= 1 && r + 1 >= pageWidth
    ? lineData.chars
    : lineData.chars.filter(char => char.l >= l && char.r <= r && char.t >= t && char.b <= b)

  if (charsToSearchIn.length === 0) return null

  const text = charsToSearchIn
    .map(char => char.c)
    .join('')

  return {
    chars: charsToSearchIn,
    text,
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
      // Include area that overflow the search area but is within the minT limit
      return includeOverflowWithMinT >= area.t
        && !(area.r <= l || area.l >= r || area.b <= t || area.t >= b)
    }
    // Only include area that is fully within or exactly overlaps with the search area
    return area.l >= l && area.r <= r && area.t >= t && area.b <= b
  })
}

// Update the area coordinates throughout the config for the given (current) page dimensions
// This is needed because the coordinates may be relative (using %) to page dimensions
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
            const startOrEndObj = column[startOrEnd]
            if (!startOrEndObj) continue

            startOrEndObj.searchIn.parsed = getNormalizedCoordinates(startOrEndObj.searchIn.raw, pageDims)
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
    lastLine: { t: number, b: number } | null
    lastQNum: number | null
    mergeNextCrop: boolean
    current: null | { qNum: number, l: number, t: number }
    paragraphQues: null | {
      current: null | { t: number }
      commonOverlayPdfDatas: null | PdfCroppedOverlayData['pdfData'][]
    }
  }
}

type CurrentState = {
  croppedOverlays: Map<string, PdfCroppedOverlayData>
  subjects: PatternModeParsedConfig['subjects']
  currentSubject: (ParsedSubjectConfig & { currentSection: ParsedSectionConfig | null }) | null
  columnDividers: string
  parsedColumnDividers: number[]
  overlaysPerQuestionCount: Map<string, number>
  currentQuestions: null | {
    column: PatternModeParsedQuestionsConfig['questions']['columns'][number]
    lastLine: { t: number, b: number } | null
    lastQNum: number | null
    mergeNextCrop: boolean
    current: null | { qNum: number, l: number, t: number }
    paragraphQues: null | {
      current: null | { t: number }
      commonOverlayPdfDatas: null | PdfCroppedOverlayData['pdfData'][]
    }
  }
}

const updateParsedColumnDividers = (state: CurrentState, pageWidth: number) => {
  const columnDividers = state.currentSubject?.columnDividers
  if (!columnDividers) return

  if (state.currentSubject) {
    columnDividers.parsed = columnDividers.raw
      .map(str => getNormalizedCoordinate(str, pageWidth))
  }
}

const getTopCoordFromLookUpRange = (
  pagePatternData: PagePatternModeData,
  questionsConfig: ParsedQuestionsConfig,
  currentLineIndex: number,
  initialTopCoord: number,
  areaLimits: { minL: number, maxR: number, minT: number },
): number => {
  const lookUp = questionsConfig.forTopCoordinateLookUp

  if (initialTopCoord <= 0 || !lookUp || lookUp.by <= 0)
    return initialTopCoord

  const { minL, maxR, minT } = areaLimits

  let currentTopCoord = initialTopCoord
  let lookUpByOrChainBy = lookUp.by
  let found = false
  while (currentTopCoord > minT) {
    found = false

    for (const lookUpType of lookUp.for) {
      if (lookUpType === 'images') {
        const newTopCoord = currentTopCoord - lookUpByOrChainBy
        if (newTopCoord <= minT)
          return currentTopCoord

        const areaConstraints = {
          l: minL,
          r: maxR,
          t: newTopCoord,
          b: currentTopCoord,
        }

        const images = getImageOrVectorAreasInSearchArea(areaConstraints, pagePatternData.images, minT)
        if (images.length > 0) {
          currentTopCoord = Math.min(...images.map(img => img.t))
          found = true
        }
      }
      else if (lookUpType === 'vectors') {
        const newTopCoord = currentTopCoord - lookUpByOrChainBy
        if (newTopCoord <= minT)
          return currentTopCoord

        const areaConstraints = {
          l: minL,
          r: maxR,
          t: newTopCoord,
          b: currentTopCoord,
        }

        const vectors = getImageOrVectorAreasInSearchArea(areaConstraints, pagePatternData.vectors, minT)
        if (vectors.length > 0) {
          currentTopCoord = Math.min(...vectors.map(vec => vec.t))
          found = true
        }
      }
      else if (lookUpType === 'lines') {
        const newTopCoord = currentTopCoord - lookUpByOrChainBy
        if (newTopCoord <= minT)
          return currentTopCoord

        let indexOfLineAboveCurrentLine = currentLineIndex - 1
        for (; indexOfLineAboveCurrentLine >= 0; indexOfLineAboveCurrentLine--) {
          const line = pagePatternData.lines[indexOfLineAboveCurrentLine]
          if (!line) continue

          if (line.minY < newTopCoord)
            break
        }

        for (; indexOfLineAboveCurrentLine < currentLineIndex; indexOfLineAboveCurrentLine++) {
          const line = pagePatternData.lines[indexOfLineAboveCurrentLine]
          if (!line) continue

          const topCoords = line.chars
            .filter(char => char.l >= minL && char.r <= maxR && char.b >= newTopCoord)
            .map(char => char.t)

          if (topCoords.length > 0) {
            currentTopCoord = Math.min(...topCoords)
            found = true
            currentLineIndex = indexOfLineAboveCurrentLine
            break
          }
        }
      }

      if (found && lookUp.chainBy) {
        lookUpByOrChainBy = lookUp.chainBy
      }
      else {
        return currentTopCoord
      }
    }
  }

  return currentTopCoord
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
  const { r, t, b } = currentQuestions.column.parsedCropTo
  const l = currentQuestions.column.parsedCropTo.l ?? (currentQuestions?.current?.l || 0)
  if (typeof l !== 'number' || typeof r !== 'number')
    return

  const filteredLineData = lastLineData.chars
    .filter(char => char.l >= l && char.r <= r && char.t >= t && char.b <= b)
  if (filteredLineData.length === 0)
    return

  currentQuestions.lastLine ??= { t: 0, b: 0 }

  currentQuestions.lastLine.t = Math.min(...filteredLineData.map(char => char.t))
  currentQuestions.lastLine.b = Math.max(...filteredLineData.map(char => char.b))
}

function endQuestion(
  state: State,
  endLineTopCoord: number,
  pageImages: PdfPagesPatternModeData[number]['images'],
  pageNum: number,
  pageWidth: number,
  pageHeight: number,
) {
  const { currentSubject, currentSection, currentQuestions, questions } = state
  if (!currentSubject || !questions || !currentQuestions?.current) return

  const coords = {
    l: currentQuestions.column.parsedCropTo.l ?? currentQuestions.current.l,
    r: currentQuestions.column.parsedCropTo.r ?? pageWidth,
    t: Math.max(currentQuestions.column.parsedCropTo.t, currentQuestions.current.t),
    b: Math.min(currentQuestions.column.parsedCropTo.b, endLineTopCoord),
  }

  if (
    currentQuestions.mergeNextCrop
    && questions.ignoreMergingAreaNotContainingAnyTextOrImage
    && !currentQuestions.lastLine
  ) {
    const isThereImagesInsideQuestionArea = pageImages
      .some(area => area.l >= coords.l && area.r <= coords.r && area.t >= coords.t && area.b <= coords.b)

    if (!isThereImagesInsideQuestionArea) {
      currentQuestions.mergeNextCrop = false
      currentQuestions.current = null
      return
    }
  }

  if (questions.useLastLineOrImageForBottomCoordinate) {
    const lastLineBottomCoord = currentQuestions.lastLine?.b || 0
    const imagesInsideQuestionArea = pageImages
      .filter(area => area.l >= coords.l && area.r <= coords.r && area.t >= coords.t && area.b <= coords.b)

    if (lastLineBottomCoord > 0 || imagesInsideQuestionArea.length > 0) {
      const highestBottomCoord = Math.max(lastLineBottomCoord, ...imagesInsideQuestionArea.map(image => image.b))
      coords.b = Math.min(coords.b, highestBottomCoord)
    }
  }

  const que = currentQuestions.current.qNum
  const queId = `${currentSection || currentSubject}${SEPARATOR}${que}`

  const pdfDatas: PdfCroppedOverlayData['pdfData'][] = []
  const existingQueImgNum = state.overlaysPerQuestionCount.get(queId)
  let imgNum = 0

  if (currentQuestions.paragraphQues)
    console.log(pageNum, que, imgNum, state)
  if (
    questions.paragraphQuestions
    && typeof existingQueImgNum !== 'number'
    && currentQuestions.paragraphQues?.commonOverlayPdfDatas?.length
  ) {
    const commonOverlayPdfDatas = currentQuestions.paragraphQues.commonOverlayPdfDatas
    pdfDatas.push(...structuredClone(commonOverlayPdfDatas))
  }
  else if (typeof existingQueImgNum === 'number') {
    if (
      questions.duplicateQuestion === 'merge'
      || currentQuestions.mergeNextCrop
      || currentQuestions.paragraphQues?.commonOverlayPdfDatas?.length
    ) {
      imgNum = existingQueImgNum
    }
    else if (questions.duplicateQuestion === 'replace') {
      for (const oldImgNum of utilRange(1, existingQueImgNum + 1)) {
        const existingId = queId + SEPARATOR + oldImgNum
        state.croppedOverlays.delete(existingId)
      }
      state.overlaysPerQuestionCount.delete(queId)
    }
  }

  pdfDatas.push({
    page: pageNum,
    l: Math.max(0, coords.l + currentQuestions.column.offsetBy.l),
    r: Math.min(pageWidth, coords.r + currentQuestions.column.offsetBy.r),
    t: Math.max(0, coords.t + currentQuestions.column.offsetBy.t),
    b: Math.min(pageHeight, coords.b + currentQuestions.column.offsetBy.b),
  })

  for (const pdfData of pdfDatas) {
    imgNum++

    const id = queId + SEPARATOR + imgNum
    const questionData: PdfCroppedOverlayData = {
      queId,
      id,
      subject: currentSubject,
      section: currentSection || currentSubject,
      que,
      imgNum,
      pdfData,
      ...structuredClone(questions.details),
    }

    state.croppedOverlays.set(id, questionData)
  }
  state.overlaysPerQuestionCount.set(queId, imgNum)

  currentQuestions.mergeNextCrop = false
}

const searchForSubjectAndSection = (
  state: State,
  lineData: PageTextLineData,
  columnIndex: number,
  pageImages: PdfPagesPatternModeData[number]['images'],
  pageNum: number,
  pageWidth: number,
  pageHeight: number,
) => {
  for (const configName of ['subjects', 'sections'] as const) {
    const subjectsOrSectionsConfig = state[configName]

    let indexOfConfigToRemove: number | null = null
    for (let configIndex = 0; configIndex < subjectsOrSectionsConfig.length; configIndex++) {
      const config = subjectsOrSectionsConfig[configIndex]!
      if (!config.searchIn.pages.has(pageNum)) continue

      const searchAreaData = getTextAndCharsOfSearchArea(config.searchArea, lineData, pageWidth)
      if (!searchAreaData) continue
      // console.log(pageNum, configName, config, searchAreaData, state)

      let firstMatchedChar: PageTextChar | null = null
      if (state.parsedColumnDividers.length === 0) {
        const matchStartIndex = searchAreaData.text.search(config.patternValue)
        if (matchStartIndex >= 0) {
          firstMatchedChar = searchAreaData.chars[matchStartIndex]!
        }
      }
      else {
        for (const match of searchAreaData.text.matchAll(config.patternValue)) {
          const firstChar = searchAreaData.chars[match.index]
          if (!firstChar) continue

          if (columnIndex === 0) { // first column
            const maxR = state.parsedColumnDividers[0]!
            if (firstChar.l > maxR)
              continue
          }
          else if (columnIndex === state.parsedColumnDividers.length) { // is last column
            const l = state.parsedColumnDividers[columnIndex - 1]!
            if (firstChar.l < l)
              continue
          }
          else { // neither first nor last column, somewhere in between
            const l = state.parsedColumnDividers[columnIndex - 1]!
            const r = state.parsedColumnDividers[columnIndex]!
            if (firstChar.l < l || firstChar.l > r)
              continue
          }

          firstMatchedChar = firstChar
          break
        }
      }

      if (!firstMatchedChar) continue

      if (state.currentQuestions?.current) {
        endQuestion(state, firstMatchedChar.t, pageImages, pageNum, pageWidth, pageHeight)
      }

      if (configName === 'subjects') {
        const subjectConfig = state.subjects[configIndex]!

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
                lastLine: null,
                mergeNextCrop: false,
                lastQNum: null,
                current: null,
                paragraphQues: subjectConfig.questions.paragraphQuestions
                  ? { commonOverlayPdfDatas: null, current: null }
                  : null,
              }
            : null
        }

        state.currentSubject = subjectConfig.name
        state.currentSection = null
        state.columnDividers = subjectConfig.columnDividers || ''
        updateParsedColumnDividers(state, pageWidth)
      }
      else {
        const sectionConfig = state.sections[configIndex]!

        state.currentSection = sectionConfig.name
        state.questions = sectionConfig.questions

        const column = state.questions.columns[columnIndex]
        state.currentQuestions = column
          ? {
              column,
              lastLine: null,
              mergeNextCrop: false,
              lastQNum: null,
              current: null,
              paragraphQues: sectionConfig.questions.paragraphQuestions
                ? { commonOverlayPdfDatas: null, current: null }
                : null,
            }
          : null
      }

      indexOfConfigToRemove = configIndex
      break
    }

    if (typeof indexOfConfigToRemove === 'number')
      subjectsOrSectionsConfig.splice(indexOfConfigToRemove, 1)
  }
}

const searchForParagraphQuestionCommonOverlay = (
  state: State,
  lineData: PageTextLineData,
  pageWidth: number,
) => {
  const { currentQuestions, questions } = state

  if (
    !currentQuestions?.paragraphQues
    || !questions?.paragraphQuestions
    || currentQuestions.paragraphQues.current
  ) return

  const paraQuesData = questions.paragraphQuestions

  const searchAreaData = getTextAndCharsOfSearchArea(paraQuesData.searchArea, lineData, pageWidth)
  if (!searchAreaData || searchAreaData.chars.length === 0) return

  const matchIndex = searchAreaData.text.search(paraQuesData.patternValue)
  if (matchIndex < 0) return

  const t = Math.min(...searchAreaData.chars.map(char => char.t))
  return { t }
}

const endParagraphQuestionCommonOverlay = (
  state: State,
  endLineTopCoord: number,
  pageImages: PdfPagesPatternModeData[number]['images'],
  pageNum: number,
  pageWidth: number,
  pageHeight: number,
  l: number | null = null,
  r: number | null = null,
) => {
  const { currentQuestions, questions } = state
  if (!currentQuestions?.column || !currentQuestions.paragraphQues?.current || !questions) return

  const coords = {
    l: currentQuestions.column.parsedCropTo.l ?? (l || 0),
    r: r ?? (currentQuestions.column.parsedCropTo.r ?? pageWidth),
    t: Math.max(0, currentQuestions.column.parsedCropTo.t, currentQuestions.paragraphQues.current.t),
    b: Math.min(pageHeight, currentQuestions.column.parsedCropTo.b, endLineTopCoord),
  }

  if (
    currentQuestions.mergeNextCrop
    && questions.ignoreMergingAreaNotContainingAnyTextOrImage
    && !currentQuestions.lastLine
  ) {
    const isThereImagesInsideQuestionArea = pageImages
      .some(area => area.l >= coords.l && area.r <= coords.r && area.t >= coords.t && area.b <= coords.b)

    if (!isThereImagesInsideQuestionArea) {
      currentQuestions.mergeNextCrop = false
      currentQuestions.paragraphQues.current = null
      return
    }
  }

  if (questions.useLastLineOrImageForBottomCoordinate) {
    const imagesInsideQuestionArea = pageImages
      .filter(area => area.l >= coords.l && area.r <= coords.r && area.t >= coords.t && area.b <= coords.b)

    const lastLineBottomCoord = currentQuestions.lastLine?.b || 0

    if (lastLineBottomCoord > 0 || imagesInsideQuestionArea.length > 0) {
      const greatestBottomCoord = Math.max(
        lastLineBottomCoord,
        ...imagesInsideQuestionArea.map(image => image.b),
      )
      console.log(pageNum, structuredClone(coords), state, lastLineBottomCoord, imagesInsideQuestionArea, greatestBottomCoord)
      coords.b = Math.min(coords.b, greatestBottomCoord)
    }
  }

  const paragraphQues = currentQuestions.paragraphQues
  if (!paragraphQues.commonOverlayPdfDatas || !currentQuestions.mergeNextCrop)
    paragraphQues.commonOverlayPdfDatas = []

  paragraphQues.commonOverlayPdfDatas.push({ ...coords, page: pageNum })

  currentQuestions.paragraphQues.current = null
  currentQuestions.mergeNextCrop = false
}

const searchForQuestions = (
  state: State,
  lines: PageTextLineData[],
  lineIndex: number,
  pageImages: PdfPagesPatternModeData[number]['images'],
  pageNum: number,
  pageWidth: number,
  pageHeight: number,
) => {
  const lineData = lines[lineIndex]
  if (!lineData) return

  const { currentSubject, currentSection, questions, currentQuestions } = state
  if (!currentSubject || !currentQuestions?.column || !questions?.pages.has(pageNum)) return

  if (currentQuestions.current && currentQuestions.column.end) {
    const end = currentQuestions.column.end
    const searchAreaData = getTextAndCharsOfSearchArea(end.searchArea, lineData, pageWidth)
    if (searchAreaData) {
      if (end.patternValue.test(searchAreaData.text)) {
        const minY = Math.min(...searchAreaData.chars.map(char => char.t))
        endQuestion(state, minY, pageImages, pageNum, pageWidth, pageHeight)
        currentQuestions.current = null
      }
      end.patternValue.lastIndex = 0
    }
  }

  if (currentQuestions.paragraphQues && !currentQuestions.paragraphQues.current) {
    const coords = searchForParagraphQuestionCommonOverlay(state, lineData, pageWidth)
    if (coords) {
      endQuestion(state, coords.t, pageImages, pageNum, pageWidth, pageHeight)
      currentQuestions.paragraphQues.current = coords

      currentQuestions.paragraphQues.commonOverlayPdfDatas = null
      currentQuestions.mergeNextCrop = false
      currentQuestions.current = null
    }
  }

  const start = currentQuestions.column.start
  const searchAreaData = getTextAndCharsOfSearchArea(start.searchArea, lineData, pageWidth)
  // console.log(pageNum, lineIndex, searchAreaData, state)

  for (const match of searchAreaData?.text.matchAll(start.patternValue) ?? []) {
    const startChar = searchAreaData!.chars[match.index]
    if (!startChar) continue

    const qNum = parseInt(match[1] || '')

    if (Number.isNaN(qNum)) continue

    const queId = `${currentSection || currentSubject}${SEPARATOR}${qNum}`
    if (state.overlaysPerQuestionCount.has(queId)
      && state.questions?.duplicateQuestion === 'ignore') continue

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
        t: minY,
        b: lineData.maxY,
        r: currentQuestions.column.parsedCropTo.r ?? pageWidth,
      }
      const imagesOverlappingOnStartLine = pageImages
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

    if (questions.topCoordRangeTolookUpTextForQuestionStart && lineIndex) {
      minY = getTopCoordFromTopCoordLookUpRange(
        lines,
        lineIndex,
        questions.topCoordRangeTolookUpTextForQuestionStart,
        minY,
        currentQuestions.column.parsedCropTo.l ?? startChar.l,
        currentQuestions.column.parsedCropTo.r,
      )
    }

    if (currentQuestions.current) {
      if (currentQuestions.mergeNextCrop)
        currentQuestions.current.l = startChar.l

      endQuestion(state, minY, pageImages, pageNum, pageWidth, pageHeight)
      currentQuestions.current = null
    }

    if (currentQuestions.paragraphQues?.current) {
      endParagraphQuestionCommonOverlay(state, minY, pageImages, pageNum, pageWidth, pageHeight, startChar.l)
    }

    currentQuestions.current = {
      qNum,
      l: startChar.l,
      t: minY,
    }
    currentQuestions.lastQNum = qNum

    break
  }

  if (questions.useLastLineOrImageForBottomCoordinate || currentQuestions.mergeNextCrop) {
    console.log('line: ', lineIndex + 1, lineData, currentQuestions)
    setLastLineCoords(currentQuestions, lineData)
  }
}

async function patternBasedCrop(
  subjectsConfig: PatternModeParsedConfig['subjects'],
  pdfTextData: PdfPagesPatternModeData,
  pagesData: PageImgData,
) {
  const state: State = {
    croppedOverlays: new Map(),
    subjects: Object.values(subjectsConfig),
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
    updateAreaCoordinatesInConfig(subjectsConfig, pageNum, pageWidth, pageHeight)
    updateParsedColumnDividers(state, pageWidth)

    const { lines, images } = pageTextData

    let columnIndex = 0
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      // skip line if line has text of linesToIgnore
      const lineText = lines[lineIndex]?.text
      if (lineText && linesToIgnore.some(text => lineText.includes(text)))
        continue

      if (Array.isArray(state.questions?.columns) && state.currentQuestions?.column) {
        const newColumn = state.questions.columns[columnIndex]
        if (newColumn) {
          state.currentQuestions.column = newColumn
        }
      }
      searchForSubjectAndSection(state, lines[lineIndex]!, columnIndex, images, pageNum, pageWidth, pageHeight)

      searchForQuestions(state, lines, lineIndex, images, pageNum, pageWidth, pageHeight)

      const { questions, currentQuestions } = state
      if (lineIndex >= lines.length - 1 // is last line of page
        && questions?.columns
        && (columnIndex + 1) < Math.min(questions.columns.length, state.parsedColumnDividers.length + 1)
      ) {
        if (currentQuestions?.current) {
          endQuestion(state, pageHeight, images, pageNum, pageWidth, pageHeight)
          if (state.questions?.mergeQuestionsByColumns) {
            currentQuestions.current.t = 0
            currentQuestions.current.l = Math.max(
              currentQuestions.column.parsedCropTo.r,
              state.parsedColumnDividers[columnIndex] || 0,
            )
            currentQuestions.mergeNextCrop = true
          }
          else {
            currentQuestions.current = null
          }
          currentQuestions.lastLine = null
        }

        if (currentQuestions?.paragraphQues?.current) {
          endParagraphQuestionCommonOverlay(state, pageHeight, images, pageNum, pageWidth, pageHeight)
          if (state.questions?.mergeQuestionsByColumns) {
            currentQuestions.paragraphQues.current = { t: 0 }
            currentQuestions.mergeNextCrop = true
          }
        }
        columnIndex++
        lineIndex = -1 // loop current page lines from start again for next column
      }
    }

    if (state.currentQuestions) {
      const currentQuestions = state.currentQuestions
      if (currentQuestions.current) {
        endQuestion(state, pageHeight, images, pageNum, pageWidth, pageHeight)
        if (state.questions?.mergeQuestionsByPages) {
          currentQuestions.current.t = 0
          currentQuestions.mergeNextCrop = true
        }
        else {
          currentQuestions.current = null
        }
      }

      if (currentQuestions?.paragraphQues?.current) {
        endParagraphQuestionCommonOverlay(state, pageHeight, images, pageNum, pageWidth, pageHeight)
        if (state.questions?.mergeQuestionsByPages) {
          currentQuestions.paragraphQues.current = { t: 0 }
          currentQuestions.mergeNextCrop = true
        }
      }

      state.currentQuestions.lastLine = null
    }
  }

  const { croppedOverlays } = state

  return croppedOverlays
}

export type PatternBasedCropFn = typeof patternBasedCrop

comlinkExpose(patternBasedCrop)
