<template>
  <UiDialog
    v-model:visible="showDialog"
    modal
    header="Backup Website Notice"
  >
    <UiDialogContent>
      <UiDialogHeader>
        <UiDialogTitle>Backup Website Notice</UiDialogTitle>
      </UiDialogHeader>
      <div class="flex flex-col items-center">
        <p>This is a backup website.</p>
        <p>
          The main website is at
          <NuxtLink to="https://pdf2cbt.vercel.app">
            <strong>pdf2cbt.vercel.app</strong>.
          </NuxtLink>
        </p>
        <p>It is recommended to use the main website unless it is unavailable.</p>
        <div class="mt-4 flex items-center justify-center gap-2">
          <UiCheckbox
            id="rememberDecisionCheckbox"
            v-model="rememberDecision"
          />
          <label
            for="rememberDecisionCheckbox"
            class="cursor-pointer select-none"
          >
            Remember my decision
          </label>
        </div>
        <div class="mt-4 flex flex-col gap-5 md:flex-row md:justify-between md:gap-8">
          <NuxtLink
            to="https://pdf2cbt.vercel.app"
            class="flex justify-center"
          >
            <BaseButton
              label="Go to Main Website"
            />
          </NuxtLink>
          <BaseButton
            label="I Understand, Don't Redirect"
            variant="warn"
            @click="dismissNotice"
          />
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import { MiscConsts } from '#layers/shared/shared/enums'

const rememberDecision = shallowRef(false)
const showDialog = defineModel<boolean>({ required: true })

const dismissNotice = () => {
  if (rememberDecision.value) {
    localStorage.setItem(MiscConsts.BackupNoticeDismissedKey, 'true')
  }
  showDialog.value = false
}
</script>
