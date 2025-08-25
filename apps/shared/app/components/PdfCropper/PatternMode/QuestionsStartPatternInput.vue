<template>
  <div class="flex flex-col gap-3 items-center">
    <div class="flex gap-2 items-center justify-center">
      <BaseButton
        class="rounded-r-none shrink-0"
        variant="outline"
        size="icon"
        :icon-name="pattern.type === 'regex'
          ? 'material-symbols:regular-expression'
          : 'my-icon:txt'"
        title="Toggle pattern type"
        icon-size="1.6rem"
        icon-class="text-green-400"
        @click="togglePatternType"
      />
      <BaseButton
        class="rounded-l-none shrink-0"
        variant="outline"
        size="icon"
        icon-name="material-symbols:match-case-rounded"
        title="Toggle case sensitivity"
        :icon-class="pattern.isCaseSensitive
          ? 'text-green-400'
          : ''"
        icon-size="1.7rem"
        @click="pattern.isCaseSensitive = !pattern.isCaseSensitive"
      />
      <span class="text-base text-center"> {{ utilKeyToLabel(pattern.type) }} Pattern</span>
      <BaseButton
        class="rounded-l-none shrink-0"
        variant="outline"
        size="icon"
        icon-name="material-symbols:match-case-rounded"
        title="Toggle case sensitivity"
        :icon-class="pattern.isCaseSensitive
          ? 'text-green-400'
          : ''"
        icon-size="1.7rem"
        @click="pattern.isCaseSensitive = !pattern.isCaseSensitive"
      />
    </div>
    <div class="flex gap-3 items-center justify-center">
      <template v-if="pattern.type === 'regex'">
        <FormLabel
          v-slot="{ id, handleBlur }"
          label="Regex Pattern"
          :field="fields.value"
          class="grow shrink-0"
        >
          <UiInput
            :id="id"
            v-model="pattern.value"
            @blur="handleBlur"
          />
        </FormLabel>
      </template>
      <template v-else>
        <BaseLabelWithId
          v-slot="{ id }"
          label="Prefix"
        >
          <UiInput
            :id="id"
            v-model="pattern.prefix"
          />
        </BaseLabelWithId>
        <FormLabel
          v-slot="{ id, handleBlur }"
          label="Q. Num Range"
          :field="fields.questionRange"
          class="grow shrink-0"
        >
          <UiInput
            :id="id"
            v-model="pattern.questionRange"
            @blur="handleBlur"
          />
        </FormLabel>
        <BaseLabelWithId
          v-slot="{ id }"
          label="Suffix"
        >
          <UiInput
            :id="id"
            v-model="pattern.suffix"
          />
        </BaseLabelWithId>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  PatternModeFormQuestionsData,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/json-config-to-form-data'

const pattern = defineModel<PatternModeFormQuestionsData['columns'][number]['start']['pattern']>({
  required: true,
})

type Fields = ReturnType<typeof usePatternModeFormStore>['r$']['subjects']['$each'][number]['sections']['$each'][number]['questions']['columns']['$each'][number]['start']['pattern']

defineProps<{ fields: Fields }>()

const togglePatternType = () => {
  if (pattern.value.type === 'text')
    pattern.value.type = 'regex'
  else
    pattern.value.type = 'text'
}
</script>
