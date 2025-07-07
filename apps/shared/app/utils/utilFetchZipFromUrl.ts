export default async function (
  originalRawUrl: string,
  convertUrl: boolean = true,
  bypassUrlCheck: boolean = false,
) {
  const data: { zipFile: File | null, convertedUrl: string, err?: unknown, originalUrl: string } = {
    zipFile: null,
    convertedUrl: '',
    originalUrl: '',
  }

  try {
    let parsedUrl: URL | null = null
    let parsedHref: string = ''

    if (bypassUrlCheck) {
      parsedHref = originalRawUrl
    }
    else {
      parsedUrl = new URL(originalRawUrl)
      parsedHref = parsedUrl.href

      if (!parsedHref) {
        throw new Error('Invalid URL')
      }
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid URL: Only a valid HTTP or HTTPS URL is supported')
      }
    }

    if (!parsedUrl && !parsedHref) throw new Error('Unable to parse URL')

    // Check if the URL is of a GitHub repository and convert it to jsDelivr URL
    // Conversion to jsDelivr is due to CORS issues with GitHub URLs
    // else use the original URL
    const jsDelivrUrl = convertUrl && parsedHref ? utilGhUrlToJsDelivrUrl(parsedHref) : null

    const response = await fetch(jsDelivrUrl ?? (parsedUrl ?? parsedHref))
    if (!response.ok) {
      const msg = response.statusText?.trim() ? `:\n${response.statusText}` : ''
      throw new Error(`Failed to load zip file from url (Status ${response.status})${msg}`)
    }

    const blob = await response.blob()
    const isZip = await utilIsZipFile(blob)
    if (isZip > 0) {
      data.zipFile = new File([blob], 'testData.zip', { type: 'application/zip' })
      data.originalUrl = parsedHref
      data.convertedUrl = jsDelivrUrl || ''
    }
    else {
      throw new Error('The file from the url is not a valid zip file')
    }
  }
  catch (err) {
    data.err = err
  }

  return data
}
