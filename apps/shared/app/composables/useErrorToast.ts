import type { toast as toastType } from 'vue-sonner'

let toast: ReturnType<typeof useNuxtApp>['$toast'] | null = null

// composable to show error in console and toast
export default (
  title: string,
  err: any = '', // eslint-disable-line @typescript-eslint/no-explicit-any
  data: Parameters<typeof toastType['error']>[1] | null = undefined,
  printToConsole: boolean = true,
) => {
  if (printToConsole)
    console.error(title, err)

  toast ??= useNuxtApp().$toast

  if (data !== null) {
    data ??= { duration: 15000 }

    if (!data.description) {
      if (err instanceof Error) {
        const description = err.toString()
        if (description)
          data.description = description
      }
      else if (err && typeof err === 'string') {
        data.description = err
      }
    }
  }

  if (data && Object.keys(data).length > 0)
    toast.error(title, data)
  else
    toast.error(title)
}
