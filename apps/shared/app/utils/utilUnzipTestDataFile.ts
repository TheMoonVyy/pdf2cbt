import { unzip, strFromU8 } from 'fflate'
import type { Unzipped } from 'fflate'
import { DataFileNames } from '#layers/shared/shared/enums'
import { SEPARATOR } from '#layers/shared/shared/constants'

type UnzippedData = UploadedTestData & {
  unzippedFiles?: Unzipped
}

export default (
  zipFile: File | Blob,
  requiredData: 'json-only' | 'pdf-or-images-only' | 'pdf-and-json' | 'json-and-maybe-pdf' | 'all',
  alsoReturnUnzippedFiles: boolean = false,
) => {
  return new Promise<UnzippedData>((resolve, reject) => {
    zipFile.arrayBuffer()
      .then((zipBuffer) => {
        unzip(new Uint8Array(zipBuffer), (err, files) => {
          if (err) {
            reject(`Error: ${err.message}!`)
            return
          }

          const data: UnzippedData = {
            pdfBuffer: null,
            testImageBlobs: null,
            jsonData: null,
          }

          const jsonFile = files[DataFileNames.DataJson]
          const jsonData = jsonFile ? JSON.parse(strFromU8(jsonFile)) : null
          const pdfFile = files[DataFileNames.QuestionsPdf]

          if (
            requiredData === 'pdf-or-images-only'
            || requiredData === 'pdf-and-json'
            || requiredData === 'all'
          ) {
            if (pdfFile) {
              data.pdfBuffer = pdfFile
            }
            else if (jsonData && Object.keys(files).length > 1 && requiredData !== 'pdf-and-json') {
              const pdfCropperData = jsonData.pdfCropperData as CropperOutputData
              if (!pdfCropperData) {
                reject('Error: PDF Cropper data not found in data.json of Zip file!')
                return
              }

              const imageBlobs: TestImageBlobs = {}
              try {
                for (const subjectData of Object.values(pdfCropperData)) {
                  for (const [section, sectionData] of Object.entries(subjectData)) {
                    imageBlobs[section] = {}
                    const sectionNamwWithSeparator = section + SEPARATOR

                    for (const [question, questionData] of Object.entries(sectionData)) {
                      const { pdfData } = questionData

                      if (Array.isArray(pdfData) && pdfData.length > 0) {
                        const qImagesCount = pdfData.length
                        const questionNameWithSeparator = question + SEPARATOR

                        imageBlobs[section][question] = []
                        for (let i = 0; i < qImagesCount; i++) {
                          const filename = `${sectionNamwWithSeparator}${questionNameWithSeparator}${i + 1}.png`
                          const imageBuffer = files[filename]
                          if (imageBuffer) {
                            const blob = new Blob([imageBuffer], { type: 'image/png' })
                            imageBlobs[section][question].push(blob)
                          }
                          else {
                            reject(`Error: Image (png) file for Section "${section}", Question "${question}", image "${i + 1}" is not found in Zip file!`)
                            return
                          }
                        }
                      }
                      else {
                        reject('Error: PDF Data not found in data.json of Zip file!')
                        return
                      }
                    }
                  }
                }
                data.testImageBlobs = imageBlobs
              }
              catch {
                reject('Error: Unable to get images from Zip file, pdf cropper data in data.json is probably not in valid format!')
                return
              }
            }
            else {
              if (requiredData === 'pdf-and-json') {
                if (jsonData) {
                  reject(`Error: ${DataFileNames.QuestionsPdf} file is not found in Zip file!`)
                  return
                }
                else {
                  reject(`Error: ${DataFileNames.QuestionsPdf} and ${DataFileNames.DataJson} files are not found in Zip file!`)
                  return
                }
              }

              reject('Error: PDF/Images files and data.json file are not found in Zip file!')
              return
            }
          }

          if (
            requiredData === 'json-only'
            || requiredData === 'pdf-and-json'
            || requiredData === 'json-and-maybe-pdf'
            || requiredData === 'all'
          ) {
            if (jsonData) {
              data.jsonData = jsonData
            }
            else {
              reject('Error: data.json file is not found in Zip file!')
              return
            }
          }

          if (requiredData === 'json-and-maybe-pdf' && pdfFile) {
            data.pdfBuffer = pdfFile
          }

          if (alsoReturnUnzippedFiles) {
            data.unzippedFiles = files
          }
          resolve(data)
        })
      })
  })
}
