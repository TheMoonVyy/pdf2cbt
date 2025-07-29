<template>
  <UiSidebar>
    <UiSidebarContent class="pt-5 px-2">
      <UiSidebarMenuItem>
        <UiSidebarMenuButton
          class="cursor-pointer py-4 data-[active=true]:text-green-500 hover:data-[active=true]:text-green-500"
          :is-active="selected === ResultsPagePanels.Summary || selected === ResultsPagePanels.Detailed"
          @click="selected = ResultsPagePanels.Summary"
          as="span"
        >
          <Icon
            name="mdi:chart-bar"
            size="1.4rem"
          />
          <span class="text-base font-semibold">Test Results</span>
        </UiSidebarMenuButton>
        <UiSidebarMenuSub class="gap-2.5 mr-0.5 mt-2 pl-1! pr-0!">
          <UiSidebarMenuSubItem>
            <UiSidebarMenuSubButton
              class="cursor-pointer py-4 data-[active=true]:text-green-500 hover:data-[active=true]:text-green-500"
              :is-active="selected === ResultsPagePanels.Summary"
              @click="selected = ResultsPagePanels.Summary"
              as="span"
            >
              <Icon
                name="material-symbols:full-coverage-outline-rounded"
                size="1.4rem"
              />
              <span class="text-base font-semibold">Summary</span>
            </UiSidebarMenuSubButton>
          </UiSidebarMenuSubItem>
          <UiSidebarMenuSubItem>
            <UiSidebarMenuSubButton
              class="cursor-pointer py-4 data-[active=true]:text-green-500 hover:data-[active=true]:text-green-500"
              :is-active="selected === ResultsPagePanels.Detailed"
              @click="selected = ResultsPagePanels.Detailed"
              as="span"
            >
              <Icon
                name="mdi:book-open-page-variant"
                size="1.4rem"
              />
              <span class="text-base font-semibold">Detailed</span>
            </UiSidebarMenuSubButton>
          </UiSidebarMenuSubItem>
        </UiSidebarMenuSub>
      </UiSidebarMenuItem>
      <UiSidebarMenuItem>
        <UiSidebarMenuButton
          class="cursor-pointer py-4 data-[active=true]:text-green-500 hover:data-[active=true]:text-green-500"
          :is-active="selected === ResultsPagePanels.MyTests"
          @click="selected = ResultsPagePanels.MyTests"
          as="span"
        >
          <Icon
            name="mdi:clipboard-text-outline"
            size="1.4rem"
          />
          <span class="text-base font-semibold">My Tests</span>
        </UiSidebarMenuButton>
      </UiSidebarMenuItem>
    </UiSidebarContent>
  </UiSidebar>
</template>

<script lang="ts" setup>
import { ResultsPagePanels } from '#layers/shared/shared/enums'

const selected = defineModel<ResultsPagePanels>({ required: true })
</script>
