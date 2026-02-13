import type { ShallowRef } from 'vue'

type CachedTestData = {
  by: 'cbt-maker' | 'generate-answer-key'
  file: File
  time: number
}

let cache: ShallowRef<CachedTestData | null> | null = null

export default () => cache ??= shallowRef(null)
