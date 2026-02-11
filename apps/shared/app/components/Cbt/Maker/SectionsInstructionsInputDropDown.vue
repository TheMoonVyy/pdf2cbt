<script lang="ts" setup>
import { SECTION_INSTRUCTIONS_MENU_MAP } from '#layers/shared/shared/constants'

defineProps<{
  questionType: QuestionType
}>()

const instructionType = defineModel<SectionInstructionTypes>({ required: true })
</script>

<template>
  <div class="flex flex-col gap-3 mx-auto items-center">
    <UiLabel
      class="text-lg text-nowrap"
    >
      <span class="text-green-500">({{ questionType }})</span>
      Section Instructions
    </UiLabel>
    <div class="flex">
      <UiInput
        :model-value="instructionType"
        readonly
        class="rounded-r-none h-10 text-base! w-72 text-center
          bg-accent/20 pointer-events-none"
        tabindex="-1"
      />

      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <BaseButton
            variant="outline"
            class="rounded-l-none border-l-0 size-10"
            size="icon"
            icon-name="material-symbols:keyboard-arrow-down-rounded"
          />
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent class="w-48">
          <template
            v-for="(rootMenu, rootIdx) in SECTION_INSTRUCTIONS_MENU_MAP[questionType]"
            :key="rootIdx"
          >
            <UiDropdownMenuSub v-if="'groupItems' in rootMenu">
              <UiDropdownMenuSubTrigger>
                {{ rootMenu.name }}
              </UiDropdownMenuSubTrigger>
              <UiDropdownMenuPortal>
                <UiDropdownMenuSubContent>
                  <template
                    v-for="(rootChildMenu, rootChildIdx) in rootMenu.groupItems"
                    :key="rootChildIdx"
                  >
                    <UiDropdownMenuSub v-if="'groupItems' in rootChildMenu">
                      <UiDropdownMenuSubTrigger>
                        {{ rootChildMenu.name }}
                      </UiDropdownMenuSubTrigger>
                      <UiDropdownMenuPortal>
                        <UiDropdownMenuSubContent>
                          <template
                            v-for="(subChildMenu, subChildIdx) in rootChildMenu.groupItems"
                            :key="subChildIdx"
                          >
                            <UiDropdownMenuItem
                              @select="instructionType = subChildMenu.value"
                            >
                              {{ subChildMenu.name }}
                            </UiDropdownMenuItem>
                          </template>
                        </UiDropdownMenuSubContent>
                      </UiDropdownMenuPortal>
                    </UiDropdownMenuSub>
                    <UiDropdownMenuItem
                      v-else
                      @select="instructionType = rootChildMenu.value"
                    >
                      {{ rootChildMenu.name }}
                    </UiDropdownMenuItem>
                  </template>
                </UiDropdownMenuSubContent>
              </UiDropdownMenuPortal>
            </UiDropdownMenuSub>
            <UiDropdownMenuItem
              v-else
              @select="instructionType = rootMenu.value"
            >
              {{ rootMenu.name }}
            </UiDropdownMenuItem>
          </template>
        </UiDropdownMenuContent>
      </UiDropdownMenu>
    </div>
  </div>
</template>
