<template>
  <div
    class="flex dark overflow-hidden min-h-0 grow bg-background"
  >
    <UiScrollArea
      type="auto"
      class="h-full w-full"
    >
      <UiCard class="py-3 rounded-none">
        <UiCardContent class="flex flex-col w-full px-2 h-full">
          <div class="flex justify-between mx-6">
            <div class="flex gap-6">
              <BaseSimpleFileUpload
                accept="application/json,.json"
                label="Import Settings"
                invalid-file-type-message="Please select a valid JSON file that was exported from this page."
                icon-name="prime:download"
                @upload="(files) => handleImportExportBtn('import', files)"
              />
              <BaseButton
                label="Export Settings"
                variant="help"
                icon-name="prime:upload"
                @click="handleImportExportBtn('export')"
              />
            </div>
            <div class="flex gap-6">
              <BaseButton
                label="Restore From Saved"
                variant="warn"
                icon-name="mdi:database-refresh"
                @click="handleImportExportBtn('restoreFromSaved')"
              />
              <BaseButton
                label="Reset Settings"
                variant="destructive"
                icon-name="material-symbols:reset-settings-rounded"
                @click="handleImportExportBtn('reset')"
              />
            </div>
          </div>
          <UiCard class="py-0 mt-4 rounded-none gap-2">
            <UiCardHeader>
              <UiCardTitle class="text-xl mx-auto">
                Test Data & Settings
              </UiCardTitle>
            </UiCardHeader>
            <UiCardContent class="flex flex-row w-full px-0">
              <div class="flex flex-col w-1/4 items-center mx-auto">
                <span class="pl-5 pr-3 text-lg font-bold">Test Settings</span>
                <div
                  class="grow pb-3 pt-1 px-1.5 w-full
                    border border-surface-700 rounded-md"
                >
                  <div class="grid grid-cols-1 w-full">
                    <div class="grid grid-cols-1 w-full mr-0.5">
                      <UiLabel
                        class="mb-0.5"
                        for="test_state_test_name"
                      >
                        Test Name
                      </UiLabel>
                      <UiInput
                        id="test_state_test_name"
                        v-model="testSettings.testName"
                        type="text"
                        :maxlength="60"
                        :disabled="!!testState.continueLastTest"
                        class="text-center"
                        @blur="() => testSettings.testName ||= defaultTestSettings.testName"
                      />
                    </div>
                    <div class="grid grid-cols-1 w-full ml-0.5 mt-2">
                      <div class="flex gap-2 w-full justify-center mb-0.5">
                        <UiLabel
                          for="submit_btn_dropdown"
                        >
                          Submit Button
                        </UiLabel>
                        <IconWithTooltip
                          :content="tooltipContent.submitBtn"
                        />
                      </div>
                      <BaseSelect
                        id="submit_btn_dropdown"
                        v-model="testSettings.submitBtn"
                        size="sm"
                        :options="selectOptions.submitBtn"
                        class="col-span-6"
                      />
                    </div>
                    <div class="flex w-full justify-center">
                      <UiLabel
                        class="col-span-5 mt-2 mb-0.5"
                      >
                        Test Duration
                      </UiLabel>
                      <IconWithTooltip
                        :content="tooltipContent.testDuration"
                        class="ml-2 mt-2"
                      />
                    </div>
                    <div class="grid grid-cols-6 w-full gap-1">
                      <div class="flex flex-col col-span-6 mt-1">
                        <UiLabel
                          class="text-sm mb-0.5"
                          for="time_format"
                        >
                          Time Format
                        </UiLabel>
                        <BaseSelect
                          id="time_format"
                          v-model="testSettings.timeFormat"
                          :options="selectOptions.timeFormat"
                          size="sm"
                        />
                      </div>
                      <div
                        v-if="testSettings.timeFormat === 'hh:mm:ss'"
                        class="flex flex-col col-span-2 items-center mt-1"
                      >
                        <UiLabel
                          class="text-sm"
                          for="duration_hours"
                        >
                          Hours
                        </UiLabel>
                        <BaseInputNumber
                          id="duration_hours"
                          v-model="testTimings.h"
                          :min="0"
                          :max="23"
                          :disabled="!!testState.continueLastTest"
                          input-class="text-sm"
                          without-buttons
                        />
                      </div>
                      <div
                        class="flex flex-col items-center mt-1"
                        :class="testSettings.timeFormat === 'hh:mm:ss' ? 'col-span-2' : 'col-span-3'"
                      >
                        <UiLabel
                          class="text-sm"
                          for="duration_minutes"
                        >
                          Mins
                        </UiLabel>
                        <BaseInputNumber
                          id="duration_minutes"
                          v-model="testTimings.m"
                          :min="0"
                          :max="testSettings.timeFormat === 'mmm:ss' ? (60 * 24) - 1 : 59"
                          :disabled="!!testState.continueLastTest"
                          input-class="text-sm"
                          without-buttons
                        />
                      </div>
                      <div
                        class="flex flex-col items-center mt-1"
                        :class="testSettings.timeFormat === 'hh:mm:ss' ? 'col-span-2' : 'col-span-3'"
                      >
                        <UiLabel
                          class="text-sm"
                          for="duration_seconds"
                        >
                          Secs
                        </UiLabel>
                        <BaseInputNumber
                          id="duration_seconds"
                          v-model="testTimings.s"
                          :min="0"
                          :max="59"
                          :disabled="!!testState.continueLastTest"
                          input-class="text-sm"
                          without-buttons
                        />
                      </div>
                    </div>
                    <div class="grid grid-cols-1 w-full ml-0.5 mt-2">
                      <div class="flex gap-2 w-full justify-center mb-0.5">
                        <UiLabel
                          for="pause_btn_dropdown"
                        >
                          Allow Pausing Test
                        </UiLabel>
                        <IconWithTooltip
                          :content="tooltipContent.showPauseBtn"
                        />
                      </div>
                      <BaseSelect
                        id="pause_btn_dropdown"
                        v-model="testSettings.showPauseBtn"
                        size="sm"
                        :options="selectOptions.showPauseBtn"
                        class="col-span-6"
                      />
                    </div>
                    <div class="grid grid-cols-1 w-full ml-0.5 mt-2">
                      <div class="flex gap-2 w-full items-center justify-center mb-0.5">
                        <UiLabel
                          for="saveQLikeRealExams"
                          class="text-center"
                        >
                          Save Questions<br>
                          Like Real Exams
                        </UiLabel>
                        <IconWithTooltip
                          :content="tooltipContent.saveQuestionsLikeRealExams"
                        />
                      </div>
                      <BaseSelect
                        id="saveQLikeRealExams"
                        v-model="testSettings.saveQuestionsLikeRealExams"
                        size="sm"
                        :options="selectOptions.yesNo"
                        class="col-span-6"
                      />
                    </div>
                    <template v-if="!testState.testImageBlobs">
                      <div class="flex justify-center gap-3 mt-3 w-full">
                        <UiLabel
                          for="test_img_quality"
                        >
                          Questions Image Scale
                        </UiLabel>
                        <IconWithTooltip
                          :content="tooltipContent.questionImgScale"
                        />
                      </div>
                      <div class="flex justify-center gap-3 w-full mt-1.5">
                        <BaseInputNumber
                          id="test_img_quality"
                          v-model="testSettings.questionImgScale"
                          :min="1"
                          :max="10"
                          :step="0.1"
                          input-class="text-sm"
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <div class="flex flex-col grow">
                <template v-if="!testState.isSectionsDataLoaded">
                  <div class="flex justify-center">
                    <span class="pl-5 pr-3 text-lg font-bold">Load PDF Questions Data</span>
                    <IconWithTooltip
                      :content="tooltipContent.testDataFileUpload"
                    />
                  </div>
                  <CbtInterfaceFileUpload
                    v-if="!hashMismatchDialogState.showDialog"
                    v-model="fileUploaderFileType"
                    v-model:show-zip-from-url-dialog="zipFileFromUrlState.isDialogOpen"
                    :zip-file-to-load="zipFileFromUrlState.zipFile"
                    @uploaded="verifyTestData"
                  />
                </template>
                <template v-else>
                  <div class="flex grow mx-8">
                    <div
                      v-if="!testState.continueLastTest"
                      class="flex flex-col mx-auto"
                    >
                      <div class="flex justify-center">
                        <span class="pl-5 pr-3 text-lg font-bold">Sort Sections Order</span>
                      </div>
                      <div class="flex mx-auto mt-2">
                        <CbtSectionsOrderList
                          v-model="testSectionsList"
                        />
                      </div>
                    </div>
                    <div class="flex flex-col mx-auto">
                      <div class="flex mb-2 gap-3">
                        <UiLabel
                          class="font-bold"
                          for="questions_numbering_type"
                        >
                          Questions Numbering Order
                        </UiLabel>
                        <IconWithTooltip
                          :content="tooltipContent.questionsNumberingOrderType"
                        />
                      </div>
                      <div class="flex flex-col grow items-center">
                        <BaseSelect
                          id="questions_numbering_type"
                          v-model="currentTestState.questionsNumberingOrderType"
                          :options="selectOptions.questionsNumberingOrderType"
                          :disabled="Boolean(testState.continueLastTest)"
                          class="w-4/5"
                        />
                        <BaseButton
                          label="Prepare Test"
                          size="lg"
                          class="my-auto"
                          icon-name="mdi:rocket-launch"
                          icon-size="1.6rem"
                          @click="prepareTestState.dialogVisibility = true"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </UiCardContent>
          </UiCard>
          <UiAccordion
            type="multiple"
            :default-value="[]"
            :unmount-on-hide="false"
            class="w-full"
          >
            <UiAccordionItem value="1">
              <UiAccordionTrigger>
                UI Settings & Customizations
              </UiAccordionTrigger>
              <UiAccordionContent>
                <UiCard class="py-2 mt-4 rounded-none gap-2">
                  <UiCardHeader>
                    <UiCardTitle class="text-lg mx-auto">
                      Main Layout
                    </UiCardTitle>
                  </UiCardHeader>
                  <UiCardContent class="grid grid-cols-4 px-4 gap-4">
                    <div class="flex flex-col w-full items-center justify-end">
                      <div class="flex gap-2 items-center justify-center">
                        <UiLabel
                          class="text-sm text-center"
                          for="testInterfacePageZoomSize"
                        >
                          Page Zoom Size (in %)
                        </UiLabel>
                      </div>
                      <BaseInputNumber
                        id="testInterfacePageZoomSize"
                        v-model="appSettings.pages.testInterface.size"
                        :min="50"
                        :max="250"
                        :step="5"
                      />
                    </div>

                    <div
                      v-for="item in htmlContent.customizeUi.mainLayout"
                      :key="item.key"
                      class="flex flex-col w-full items-center justify-end"
                    >
                      <div class="flex gap-2 items-center justify-center">
                        <UiLabel
                          class="text-sm text-center"
                          :for="item.id"
                        >
                          {{ item.label }}
                        </UiLabel>
                        <IconWithTooltip
                          v-if="item.tooltip"
                          :content="item.tooltip"
                        />
                      </div>
                      <BaseSelect
                        v-if="item.type === 'select'"
                        :id="item.id"
                        v-model="(settings.mainLayout[item.key as keyof CbtUiSettings['mainLayout']] as boolean)"
                        :options="item.options || selectOptions.showHide"
                        trigger-class="w-3/4"
                      />
                      <BaseInputNumber
                        v-else
                        :id="item.id"
                        v-model="(settings.mainLayout[item.key as keyof CbtUiSettings['mainLayout']] as number)"
                        :min="item.min"
                        :max="item.max"
                        :step="item.step || 1"
                        :size="('size' in item ? (item.size as string) : null)"
                      />
                    </div>
                  </UiCardContent>
                </UiCard>
                <div class="flex w-full">
                  <UiCard class="pt-2 pb-0 mt-4 rounded-none gap-2 w-1/2 shrink-0">
                    <UiCardHeader>
                      <UiCardTitle class="text-lg mx-auto">
                        Themes
                      </UiCardTitle>
                    </UiCardHeader>
                    <UiCardContent class="flex flex-col px-0 divide-y divide-border border-t border-border">
                      <div class="grid grid-cols-8 gap-3 text-center font-semibold divide-x divide-border">
                        <div class="py-4 col-span-2">
                          Theme
                        </div>
                        <div class="py-4 col-span-3">
                          Text Color
                        </div>
                        <div class="py-4 col-span-3">
                          Background Color
                        </div>
                      </div>
                      <div
                        v-for="(theme, name) in settings.themes"
                        :key="name"
                        class="grid grid-cols-8 gap-3 text-center divide-x divide-border"
                      >
                        <!-- Theme Name -->
                        <div class="col-span-2 flex items-center justify-center text-base font-medium py-4">
                          {{ utilKeyToLabel(name) }}
                        </div>
                        <!-- Text Color -->
                        <div class="flex col-span-3 items-center justify-center gap-4 py-4 px-2">
                          <UiInput
                            v-model="theme.textColor"
                            type="text"
                            class="text-center"
                          />
                          <BaseColorPicker v-model="theme.textColor" />
                        </div>
                        <!-- Background Color -->
                        <div class="flex col-span-3 items-center justify-center gap-4 py-4 px-2">
                          <UiInput
                            v-model="theme.bgColor"
                            type="text"
                            class="text-center"
                          />
                          <BaseColorPicker v-model="theme.bgColor" />
                        </div>
                      </div>
                    </UiCardContent>
                  </UiCard>
                  <UiCard class="py-2 mt-4 rounded-none gap-2">
                    <UiCardHeader>
                      <UiCardTitle class="text-lg mx-auto">
                        Question Panel
                      </UiCardTitle>
                    </UiCardHeader>
                    <UiCardContent class="flex flex-col px-4">
                      <div class="flex w-full justify-center gap-2 mb-0.5">
                        <UiLabel
                          class="text-nowrap font-semibold"
                        >
                          MCQ &amp; MSQ Options Format
                        </UiLabel>
                        <div class="flex relative items-center group">
                          <Icon
                            class="text-base"
                            name="my-icon:info"
                            tabindex="-1"
                          />
                          <div
                            class="hidden group-hover:flex! group-focus:flex! absolute flex-col
                              z-50 w-max text-black bg-white top-full right-0"
                          >
                            <span class="text-center">
                              PREVIEW:
                            </span>
                            <div class="py-2 px-4">
                              <CbtInterfaceAnswerOptionsDiv
                                v-model="dummyValue"
                                total-options="4"
                                question-type="mcq"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-span-2 grid grid-cols-3 gap-1 mt-2">
                        <div class="flex flex-col w-full">
                          <UiLabel
                            class="text-sm"
                            for="answer_options_prefix"
                          >
                            Prefix
                          </UiLabel>
                          <UiInput
                            id="answer_options_prefix"
                            v-model="settings.questionPanel.answerOptionsFormat.mcqAndMsq.prefix"
                            type="text"
                            :maxlength="25"
                            class="md:text-base h-8"
                          />
                        </div>
                        <div class="flex flex-col w-full">
                          <UiLabel
                            class="text-sm"
                            for="answer_options_counter"
                          >
                            Counter Type
                          </UiLabel>
                          <BaseSelect
                            id="answer_options_counter"
                            v-model="settings.questionPanel.answerOptionsFormat.mcqAndMsq.counterType"
                            :options="selectOptions.answerOptionsFormat"
                            size="sm"
                          />
                        </div>
                        <div class="flex flex-col w-full">
                          <UiLabel
                            class="text-sm"
                            for="answer_options_suffix"
                          >
                            Suffix
                          </UiLabel>
                          <UiInput
                            id="answer_options_suffix"
                            v-model="settings.questionPanel.answerOptionsFormat.mcqAndMsq.suffix"
                            type="text"
                            :maxlength="25"
                            class="md:text-base h-8"
                          />
                        </div>
                      </div>
                      <div class="col-span-2 grid grid-cols-3 gap-1 mt-2">
                        <div
                          v-for="item in htmlContent.customizeUi.questionPanel.answerOptionsFormat.mcqAndMsq"
                          :key="item.key"
                          class="flex flex-col w-full"
                        >
                          <UiLabel
                            class="text-sm"
                            :for="item.id"
                          >
                            {{ item.label }}
                          </UiLabel>
                          <BaseInputNumber
                            :id="item.id"
                            v-model="(
                              settings.questionPanel.answerOptionsFormat.mcqAndMsq[
                                item.key as keyof CbtUiSettings['questionPanel']['answerOptionsFormat']['mcqAndMsq']
                              ] as number)"
                            :min="item.min"
                            :max="item.max"
                            :step="item.step || 1"
                          />
                        </div>
                      </div>
                      <div
                        class="grid grid-cols-2 mt-4 gap-3"
                      >
                        <UiLabel
                          class="col-span-2 text-base text-nowrap font-semibold"
                        >
                          Question Img Max Width (%)
                        </UiLabel>
                        <div class="flex flex-col items-center">
                          <UiLabel
                            class="text-sm"
                            for="ques_img_max_width_qp_opened"
                          >
                            When Question Palette Opened
                          </UiLabel>
                          <BaseInputNumber
                            v-model="uiSettings.questionPanel.questionImgMaxWidth.maxWidthWhenQuestionPaletteOpened"
                            :min="10"
                            :max="100"
                            :step="5"
                            label-id="ques_img_max_width_qp_opened"
                            class="w-3/5"
                          />
                        </div>
                        <div class="flex flex-col items-center">
                          <UiLabel
                            for="ques_img_max_width_qp_closed"
                            class="text-sm"
                          >
                            When Question Palette Closed
                          </UiLabel>
                          <BaseInputNumber
                            v-model="uiSettings.questionPanel.questionImgMaxWidth.maxWidthWhenQuestionPaletteClosed"
                            :min="10"
                            :max="100"
                            :step="5"
                            label-id="ques_img_max_width_qp_closed"
                            class="w-3/5"
                          />
                        </div>
                      </div>
                    </UiCardContent>
                  </UiCard>
                </div>
                <UiCard class="py-2 mt-4 rounded-none gap-2 w-full">
                  <UiCardHeader>
                    <UiCardTitle class="text-lg mx-auto">
                      MSM Question Type's Format
                    </UiCardTitle>
                  </UiCardHeader>
                  <UiCardContent class="flex px-4 w-full divide-x-2 divide-border">
                    <div class="flex flex-col w-60 pr-4">
                      <UiLabel
                        class="text-sm"
                        for="msm-checkbox-zoom-size"
                      >
                        Checkbox Size
                      </UiLabel>
                      <BaseInputNumber
                        id="msm-checkbox-zoom-size"
                        v-model="settings.questionPanel.answerOptionsFormat.msm.zoomSize"
                        :min="0.5"
                        :max="5"
                        :step="0.1"
                      />
                    </div>
                    <div class="grid grid-cols-2 divide-x-2 divide-border">
                      <div
                        v-for="(axisLabel, axisKey) in ({ row: 'Rows', col: 'Columns' } as const)"
                        :key="axisKey"
                        class="flex flex-col gap-3 px-4"
                      >
                        <div class="flex w-full justify-center gap-2 mb-0.5">
                          <UiLabel
                            class="text-nowrap font-semibold"
                          >
                            {{ axisLabel }} Format
                          </UiLabel>
                        </div>
                        <div class="col-span-2 grid grid-cols-3 gap-4 mt-2">
                          <div class="flex flex-col">
                            <UiLabel
                              class="text-sm"
                              :for="`msm_${axisKey}_answer_options_prefix`"
                            >
                              Prefix
                            </UiLabel>
                            <UiInput
                              :id="`msm_${axisKey}_answer_options_prefix`"
                              v-model="settings.questionPanel.answerOptionsFormat.msm[axisKey].prefix"
                              type="text"
                              :maxlength="25"
                              class="md:text-base h-8"
                            />
                          </div>
                          <div class="flex flex-col">
                            <UiLabel
                              class="text-sm"
                              :for="`msm_${axisKey}_answer_options_counter`"
                            >
                              Counter Type
                            </UiLabel>
                            <BaseSelect
                              :id="`msm_${axisKey}_answer_options_counter`"
                              v-model="settings.questionPanel.answerOptionsFormat.msm[axisKey].counterType"
                              :options="selectOptions.answerOptionsFormat"
                              size="sm"
                            />
                          </div>
                          <div class="flex flex-col">
                            <UiLabel
                              class="text-sm"
                              :for="`msm_${axisKey}_answer_options_suffix`"
                            >
                              Suffix
                            </UiLabel>
                            <UiInput
                              :id="`msm_${axisKey}_answer_options_suffix`"
                              v-model="settings.questionPanel.answerOptionsFormat.msm[axisKey].suffix"
                              type="text"
                              :maxlength="25"
                              class="md:text-base h-8"
                            />
                          </div>
                        </div>
                        <div class="col-span-2 grid grid-cols-2 gap-4 mt-2">
                          <div
                            v-for="item in htmlContent.customizeUi.questionPanel.answerOptionsFormat.msm"
                            :key="item.key"
                            class="flex flex-col w-full"
                          >
                            <UiLabel
                              class="text-sm"
                              :for="item.id"
                            >
                              {{ item.label }}
                            </UiLabel>
                            <BaseInputNumber
                              :id="item.id"
                              v-model="(
                                settings.questionPanel.answerOptionsFormat.msm[axisKey][
                                  item.key as keyof CbtUiSettings['questionPanel']['answerOptionsFormat']['msm']['row']
                                ] as number)"
                              :min="item.min"
                              :max="item.max"
                              :step="item.step || 1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </UiCardContent>
                </UiCard>
                <UiCard class="py-2 mt-4 rounded-none gap-2">
                  <UiCardHeader>
                    <UiCardTitle class="text-lg mx-auto">
                      Section Summary &amp; Question Palette
                    </UiCardTitle>
                  </UiCardHeader>
                  <UiCardContent class="flex flex-col w-full p-2 gap-3">
                    <div class="grid grid-cols-4 gap-4">
                      <div
                        v-for="item in htmlContent.customizeUi.questionPalette"
                        :key="item.key"
                        class="flex flex-col w-full items-center justify-end"
                      >
                        <UiLabel
                          class="text-sm"
                          :for="item.id"
                        >
                          {{ item.label }}
                        </UiLabel>
                        <BaseInputNumber
                          :id="item.id"
                          v-model="(
                            settings.questionPalette[
                              item.key as keyof CbtUiSettings['questionPalette']
                            ] as number)"
                          :min="item.min"
                          :max="item.max"
                          :step="item.step || 1"
                        />
                      </div>
                    </div>
                    <div class="flex justify-center p-5 gap-3">
                      <UiLabel class="text-lg font-semibold text-center">
                        Customize Icons & its sizes
                      </UiLabel>
                      <IconWithTooltip
                        :content="tooltipContent.iconSettings"
                        icon-size="1.25rem"
                      />
                    </div>
                    <div class="grid grid-cols-5 border-2 border-gray-500 divide-x-2 divide-gray-500">
                      <template
                        v-for="(label, key) in statusKeyNames"
                        :key="key"
                      >
                        <div class="flex flex-col gap-3 pb-2">
                          <UiLabel class="col-span-2 p-2 font-bold py-1 border-b-2 border-gray-500">
                            {{ label }}:
                          </UiLabel>
                          <BaseSimpleFileUpload
                            accept="image/*"
                            label="Change Icon"
                            variant="help"
                            invalid-file-type-message="Please select a valid Image."
                            class="mx-auto"
                            @upload="(file) => changeIcon(file, key)"
                          />
                          <div class="grid grid-cols-4 gap-2 px-4">
                            <UiLabel
                              class="col-span-4"
                              :for="`icons_${key}_text_color`"
                            >
                              Text Color
                            </UiLabel>
                            <UiInput
                              :id="`icons_${key}_text_color`"
                              v-model="settings.questionPalette.quesIcons[key].textColor"
                              type="text"
                              class="col-span-3 text-center"
                            />
                            <BaseColorPicker v-model="settings.questionPalette.quesIcons[key].textColor" />
                          </div>
                          <UiLabel class="p-2 border-y border-gray-500">
                            Section Summary
                          </UiLabel>
                          <div class="flex flex-col gap-1 px-4">
                            <UiLabel
                              :for="`${key}_summary_icon_size`"
                            >
                              Icon Size
                            </UiLabel>
                            <BaseInputNumber
                              v-model="settings.questionPalette.quesIcons[key].summaryIconSize"
                              :min="0"
                              :max="10"
                              :step="0.1"
                              :label-id="`${key}_summary_icon_size`"
                              size="small"
                            />
                          </div>
                          <div class="flex flex-col gap-1 px-4">
                            <UiLabel
                              :for="`${key}_summary_number_size`"
                            >
                              Icon Number Size
                            </UiLabel>
                            <BaseInputNumber
                              v-model="settings.questionPalette.quesIcons[key].summaryNumberTextFontSize"
                              :min="0"
                              :max="10"
                              :step="0.1"
                              :label-id="`${key}_summary_number_size`"
                              size="small"
                            />
                          </div>
                          <div class="flex flex-col gap-1 px-4">
                            <UiLabel
                              :for="`${key}_summary_label_size`"
                            >
                              Label Font Size
                            </UiLabel>
                            <BaseInputNumber
                              v-model="settings.questionPalette.quesIcons[key].summaryLabelFontSize"
                              :min="0"
                              :max="10"
                              :step="0.1"
                              :label-id="`${key}_summary_label_size`"
                              size="small"
                            />
                          </div>
                          <UiLabel class="p-2 border-y border-gray-500">
                            Question Palette
                          </UiLabel>
                          <div class="flex flex-col gap-1 px-4">
                            <UiLabel
                              :for="`${key}_palette_icon_size`"
                            >
                              Icon Size
                            </UiLabel>
                            <BaseInputNumber
                              v-model="settings.questionPalette.quesIcons[key].iconSize"
                              :min="0"
                              :max="10"
                              :step="0.1"
                              :label-id="`${key}_palette_icon_size`"
                              size="small"
                            />
                          </div>
                          <div class="flex flex-col gap-1 px-4">
                            <UiLabel
                              :for="`${key}_palette_number_size`"
                            >
                              Icon Number Size
                            </UiLabel>
                            <BaseInputNumber
                              v-model="settings.questionPalette.quesIcons[key].numberTextFontSize"
                              :min="0"
                              :max="10"
                              :step="0.1"
                              :label-id="`${key}_palette_number_size`"
                              size="small"
                            />
                          </div>
                        </div>
                      </template>
                    </div>
                  </UiCardContent>
                </UiCard>
              </UiAccordionContent>
            </UiAccordionItem>
            <UiAccordionItem value="2">
              <UiAccordionTrigger>
                Miscellaneous Settings
              </UiAccordionTrigger>
              <UiAccordionContent>
                <span class="flex text-center justify-center mb-4">
                  Misc. settings for Profile Details (Top-right corner one)<br>
                  Everthing under this is for visual use only and thus is optional,<br>
                  none of these are saved or exported for privacy reasons
                </span>
                <div class="flex w-full">
                  <div class="grid grid-cols-6 gap-4">
                    <div class="grid grid-cols-1 col-span-2 w-full">
                      <UiLabel
                        class="mb-0.5"
                        for="misc_user_name"
                      >
                        User Name
                      </UiLabel>
                      <UiInput
                        id="misc_user_name"
                        v-model="miscSettings.username"
                        type="text"
                        class="text-center"
                        :maxlength="60"
                      />
                    </div>
                    <div class="grid grid-cols-1 w-full">
                      <UiLabel
                        for="misc_profile_icon"
                      >
                        Profile Img
                      </UiLabel>
                      <BaseSimpleFileUpload
                        accept="image/*"
                        label="Change"
                        variant="help"
                        button-class="px-2 pt-[.5rem]"
                        class="mx-auto"
                        invalid-file-type-message="Please select a valid Image."
                        @upload="(file) => changeProfileIcon(file)"
                      />
                    </div>
                    <div
                      v-for="item in htmlContent.miscSettings"
                      :key="item.key"
                      class="grid grid-cols-1 w-full"
                    >
                      <UiLabel
                        class="text-sm"
                        :for="item.id"
                      >
                        {{ item.label }}
                      </UiLabel>
                      <BaseInputNumber
                        :id="item.id"
                        v-model="(miscSettings[item.key as keyof MiscSettings] as number)"
                        :min="item.min"
                        :max="item.max"
                        :step="item.step || 1"
                      />
                    </div>
                  </div>
                </div>
              </UiAccordionContent>
            </UiAccordionItem>
          </UiAccordion>
        </UiCardContent>
      </UiCard>
    </UiScrollArea>
    <LazyCbtInterfaceImportExportDialog
      v-if="importExportDialogState.isDialogOpen"
      v-model="importExportDialogState.isDialogOpen"
      :data="importExportDialogState.data"
      :type="importExportDialogState.type"
      @processed="processImportExport"
    />
    <UiDialog
      v-model:open="prepareTestState.dialogVisibility"
    >
      <UiDialogContent class="sm:w-fit z-51">
        <UiDialogHeader>
          <UiDialogTitle>Confirm Preparing Test</UiDialogTitle>
        </UiDialogHeader>
        <span class="text-base text-center pt-2 pb-4">
          Are you sure you want to start preparing the test?
        </span>
        <UiDialogFooter>
          <BaseButton
            label="Prepare Test"
            icon-name="mdi:rocket-launch"
            @click="prepareTest()"
          />
          <BaseButton
            label="Go Back"
            variant="destructive"
            icon-name="material-symbols:undo"
            @click="prepareTestState.dialogVisibility = false"
          />
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
    <UiDialog
      v-if="!zipFileFromUrlState.isDialogOpen"
      v-model:open="prepareTestState.isOngoingTestFoundInDB"
    >
      <UiDialogContent
        class="sm:w-fit z-51"
        non-closable
      >
        <UiDialogHeader>
          <UiDialogTitle>Unfinished Test is Found!</UiDialogTitle>
        </UiDialogHeader>
        <div class="flex">
          <p class="text-lg text-center">
            An unfinished test was found!<br>
            You can continue the test or discard it.<br><br>
            The steps to continue remain the same as for a fresh test<br>
            (upload the .zip file or .pdf &amp; .json files).<br><br>
            Some settings from this test will be locked, while others can be modified as needed.
          </p>
        </div>
        <UiDialogFooter>
          <BaseButton
            label="Continue Unfinished Test"
            icon-name="mdi:rocket"
            @click="() => {
              testState.continueLastTest = true
              prepareTestState.isOngoingTestFoundInDB = false
            }"
          />
          <BaseButton
            label="Discard Test"
            variant="destructive"
            icon-name="mdi:clear-circle"
            @click="prepareTestState.isOngoingTestFoundInDB = false"
          />
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
    <UiDialog
      v-if="testState.continueLastTest === null"
      default-open
    >
      <UiDialogContent
        class="sm:w-fit z-51"
        non-closable
      >
        <UiDialogHeader>
          <UiDialogTitle>Oops Test Data is not Found!</UiDialogTitle>
        </UiDialogHeader>
        <div class="flex mt-3">
          <p class="text-lg text-center">
            Test Data was not found in storage.<br>
            Either the data is corrupted, deleted, or the browser is blocking access to it.<br>
            You can try refreshing the page or discard this test.<br>
          </p>
        </div>
        <UiDialogFooter>
          <BaseButton
            label="Refresh Page"
            icon-name="mdi:rocket"
            @click="reloadPage()"
          />
          <BaseButton
            label="Discard Test"
            variant="destructive"
            icon-name="mdi:clear-circle"
            @click="testState.continueLastTest = false"
          />
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
    <UiDialog
      v-model:open="hashMismatchDialogState.showDialog"
    >
      <UiDialogContent
        class="sm:w-xl z-51"
        non-closable
      >
        <UiDialogHeader>
          <UiDialogTitle>PDF hash is not matching with the one in cropper data!</UiDialogTitle>
        </UiDialogHeader>
        <div class="flex items-center">
          <p
            v-if="fileUploaderFileType === 'zip'"
            class="text-lg text-center"
          >
            PDF file's hash is different to the one that was used in PDF Cropper.<br><br>
            Hash can differ if even slight modification was done to pdf's contents.<br><br>
            If you sure that both questions.pdf and data.json in zip file are correct, then you can continue.<br>
            OR<br>
            You can re-upload the correct one.<br><br>
          </p>
          <p
            v-else
            class="text-lg text-center"
          >
            PDF file's hash and hash of PDF in JSON file is different.<br><br>
            Hash can differ if even slight modification was done to pdf's contents.<br><br>
            If you sure that both pdf and json files are correct, then you can continue.<br>
            OR<br>
            You can re-upload the correct ones.<br><br>
          </p>
        </div>
        <UiDialogFooter>
          <BaseButton
            label="Continue anyway"
            variant="warn"
            icon-name="mdi:rocket"
            @click="() => {
              hashMismatchDialogState.showDialog = false

              const { pdfBuffer, jsonData, pdfFileHash } = hashMismatchDialogState
              if (pdfBuffer && jsonData) {
                testState.testConfig.pdfFileHash = pdfFileHash || ''
                loadTestData({ pdfBuffer, jsonData, testImageBlobs: null })
              }
            }"
          />
          <BaseButton
            label="Re-upload"
            icon-name="prime:upload"
            @click="hashMismatchDialogState.showDialog = false"
          />
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
    <UiDialog
      v-model:open="zipFileFromUrlState.isDialogOpen"
    >
      <UiDialogContent
        class="sm:w-xl z-51 items-center text-center md:min-w-lg sm:max-w-xl"
        non-closable
      >
        <UiDialogHeader>
          <UiDialogTitle>Load Test Data ZIP file from URL</UiDialogTitle>
        </UiDialogHeader>
        <p
          v-if="zipFileFromUrlState.isLoading"
          class="text-cyan-400 py-5"
        >
          Please wait, loading the test data zip file from the URL...
        </p>
        <div
          v-else-if="zipFileFromUrlState.errorMsg"
          class="flex flex-col items-center gap-4 mb-4 text-center"
        >
          <p class="text-red-400 text-lg font-semibold">
            Error: {{ zipFileFromUrlState.errorMsg }}
          </p>
          <p>
            Check the URL or retry.<br>
            Make sure your network connection is working
          </p>
          <p>
            Retried {{ zipFileFromUrlState.retryCount }} times.
          </p>
        </div>
        <div v-else>
          <p class="text-sm text-gray-200 text-wrap mt-2 mb-7">
            <strong>Note:</strong> The URL must be a direct link to the file and should have CORS setup to allow loading the file.<br>
            URLs that work include links to file on public GitHub repositories.<br>
            For example, here is the URL of demo test data on this project's GitHub repo which will work:<br>
            <a
              href="https://github.com/TheMoonVyy/pdf2cbt/blob/main/apps/shared/app/assets/zip/demo_test_data_pre_generated.zip"
              target="_blank"
              class="text-blue-400 underline"
            >
              https://github.com/TheMoonVyy/pdf2cbt/blob/main/apps/shared/app/assets/zip/demo_test_data_pre_generated.zip
            </a>
          </p>
          <p>
            Enter the URL (link) of the test data zip file:
          </p>
        </div>
        <UiInput
          v-show="!zipFileFromUrlState.isLoading"
          v-model.trim="zipFileFromUrlState.url"
          type="text"
          class="w-4/5 mx-auto"
        />
        <div
          v-if="prepareTestState.isOngoingTestFoundInDB"
          class="text-red-400 my-3"
        >
          <strong>Warning: An Unfinished Test has been found!</strong>
          <p>The unfinished test will be discarded if you chose to load this test from url.</p>
        </div>
        <UiDialogFooter
          v-if="!zipFileFromUrlState.isLoading"
        >
          <BaseButton
            :label="zipFileFromUrlState.errorMsg ? 'Retry' : 'Load File'"
            :disabled="zipFileFromUrlState.isLoading || !zipFileFromUrlState.url.trim()"
            @click="() => {
              prepareTestState.isOngoingTestFoundInDB = false
              fetchZipFile(Boolean(zipFileFromUrlState.errorMsg))
            }"
          />
          <BaseButton
            label="Cancel"
            variant="destructive"
            :disabled="zipFileFromUrlState.isLoading"
            @click="zipFileFromUrlState.isDialogOpen = false"
          />
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script lang="ts" setup>
import type { LocationQueryValue } from 'vue-router'
import { CBTInterfaceQueryParams } from '#layers/shared/shared/enums'
import { ANSWER_OPTIONS_COUNTER_TYPES } from '#layers/shared/shared/constants'

