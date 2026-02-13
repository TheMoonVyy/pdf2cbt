<script lang="ts" setup>
const questionAnswer = defineModel<GenerateAnswerKeyInternalNatAnswer>({ required: true })

let nextId = Date.now()

function onOrBtnClick(
  idx: number,
  item: NonNullable<ReturnType<GenerateAnswerKeyInternalNatAnswer['get']>>,
) {
  if ((idx + 1) === questionAnswer.value.size) {
    questionAnswer.value.set(++nextId, {
      isRange: item.isRange,
      min: '',
      max: '',
      value: '',
    })

    return
  }

  const nextItemId = questionAnswer.value.keys()
    .find((_, i) => i === (idx + 1))

  if (typeof nextItemId === 'number')
    questionAnswer.value.delete(nextItemId)
}
</script>

<template>
  <div class="flex flex-col items-center gap-5 px-4">
    <template
      v-for="([id, item], idx) in questionAnswer"
      :key="id"
    >
      <div class="flex gap-5">
        <BaseButton
          icon-name="mdi:letter-r-circle-outline"
          :icon-class="item.isRange ? 'text-green-400': ''"
          size="icon"
          icon-size="1.8rem"
          variant="outline"
          title="Toggle Range"
          @click="item.isRange = !item.isRange"
        />
        <div
          v-if="item.isRange"
          class="flex items-center gap-3"
        >
          <UiInput
            v-model.trim="item.min"
            class="text-base md:text-xl h-10 w-25 text-center"
            type="text"
            :maxlength="50"
          />
          <span class="text-xl">To</span>
          <UiInput
            v-model.trim="item.max"
            class="text-base md:text-xl h-10 w-25 text-center"
            type="text"
            :maxlength="50"
          />
        </div>
        <div
          v-else
          class="flex"
        >
          <UiInput
            v-model.trim="item.value"
            class="text-base md:text-xl h-10 w-61.5 text-center"
            type="text"
            :maxlength="50"
          />
        </div>
      </div>
      <BaseButton
        :class="(idx + 1) !== questionAnswer.size
          ? 'text-green-500 hover:text-green-500'
          : ''"
        label-class="text-base font-bold"
        label="OR"
        size="icon"
        variant="outline"
        @click="onOrBtnClick(idx, item)"
      />
    </template>
  </div>
</template>
