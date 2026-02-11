import type { Liquid } from 'liquidjs'

declare module '#app' {
  interface NuxtApp {
    $loadCbtLiquidEngine: () => Promise<InstanceType<typeof Liquid>>
    $getCbtLiquidEngine: () => InstanceType<typeof Liquid> | null
  }
}

export {}