type ImportExportTypeKey = 'import' | 'export' | 'restoreFromSaved' | 'reset'

interface ImportExportDialogState {
  isDialogOpen: boolean
  type: ImportExportTypeKey
  data: Record<string, unknown>
}

const tooltipContent = {
  testDataFileUpload: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'Load the file(s) downloaded from the PDF Cropper Page.'),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'ZIP format'),
          ': Upload only the ZIP file.',
        ]),
        h('li', [
          h('strong', 'PDF + JSON format'),
          ': Upload both the JSON file and its corresponding PDF.',
        ]),
      ]),
    ]),

  iconSettings: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', [
        'When you are changing the icon/image, it is recommended to upload an icon with ',
        h('strong', 'equal width and height'),
        ' (i.e. a square) for best compatibility.',
      ]),
    ]),

  testDuration: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'Duration of test, time formats:'),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'mmm:ss'),
          ': minutes-seconds format (e.g. 150:45 means 150 minutes, 45 seconds).',
        ]),
        h('li', [
          h('strong', 'hh:mm:ss'),
          ': 24-hour format (e.g. 14:30:45).',
        ]),
      ]),
    ]),

  submitBtn: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'Submit Button:'),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'Enabled'),
          ': Submit Button is functional and test can be submitted anytime before timeout.',
        ]),
        h('li', [
          h('strong', 'Disabled'),
          ': Submit Button is disabled and test cannot be submitted before timeout.',
        ]),
        h('li', [
          h('strong', 'Hidden'),
          ': Submit Button is hidden (i.e. not visible) and test cannot be submitted before timeout.',
        ]),
      ]),
      h('p', { class: 'font-semibold' }, 'In all cases, test will be submitted automatically on timeout.'),
    ]),

  showPauseBtn: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'Allow pausing test?'),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'Yes'),
          ': You will be able to pause/resume the test. The pause button is available in hidden settings, ',
          'which can be accessed by long-pressing the profile icon (top-right corner).',
        ]),
        h('li', [
          h('strong', 'No'),
          ': You will not be able to pause the test (pause button will not be provided).',
        ]),
      ]),
      h('strong', 'You can access hidden settings any time, be it before or during the test.'),
    ]),

  saveQuestionsLikeRealExams: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', [
        'From my experience and from others as well,',
        h('br'),
        'the way answers are saved differs between the Real Exams and the Official Mock Tests.',
      ]),
      h('p', [
        'In the Official Mock Tests, ',
        'the answer to the current question is saved or updated only when you click on ',
        '"Save & Next" or "Mark for Review & Next".',
      ]),
      h('p', [
        'In the Real Exams, however, ',
        'the answer to the current question is saved or updated whenever you change the question.',
        h('br'),
        'It doesn’t matter which button you used to move to another question.',
        h('br'),
        'This means the answer is saved or updated when you click on "Previous", ',
        '"Save & Next", "Mark for Review & Next", ',
        'change the section, or switch questions from the question palette.',
      ]),
      h('p', [
        'So yes, ironically, the Official Mock Test whose purpose is to ',
        'familiarize candidates with the interface behaves differently ',
        'from the actual exam interface.',
      ]),
      h('p', 'Save questions like Real Exams?'),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'Yes'),
          ': The answer to the current question will be saved or ',
          'updated whenever you change the question ',
          '(behaves like Real Exams).',
        ]),
        h('li', [
          h('strong', 'No'),
          ': The answer to the current question will be saved or updated only when you click on ',
          '"Save & Next" or "Mark for Review & Next".',
        ]),
      ]),
      h('p', [
        'In versions before v1.30.0, ',
        'the behaviour was like official mock test\'s behaviour (i.e. "No").',
      ]),
    ]),

  disableMouseWheel: () =>
    h('div', { class: 'space-y-2' }, [
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'Yes'),
          ': You won\'t be able to use the mouse wheel for scrolling, ',
          'you will have to use the scrollbar to scroll.',
        ]),
        h('li', [
          h('strong', 'No'),
          ': Mouse wheel will work normally for scrolling.',
        ]),
      ]),
    ]),

  questionImgScale: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', '(This is ignored for ZIP files with pre-generated images)'),
      h('p', [
        'The scale controls the size (hence quality) of the generated question images, relative to its original size. ',
        'Device Pixel Ratio (DPR) is applied separately.',
      ]),
      h('p',
        'Higher scale value increases resolution and clarity, but also increases file size, ram usage and processing power.',
      ),
    ]),

  questionsNumberingOrderType: () =>
    h('div', { class: 'space-y-2' }, [
      h('p', 'Choose how question numbers appear in the Question Palette:'),
      h('ul', { class: 'list-disc space-y-1 ml-6 [&>li]:mb-1' }, [
        h('li', [
          h('strong', 'Original'),
          ': Uses original numbering as it is.',
        ]),
        h('li', [
          h('strong', 'Cumulative'),
          ': Continues numbering across sections (e.g. 1-20, 21-40, 41-60).',
        ]),
        h('li', [
          h('strong', 'Section-wise'),
          ': Resets numbering in each section (e.g. 1-20, 1-20, 1-20).',
        ]),
      ]),
    ]),
}

