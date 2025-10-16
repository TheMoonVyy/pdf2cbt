import {
  type PatternModeFormData,
  getConfigFormDataFromJson,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/json-config-to-form-data'
import type {
  PatternModeConfigJson,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/config-schema'

const form = ref<PatternModeFormData | null>(null)

export default (jsonData?: PatternModeConfigJson | null) => {
  if (jsonData) {
    form.value = getConfigFormDataFromJson(jsonData)
  }
  return { form }
}
