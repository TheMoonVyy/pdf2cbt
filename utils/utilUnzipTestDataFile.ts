import { unzip, strFromU8, type Unzipped } from 'fflate'
import { IMAGE_FILE_NAME_OF_ZIP_SEPARATOR } from '~/shared/constants'
import type { CropperOutputData, TestImageBlobs, UploadedTestData } from '~/src/types'
import { DataFileNames } from '~/src/types/enums'

type UnzippedData = UploadedTestData & {
  unzippedFiles?: Unzipped
}

export default (
  zipFile: File | Blob,
  requiredData: 'json-only' | 'pdf-or-images-only' | 'all',
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

          const jsonFile = files[DataFileNames.dataJson]
          const jsonData = jsonFile ? JSON.parse(strFromU8(jsonFile)) : null
          const pdfFile = files[DataFileNames.questionsPdf]

          if (requiredData === 'pdf-or-images-only' || requiredData === 'all') {
            if (pdfFile) {
              data.pdfBuffer = pdfFile
            }
            else if (jsonData && Object.keys(files).length > 1) {
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
                    const sectionNamwWithSeparator = section + IMAGE_FILE_NAME_OF_ZIP_SEPARATOR

                    for (const [question, questionData] of Object.entries(sectionData)) {
                      const { pdfData } = questionData

                      if (Array.isArray(pdfData) && pdfData.length > 0) {
                        const qImagesCount = pdfData.length
                        const questionNameWithSeparator = question + IMAGE_FILE_NAME_OF_ZIP_SEPARATOR

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
              reject('Error: PDF/Images files and data.json file are not found in Zip file!')
              return
            }
          }

          if (requiredData === 'json-only' || requiredData === 'all') {
            if (jsonData) {
              data.jsonData = jsonData
            }
            else {
              reject('Error: data.json file is not found in Zip file!')
              return
            }
          }
          if (alsoReturnUnzippedFiles) {
            data.unzippedFiles = files
          }
          resolve(data)
        })
      })
  })
}