const dummyValue = ref<QuestionAnswer>(null)

const selectOptions = {
  timeFormat: [
    'mmm:ss',
    'hh:mm:ss',
  ],

  submitBtn: [
    { name: 'Enabled', value: 'enabled' },
    { name: 'Disabled', value: 'disabled' },
    { name: 'Hidden', value: 'hidden' },
  ],

  showPauseBtn: [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ],

  answerOptionsFormat: ANSWER_OPTIONS_COUNTER_TYPES,

  showHide: [
    { name: 'Show', value: true },
    { name: 'Hide', value: false },
  ],

  yesNo: [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ],

  questionsNumberingOrderType: [
    { name: 'Original', value: 'original' },
    { name: 'Cumulative', value: 'cumulative' },
    { name: 'Section-wise', value: 'section-wise' },
  ],
}

const addIds = <T extends Record<string, unknown>>(items: T[]): (T & { id: string })[] => {
  return items.map(item => ({
    ...item,
    id: useId(),
  }))
}

const htmlContent = {
  customizeUi: {
    mainLayout: addIds([
      { key: 'testTotalHeaderHeight', label: '"Test Total" Header Height', min: 0, max: 30, step: 0.1 },
      { key: 'sectionHeaderHeight', label: 'Sections Height', min: 1, max: 20, step: 0.1 },
      { key: 'questionTypeFontSize', label: 'Ques. Type Font Size', min: 0.25, max: 5, step: 0.1 },
      { key: 'markingSchemeFontSize', label: 'Marking Scheme Font Size', min: 0.25, max: 5, step: 0.1 },
      { key: 'questionTimeSpentFontSize', label: 'Ques. Time Spent Font Size', min: 0.25, max: 5, step: 0.1 },
      { key: 'questionNumFontSize', label: 'Ques. No. Font Size', min: 0.25, max: 5, step: 0.1 },
      {
        key: 'sectionHeaderAndQuesPanelDividerHeight',
        label: 'Sections & Question-panel Divider Height', min: 0, max: 30, step: 0.1,
      },
      { type: 'select', key: 'showQuestionType', label: 'Question Type' },
      { type: 'select', key: 'showMarkingScheme', label: 'Marking Scheme' },
      { type: 'select', key: 'showQuestionTimeSpent', label: 'Time Spent Per Question' },
      { type: 'select', key: 'showQuestionPaperBtn', label: 'Question Paper Btn' },
      {
        type: 'select',
        key: 'disableMouseWheel',
        label: 'Disable Mouse Wheel',
        options: selectOptions.yesNo,
        tooltip: tooltipContent.disableMouseWheel,
      },
      { type: 'select', key: 'showScrollToTopAndBottomBtns', label: 'Scroll To Top/Bottom Btns' },
    ]),
    questionPanel: {
      answerOptionsFormat: {
        mcqAndMsq: addIds([
          { key: 'fontSize', label: 'Text Font Size', min: 0.5, max: 5, step: 0.1 },
          { key: 'zoomSize', label: 'Checkbox Size', min: 0.5, max: 5, step: 0.1 },
          { key: 'rowGap', label: 'Row Gap', min: 0, max: 10, step: 0.1 },
        ]),
        msm: addIds([
          { key: 'fontSize', label: 'Text Font Size', min: 0.5, max: 5, step: 0.1 },
          { key: 'gap', label: 'Gap', min: 0, max: 10, step: 0.1 },
        ]),
      },
    },
    questionPalette: addIds([
      { key: 'width', label: 'Palette Width (%)', min: 10, max: 40 },
      { key: 'sectionTextFontSize', label: 'Section Text Font Size', min: 0, max: 5, step: 0.1 },
      { key: 'columnsGap', label: 'Palette Columns Gap', min: 0, max: 10, step: 0.1 },
      { key: 'rowsGap', label: 'Palette Rows Gap', min: 0, max: 10, step: 0.1 },
    ]),
  },
  miscSettings: addIds([
    { key: 'fontSize', label: 'Font Size', min: 0.5, max: 5, step: 0.1 },
    { key: 'imgWidth', label: 'Img Width (%)', min: 0, max: 100 },
    { key: 'imgHeight', label: 'Img Height (%)', min: 0, max: 100 },
  ]),
}

