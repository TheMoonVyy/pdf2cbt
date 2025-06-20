<template>
  <header
    v-show="!isFullscreen"
    class="border"
  >
    <nav>
      <div class="flex w-full h-14 items-center @container">
        <h1 class="font-bold text-[1.7rem] sm:text-[2rem] py-1.5 pl-4 md:pl-6">
          <NuxtLink
            to="/"
            class="text-green-500"
          >
            pdf2cbt
            <span class="text-cyan-500 text-base md:text-lg">v{{ projectVersion }}</span>
          </NuxtLink>
        </h1>
        <div class="hidden gap-1 min-[74rem]:flex items-center mx-auto">
          <template
            v-for="item in [pdfCropperItem, ...cbtItems]"
            :key="item.title"
          >
            <NuxtLink
              :to="item.href"
              class="outline-hidden rounded-sm shadow-xs transition-all
              focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border"
            >
              <template #default="{ isActive }">
                <div
                  class="flex gap-1.5 justify-center"
                  :class="[navigationMenuTriggerStyle(), 'h-full', isActive ? 'text-green-400' : '']"
                >
                  <Icon
                    :name="item.icon"
                    size="1.3rem"
                  />
                  <span class="text-lg font-bold text-nowrap">
                    {{ item.title }}
                  </span>
                </div>
              </template>
            </NuxtLink>
          </template>
        </div>
        <UiNavigationMenu class="hidden sm:flex min-[74rem]:hidden mx-auto">
          <UiNavigationMenuList>
            <UiNavigationMenuItem
              v-for="item in menuItems"
              :key="item.title"
            >
              <template v-if="'content' in item">
                <UiNavigationMenuTrigger class="h-12 p-2 text-xl font-semibold">
                  <Icon
                    class="text-foreground"
                    :name="item.icon"
                    size="1.3rem"
                  />
                  <span class="ml-2">{{ item.title }}</span>
                </UiNavigationMenuTrigger>
                <UiNavigationMenuContent>
                  <ul
                    class="grid grid-cols-1 gap-2 p-2 w-64"
                  >
                    <li
                      v-for="contentItem in item.content"
                      :key="contentItem.title"
                    >
                      <NuxtLink
                        v-slot="{ isActive, href, navigate }"
                        :to="contentItem.href"
                        custom
                      >
                        <UiNavigationMenuLink
                          :active="isActive"
                          :href="href"
                          :class="navigationMenuTriggerStyle()"
                          class="w-full"
                          @click="navigate"
                        >
                          <div
                            class="flex items-center gap-2.5 p-1"
                            :class="isActive ? 'text-green-400' : ''"
                          >
                            <Icon
                              :name="contentItem.icon"
                              size="1.3rem"
                            />
                            <span class="text-lg font-bold text-nowrap">
                              {{ contentItem.title }}
                            </span>
                          </div>
                        </UiNavigationMenuLink>
                      </NuxtLink>
                    </li>
                  </ul>
                </UiNavigationMenuContent>
              </template>
              <NuxtLink
                v-else
                v-slot="{ isActive, href, navigate }"
                :to="item.href"
                custom
              >
                <UiNavigationMenuLink
                  :active="isActive"
                  :href="href"
                  :class="navigationMenuTriggerStyle()"
                  class="h-12"
                  @click="navigate"
                >
                  <div
                    class="flex items-center gap-2.5 p-1"
                    :class="isActive ? 'text-green-400' : ''"
                  >
                    <Icon
                      :name="item.icon"
                      size="1.3rem"
                    />
                    <span class="text-lg font-bold text-nowrap">
                      {{ item.title }}
                    </span>
                  </div>
                </UiNavigationMenuLink>
              </NuxtLink>
            </UiNavigationMenuItem>
          </UiNavigationMenuList>
        </UiNavigationMenu>
        <div class="flex gap-3 sm:gap-4 items-center h-14 ml-auto sm:ml-2 pr-4 sm:pr-8">
          <NuxtLink
            to="https://github.com/TheMoonVyy/pdf2cbt"
            class="flex items-center justify-center"
            target="_blank"
            tabindex="-1"
          >
            <BaseButton
              variant="outline"
              size="icon"
              title="pdf2cbt's github repo"
              icon-name="prime:github"
              icon-size="1.5rem"
            />
          </NuxtLink>
          <UiPopover>
            <UiPopoverTrigger as-child>
              <BaseButton
                variant="outline"
                size="icon"
                title="Theme Variants"
                icon-name="mdi:color"
                icon-size="1.5rem"
              />
            </UiPopoverTrigger>
            <UiPopoverContent class="w-xs p-0">
              <UiCard class="py-2">
                <UiCardHeader>
                  <UiCardTitle class="mx-auto text-lg">
                    Theme Colors
                  </UiCardTitle>
                  <UiCardDescription>You can change the website theme color to any of these below.</UiCardDescription>
                </UiCardHeader>
                <UiCardContent class="grid grid-cols-2 gap-4 pb-4">
                  <BaseButton
                    v-for="(themeColorStyle, themeName) in themeVariants"
                    :key="themeName"
                    variant="outline"
                    :label="themeName"
                    class="gap-3"
                    @click="colorMode = themeName"
                  >
                    <template #icon>
                      <span
                        class="size-4"
                        :style="{
                          backgroundColor: themeColorStyle,
                        }"
                      />
                    </template>
                  </BaseButton>
                </UiCardContent>
              </UiCard>
            </UiPopoverContent>
          </UiPopover>
          <BaseButton
            variant="outline"
            size="icon"
            title="Toggle Fullscreen"
            class="text-green-500 hover:text-green-600"
            icon-name="material-symbols:fullscreen"
            icon-size="1.5rem"
            @click="toggleFullscreen()"
          />
          <UiSheet>
            <UiSheetTrigger as-child>
              <BaseButton
                variant="outline"
                size="icon"
                title="Menu"
                class="sm:hidden"
                icon-name="material-symbols:menu-rounded"
              />
            </UiSheetTrigger>
            <UiSheetContent side="right">
              <UiSheetHeader class="p-3">
                <UiSheetTitle class="mx-auto">
                  Pages
                </UiSheetTitle>
              </UiSheetHeader>
              <ul
                class="grid grid-cols-1 gap-2 p-2"
              >
                <li
                  v-for="contentItem in [pdfCropperItem, ...cbtItems]"
                  :key="contentItem.title"
                >
                  <UiSheetClose as-child>
                    <NuxtLink
                      v-slot="{ isActive, href, navigate }"
                      :to="contentItem.href"
                      custom
                    >
                      <UiNavigationMenuLink
                        :active="isActive"
                        :href="href"
                        :class="navigationMenuTriggerStyle()"
                        class="w-full"
                        @click="navigate"
                      >
                        <div
                          class="flex items-center gap-2.5 p-1"
                          :class="isActive ? 'text-green-400' : ''"
                        >
                          <Icon
                            :name="contentItem.icon"
                            size="1.3rem"
                          />
                          <span class="text-lg font-bold text-nowrap">
                            {{ contentItem.title }}
                          </span>
                        </div>
                      </UiNavigationMenuLink>
                    </NuxtLink>
                  </UiSheetClose>
                </li>
              </ul>
            </UiSheetContent>
          </UiSheet>
        </div>
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { LocalStorageKeys } from '#shared/enums'

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
const projectVersion = useRuntimeConfig().public.projectVersion

const themeVariants = {
  blue: 'hsl(217.2 91.2% 59.8%)',
  slate: 'hsl(215.3 19.3% 34.5%)',
  neutral: 'hsl(0 0% 32.2%)',
}

const colorMode = useColorMode<keyof typeof themeVariants>({
  attribute: 'data-theme-variant',
  modes: Object.fromEntries(Object.keys(themeVariants).map(v => [v, v])),
  storageKey: LocalStorageKeys.AppThemeVariant,
  initialValue: 'blue',
})

const pdfCropperItem = {
  title: 'PDF Cropper',
  href: '/pdf-cropper',
  icon: 'material-symbols:crop-rounded',
}

const cbtItems = [
  {
    title: 'Test Interface',
    href: '/cbt/interface',
    icon: 'line-md:computer',
  },
  {
    title: 'Test Results',
    href: '/cbt/results',
    icon: 'material-symbols:bar-chart-4-bars-rounded',
  },
  {
    title: 'Generate Answer Key',
    href: '/cbt/generate-answer-key',
    icon: 'mdi:script-text-key-outline',
  },
]

const menuItems = [
  pdfCropperItem,
  {
    title: 'CBT',
    icon: 'line-md:computer',
    content: cbtItems,
  },
]
</script>
