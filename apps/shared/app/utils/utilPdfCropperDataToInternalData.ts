import { SEPARATOR } from '#layers/shared/shared/constants'

export type InputPdfCropperData = GenericSubjectsTree<
  Omit<CropperQuestionData, 'pdfData'> & {
    pdfData: (PdfCropperCoords | (PdfCroppedOverlayCoords & { page: number }))[]
  }
>

export default (
  inputPdfCropperData: InputPdfCropperData,
  pagesImgData: PagesImgData,
  outputPdfCropperData: Map<string, PdfCroppedOverlayInternalData>,
  outputOverlaysPerQuestion: PdfCropperOverlaysPerQuestion,
) => {
  for (const [subject, subjectData] of Object.entries(inputPdfCropperData)) {
    for (const [section, sectionData] of Object.entries(subjectData)) {
      for (const [question, questionData] of Object.entries(sectionData)) {
        const {
          pdfData,
          que,
          answerOptions,
          answerOptionsCounterType,
          type,
        } = questionData

        const marks: PdfCroppedOverlayInternalData['marks'] = {
          cm: questionData.marks.cm,
          pm: questionData.marks.pm ?? 1,
          im: questionData.marks.im,
        }

        const queId = `${section}${SEPARATOR}${question}`

        let imgNum = 0
        for (const data of pdfData as (PdfCropperCoords | PdfCropperPdfData)[]) {
          imgNum++
          const id = `${queId}${SEPARATOR}${imgNum}`

          let l: number
          let r: number
          let t: number
          let b: number
          if ('x1' in data) {
            l = data.x1
            r = data.x2
            t = data.y1
            b = data.y2
          }
          else {
            l = data.l
            r = data.r
            t = data.t
            b = data.b
          }

          const coords = {
            l: Math.min(l, r),
            r: Math.max(l, r),
            t: Math.min(t, b),
            b: Math.max(t, b),
          }
          const top = pagesImgData[data.page]?.top || 0
          coords.t += top
          coords.b += top

          const overlayData: PdfCroppedOverlayInternalData = {
            id,
            queId,
            que,
            subject,
            section,
            imgNum,
            type,
            answerOptions: answerOptions || '4',
            marks,
            coords,
            answerOptionsCounterTypePrimary: answerOptionsCounterType?.primary || 'default',
            answerOptionsCounterTypeSecondary: answerOptionsCounterType?.secondary || 'default',
          }

          outputPdfCropperData.set(id, overlayData)
        }
        outputOverlaysPerQuestion.set(queId, imgNum)
      }
    }
  }
}
