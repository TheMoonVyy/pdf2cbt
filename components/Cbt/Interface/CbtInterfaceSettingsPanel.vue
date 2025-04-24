<template>
  <div
    class="flex p-2 h-full overflow-auto bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0"
  >
    <div
      class="flex flex-col w-full"
    >
      <div class="flex justify-between mx-4 mb-4">
        <div class="flex gap-6">
          <BaseSimpleFileUpload
            accept="application/json,.json"
            label="Import Settings"
            invalid-file-type-message="Invalid file. Please select a valid JSON file"
            icon-name="prime:download"
            @upload="(files) => handleImportExportBtn('import', files)"
          />
          <BaseButton
            label="Export Settings"
            severity="help"
            @click="handleImportExportBtn('export')"
          >
            <template #icon>
              <Icon
                name="prime:upload"
                size="1.4rem"
              />
            </template>
          </BaseButton>
        </div>
        <div class="flex gap-6">
          <BaseButton
            label="Restore From Saved"
            severity="warn"
            @click="handleImportExportBtn('restoreFromSaved')"
          >
            <template #icon>
              <Icon
                name="mdi:database-refresh"
                size="1.4rem"
              />
            </template>
          </BaseButton>
          <BaseButton
            label="Reset Settings"
            severity="danger"
            @click="handleImportExportBtn('reset')"
          >
            <template #icon>
              <Icon
                name="material-symbols:reset-settings-rounded"
                size="1.4rem"
              />
            </template>
          </BaseButton>
        </div>
      </div>
      <Panel
        header="Test Data & Settings"
        class="w-full"
        pt:title:class="text-xl"
        pt:header:class="justify-center p-2"
        pt:content:class="flex justify-center py-1 px-4"
      >
        <div class="flex flex-col w-1/4 items-center mx-auto">
          <span class="pl-5 pr-3 text-lg font-bold">Test Settings</span>
          <div class="grow pb-3 pt-1 px-1.5 w-full border border-surface-200 dark:border-surface-700 rounded-md">
            <div class="grid grid-cols-1 w-full">
              <div class="grid grid-cols-1 w-full mr-0.5">
                <label
                  class="text-center mb-0.5"
                  for="test_state_test_name"
                >
                  Test Name
                </label>
                <InputText
                  v-model="testSettings.testName"
                  type="text"
                  label-id="test_state_test_name"
                  :fluid="true"
                  :maxlength="60"
                  size="small"
                  :disabled="!!testState.continueLastTest"
                  pt:root:class="text-center"
                  @blur="() => testSettings.testName ||= defaultTestSettings.testName"
                />
              </div>
              <div class="grid grid-cols-1 w-full ml-0.5 mt-2">
                <div class="flex gap-2 w-full justify-center mb-0.5">
                  <label
                    class="text-center text-base"
                    for="submit_btn_dropdown"
                  >
                    Submit Button
                  </label>
                  <IconWithTooltip
                    :tooltip-content="tooltipContent.submitBtn"
                    icon-class="text-lg"
                  />
                </div>
                <Select
                  v-model="testSettings.submitBtn"
                  label-id="submit_btn_dropdown"
                  :options="selectOptions.submitBtn"
                  option-label="name"
                  option-value="value"
                  :fluid="true"
                  size="small"
                  pt:root:class="col-span-6"
                  pt:label:class="text-center"
                />
              </div>
              <div class="flex w-full justify-center">
                <label
                  class="text-center text-base col-span-5 mt-2 mb-0.5"
                >
                  Test Duration
                </label>
                <IconWithTooltip
                  :tooltip-content="tooltipContent.testDuration"
                  icon-class="text-lg"
                  root-class="ml-2 mt-2"
                />
              </div>
              <div class="grid grid-cols-6 w-full gap-1">
                <div class="flex flex-col col-span-6 mt-1">
                  <label
                    class="text-center text-sm mb-0.5"
                    for="time_format"
                  >
                    Time Format
                  </label>
                  <Select
                    v-model="testSettings.timeFormat"
                    label-id="time_format"
                    :options="selectOptions.timeFormat"
                    size="small"
                    pt:label:class="text-center"
                  />
                </div>
                <div
                  v-if="testSettings.timeFormat === 'hh:mm:ss'"
                  class="flex flex-col col-span-2 items-center mt-1"
                >
                  <label
                    class="text-sm text-center"
                    for="duration_hours"
                  >
                    Hours
                  </label>
                  <InputNumber
                    v-model="testTimings.h"
                    :min="0"
                    :max="23"
                    :step="1"
                    label-id="duration_hours"
                    :fluid="true"
                    :disabled="!!testState.continueLastTest"
                    size="small"
                    pt:root:class="[&>input]:pr-2.5!"
                  />
                </div>
                <div
                  class="flex flex-col items-center mt-1"
                  :class="testSettings.timeFormat === 'hh:mm:ss' ? 'col-span-2' : 'col-span-3'"
                >
                  <label
                    class="text-sm text-center"
                    for="duration_minutes"
                  >
                    Mins
                  </label>
                  <InputNumber
                    v-model="testTimings.m"
                    :min="0"
                    :max="testSettings.timeFormat === 'mmm:ss' ? (60 * 24) - 1 : 59"
                    :step="1"
                    label-id="duration_minutes"
                    :disabled="!!testState.continueLastTest"
                    :fluid="true"
                    size="small"
                    pt:root:class="[&>input]:pr-2.5!"
                  />
                </div>
                <div
                  class="flex flex-col items-center mt-1"
                  :class="testSettings.timeFormat === 'hh:mm:ss' ? 'col-span-2' : 'col-span-3'"
                >
                  <label
                    class="text-sm text-center"
                    for="duration_seconds"
                  >
                    Secs
                  </label>
                  <InputNumber
                    v-model="testTimings.s"
                    :min="0"
                    :max="59"
                    :step="1"
                    :disabled="!!testState.continueLastTest"
                    label-id="duration_seconds"
                    :fluid="true"
                    size="small"
                    pt:root:class="[&>input]:pr-2.5!"
                  />
                </div>
              </div>
              <div class="grid grid-cols-1 w-full ml-0.5 mt-2">
                <div class="flex gap-2 w-full justify-center mb-0.5">
                  <label
                    class="text-center text-base"
                    for="pause_btn_dropdown"
                  >
                    Allow Pausing Test
                  </label>
                  <IconWithTooltip
                    :tooltip-content="tooltipContent.showPauseBtn"
                    icon-class="text-lg"
                  />
                </div>
                <Select
                  v-model="testSettings.showPauseBtn"
                  label-id="pause_btn_dropdown"
                  :options="selectOptions.showPauseBtn"
                  option-label="name"
                  option-value="value"
                  :fluid="true"
                  size="small"
                  pt:root:class="col-span-6"
                  pt:label:class="text-center"
                />
              </div>
              <div class="flex justify-center gap-3 mt-3 w-full">
                <label
                  class="text-center"
                  for="test_img_quality"
                >
                  Questions Image Scale
                </label>
                <IconWithTooltip
                  :tooltip-content="tooltipContent.questionImgScale"
                  icon-class="text-lg"
                />
              </div>
              <div class="flex gap-3 w-full mt-1.5">
                <BaseInputNumber
                  v-model="testSettings.questionImgScale"
                  :min="1"
                  :max="10"
                  :step="0.1"
                  suffix="x"
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col grow">
          <template v-if="!testState.isSectionsDataLoaded">
            <div class="flex justify-center">
              <span class="pl-5 pr-3 text-lg font-bold">Load PDF Questions Data</span>
              <IconWithTooltip
                :tooltip-content="tooltipContent.testDataFileUpload"
                icon-class="text-lg"
              />
            </div>
            <form
              class="flex grow border border-surface-700 rounded-lg"
              autocomplete="off"
            >
              <CbtFileUpload
                v-model="fileUploaderFileType"
                :file-options="selectOptions.dataFile"
                file-types="zip-or-pdfjson"
                empty-slot-text-class="top-[30%]"
                @on-uploaded="(data) => loadTestData(data.pdfFile!, data.jsonData)"
              />
            </form>
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
                  <CbtInterfaceSectionsOrderList
                    v-model="testSectionsList"
                  />
                </div>
              </div>
              <div class="flex flex-col mx-auto">
                <div class="flex mb-2 gap-3">
                  <label
                    class="font-bold"
                    for="questions_numbering_type"
                  >
                    Questions Numbering Order
                  </label>
                  <IconWithTooltip
                    :tooltip-content="tooltipContent.questionsNumberingOrderType"
                    icon-class="text-lg"
                  />
                </div>
                <div class="flex flex-col grow items-center">
                  <Select
                    v-model="currentTestState.questionsNumberingOrderType"
                    label-id="questions_numbering_type"
                    :options="selectOptions.questionsNumberingOrderType"
                    option-label="name"
                    option-value="value"
                    :fluid="true"
                    :disabled="Boolean(testState.continueLastTest)"
                    pt:root:class="w-4/5"
                  />
                  <BaseButton
                    label="Prepare Test"
                    size="large"
                    class="my-auto"
                    @click="prepareTestState.dialogVisibility = true"
                  >
                    <template #icon>
                      <Icon
                        name="mdi:rocket-launch"
                        size="1.6rem"
                      />
                    </template>
                  </BaseButton>
                </div>
              </div>
            </div>
          </template>
        </div>
      </Panel>
      <Panel
        header="Customize UI"
        class="w-full"
        toggleable
        :collapsed="true"
        pt:root:class="pb-2"
        pt:title:class="text-2xl"
        pt:header:class="justify-center pt-3 pb-2 gap-5"
        pt:content:class="p-2"
      >
        <Panel
          header="Main Layout"
          class="w-full"
          pt:title:class="text-xl"
          pt:header:class="justify-center p-5"
          pt:content:class="grid grid-cols-4 px-2 gap-4"
        >
          <div
            v-for="item in htmlContent.customizeUi.mainLayout"
            :key="item.key"
            class="flex flex-col w-full items-center justify-end"
          >
            <label
              class="text-center text-sm"
              :for="item.id"
            >
              {{ item.label }}
            </label>
            <BaseInputNumber
              v-model="(settings.mainLayout[item.key as keyof CbtUiSettings['mainLayout']] as number)"
              :min="item.min"
              :max="item.max"
              :step="item.step || 1"
              :label-id="item.id"
              :size="('size' in item ? (item.size as string) : null)"
            />
          </div>
          <div class="flex flex-col w-full items-center justify-end">
            <label
              class="text-center text-sm"
              for="show_question_type"
            >
              Question Type Visibility
            </label>
            <Select
              v-model="settings.mainLayout.showQuestionType"
              label-id="show_question_type"
              :options="selectOptions.showHide"
              option-label="name"
              option-value="value"
              :fluid="true"
              pt:root="w-3/4"
            />
          </div>
          <div class="flex flex-col w-full items-center justify-end">
            <label
              class="text-center text-sm"
              for="show_marking_scheme"
            >
              Marking Scheme Visibility
            </label>
            <Select
              v-model="settings.mainLayout.showMarkingScheme"
              label-id="show_marking_scheme"
              :options="selectOptions.showHide"
              option-label="name"
              option-value="value"
              :fluid="true"
              pt:root="w-3/4"
            />
          </div>
          <div class="flex flex-col w-full items-center justify-end">
            <label
              class="text-center text-sm"
              for="show_marking_scheme"
            >
              Show Question's Time Spent
            </label>
            <Select
              v-model="settings.mainLayout.showQuestionTimeSpent"
              label-id="show_marking_scheme"
              :options="selectOptions.showHide"
              option-label="name"
              option-value="value"
              :fluid="true"
              pt:root="w-3/4"
            />
          </div>
        </Panel>
        <div class="flex w-full">
          <Panel
            header="Themes"
            class="w-full"
            pt:title:class="text-xl"
            pt:header:class="justify-center p-5"
            pt:content:class="flex flex-col px-0 pb-0 border-y border-gray-500 divide-y divide-gray-500"
          >
            <div class="grid grid-cols-8 gap-3 text-center font-semibold divide-x divide-gray-500">
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
              class="grid grid-cols-8 gap-3 text-center divide-x divide-gray-500"
            >
              <!-- Theme Name -->
              <div class="col-span-2 flex items-center justify-center text-base font-medium py-4">
                {{ utilKeyToLabel(name) }}
              </div>
              <!-- Text Color -->
              <div class="flex col-span-3 items-center justify-center gap-4 py-4">
                <InputText
                  v-model="theme.textColor"
                  type="text"
                  size="small"
                  class="text-center w-24"
                />
                <ColorPicker
                  v-model="theme.textColor"
                  class="caret-transparent"
                  format="hex"
                />
              </div>
              <!-- Background Color -->
              <div class="flex col-span-3 items-center justify-center gap-4 py-4">
                <InputText
                  v-model="theme.bgColor"
                  type="text"
                  size="small"
                  class="text-center w-24"
                />
                <ColorPicker
                  v-model="theme.bgColor"
                  class="caret-transparent"
                  format="hex"
                />
              </div>
            </div>
          </Panel>
          <Panel
            header="Question Panel"
            class="w-full"
            pt:title:class="text-xl"
            pt:header:class="justify-center p-5"
            pt:content:class="flex flex-col px-4"
          >
            <div class="flex w-full justify-center gap-2 mb-0.5">
              <label
                class="text-center text-base text-nowrap font-semibold"
              >
                Answer Options Format
              </label>
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
                  <h3 class="text-center">
                    PREVIEW:
                  </h3>
                  <div class="py-2 px-4">
                    <CbtInterfaceAnswerOptionsDiv
                      v-model="dummyValue"
                      :total-options="4"
                      question-type="mcq"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-2 grid grid-cols-3 gap-1 mt-2">
              <div class="flex flex-col w-full">
                <label
                  class="text-center text-sm"
                  for="answer_options_prefix"
                >
                  Prefix
                </label>
                <InputText
                  v-model="settings.questionPanel.answerOptionsFormat.prefix"
                  type="text"
                  label-id="answer_options_prefix"
                  :fluid="true"
                  :maxlength="25"
                  size="small"
                />
              </div>
              <div class="flex flex-col w-full">
                <label
                  class="text-center text-sm"
                  for="answer_options_counter"
                >
                  Counter Type
                </label>
                <Select
                  v-model="settings.questionPanel.answerOptionsFormat.counterType"
                  label-id="answer_options_counter"
                  :options="selectOptions.answerOptionsFormat"
                  option-label="name"
                  option-value="value"
                  :fluid="true"
                  size="small"
                />
              </div>
              <div class="flex flex-col w-full">
                <label
                  class="text-center text-sm"
                  for="answer_options_suffix"
                >
                  Suffix
                </label>
                <InputText
                  v-model="settings.questionPanel.answerOptionsFormat.suffix"
                  type="text"
                  label-id="answer_options_suffix"
                  :fluid="true"
                  :maxlength="25"
                  size="small"
                />
              </div>
            </div>
            <div class="col-span-2 grid grid-cols-3 gap-1 mt-2">
              <div
                v-for="item in htmlContent.customizeUi.questionPanel.answerOptionsFormat"
                :key="item.key"
                class="flex flex-col w-full"
              >
                <label
                  class="text-center text-sm"
                  :for="item.id"
                >
                  {{ item.label }}
                </label>
                <BaseInputNumber
                  v-model="(
                    settings.questionPanel.answerOptionsFormat[
                      item.key as keyof CbtUiSettings['questionPanel']['answerOptionsFormat']
                    ] as number)"
                  :min="item.min"
                  :max="item.max"
                  :step="item.step || 1"
                  :label-id="item.id"
                  :size="('size' in item ? (item.size as string) : null)"
                />
              </div>
            </div>
            <div
              class="grid grid-cols-2 mt-4 gap-3"
            >
              <label
                class="col-span-2 text-center text-base text-nowrap font-semibold"
              >
                Question Img Max Width (%)
              </label>
              <div class="flex flex-col">
                <label
                  for="ques_img_max_width_qp_opened"
                  class="text-center"
                >
                  When Question Palette Opened
                </label>
                <BaseInputNumber
                  v-model="uiSettings.questionPanel.questionImgMaxWidth.maxWidthWhenQuestionPaletteOpened"
                  :min="10"
                  :max="100"
                  :step="5"
                  label-id="ques_img_max_width_qp_opened"
                  size="small"
                />
              </div>
              <div class="flex flex-col">
                <label
                  for="ques_img_max_width_qp_closed"
                  class="text-center"
                >
                  When Question Palette Closed
                </label>
                <BaseInputNumber
                  v-model="uiSettings.questionPanel.questionImgMaxWidth.maxWidthWhenQuestionPaletteClosed"
                  :min="10"
                  :max="100"
                  :step="5"
                  label-id="ques_img_max_width_qp_closed"
                  size="small"
                />
              </div>
            </div>
          </Panel>
        </div>
        <Panel
          header="Section Summary & Question Palette"
          class="w-full"
          pt:title:class="text-xl"
          pt:header:class="justify-center p-5"
          pt:content:class="flex flex-col w-full p-2 gap-3"
        >
          <div class="grid grid-cols-4 gap-4">
            <div
              v-for="item in htmlContent.customizeUi.questionPalette"
              :key="item.key"
              class="flex flex-col w-full items-center justify-end"
            >
              <label
                class="text-center text-sm"
                :for="item.id"
              >
                {{ item.label }}
              </label>
              <BaseInputNumber
                v-model="(
                  settings.questionPalette[
                    item.key as keyof CbtUiSettings['questionPalette']
                  ] as number)"
                :min="item.min"
                :max="item.max"
                :step="item.step || 1"
                :label-id="item.id"
                :size="('size' in item ? (item.size as string) : null)"
              />
            </div>
          </div>
          <div class="flex justify-center p-5 gap-3">
            <label class="text-lg font-semibold text-center">
              Customize Icons & its sizes
            </label>
            <IconWithTooltip
              :tooltip-content="tooltipContent.iconSettings"
              icon-class="text-xl"
            />
          </div>
          <div class="grid grid-cols-5 border-2 border-gray-500 divide-x-2 divide-gray-500">
            <template
              v-for="(label, key) in statusKeyNames"
              :key="key"
            >
              <div class="flex flex-col gap-3 pb-2">
                <label class="col-span-2 text-center p-2 font-bold py-1 border-b-2 border-gray-500">
                  {{ label }}:
                </label>
                <BaseSimpleFileUpload
                  accept="image/*"
                  label="Change Icon"
                  severity="help"
                  invalid-file-type-message="Invalid file. Please select a valid Image"
                  header-class="mx-3"
                  @upload="(file) => changeIcon(file, key)"
                />
                <div class="grid grid-cols-4 gap-1 px-4">
                  <label
                    class="col-span-4 text-center"
                    :for="`icons_${key}_text_color`"
                  >
                    Text Color
                  </label>
                  <InputText
                    v-model="settings.questionPalette.quesIcons[key].textColor"
                    type="text"
                    :label-id="`icons_${key}_text_color`"
                    :fluid="true"
                    size="small"
                    pt:root:class="col-span-3 text-center"
                  />
                  <div class="card col-span-1 flex w-full items-center justify-center">
                    <ColorPicker
                      v-model="settings.questionPalette.quesIcons[key].textColor"
                      class="caret-transparent"
                      format="hex"
                    />
                  </div>
                </div>
                <label class="text-center p-2 border-y border-gray-500">Section Summary</label>
                <div class="flex flex-col gap-1 px-4">
                  <label
                    class="text-center"
                    :for="`${key}_summary_icon_size`"
                  >
                    Icon Size
                  </label>
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
                  <label
                    class="text-center"
                    :for="`${key}_summary_number_size`"
                  >
                    Icon Number Size
                  </label>
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
                  <label
                    class="text-center"
                    :for="`${key}_summary_label_size`"
                  >
                    Label Font Size
                  </label>
                  <BaseInputNumber
                    v-model="settings.questionPalette.quesIcons[key].summaryLabelFontSize"
                    :min="0"
                    :max="10"
                    :step="0.1"
                    :label-id="`${key}_summary_label_size`"
                    size="small"
                  />
                </div>
                <label class="text-center p-2 border-y border-gray-500">Question Palette</label>
                <div class="flex flex-col gap-1 px-4">
                  <label
                    class="text-center"
                    :for="`${key}_palette_icon_size`"
                  >
                    Icon Size
                  </label>
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
                  <label
                    class="text-center"
                    :for="`${key}_palette_number_size`"
                  >
                    Icon Number Size
                  </label>
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
        </Panel>
      </Panel>
      <Panel
        header="Miscellaneous Settings"
        class="w-full"
        toggleable
        :collapsed="true"
        pt:root:class="pb-5"
        pt:title:class="text-2xl"
        pt:header:class="justify-center pt-2 pb-1 gap-5"
        pt:content:class="p-2"
      >
        <span class="flex text-center justify-center mb-4">
          Misc. settings for Profile Details (Top-right corner one)<br>
          Everthing under this is for visual use only and thus is optional,<br>
          none of these are saved or exported for privacy reasons
        </span>
        <div class="flex w-full">
          <div class="grid grid-cols-6 gap-4">
            <div class="grid grid-cols-1 col-span-2 w-full">
              <label
                class="text-center mb-0.5"
                for="misc_user_name"
              >
                User Name
              </label>
              <InputText
                v-model="miscSettings.username"
                type="text"
                label-id="misc_user_name"
                :fluid="true"
                :maxlength="60"
                pt:root:class="text-center"
              />
            </div>
            <div class="grid grid-cols-1 w-full">
              <label
                class="text-center"
                for="misc_profile_icon"
              >
                Profile Img
              </label>
              <BaseSimpleFileUpload
                accept="image/*"
                label="Change"
                severity="help"
                button-class="px-2 pt-[.5rem]"
                :fluid="true"
                invalid-file-type-message="Invalid file. Please select a valid Image"
                @upload="(file) => changeProfileIcon(file)"
              />
            </div>
            <div
              v-for="item in htmlContent.miscSettings"
              :key="item.key"
              class="grid grid-cols-1 w-full"
            >
              <label
                class="text-center text-sm"
                :for="item.id"
              >
                {{ item.label }}
              </label>
              <BaseInputNumber
                v-model="(miscSettings[item.key as keyof MiscSettings] as number)"
                :min="item.min"
                :max="item.max"
                :step="item.step || 1"
                :label-id="item.id"
                :size="('size' in item ? (item.size as string) : null)"
              />
            </div>
          </div>
        </div>
      </Panel>
    </div>
    <LazyImportExportDialog
      v-if="importExportDialogState.isDialogOpen"
      v-model:visibility="importExportDialogState.isDialogOpen"
      :data="importExportDialogState.data"
      :type="importExportDialogState.type"
      @processed="processImportExport"
    />
    <Dialog
      v-model:visible="prepareTestState.dialogVisibility"
      header="Confirm Preparing Test"
      :modal="true"
      :closable="true"
      pt:content:class="flex flex-col p-4 pt-0"
    >
      <div class="flex mb-10">
        <h3 class="text-base">
          Are you sure you want to start preparing the test?
        </h3>
      </div>
      <div class="flex px-4 justify-between">
        <BaseButton
          label="Prepare Test"
          @click="prepareTest()"
        >
          <template #icon>
            <Icon
              name="mdi:rocket-launch"
              size="1.4rem"
            />
          </template>
        </BaseButton>
        <BaseButton
          label="Go Back"
          severity="danger"
          @click="prepareTestState.dialogVisibility = false"
        >
          <template #icon>
            <Icon
              name="material-symbols:undo"
              size="1.4rem"
            />
          </template>
        </BaseButton>
      </div>
    </Dialog>
    <Dialog
      v-model:visible="prepareTestState.isOngoingTestFoundInDB"
      header="Unfinished Test is Found!"
      :modal="true"
      :closable="false"
      :close-on-escape="false"
      :block-scroll="true"
      :draggable="false"
      pt:content:class="flex flex-col p-4 pt-0"
    >
      <div class="flex mb-10">
        <h3 class="text-lg text-center">
          An unfinished test was found!<br>
          You can continue the test or discard it.<br><br>
          The steps to continue remain the same as for a fresh test<br>
          (upload the .zip file or .pdf &amp; .json files).<br><br>
          Some settings from this test will be locked, while others can be modified as needed.
        </h3>
      </div>
      <div class="flex px-4 justify-between">
        <BaseButton
          label="Continue Unfinished Test"
          @click="() => {
            testState.continueLastTest = true
            prepareTestState.isOngoingTestFoundInDB = false
          }"
        >
          <template #icon>
            <Icon
              name="mdi:rocket"
              size="1.4rem"
            />
          </template>
        </BaseButton>
        <BaseButton
          label="Discard Test"
          severity="danger"
          @click="prepareTestState.isOngoingTestFoundInDB = false"
        >
          <template #icon>
            <Icon
              name="mdi:clear-circle"
              size="1.4rem"
            />
          </template>
        </BaseButton>
      </div>
    </Dialog>
    <Dialog
      v-if="testState.continueLastTest === null"
      :visible="true"
      header="Oops Test Data is not Found!"
      :modal="true"
      :closable="false"
      :close-on-escape="false"
      :block-scroll="true"
      :draggable="false"
      pt:content:class="flex flex-col p-4 pt-0"
    >
      <div class="flex mb-10">
        <h3 class="text-lg text-center">
          Test Data was not found in storage.<br>
          Either the data is corrupted, deleted, or the browser is blocking access to it.<br>
          You can try refreshing the page or discard this test.<br>
        </h3>
      </div>
      <div class="flex px-4 justify-between">
        <BaseButton
          label="Refresh Page"
          @click="reloadPage()"
        >
          <template #icon>
            <Icon
              name="mdi:rocket"
              size="1.4rem"
            />
          </template>
        </BaseButton>
        <BaseButton
          label="Discard Test"
          severity="danger"
          @click="prepareTestState.isOngoingTestFoundInDB = false"
        >
          <template #icon>
            <Icon
              name="mdi:clear-circle"
              size="1.4rem"
            />
          </template>
        </BaseButton>
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { db } from '~/src/db/cbt-db'
import type {
  QuestionStatus,
  CropperSectionsData,
  CropperOutputData,
  TestState,
  TestSectionListItem,
  TestSectionsData,
  TestSectionData,
  TestSectionKey,
  QuestionAnswer,
  MiscSettings,
  CbtUiSettings,
  TestAnswerKeyData,
} from '~/src/types'

