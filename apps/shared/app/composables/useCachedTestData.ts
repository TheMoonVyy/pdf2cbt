import type { ShallowRef } from 'vue'

type CachedTestData = {
  by: 'cbt-maker' | 'generate-answer-key'
  file: File
}

let cache: ShallowRef<CachedTestData | null> | null = null

export default () => cache ??= shallowRef(null)
