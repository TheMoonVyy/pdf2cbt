<script setup lang="ts">
import {
  cropperOverlayDatasKey,
  instructionsDataKey,
} from '../keys'

const steps = [
  {
    step: 1,
    title: 'Crop Questions',
    icon: 'mdi:library-edit',
  },
  {
    step: 2,
    title: 'Bulk Edit',
    icon: 'mdi:library-edit',
  },
  {
    step: 3,
    title: ['Sort Subjects or', 'Sections'],
    icon: 'mdi:sort',
  },
  {
    step: 4,
    title: ['Test or Section-', 'wise Instructions'],
    icon: 'mdi:newspaper-variant-multiple-outline',
  },
  {
    step: 5,
    title: 'Download',
    icon: 'line-md:download',
  },
]

const currentStep = defineModel<number>({ required: true })

const scrollAreaElem = useTemplateRef('scrollAreaElem')

useNuxtApp()?.$loadCbtLiquidEngine()

function handlePrevStep() {
  if (currentStep.value <= 1) return

  currentStep.value--
  scrollAreaElem.value?.scrollTop()
}

function handleNextStep() {
  if (currentStep.value >= steps.length) return

  currentStep.value++
  scrollAreaElem.value?.scrollTop()
}

const cropperOverlayDatas = inject(cropperOverlayDatasKey)!

const instructionsData = inject(instructionsDataKey)!

function prepareInstructionsData() {
  const subjectSections: {
    [subjectName: string]: string[] // section names
  } = {}

  for (const overlay of cropperOverlayDatas.value.values()) {
    if (overlay.imgNum !== 1) continue

    const subject = overlay.subject
    const section = overlay.section

    const sections = subjectSections[subject]
    if (!sections) {
      subjectSections[subject] = [section]
    }
    else {
      if (!sections.includes(section)) {
        sections.push(section)
      }
    }
  }

  const currentData = instructionsData.additionalData
  const newAdditionalData: CbtMakerInternalInstructionsData['additionalData'] = {}
  for (const [subject, sections] of Object.entries(subjectSections)) {
    const newSections: (typeof newAdditionalData)[string]['sections'] = {}

    for (const section of sections) {
      const currentSectionData = currentData[subject]?.sections[section]
      const optionalQuestions = currentSectionData?.optionalQuestions ?? 0
      const type = currentSectionData?.instructions?.type || 'none'

      newSections[section] = {
        optionalQuestions,
        instructions: { type },
      }
    }
    newAdditionalData[subject] = { sections: newSections }
  }

  instructionsData.additionalData = newAdditionalData
}

watch(currentStep,
  (newStep, oldStep) => {
    if (oldStep === 1 && newStep >= 2) {
      prepareInstructionsData()

      nextTick(() => {
        scrollAreaElem.value?.scrollTop()
      })
    }
  },
  { flush: 'pre' },
)
</script>

<template>
  <UiScrollArea
    ref="scrollAreaElem"
    type="auto"
    class="flex"
    viewport-class="min-h-0 h-[calc(100dvh-var(--main-nav-bar-height,0))]!
      [&>div]:flex [&>div]:flex-col [&>div]:min-h-0
      [&>div]:w-full [&>div]:p-2 [&>div]:lg:px-4"
  >
    <div class="flex w-full justify-center mb-3">
      <UiStepper
        v-model="currentStep"
        :linear="false"
        class="grid grid-cols-5 gap-0
          min-w-160 lg:min-w-230 xl:min-w-240  max-w-300"
      >
        <UiStepperItem
          v-for="item in steps"
          :key="item.step"
          :step="item.step"
          class="relative flex w-full flex-col items-center mt-1"
        >
          <UiStepperTrigger class="cursor-pointer">
            <UiStepperIndicator
              class="bg-muted size-10
              group-data-[state=completed]:bg-green-400
              group-data-[state=completed]:text-primary-foreground"
            >
              <Icon
                :name="item.icon"
                size="1.7rem"
              />
            </UiStepperIndicator>
          </UiStepperTrigger>
          <UiStepperSeparator
            v-if="item.step !== steps[steps.length - 1]?.step"
            class="absolute left-[calc(50%+24px)] right-[calc(-50%+24px)]
            top-6 block h-0.5 shrink-0 rounded-full bg-muted
            group-data-[state=completed]:bg-green-400"
          />
          <div class="flex flex-col items-center">
            <UiStepperTitle class="flex flex-col text-center lg:text-lg">
              <template v-if="Array.isArray(item.title)">
                <span
                  v-for="(des, idx) in item.title"
                  :key="idx"
                >{{ des }}</span>
              </template>
              <template v-else>
                {{ item.title }}
              </template>
            </UiStepperTitle>
          </div>
        </UiStepperItem>
      </UiStepper>
    </div>
    <CbtMakerPostCropperBulkEditPanel
      v-if="currentStep === 2"
      class="xl:w-5xl mx-auto"
    />
    <CbtMakerPostCropperSortPanel
      v-if="currentStep === 3"
      v-model:current-step="currentStep"
      class="xl:w-5xl mx-auto"
    />
    <CbtMakerPostCropperInstructionsPanel
      v-if="currentStep === 4"
      class="w-xl mx-auto"
    />
    <CbtMakerPostCropperDownloadPanel
      v-if="currentStep === 5"
      class="w-xl mx-auto"
    />
    <div class="flex gap-20 mx-auto mb-4 mt-7 pb-10">
      <BaseButton
        variant="help"
        icon-name="material-symbols:arrow-back-ios-new"
        label="Prev Step"
        icon-size="1.4rem"
        @click="handlePrevStep"
      />
      <BaseButton
        variant="help"
        class="flex flex-row-reverse"
        icon-name="material-symbols:arrow-forward-ios"
        label="Next Step"
        icon-size="1.4rem"
        :disabled="currentStep === steps.length"
        @click="handleNextStep"
      />
    </div>
    <UiCard class="gap-2 mx-2 sm:mx-auto max-w-4xl">
      <UiCardHeader class="mb-4">
        <UiCardTitle class="text-xl font-bold text-center">
          Docs
        </UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="px-6">
        <DocsCbtMakerPostCropperBulkEditPanel
          v-if="currentStep === 2"
        />
        <DocsCbtMakerPostCropperSortPanel
          v-if="currentStep === 3"
        />
        <DocsCbtMakerPostCropperTestAndSectionsInstructionsPanel
          v-if="currentStep === 4"
        />
        <DocsCbtMakerPostCropperDownloadPanel
          v-if="currentStep === 5"
        />
      </UiCardContent>
    </UiCard>
  </UiScrollArea>
</template>
