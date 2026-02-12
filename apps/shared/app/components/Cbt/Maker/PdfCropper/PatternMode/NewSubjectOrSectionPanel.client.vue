<template>
  <div
    ref="containerElem"
    class="flex flex-col gap-5 w-full"
  >
    <UiCard class="py-3 gap-2 w-full">
      <UiCardHeader>
        <UiCardTitle class="mx-auto text-lg">
          Current Config
        </UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="flex flex-col gap-2 px-3">
        <div
          v-for="config in currentEditingConfigData"
          :key="config.id"
          class="flex flex-row gap-5 items-center p-2 border border-border rounded-sm"
        >
          <BaseButton
            variant="outline"
            size="iconXs"
            title="Show Subjects"
            icon-name="material-symbols:arrow-drop-down"
            icon-class="text-green-500"
            class="p-0"
            icon-size="1.5rem"
            :data-dd-id="config.id"
            @click="showPopover('current', config)"
          />
          <span class="text-lg">{{ config.name }}</span>
        </div>
      </UiCardContent>
    </UiCard>
    <UiCard class="py-3 gap-2 w-full">
      <UiCardHeader>
        <UiCardTitle class="mx-auto text-lg">
          Built-in Configs
        </UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="flex flex-col gap-2 px-3">
        <div
          v-for="config in builtInConfigs"
          :key="config.id"
          class="flex flex-row gap-5 items-center p-2 border border-border rounded-sm"
        >
          <BaseButton
            variant="outline"
            size="iconXs"
            title="Show Subjects"
            icon-name="material-symbols:arrow-drop-down"
            icon-class="text-green-500"
            class="p-0"
            icon-size="1.5rem"
            :data-dd-id="'built-in' + config.id"
            @click="showPopover('built-in', config)"
          />
          <span class="text-lg">{{ config.name }}</span>
        </div>
      </UiCardContent>
    </UiCard>
    <UiCard
      v-if="userConfigs.length"
      class="py-3 gap-2 w-full"
    >
      <UiCardHeader>
        <UiCardTitle class="mx-auto text-lg">
          Your Configs
        </UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="flex flex-col gap-2 px-3">
        <div
          v-for="config in userConfigs"
          :key="config.id"
          class="flex flex-row gap-5 items-center p-2 border border-border rounded-sm"
        >
          <BaseButton
            variant="outline"
            size="iconXs"
            title="Show Subjects"
            icon-name="material-symbols:arrow-drop-down"
            icon-class="text-green-500"
            class="p-0"
            icon-size="1.5rem"
            :data-dd-id="'user-' + config.id"
            @click="showPopover('user', config)"
          />
          <span class="text-lg">{{ config.name }}</span>
        </div>
      </UiCardContent>
    </UiCard>
  </div>

  <UiDropdownMenu
    v-if="dropdownState.configNamesData && dropdownState.referenceElem"
    v-model:open="dropdownState.show"
  >
    <UiDropdownMenuContent
      :reference="dropdownState.referenceElem"
      class="w-full sm:w-auto sm:min-w-64 sm:max-w-lg"
    >
      <DropdownMenuArrow as-child>
        <ArrowSvgForOverlays />
      </DropdownMenuArrow>
      <template
        v-for="([subjectName, sections], subIdx) in Object.entries(dropdownState.configNamesData.subjects)"
        :key="subIdx"
      >
        <template v-if="Array.isArray(sections)">
          <UiDropdownMenuLabel class="text-center font-bold">
            {{ subjectName }}
          </UiDropdownMenuLabel>
          <UiDropdownMenuSeparator />
          <UiDropdownMenuGroup>
            <UiDropdownMenuItem
              v-for="(sectionName, secIdx) in sections"
              :key="secIdx"
              @click="addSubjectOrSection(subIdx, secIdx)"
            >
              <span class="text-base">{{ sectionName }}</span>
            </UiDropdownMenuItem>
          </UiDropdownMenuGroup>
        </template>
        <UiDropdownMenuItem
          v-else
          @click="addSubjectOrSection(subIdx)"
        >
          <span class="text-base">{{ subjectName }}</span>
        </UiDropdownMenuItem>
        <UiDropdownMenuSeparator class="last:hidden" />
      </template>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>

<script lang="ts" setup>
import type {
  PatternModeConfigJson,
  PatternModeSubjectConfigJson,
  PatternModeSectionConfigJson,
} from '#layers/shared/app/src/pdf-cropper-pattern-mode/config-schema'
import { builtInConfigs } from './built-in-configs'
import { DropdownMenuArrow } from 'reka-ui'

