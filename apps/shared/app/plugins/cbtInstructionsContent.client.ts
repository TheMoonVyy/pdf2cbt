import instructionsMdZipUrl from '#layers/shared/md/instructions-md.zip?url'
import type { Liquid } from 'liquidjs'

export default defineNuxtPlugin(() => {
  let engine: InstanceType<typeof Liquid> | null = null

  async function loadCbtLiquidEngine() {
    if (engine) return engine

    const [{ Liquid }, { unzipSync, strFromU8 }, { ToWords }]
      = await Promise.all([
        import('liquidjs'),
        import('fflate'),
        import('to-words/en-IN'),
      ])

    const toWords = new ToWords()

    // Fetch zip only when first needed
    const zipBuffer = await $fetch(instructionsMdZipUrl, {
      responseType: 'arrayBuffer',
    })

    const files = unzipSync(new Uint8Array(zipBuffer as Uint8Array))

    const templates: Record<string, string> = {}

    for (const [fileName, file] of Object.entries(files)) {
      templates[fileName] = strFromU8(file)
    }

    engine = new Liquid({
      cache: true,
      templates,
    })

    engine.registerFilter(
      'zeroPad',
      (value: Numberish, length = 2) =>
        String(value).padStart(Number(length), '0'),
    )

    engine.registerFilter(
      'toWords',
      (value: Numberish) =>
        toWords.convert(Number(value)),
    )

    engine.registerFilter(
      'toCombinations',
      (value: unknown[]): unknown[][][] => {
        const finalResult: unknown[][][] = []
        const n: number = value.length

        function combine(
          start: number,
          path: unknown[],
          r: number,
          result: unknown[][],
        ): void {
          if (path.length === r) {
            result.push([...path])
            return
          }

          for (let i = start; i < n; i++) {
            path.push(value[i])
            combine(i + 1, path, r, result)
            path.pop()
          }
        }

        // nC1 up to nCn-1
        for (let r = 1; r < n; r++) {
          const level: unknown[][] = []
          combine(0, [], r, level)
          finalResult.push(level)
        }

        return finalResult
      },
    )

    engine.registerFilter('joinInEnglish', function (
      arr,
      open = '',
      close = '',
      sep = ', ',
      lastSep = ' and ',
    ) {
      if (!Array.isArray(arr) || arr.length === 0) return ''
      if (arr.length === 1) return `${open}${arr[0]}${close}`

      const wrapped = arr.map(v => `${open}${v}${close}`)

      return wrapped.slice(0, -1).join(sep) + lastSep + wrapped.at(-1)
    })

    return engine
  }

  return {
    provide: {
      loadCbtLiquidEngine,
      getCbtLiquidEngine: () => engine,
    },
  }
})
