export default async (
  originalRawUrl: string,
  convertUrl: boolean = true,
) => {
  const data: { zipFile: File | null, convertedUrl: string, err?: unknown, originalUrl: string } = {
    zipFile: null,
    convertedUrl: '',
    originalUrl: '',
  }

  try {
    const parsedUrl = new URL(originalRawUrl)
    const href = parsedUrl.href

    if (!href) {
      throw new Error('Invalid URL')
    }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('Invalid URL: Only a valid HTTP or HTTPS URL is supported')
    }

    // Check if the URL is of a GitHub repository and convert it to jsDelivr URL
    // Conversion to jsDelivr is due to CORS issues with GitHub URLs
    // else use the original URL
    const jsDelivrUrl = convertUrl ? utilGhUrlToJsDelivrUrl(href) : null
    const response = await fetch(jsDelivrUrl ?? parsedUrl)
    if (!response.ok) {
      const msg = response.statusText?.trim() ? `:\n${response.statusText}` : ''
      throw new Error(`Failed to load zip file from url (Status ${response.status})${msg}`)
    }

    const blob = await response.blob()
    const isZip = await utilIsZipFile(blob)
    if (isZip > 0) {
      data.zipFile = new File([blob], 'testData.zip', { type: 'application/zip' })
      data.convertedUrl = href
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
