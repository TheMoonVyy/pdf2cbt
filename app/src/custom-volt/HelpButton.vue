<template>
    <Button
        unstyled
        :pt="theme"
        :ptOptions="{
            mergeProps: ptViewMerge
        }"
    >
        <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
    </Button>
</template>

<script setup lang="ts">
import Button, { type ButtonPassThroughOptions, type ButtonProps } from 'primevue/button';
import { ref } from 'vue';
import { ptViewMerge } from '../volt/utils';

interface Props extends /* @vue-ignore */ ButtonProps {}
defineProps<Props>();

const theme = ref<ButtonPassThroughOptions>({
  root: `inline-flex cursor-pointer select-none items-center justify-center overflow-hidden relative
    px-3 py-2 gap-2 rounded-md disabled:pointer-events-none disabled:opacity-60 transition-colors duration-200
    bg-purple-500 enabled:hover:bg-purple-600 enabled:active:bg-purple-700
    border border-purple-500 enabled:hover:border-purple-600 enabled:active:border-purple-700
    text-white enabled:hover:text-white enabled:active:text-white
    dark:bg-purple-400 dark:enabled:hover:bg-purple-300 dark:enabled:active:bg-purple-200
    dark:border-purple-400 dark:enabled:hover:border-purple-300 dark:enabled:active:border-purple-200
    dark:text-purple-950 dark:enabled:hover:text-purple-950 dark:enabled:active:text-purple-950
    focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2
    focus-visible:outline-purple-500 dark:focus-visible:outline-purple-400
    p-vertical:flex-col p-fluid:w-full p-fluid:p-icon-only:w-10
    p-icon-only:w-10 p-icon-only:px-0 p-icon-only:gap-0
    p-icon-only:p-rounded:rounded-full p-icon-only:p-rounded:h-10
    p-small:text-sm p-small:px-2.5 p-small:py-1.5
    p-large:text-[1.125rem] p-large:px-3.5 p-large:py-2.5
    p-raised:shadow-sm p-rounded:rounded-4xl
    p-outlined:bg-transparent enabled:hover:p-outlined:bg-purple-50 enabled:active:p-outlined:bg-purple-100
    p-outlined:border-purple-200 enabled:hover:p-outlined:border-purple-200 enabled:active:p-outlined:border-purple-200
    p-outlined:text-purple-500 enabled:hover:p-outlined:text-purple-500 enabled:active:p-outlined:text-purple-500
    dark:p-outlined:bg-transparent dark:enabled:hover:p-outlined:bg-purple-400/5 dark:enabled:active:p-outlined:bg-purple-400/15
    dark:p-outlined:border-purple-700 dark:enabled:hover:p-outlined:border-purple-700 dark:enabled:active:p-outlined:border-purple-700
    dark:p-outlined:text-purple-400 dark:enabled:hover:p-outlined:text-purple-400 dark:enabled:active:p-outlined:text-purple-400
    p-text:bg-transparent enabled:hover:p-text:bg-purple-50 enabled:active:p-text:bg-purple-100
    p-text:border-transparent enabled:hover:p-text:border-transparent enabled:active:p-text:border-transparent
    p-text:text-purple-500 enabled:hover:p-text:text-purple-500 enabled:active:p-text:text-purple-500
    dark:p-text:bg-transparent dark:enabled:hover:p-text:bg-purple-400/5 dark:enabled:active:p-text:bg-purple-400/15
    dark:p-text:border-transparent dark:enabled:hover:p-text:border-transparent dark:enabled:active:p-text:border-transparent
    dark:p-text:text-purple-400 dark:enabled:hover:p-text:text-purple-400 dark:enabled:active:p-text:text-purple-400
  `,
  loadingIcon: ``,
  icon: `p-right:order-1 p-bottom:order-2`,
  label: `font-medium p-icon-only:invisible p-icon-only:w-0
    p-small:text-sm p-large:text-[1.125rem]`,
  pcBadge: {
    root: `min-w-4 h-4 leading-4`
  }
});
</script>
