<template>
  <header v-show="!isFullscreen">
    <nav class="relative">
      <div
        class="flex flex-row items-center pl-5 pr-4 sm:px-5 dark:bg-surface-900 dark:text-surface-0"
      >
        <NuxtLink
          to="/"
          class="text-green-500 font-bold text-3xl md:text-[2rem] p-1"
        >
          pdf2cbt
        </NuxtLink>
        <div class="flex grow flex-row-reverse md:flex-row">
          <div class="flex flex-row justify-center items-center md:mx-auto">
            <Icon
              :name="isHamburgerMenuOpen ? 'material-symbols:close-rounded' : 'material-symbols:menu-rounded'"
              size="1.8rem"
              class="peer cursor-pointer md:!hidden"
              :data-active="isHamburgerMenuOpen"
              @click="isHamburgerMenuOpen = !isHamburgerMenuOpen"
            />
            <div
              class="dark:bg-surface-900 dark:text-surface-0
              hidden w-full peer-data-[active=true]:!flex flex-col absolute z-50 left-0 top-full py-3
              md:flex md:flex-row md:static md:py-0"
            >
              <NuxtLink
                to="/pdf-cropper"
                class="flex items-center p-3 gap-2 hover:bg-surface-200 dark:hover:bg-surface-800"
              >
                <Icon
                  name="material-symbols:crop-rounded"
                  size="1.5rem"
                />
                <span class="text-lg">PDF Cropper</span>
              </NuxtLink>
              <div
                class="relative flex flex-col justify-center gap-0.5 group"
              >
                <span
                  class="flex items-center gap-2 pl-3"
                  tabindex="0"
                >
                  <Icon
                    name="material-symbols:computer-outline-rounded"
                    size="1.4rem"
                  />
                  <span class="text-lg">CBT</span>
                  <Icon
                    name="material-symbols:keyboard-arrow-down-rounded"
                    size="1.5rem"
                    class="hidden ml-2 md:block group-hover:-scale-y-100 transition-all"
                  />
                </span>
                <div
                  class="flex flex-col justify-center z-50 dark:text-surface-0 dark:bg-surface-900
                  md:hidden md:absolute md:group-hover:flex md:group-focus-within:flex
                  md:top-full md:left-1/2 md:-translate-x-1/2"
                >
                  <NuxtLink
                    to="/cbt/interface"
                    class="flex items-center gap-2 p-2 pl-8 md:pl-2 hover:bg-surface-200 dark:hover:bg-surface-800"
                  >
                    <Icon
                      name="material-symbols:computer-outline-rounded"
                      size="1.3rem"
                    />
                    <span class="text-base text-nowrap">Test Interface</span>
                  </NuxtLink>
                  <NuxtLink
                    to="/cbt/results"
                    class="flex items-center gap-2 p-2 pl-8 md:pl-2 hover:bg-surface-200 dark:hover:bg-surface-800"
                  >
                    <Icon
                      name="material-symbols:bar-chart-4-bars-rounded"
                      size="1.3rem"
                    />
                    <span class="text-base text-nowrap">Test Results</span>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-row justify-center mr-5 md:mr-0">
            <NuxtLink
              to="https://github.com/TheMoonVyy/pdf2cbt"
              class="flex items-center justify-center px-1 gap-2 hover:bg-surface-200 dark:hover:bg-surface-800"
              target="_blank"
            >
              <Icon
                name="prime:github"
                size="1.4rem"
              />
              <span class="hidden sm:block">Source</span>
            </NuxtLink>
            <Button
              label="Fullscreen"
              variant="link"
              :pt="{ label: 'hidden sm:block' }"
              @click="toggleFullscreen()"
            >
              <template #icon>
                <Icon
                  name="material-symbols:fullscreen"
                  size="1.4rem"
                />
              </template>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const isHamburgerMenuOpen = shallowRef(false)
const router = useRouter()

router.beforeEach(() => {
  isHamburgerMenuOpen.value = false
})

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
</script>