type ConfigsListItem = MakePropertyOptional<Omit<PatternModeBuiltInConfig, 'id'>, 'url'>
  & { id: number | 'current-config' }

const props = defineProps<{
  panelFor: 'subject' | 'section'
}>()

const currentConfigNamesData = inject<PatternModeBuiltInConfig['subjects']>('currentConfigNamesData')

const emit = defineEmits<{
  addNewSubject: [ name: string, data: PatternModeSubjectConfigJson ]
  addNewSection: [ name: string, data: PatternModeSectionConfigJson ]
  addCurrentConfigSubject: [ subjectIdx: number ]
  addCurrentConfigSection: [ subjectIdx: number, sectionIdx: number ]
}>()

const currentEditingConfigData = computed(() => {
  return [{
    id: 'current-config',
    name: 'Current Config',
    subjects: toValue(currentConfigNamesData) || {},
  }] as const
})
const containerElem = useTemplateRef('containerElem')

const dropdownState = shallowReactive({
  show: false,
  configNamesData: null as null | ConfigsListItem,
  referenceElem: null as null | Element,
})

const db = useDB()
const userConfigs = shallowRef<PatternModeUserConfig[]>([])

function loadUserConfigs() {
  db.getAllPatternModeConfigNames()
    .then(configNamesData => userConfigs.value = configNamesData)
    .catch(err => console.error('Failed to load user configs:', err))
}

loadUserConfigs()

function showPopover(
  type: 'built-in' | 'user' | 'current',
  configData: ConfigsListItem,
) {
  if (!containerElem.value) return

  let elemDataIdValue = ''
  switch (type) {
    case 'built-in':
      elemDataIdValue = 'built-in' + configData.id // id is negative so "-" suffix is not needed
      break
    case 'user':
      elemDataIdValue = 'user-' + configData.id
      break
    case 'current':
      elemDataIdValue = configData.id + ''
      break
  }

  if (!elemDataIdValue) return

  const elem = containerElem.value.querySelector(`[data-dd-id="${elemDataIdValue}"]`)
  if (elem) {
    const clonedConfigData = utilCloneJson(configData)

    if (props.panelFor === 'subject') {
      for (const key of Object.keys(clonedConfigData.subjects)) {
        clonedConfigData.subjects[key] = null
      }
    }
    dropdownState.configNamesData = clonedConfigData
    dropdownState.referenceElem = elem
    dropdownState.show = true
  }
}

async function addSubjectOrSection(subjectIdx: number, sectionIdx?: number) {
  if (!dropdownState.configNamesData) return

  try {
    const config = utilCloneJson(dropdownState.configNamesData)
    const { id, url } = config

    let patternModeConfigJson = null as null | PatternModeConfigJson
    if (id === 'current-config') {
      if (sectionIdx === undefined) {
        emit('addCurrentConfigSubject', subjectIdx)
        return
      }
      else if (sectionIdx !== undefined) {
        emit('addCurrentConfigSection', subjectIdx, sectionIdx)
        return
      }
    }
    else if (id < 0 && url) {
      const res = await fetch(url)

      if (!res.ok)
        throw Error(`status code: ${res.status}`)

      const data = await res.json()
      patternModeConfigJson = data?.patternModeConfig ?? null
      if (!patternModeConfigJson)
        throw Error('No patternModeConfig found in fetched config')
    }
    else {
      const dbConfig = await db.getPatternModeConfig(config.id as number)
      patternModeConfigJson = dbConfig?.data?.patternModeConfig ?? null
    }

    if (patternModeConfigJson) {
      const subjects = patternModeConfigJson.subjects
      if (!subjects)
        throw Error('No subjects data found in fetched config')
      const subjectEntry = Object.entries(subjects)[subjectIdx]
      if (!subjectEntry)
        throw Error('Invalid subject index')

      if (sectionIdx === undefined)
        emit('addNewSubject', subjectEntry[0]!, subjectEntry[1]!)
      else {
        const subjectData = subjectEntry[1]!
        if ('sections' in subjectData) {
          const sectionEntry = Object.entries(subjectData.sections)[sectionIdx]
          if (!sectionEntry)
            throw Error('Invalid section index')
          emit('addNewSection', sectionEntry[0]!, sectionEntry[1]!)
        }
      }
    }
  }
  catch (err) {
    console.error('Failed to load config data:', err)
  }
}
</script>