const statusKeyNames = {
  answered: 'Answered',
  notAnswered: 'Not Answered',
  notVisited: 'Not Visited',
  marked: 'Marked for Review',
  markedAnswered: 'MFR & Answered',
}

const prepareTestState = shallowReactive({
  isOngoingTestFoundInDB: false,
  dialogVisibility: false,
})

const testState = defineModel<TestState>('testState', { required: true })

const emit = defineEmits(['prepareTest'])

const db = useDB()

const migrateJsonData = useMigrateJsonData()

const fileUploaderFileType = shallowRef<'zip' | 'json'>('zip')

const zipFileFromUrlState = shallowReactive<{
  url: string
  isLoading: boolean
  errorMsg: string
  retryCount: number
  isDialogOpen: boolean
  zipFile: File | null
}>({
  url: '',
  isLoading: false,
  errorMsg: '',
  retryCount: 0,
  isDialogOpen: false,
  zipFile: null,
})

const importExportDialogState = shallowReactive<ImportExportDialogState>({
  isDialogOpen: false,
  type: 'import',
  data: {},
})

const hashMismatchDialogState = shallowReactive<{
  showDialog: boolean
  pdfFileHash: string
  pdfBuffer: Uint8Array | null
  jsonData: AnswerKeyJsonOutputBasedOnPdfCropper | PdfCropperJsonOutput | null
}>({
  showDialog: false,
  pdfFileHash: '',
  pdfBuffer: null,
  jsonData: null,
})

