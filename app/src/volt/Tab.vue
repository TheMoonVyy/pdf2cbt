<template>
    <Tab
        :value="props.value"
        unstyled
        :pt="theme"
        :ptOptions="{
            mergeProps: ptViewMerge
        }"
    >
        <slot></slot>
    </Tab>
</template>

<script setup lang="ts">
import Tab, { type TabPassThroughOptions, type TabProps } from 'primevue/tab';
import { ref } from 'vue';
import { ptViewMerge } from './utils';

interface Props extends /* @vue-ignore */ TabProps {}
const props = defineProps<Props>();

const theme = ref<TabPassThroughOptions>({
    root: `shrink-0 cursor-pointer select-none relative whitespace-nowrap py-4 px-4.5
        border-b border-surface-200 dark:border-surface-700 font-semibold
        text-surface-500 dark:text-surface-400
        transition-colors duration-200 -mb-px
        not-p-active:enabled:hover:text-surface-700 dark:not-p-active:enabled:hover:text-surface-0
        p-active:border-primary p-active:text-primary
        disabled:pointer-events-none disabled:opacity-60
        focus-visible:z-10 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-primary`
});
</script>
