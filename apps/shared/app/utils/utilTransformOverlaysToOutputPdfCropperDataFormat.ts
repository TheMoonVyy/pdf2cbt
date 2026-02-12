type StructuredOverlayData = {
  [subject: string]: {
    [section: string]: {
      [question: Numberish]: Omit<PdfCroppedOverlayInternalData, 'coords'> & {
        coordsList: {
          [imgNum: Numberish]: PdfCroppedOverlayCoords
        }
      }
    }
  }
}

export default (
  overlays: Map<string, PdfCroppedOverlayInternalData>,
  pagesImgData: PagesImgData,
): CropperOutputData => {
  const structuredOverlayData: StructuredOverlayData = {}

  for (const overlayData of overlays.values()) {
    const { subject, section: rawSection, que, imgNum } = overlayData
    const section = rawSection || subject

    structuredOverlayData[subject] ||= {}
    structuredOverlayData[subject][section] ||= {}
    if (!structuredOverlayData[subject][section][que]) {
      const { coords, ...rest } = overlayData
      structuredOverlayData[subject][section][que] = {
        ...rest,
        coordsList: {},
      }
    }
    structuredOverlayData[subject][section][que].coordsList[imgNum] = overlayData.coords
  }

  const pdfCropperData: CropperOutputData = {}
  const totalPages = Object.keys(pagesImgData).length
  for (const [subject, subjectData] of Object.entries(structuredOverlayData)) {
    pdfCropperData[subject] = {}

    for (const [section, sectionData] of Object.entries(subjectData)) {
      pdfCropperData[subject][section] = {}

      for (const [question, overlayData] of Object.entries(sectionData)) {
        const sortedOverlayCoords = Object.keys(overlayData.coordsList)
          .map(pageNum => overlayData.coordsList[pageNum]!)

        const pdfData: PdfCropperCoords[] = []

        for (const coords of sortedOverlayCoords) {
          let firstFound = false
          for (let i = 0; i < totalPages; i++) {
            const pageData = pagesImgData[i + 1]!

            if (coords.b >= pageData.top
              && coords.t <= pageData.bottom
            ) {
              const absTop = Math.max(coords.t, pageData.top)
              const absBottom = Math.min(coords.b, pageData.bottom)

              const _t = absTop - pageData.top
              const _b = absBottom - pageData.top
              const _l = utilClampNumber(coords.l, 0, pageData.width)
              const _r = utilClampNumber(coords.r, 0, pageData.width)

              const l = Math.min(_l, _r)
              const r = Math.max(_l, _r)
              const t = Math.min(_t, _b)
              const b = Math.max(_t, _b)

              if ((b - t) <= 5 || (r - l) <= 5)
                continue

              pdfData
                .push({ page: i + 1, x1: l, x2: r, y1: t, y2: b })

              firstFound = true
            }
            else if (firstFound) break
          }
        }

        const {
          que,
          type,
          answerOptions,
          marks,
          answerOptionsCounterTypePrimary,
          answerOptionsCounterTypeSecondary,
        } = overlayData
        const questionData: CropperQuestionData = {
          que,
          type: type,
          marks: {
            ...marks,
          },
          pdfData,
        }

        const answerOptionsCounterType: CropperQuestionData['answerOptionsCounterType'] = {}

        if (type !== 'msq') delete questionData.marks.pm
        if (type === 'msq' || type === 'mcq' || type === 'msm') {
          questionData.answerOptions = answerOptions || '4'

          if (answerOptionsCounterTypePrimary !== 'default') {
            answerOptionsCounterType.primary = answerOptionsCounterTypePrimary
          }
          if (type === 'msm') {
            questionData.marks.max = marks.cm * parseInt(answerOptions || '4')
            if (answerOptionsCounterTypeSecondary !== 'default')
              answerOptionsCounterType.secondary = answerOptionsCounterTypeSecondary
          }
        }
        if (answerOptionsCounterType.primary || answerOptionsCounterType.secondary) {
          questionData.answerOptionsCounterType = answerOptionsCounterType
        }

        pdfCropperData[subject][section][question] = questionData
      }
    }
  }

  return pdfCropperData
}