const appSettings = useAppSettings()

const {
  uiSettings,
  defaultUiSettings,
  testSettings,
  defaultTestSettings,
  miscSettings,
  defaultMiscSettings,
} = useCbtSettings()

const settings = useThrottle(uiSettings, 400)

const {
  testSectionsList,
  cropperSectionsData,
  currentTestState,
  testSectionsData,
  testQuestionsData,
  testSectionsSummary,
} = useCbtTestData()

// test timings and watchers for formatting/converting it
const testTimings = shallowReactive({
  h: 0,
  m: 180,
  s: 0,
})

const testTimeFormatWatcher = watch(() => testSettings.value.timeFormat, (newtimeFormat) => {
  if (newtimeFormat === 'mmm:ss') {
    testTimings.m += testTimings.h * 60
    testTimings.h = 0
  }
  else {
    const m = testTimings.m
    testTimings.h = Math.floor(m / 60)
    testTimings.m = m % 60
  }
})

let istestTimingsUpdating: boolean = false

const testDurationWatcher = watch(
  [
    () => testSettings.value.durationInSeconds,
    testTimings,
  ],
  ([newDuration], [oldDuration]) => {
    if (istestTimingsUpdating) {
      istestTimingsUpdating = false
      return
    }

    if (newDuration !== oldDuration) {
      istestTimingsUpdating = true
      testTimings.s = newDuration % 60
      if (testSettings.value.timeFormat === 'mmm:ss') {
        testTimings.h = 0
        testTimings.m = Math.floor(newDuration / 60)
      }
      else {
        testTimings.h = Math.floor(newDuration / 3600)
        testTimings.m = Math.floor(newDuration / 60) % 60
      }
    }
    else {
      const newCalcDuration = testTimings.h * 3600 + testTimings.m * 60 + testTimings.s
      if (testSettings.value.durationInSeconds !== newCalcDuration) {
        istestTimingsUpdating = true
        testSettings.value.durationInSeconds = newCalcDuration
      }
    }
  },
)