type ImportExportTypeKey = 'import' | 'export' | 'restoreFromSaved' | 'reset'

interface ImportExportDialogState {
  isDialogOpen: boolean
  type: ImportExportTypeKey
  data: Record<string, unknown>
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
      { key: 'size', label: 'Main Layout Size (px)', min: 5, max: 25 },
      { key: 'testTotalHeaderHeight', label: '"Test Total" Header Height', min: 0, max: 30, step: 0.1 },
      { key: 'sectionHeaderHeight', label: 'Sections Height', min: 1, max: 20, step: 0.1 },
      { key: 'sectionHeaderScrollPadding', label: 'Sections Scroll Padding', min: 0, max: 20, step: 0.1 },
      { key: 'sectionHeaderAndQuesPanelDividerHeight',
        label: 'Sections & Question-panel Divider Height', min: 0, max: 30, step: 0.1,
      },
    ]),
    questionPanel: {
      answerOptionsFormat: addIds([
        { key: 'fontSize', label: 'Text Font Size', min: 0.5, max: 5, step: 0.1, size: 'small' },
        { key: 'zoomSize', label: 'Checkbox Size', min: 0.5, max: 5, step: 0.1, size: 'small' },
        { key: 'rowGap', label: 'Row Gap', min: 0, max: 10, step: 0.1, size: 'small' },
      ]),
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

const tooltipContent = {
  testDataFileUpload:
    'Load the file(s) downloaded from the PDF Cropper.\n\n'
    + 'If you chose ZIP format, upload only the ZIP file.\n'
    + 'If you chose JSON format, upload both the JSON file and its corresponding PDF.',

  iconSettings:
    'When you are changing the icon/image,\n'
    + 'it is recommended to upload an icon with equal width and height (i.e. a square) for best compatibility.',

  testDuration:
    'Duration of Test, time formats:\n\n'
    + 'mmm:ss → Remaining minutes-seconds format (e.g. 150:45 means 150 minutes, 45 seconds).\n\n'
    + 'hh:mm:ss → 24-hour format (e.g. 14:30:45).',

  submitBtn:
    '"Enabled" → Submit Button is functional and test can be submitted anytime before timeout.\n\n'
    + '"Disabled" → Submit Button is disabled and test cannot be submitted before timeout.\n\n'
    + '"Hidden" → Submit Button is hidden (i.e. not visible) and test cannot be submitted before timeout.\n\n'
    + 'In all cases, test will be submitted automatically on timeout.',

  showPauseBtn:
    '"Yes" → During the test, you will be able to Pause/Resume the test.\n'
    + 'you can access the Pause Button in the hidden settings.\n'
    + 'To access hidden settings, long press on profile icon (the one that you see in the upper-right corner).\n'
    + 'You can access hidden settings whenever you want, now and while the test is ongoing.\n\n'
    + '"No" → You will not have the ability to pause the test (pause button will not be provided in hidden settings)',

  questionImgScale:
    'The scale of question pdf/image dimensions relative to original dimensions (x).\n'
    + 'device pixel ratio (DPR) is also multipled separately.\n\n'
    + 'Higher values increases resolution and improve image clarity but increase file size, '
    + 'requiring more RAM and processing time\n\n'
    + 'Ensure your device has enough RAM to handle the selected scale.\n'
    + 'If RAM is insufficient, the browser may kill the tab/window, or on low-end devices, '
    + 'the system might freeze, requiring a restart',

  misc:
    'Misc. settings for Profile Details (Top-right corner one)\n\n'
    + 'Everthing under this is for visual use only and thus is optional, '
    + 'none of these are saved or exported for privacy reasons',

  questionsNumberingOrderType:
    'Select how question numbers appear in the Question Palette:\n\n'
    + 'Original → Uses the numbering as provided in the data.\n\n'
    + 'Cumulative → Continues numbering across sections (e.g., 1-20, 21-40, 41-60).\n\n'
    + 'Section-wise → Resets numbering in each section (e.g., 1-20, 1-20, 1-20).',

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

  answerOptionsFormat: [
    { name: 'A, B, C, D...', value: 'upper-latin' },
    { name: 'a, b, c, d...', value: 'lower-latin' },
    { name: '1, 2, 3, 4...', value: 'decimal' },
    { name: 'I, II, III, IV...', value: 'upper-roman' },
    { name: 'i, ii, iii, iv...', value: 'lower-roman' },
  ],

  dataFile: [
    { name: 'Zip', value: 'zip' },
    { name: 'PDF + Json', value: 'json' },
  ],

  showHide: [
    { name: 'Show', value: true },
    { name: 'Hide', value: false },
  ],

  questionsNumberingOrderType: [
    { name: 'Original', value: 'original' },
    { name: 'Cumulative', value: 'cumulative' },
    { name: 'Section-wise', value: 'section-wise' },
  ],
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

const fileUploaderFileType = shallowRef('zip')

const importExportDialogState = shallowReactive<ImportExportDialogState>({
  isDialogOpen: false,
  type: 'import',
  data: {},
})

const {
  uiSettings,
  defaultUiSettings,
  testSettings,
  defaultTestSettings,
  miscSettings,
  defaultMiscSettings,
} = useCbtSettings()

const settings = useThrottle(uiSettings, 400)

const mainLayoutCssVar = useCssVar(
  '--main-layout-size',
  null,
  { initialValue: settings.value.mainLayout.size + 'px' },
)

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

watch(() => testSettings.value.timeFormat, (newtimeFormat) => {
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

watch(
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
          .catch((e: unknown) => console.error('Error importing settings:', e))
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
        console.error('Error getting settings from db', e)
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
    /* using toRaw because while both are ref from useState,
      .value of them is reactive object
    */
    testSettings: toRaw(testSettings.value),
    uiSettings: toRaw(uiSettings.value),
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

async function loadTestData(
  pdfFile: Uint8Array,
  jsonData: Record<string, unknown>,
) {
  try {
    testState.value.pdfFile = pdfFile

    const newCropperSectionsData: CropperSectionsData = {}
    let newTestSectionsData: TestSectionsData = {}
    let sectionsArray: TestSectionListItem[] = []

    const isContinueLastTest = testState.value.continueLastTest

    const { pdfCropperData, testAnswerKey } = jsonData as {
      pdfCropperData: CropperOutputData
      testAnswerKey: TestAnswerKeyData | undefined
    }

    if (testAnswerKey) testState.value.testAnswerKey = testAnswerKey

    // for newCropperSectionsData and sectionsArray
    for (const subject of Object.keys(pdfCropperData)) {
      for (const section of Object.keys(pdfCropperData[subject])) {
        newCropperSectionsData[section] = pdfCropperData[subject][section]

        if (isContinueLastTest) continue // skip sectionsList as the one in db will be used

        const sectionsItem: TestSectionListItem = {
          name: section,
          subject,
        }
        sectionsArray.push(sectionsItem)
      }
    }

    let totalQuestions = 0
    let totalSections = 0

    if (isContinueLastTest) {
      try {
        const [sectionsList, testState, sectionsData, testLogs] = await db.getTestData()

        totalQuestions = sectionsData.totalQuestions
        totalSections = sectionsList.length
        sectionsArray = sectionsList
        newTestSectionsData = sectionsData.testSectionsData
        currentTestState.value = testState

        const testLogger = useCbtLogger()
        testLogger.replaceLogsArray(testLogs)
      }
      catch (e: unknown) {
        console.error('Error getting Test Data in db', e)
        testState.value.continueLastTest = null
      }
    }
    else {
    // for newTestSectionsData
      let sectionData: Record<string, unknown> = {}
      const firstData: {
        section: TestSectionKey | null
        question: null | number
      } = {
        section: null,
        question: null,
      }

      const sectionsPrevQuestion: Record<TestSectionKey, number> = {}
      for (const section of Object.keys(newCropperSectionsData) as TestSectionKey[]) {
        let firstQuestion: number | null = null

        firstData.section ??= section
        let secQueId = 1
        for (const question of Object.keys(newCropperSectionsData[section])) {
          const { que, type, options } = newCropperSectionsData[section][question]

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
          if (type === 'msq' && options && options !== 4) {
            sectionData.totalOptions = options
          }

          totalQuestions++
          secQueId++
        }

        if (firstQuestion !== null) {
          sectionsPrevQuestion[section] = firstQuestion
        }
        newTestSectionsData[section] = sectionData as TestSectionData

        sectionData = {}
        totalSections++
      }

      currentTestState.value.sectionsPrevQuestion = sectionsPrevQuestion
      currentTestState.value.section = firstData.section as TestSectionKey
    }

    testState.value.totalSections = totalSections
    testState.value.totalQuestions = totalQuestions
    testSectionsList.value.splice(0, testSectionsList.value.length, ...sectionsArray)
    cropperSectionsData.value = newCropperSectionsData
    testSectionsData.value = newTestSectionsData
    updateTestQuestionsData(false)

    useCreateSectionsSummary(testSectionsData, testSectionsSummary)

    testState.value.isSectionsDataLoaded = true
  }
  catch (err) {
    console.error('Error loading TestData', err)
  }
}

function updateTestQuestionsData(recalculateTotalQueId: boolean = true) {
  const sectionsList = testSectionsList.value
  const sectionsData = testSectionsData.value

  testQuestionsData.value.clear()

  let queId = 1
  for (const sectionListItem of sectionsList) {
    const sectionData = sectionsData[sectionListItem.name]

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

watch(
  () => settings.value.mainLayout.size,
  () => {
    mainLayoutCssVar.value = settings.value.mainLayout.size + 'px'
  },
)

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
          settings.value.mainLayout.size = 9
        }
        else {
          const fontSize = parseInt(getComputedStyle(document.documentElement).fontSize)
          if (!Number.isNaN(fontSize)) {
            settings.value.mainLayout.size = fontSize
          }
        }
      }
    })

  db.getTestStatus().then((testStatus) => {
    if (testStatus === 'ongoing') {
      prepareTestState.isOngoingTestFoundInDB = true
    }
  }).catch((e: unknown) => console.error(
    'Error getting last test data (if present) in db', e,
  ))
})
</script>
