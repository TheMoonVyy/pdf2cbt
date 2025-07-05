const urls: string[] = []

type Config = {
  isBuildForWebsite: string | boolean
  mupdfVersion: string
}

function addUrls(config: Config) {
  const version = config.mupdfVersion
  let parsedVersion = 'latest'

  if (version) {
    const match = version.match(/\d+(\.\d+){0,2}/)
    if (match) {
      parsedVersion = match[0] as string
    }
  }

  const scriptUrls = [
    `https://cdn.jsdelivr.net/npm/mupdf@${parsedVersion}/dist/mupdf.js`,
    '/assets/_mupdf/mupdf.js',
  ]

  if (!config.isBuildForWebsite)
    scriptUrls.reverse()

  for (const url of scriptUrls) {
    urls.push(url)
  }

  return JSON.stringify(scriptUrls)
}

export default () => {
  if (urls.length === 0)
    addUrls(useRuntimeConfig().public)

  return urls
}