watch(
  () => zipFileFromUrlState.isDialogOpen,
  (newValue) => {
    if (newValue) {
      zipFileFromUrlState.errorMsg = ''
      zipFileFromUrlState.retryCount = 0
    }
  },
)

const fetchZipFile = async (isRetry: boolean = false) => {
  if (!zipFileFromUrlState.url) return
  zipFileFromUrlState.errorMsg = ''
  zipFileFromUrlState.zipFile = null
  zipFileFromUrlState.isLoading = true
  await nextTick()

  try {
    const data = await utilFetchZipFromUrl(zipFileFromUrlState.url)

    if (data.zipFile) {
      zipFileFromUrlState.zipFile = new File([data.zipFile], 'testData.zip', { type: 'application/zip' })
      testState.value.testConfig.zipOriginalUrl = data.originalUrl
      testState.value.testConfig.zipConvertedUrl = data.convertedUrl || ''
      zipFileFromUrlState.isDialogOpen = false
      zipFileFromUrlState.isLoading = false
    }
    else {
      throw data.err
    }
  }
  catch (error) {
    useErrorToast('Error fetching zip file from url:', error)
    zipFileFromUrlState.errorMsg = error instanceof Error ? error.message : String(error)
    zipFileFromUrlState.isLoading = false
    testState.value.testConfig.zipOriginalUrl = ''
    testState.value.testConfig.zipConvertedUrl = ''
    if (isRetry) zipFileFromUrlState.retryCount++
  }
}

