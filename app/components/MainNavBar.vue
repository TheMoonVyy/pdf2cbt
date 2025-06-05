<template>
  <header
    v-show="!isFullscreen"
    class="border"
  >
    <nav>
      <div class="flex w-full h-14">
        <h1 class="font-bold text-[1.7rem] sm:text-[2rem] py-1.5 pl-4 md:pl-6">
          <NuxtLink
            to="/"
            class="text-green-500"
          >
            pdf2cbt
            <span class="text-cyan-500 text-base md:text-lg">v{{ projectVersion }}</span>
          </NuxtLink>
        </h1>
        <UiNavigationMenu class="hidden sm:flex mx-auto">
          <UiNavigationMenuList>
            <UiNavigationMenuItem
              v-for="item in menuItems"
              :key="item.title"
            >
              <template v-if="item.content">
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
          <BaseButton
            variant="outline"
            size="icon"
            title="Toggle Fullscreen"
            class="cursor-pointer text-green-500 hover:text-green-600"
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
                <template
                  v-for="item in menuItems"
                  :key="item.title"
                >
                  <li
                    v-for="contentItem in (item.content || [item])"
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
                </template>
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

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
const projectVersion = useRuntimeConfig().public.projectVersion

const menuItems = [
  {
    title: 'PDF Cropper',
    href: '/pdf-cropper',
    icon: 'material-symbols:crop-rounded',
  },
  {
    title: 'CBT',
    icon: 'material-symbols:computer-outline-rounded',
    content: [
      {
        title: 'Test Interface',
        href: '/cbt/interface',
        icon: 'material-symbols:computer-outline-rounded',
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
    ],
  },
]
</script>
