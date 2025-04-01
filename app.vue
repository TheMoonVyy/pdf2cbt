<template>
  <div class="max-h-dvh min-h-dvh w-full flex flex-col overflow-hidden">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <LazyMiscBackupWebsiteNotice
      v-if="showBackupWebsiteNotice"
      v-model="showBackupWebsiteNotice"
    />
  </div>
</template>

<script setup lang="ts">
import { MiscConsts } from '~/src/types/enums'

const showBackupWebsiteNotice = shallowRef(false)

onMounted(() => {
  const config = useRuntimeConfig()
  if (config.public.isBackupWebsite) {
    if (!localStorage.getItem(MiscConsts.BackupNoticeDismissedKey)) {
      showBackupWebsiteNotice.value = true
    }
  }
})
</script>