const changeIcon = (iconFile: File, key: QuestionStatus) => {
  utilFileAsDataURL(iconFile).then((dataURL) => {
    uiSettings.value.questionPalette.quesIcons[key].image = dataURL
  })
}

const changeProfileIcon = (iconFile: File) => {
  utilFileAsDataURL(iconFile).then((dataURL) => {
    miscSettings.value.profileImg = dataURL
  })
}

const handleImportExportBtn = async (name: ImportExportTypeKey, file: File | null = null) => {
  switch (name) {
    case 'import': {
      if (file) {
        utilParseJsonFile(file)
          .then((data) => {
            if (data) {
              importExportDialogState.data = data
              importExportDialogState.type = name
              importExportDialogState.isDialogOpen = true
            }
          })
          .catch((e: unknown) => useErrorToast('Error importing settings:', e))
      }
      break
    }
    case 'export': {
      const data = {
        testSettings: testSettings.value,
        uiSettings: uiSettings.value,
      }

      importExportDialogState.data = data
      importExportDialogState.type = name
      importExportDialogState.isDialogOpen = true
      break
    }
    case 'restoreFromSaved': {
      try {
        const data = await db.getSettings()
        if (data) {
          importExportDialogState.data = data
          importExportDialogState.type = name
          importExportDialogState.isDialogOpen = true
          break
        }
      }
      catch (e: unknown) {
        useErrorToast('Error getting settings from db', e)
      }

      name = 'reset' as ImportExportTypeKey
      // fallthrough to reset if data is not found
    }
    case 'reset': {
      importExportDialogState.data = {
        testSettings: defaultTestSettings,
        uiSettings: defaultUiSettings,
        miscSettings: defaultMiscSettings,
      }
      importExportDialogState.type = name
      importExportDialogState.isDialogOpen = true
      break
    }
  }
}

const processImportExport = (name: ImportExportTypeKey | string, data: Record<string, unknown>) => {
  const keyName = name as ImportExportTypeKey
  const currentData = {
    testSettings: testSettings.value,
    uiSettings: uiSettings.value,
  }

  const getPlainData = () => ({
    testSettings: utilCloneJson(testSettings.value),
    uiSettings: utilCloneJson(uiSettings.value),
  })

  switch (keyName) {
    case 'import': {
      utilSelectiveMergeObj(currentData, data)
      db.replaceSettings(getPlainData())
      break
    }
    case 'export': {
      db.replaceSettings(getPlainData())

      const exportData = JSON.stringify(data, null, 2)
      const blob = new Blob([exportData], { type: 'application/json' })
      utilSaveFile('pdf2cbt.settings.json', blob)
      break
    }
    case 'restoreFromSaved': {
      utilSelectiveMergeObj(currentData, data)
      break
    }
    case 'reset': {
      const { miscSettings: miscSettingsToReset, ...rest } = data

      if (Object.keys(rest).length > 0) {
        utilSelectiveMergeObj(currentData, rest)
        db.replaceSettings(getPlainData())
      }

      if (miscSettingsToReset) {
        utilSelectiveMergeObj(
          miscSettings.value as unknown as Record<string, unknown>,
          miscSettingsToReset,
        )
      }
      break
    }
  }

  importExportDialogState.isDialogOpen = false
}

async function verifyTestData(
  uploadedData: UploadedTestData,
) {
  try {
    const { jsonData, pdfBuffer, testImageBlobs } = uploadedData
    if (jsonData && (pdfBuffer || testImageBlobs)) {
      const jsonParsedData = migrateJsonData.answerKeyData<AnswerKeyJsonOutputBasedOnPdfCropper>(jsonData)
      uploadedData.jsonData = jsonParsedData
      const pdfFileHashInJson = jsonParsedData.testConfig.pdfFileHash

      if (pdfBuffer) {
        const currentPdfFileHash = await utilGetHash(pdfBuffer)

        if (pdfFileHashInJson && currentPdfFileHash !== pdfFileHashInJson) {
          hashMismatchDialogState.pdfBuffer = pdfBuffer
          hashMismatchDialogState.jsonData = jsonParsedData
          hashMismatchDialogState.pdfFileHash = currentPdfFileHash
          hashMismatchDialogState.showDialog = true
        }
        else {
          if (currentPdfFileHash) {
            testState.value.testConfig.pdfFileHash = currentPdfFileHash
          }
          loadTestData(uploadedData)
        }
      }
      else {
        testState.value.testConfig.pdfFileHash = pdfFileHashInJson || ''
        loadTestData(uploadedData)
      }
    }
    else if (!jsonData && !pdfBuffer && !testImageBlobs) {
      throw new Error('PDF/Images and Json Data is returned null by file uploader')
    }
    else if (!jsonData) {
      throw new Error('Json Data is returned null by file uploader')
    }
    else {
      throw new Error('PDF/Images is returned null by file uploader')
    }
  }
  catch (err) {
    useErrorToast('Error while verifying test data:', err)
  }
}

