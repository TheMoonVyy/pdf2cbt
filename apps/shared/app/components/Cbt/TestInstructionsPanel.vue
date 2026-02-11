<script lang="ts" setup>
const {
  viewOnly,
  disableBtn = false,
  parsedTestInstructions,
} = defineProps<{
  viewOnly?: boolean
  disableBtn?: boolean
  parsedTestInstructions: CbtParsedTestInstructions
}>()

const emit = defineEmits<{
  startTest: []
}>()

const isDeclarationChecked = shallowRef(false)

const currentPageIdx = shallowRef(0)

const currentPage = computed(() => parsedTestInstructions.pages[currentPageIdx.value]!)

const isFirstPage = computed(() => currentPageIdx.value === 0)
const isLastPage = computed(() =>
  currentPageIdx.value >= (parsedTestInstructions.pages.length - 1),
)
function changeCurrentPage(newIndex: number) {
  currentPageIdx.value = newIndex
}

const { uiSettings } = useCbtSettings()

const pageCssVars = computed(() => {
  const themes = uiSettings.value.themes
  return {
    '--bg-primary-theme-color': themes.primary.bgColor,
    '--text-primary-theme-color': themes.primary.textColor,
    '--bg-secondary-theme-color': themes.secondary.bgColor,
    '--text-secondary-theme-color': themes.secondary.textColor,
  }
})

watch(() => parsedTestInstructions, () => {
  const newPagesLength = parsedTestInstructions.pages.length

  if (currentPageIdx.value >= newPagesLength)
    currentPageIdx.value = 0

  isDeclarationChecked.value = false
})
</script>

<template>
  <ClientOnly>
    <div
      class="h-dvh bg-white text-black"
      :style="pageCssVars"
    >
      <template v-if="!viewOnly">
        <div
          class="px-2.5 text-lg font-bold py-2 h-10 sticky top-0 z-10
          secondary-theme text-zinc-600!"
        >
          {{ currentPage.title }}
        </div>

        <div
          v-for="(instruction, index) in parsedTestInstructions.pages"
          v-show="currentPageIdx === index"
          :key="index"
          class="overflow-y-auto h-[calc(100vh-10rem)]"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="max-w-none mt-4 mb-10"
            data-cbt-instructions
            v-html="instruction.data"
          />
        </div>

        <div
          class="px-5 pt-1 pb-4 flex flex-col justify-end min-h-30 h-fit z-10
          border-t border-gray-400"
        >
          <div
            v-if="isLastPage && parsedTestInstructions.declaration.trim()"
            class="flex gap-2 text-xs"
          >
            <input
              id="instructions-panel-declaration"
              v-model="isDeclarationChecked"
              class="cursor-pointer"
              type="checkbox"
            >
            <label
              for="instructions-panel-declaration"
              class="cursor-pointer text-slate-800 h-12 overflow-y-auto"
              v-html="parsedTestInstructions.declaration"
            />
          </div>
          <div class="grid grid-cols-3 my-2.5">
            <BaseButton
              v-show="!isFirstPage"
              class="mr-auto col-start-1 gap-0.5 h-10 px-5 rounded-none
              primary-theme-btn-hover bg-white border border-slate-400
              transition delay-30 duration-100 ease-in-out"
              label="Previous"
              label-class="text-[0.95rem]"
              icon-name="material-symbols:arrow-back-ios-new"
              icon-size="1.1rem"
              @click="changeCurrentPage(currentPageIdx - 1)"
            />
            <BaseButton
              v-show="isLastPage"
              class="mx-auto col-start-2 h-10 px-5 rounded-none primary-theme-btn
              border border-slate-400 transition delay-30 duration-100 ease-in-out"
              label="I am ready to begin"
              label-class="text-xs"
              :disabled="disableBtn
                || (!!parsedTestInstructions.declaration.trim() && !isDeclarationChecked)"
              @click="emit('startTest')"
            />
            <BaseButton
              v-show="!isLastPage"
              class="ml-auto col-start-3 gap-0.5 flex-row-reverse h-10.5 px-5
              primary-theme-btn-hover border border-slate-400
              rounded-none transition delay-30 duration-100 ease-in-out"
              label="Next"
              label-class="text-[0.95rem]"
              icon-name="material-symbols:arrow-forward-ios"
              icon-size="1.1rem"
              @click="changeCurrentPage(currentPageIdx + 1)"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <div
          v-for="(instruction, index) in parsedTestInstructions.pages"
          :key="index"
        >
          <div
            class="px-2.5 text-lg font-bold py-2 h-10
          secondary-theme text-zinc-600!"
          >
            {{ instruction.title }}
          </div>
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="max-w-none mt-4 mb-10"
            data-cbt-instructions
            v-html="instruction.data"
          />
        </div>
      </template>
    </div>
  </ClientOnly>
</template>

<style>
[data-cbt-instructions] {
  font-family: 'Calibri', sans-serif;
  font-size: 1.1rem;
  line-height: 1.4rem;
  color: #000;
  padding: 0 30px;
  background-color: #fff;
}

[data-cbt-instructions] h1,
[data-cbt-instructions] h2 {
  color: #000;
  font-weight: 600;
  margin: 0;
}

[data-cbt-instructions] h1 {
  font-size: 1.5rem;
}

[data-cbt-instructions] h2 {
  font-size: 1.2rem;
  margin-top: 25px;
}

/* Lists */
[data-cbt-instructions] ol, [data-cbt-instructions] ul {
  padding-left: 30px;
  margin-top: 10px;
}

[data-cbt-instructions] > ul, [data-cbt-instructions] > ol {
  padding-left: 40px;
}

[data-cbt-instructions] ul:not([class]) {
  padding-left: 20px;
}

:where([data-cbt-instructions] ol) {
  list-style-type: decimal;
}

[data-cbt-instructions] ol li {
  padding: 6px 3px;
  font-size: 1.1rem;
  margin-bottom: 0;
}

[data-cbt-instructions] table,
[data-cbt-instructions] table thead,
[data-cbt-instructions] table th,
[data-cbt-instructions] table tr,
[data-cbt-instructions] table td,
[data-cbt-instructions] table tbody {
  border-width: 1px;
  padding: 3px 8px;
}

[data-cbt-instructions] table {
  margin-left: auto;
  margin-right: auto;
}

[data-cbt-instructions] .left {
  margin-left: 0px;
  margin-right: auto;
}

[data-cbt-instructions] .center {
  margin-left: auto;
  margin-right: auto;
}

[data-cbt-instructions] .right {
  margin-right: 0px;
  margin-left: auto;
}
</style>