async function loadTestData(
  uploadedData: UploadedTestData,
) {
  try {
    zipFileFromUrlState.zipFile = null
    const { jsonData, pdfBuffer, testImageBlobs } = uploadedData
    testState.value.pdfFile = pdfBuffer
    testState.value.testImageBlobs = testImageBlobs

    const newCropperSectionsData: CropperSectionsData = {}
    let newTestSectionsData: TestSessionSectionsData = {}
    let sectionsArray: TestSectionListItem[] = []

    const isContinueLastTest = testState.value.continueLastTest

    const {
      pdfCropperData,
      testAnswerKey,
      testConfig,
    } = jsonData as unknown as AnswerKeyJsonOutputBasedOnPdfCropper

    if (!testState.value.testConfig.zipOriginalUrl)
      testState.value.testConfig.zipOriginalUrl = testConfig?.zipOriginalUrl || (testConfig?.zipUrl || '')

    if (testConfig.optionalQuestions?.length)
      testState.value.testConfig.optionalQuestions = testConfig.optionalQuestions

    if (testAnswerKey)
      testState.value.testAnswerKey = testAnswerKey

    if (!pdfCropperData)
      throw new Error('Error, pdfCropperData not found in json data')

    // for newCropperSectionsData and sectionsArray
    for (const subject of Object.keys(pdfCropperData)) {
      for (const section of Object.keys(pdfCropperData[subject]!)) {
        newCropperSectionsData[section] = pdfCropperData[subject]![section]!

        if (isContinueLastTest) continue // skip sectionsList as the one in db will be used

        const sectionsItem: TestSectionListItem = {
          name: section,
          subject,
          id: 0, // initial, proper id is being set later
        }
        sectionsArray.push(sectionsItem)
      }
    }

    let totalQuestions = 0
    let totalSections = 0

    if (isContinueLastTest) {
      try {
        const testData = await db.getTestData()

        totalQuestions = testData.totalQuestions
        totalSections = testData.testSectionsList.length
        sectionsArray = testData.testSectionsList
        newTestSectionsData = testData.testSectionsData
        currentTestState.value = testData.currentTestState

        const testLogger = useCbtLogger()
        testLogger.replaceLogsArray(testData.testLogs)
      }
      catch (e: unknown) {
        useErrorToast('Error getting Test Data in db', e)
        testState.value.continueLastTest = null
      }
    }
    else {
    // for newTestSectionsData
      let sectionData: TestSessionSectionData = {}
      const firstData: {
        section: string | null
        question: null | number
      } = {
        section: null,
        question: null,
      }

      const sectionsPrevQuestion: Record<string, number> = {}
      for (const section of Object.keys(newCropperSectionsData)) {
        let firstQuestion: number | null = null

        firstData.section ??= section
        let secQueId = 1
        for (const question of Object.keys(newCropperSectionsData[section]!)) {
          const { que, type, answerOptions } = newCropperSectionsData[section]![question]!

          firstQuestion ??= que
          firstData.question ??= que

          sectionData[question] = {
            secQueId,
            queId: totalQuestions,
            que,
            section,
            type,
            answer: null,
            status: 'notVisited',
            timeSpent: 0,
          }

          if (type === 'mcq' || type === 'msq' || type === 'msm')
            sectionData[question].answerOptions = answerOptions || '4'

          totalQuestions++
          secQueId++
        }

        if (firstQuestion !== null) {
          sectionsPrevQuestion[section] = firstQuestion
        }
        newTestSectionsData[section] = sectionData

        sectionData = {}
        totalSections++
      }

      currentTestState.value.sectionsPrevQuestion = sectionsPrevQuestion
      currentTestState.value.section = firstData.section as string
    }

    testState.value.totalSections = totalSections
    testState.value.totalQuestions = totalQuestions

    sectionsArray.forEach((item, idx) => item.id = idx + 1)

    testSectionsList.value.splice(0, testSectionsList.value.length, ...sectionsArray)
    cropperSectionsData.value = newCropperSectionsData
    testSectionsData.value = newTestSectionsData
    updateTestQuestionsData(false)

    useCreateSectionsSummary(testSectionsData, testSectionsSummary)

    testState.value.isSectionsDataLoaded = true
  }
  catch (err) {
    useErrorToast('Error loading TestData', err)
  }
}

function updateTestQuestionsData(recalculateTotalQueId: boolean = true) {
  const sectionsList = testSectionsList.value
  const sectionsData = testSectionsData.value

  testQuestionsData.value.clear()

  let queId = 1
  for (const sectionListItem of sectionsList) {
    const sectionData = sectionsData[sectionListItem.name]
    if (!sectionData) continue

    for (const questionData of Object.values(sectionData)) {
      if (recalculateTotalQueId) {
        questionData.queId = queId
        testQuestionsData.value.set(queId, questionData)
        queId++
      }
      else {
        queId = questionData.queId
        testQuestionsData.value.set(queId, questionData)
      }
    }
  }
}

function prepareTest() {
  updateTestQuestionsData()
  emit('prepareTest')
}

const reloadPage = () => {
  window.location.reload()
}

watchDebounced(testSectionsList,
  () => {
    if (testState.value.isSectionsDataLoaded) {
      updateTestQuestionsData()
    }
  },
  { debounce: 750, maxWait: 5000, deep: true },
)

onMounted(() => {
  db.getSettings()
    .then((storedSettings) => {
      if (storedSettings) {
        const data = {
          testSettings: testSettings.value,
          uiSettings: uiSettings.value,
        }
        utilSelectiveMergeObj(data, storedSettings)
      }
      else {
        console.info('Unable to load settings from db, either does not exists or unable to access it')

        // simple method to reduce layout size for small screens
        const widthInRange = window.innerWidth >= 250 && window.innerWidth <= 480
        const heightInRange = window.innerHeight >= 250 && window.innerHeight <= 480

        if (widthInRange || heightInRange) {
          appSettings.value.pages.testInterface.size = 55
        }
      }
    })
    .finally(() => {
      const route = useRoute()
      testTimeFormatWatcher.pause()
      testDurationWatcher.pause()

      const getFirstQuery = (
        param: LocationQueryValue | LocationQueryValue[] | undefined,
      ) => {
        return Array.isArray(param) ? param[0] : param
      }

      const nameValue = getFirstQuery(route.query[CBTInterfaceQueryParams.TestName])
      const durationValue = getFirstQuery(route.query[CBTInterfaceQueryParams.TestDuration])
      const timeFormatValue = getFirstQuery(route.query[CBTInterfaceQueryParams.TimeFormat])
      const zipurlValue = getFirstQuery(route.query[CBTInterfaceQueryParams.ZipUrl])
      const submitmodeValue = getFirstQuery(route.query[CBTInterfaceQueryParams.SubmitMode])
      const allowpauseValue = getFirstQuery(route.query[CBTInterfaceQueryParams.AllowPause])
      const imgScaleValue = getFirstQuery(route.query[CBTInterfaceQueryParams.ImageScale])

      if (nameValue && typeof nameValue === 'string') {
        testSettings.value.testName = nameValue
      }
      if (durationValue
        && !isNaN(Number(durationValue))
        && Number(durationValue) !== testSettings.value.durationInSeconds
      ) {
        testSettings.value.durationInSeconds = Number(durationValue)
      }
      if (timeFormatValue) {
        const firstChar = timeFormatValue[0]
        if (firstChar === 'm') {
          testSettings.value.timeFormat = 'mmm:ss'
        }
        else if (firstChar === 'h') {
          testSettings.value.timeFormat = 'hh:mm:ss'
        }
      }

      const totalseconds = testSettings.value.durationInSeconds
      testTimings.s = totalseconds % 60
      if (testSettings.value.timeFormat === 'mmm:ss') {
        testTimings.m = Math.floor(totalseconds / 60)
        testTimings.h = 0
      }
      else {
        testTimings.m = Math.floor(totalseconds / 60) % 60
        testTimings.h = Math.floor(totalseconds / 3600)
      }

      if (typeof zipurlValue === 'string' && zipurlValue.trim() !== '') {
        zipFileFromUrlState.url = zipurlValue.trim()
        zipFileFromUrlState.isDialogOpen = true
      }
      if (submitmodeValue && ['enabled', 'disabled', 'hidden'].includes(submitmodeValue)) {
        testSettings.value.submitBtn = submitmodeValue as 'enabled' | 'disabled' | 'hidden'
      }
      if (allowpauseValue && ['yes', 'no'].includes(allowpauseValue)) {
        testSettings.value.showPauseBtn = allowpauseValue === 'yes'
      }
      if (imgScaleValue && !isNaN(Number(imgScaleValue))) {
        testSettings.value.questionImgScale = Number(imgScaleValue)
      }

      nextTick().then(() => {
        testTimeFormatWatcher.resume()
        testDurationWatcher.resume()
        istestTimingsUpdating = false
      })
    })

  db.getTestStatus()
    .then((testStatus) => {
      if (testStatus === 'ongoing') {
        prepareTestState.isOngoingTestFoundInDB = true
      }
    })
    .catch((e: unknown) => useErrorToast(
      'Error getting last test data (if present) in db', e,
    ))
})
</script>
