import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'

const secondaryIconOnlyBtnClasses = {
  root: `inline-flex cursor-pointer select-none items-center justify-center overflow-hidden relative
        px-3 py-2 gap-2 rounded-md disabled:pointer-events-none disabled:opacity-60 transition-colors duration-200
        bg-surface-100 enabled:hover:bg-surface-200 enabled:active:bg-surface-300
        border border-surface-100 enabled:hover:border-surface-200 enabled:active:border-surface-300
        text-surface-600 enabled:hover:text-surface-700 enabled:active:text-surface-800
        dark:bg-surface-800 dark:enabled:hover:bg-surface-700 dark:enabled:active:bg-surface-600
        dark:border-surface-800 dark:enabled:hover:border-surface-700 dark:enabled:active:border-surface-600
        dark:text-surface-300 dark:enabled:hover:text-surface-200 dark:enabled:active:text-surface-100
        focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2
        focus-visible:outline-surface-600 dark:focus-visible:outline-surface-300
        p-vertical:flex-col p-fluid:w-full p-fluid:p-icon-only:w-10
        p-icon-only:w-10 p-icon-only:px-0 p-icon-only:gap-0
        p-icon-only:p-rounded:rounded-full p-icon-only:p-rounded:h-10
        p-small:text-sm p-small:px-2.5 p-small:py-1.5
        p-large:text-[1.125rem] p-large:px-3.5 p-large:py-2.5
        p-raised:shadow-sm p-rounded:rounded-4xl
        p-outlined:bg-transparent enabled:hover:p-outlined:bg-surface-50 enabled:active:p-outlined:bg-surface-100
        p-outlined:border-surface-200 enabled:hover:p-outlined:border-surface-200 enabled:active:p-outlined:border-surface-200
        p-outlined:text-surface-500 enabled:hover:p-outlined:text-surface-500 enabled:active:p-outlined:text-surface-500
        dark:p-outlined:bg-transparent dark:enabled:hover:p-outlined:bg-white/5 dark:enabled:active:p-outlined:bg-white/15
        dark:p-outlined:border-surface-700 dark:enabled:hover:p-outlined:border-surface-700 dark:enabled:active:p-outlined:border-surface-700
        dark:p-outlined:text-surface-400 dark:enabled:hover:p-outlined:text-surface-400 dark:enabled:active:p-outlined:text-surface-400
        p-text:bg-transparent enabled:hover:p-text:bg-surface-50 enabled:active:p-text:bg-surface-100
        p-text:border-transparent enabled:hover:p-text:border-transparent enabled:active:p-text:border-transparent
        p-text:text-surface-500 enabled:hover:p-text:text-surface-500 enabled:active:p-text:text-surface-500
        dark:p-text:bg-transparent dark:enabled:hover:p-text:bg-surface-800 dark:enabled:active:p-text:bg-surface-700
        dark:p-text:border-transparent dark:enabled:hover:p-text:border-transparent dark:enabled:active:p-text:border-transparent
        dark:p-text:text-surface-400 dark:enabled:hover:p-text:text-surface-400 dark:enabled:active:p-text:text-surface-400
    `,
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    unstyled: true,
    pt: {
      directives: {
        tooltip: {
          root: `
            absolute hidden group max-w-48 sm:max-w-64 md:max-w-96
            data-[p-position=right]:py-0 data-[p-position=right]:px-1
            data-[p-position=left]:py-0 data-[p-position=left]:px-1
            data-[p-position=top]:py-1 [data-p-position=top]:px-0
            data-[p-position=bottom]:py-1 data-[p-position=bottom]:px-0
          `,
          text: `
            whitespace-pre-line break-words bg-surface-700 text-surface-0
            py-2 px-3 rounded-md
            shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]
          `,
          arrow: `
            absolute w-0 h-0 border-solid border-transparent
            group-data-[p-position=right]:border-y-6 group-data-[p-position=right]:border-l-0
            group-data-[p-position=right]:border-r-6 group-data-[p-position=right]:border-r-surface-700
            group-data-[p-position=right]:rtl:rotate-180

            group-data-[p-position=left]:border-y-6 group-data-[p-position=left]:border-r-0
            group-data-[p-position=left]:border-l-6 group-data-[p-position=left]:border-l-surface-700
            group-data-[p-position=left]:rtl:rotate-180

            group-data-[p-position=top]:border-x-6 group-data-[p-position=top]:border-b-0
            group-data-[p-position=top]:border-t-6 group-data-[p-position=top]:border-t-surface-700

            group-data-[p-position=bottom]:border-x-6 group-data-[p-position=bottom]:border-t-0
            group-data-[p-position=bottom]:border-b-6 group-data-[p-position=bottom]:border-b-surface-700
          `,
        },
      },
      select: {
        root: 'p-disabled:text-surface-300! p-disabled:bg-surface-800!',
        label: 'text-center',
        optionlabel: 'mx-auto',
      },
      dialog: {
        title: 'mx-auto',
      },
      listbox: {
        root: `group bg-surface-0 dark:bg-surface-950 text-surface-700 dark:text-surface-0
        border border-surface-300 dark:border-surface-700 rounded-md
        p-disabled:bg-surface-200 p-disabled:text-surface-500 dark:p-disabled:bg-surface-700 dark:p-disabled:text-surface-400 p-disabled:pointer-events-none
        p-invalid:border-red-400 dark:p-invalid:border-red-300
        shadow-[0_1px_2px_0_rgba(18,18,23,0.05)] transition-colors duration-200`,
        header: `pt-2 pb-1 px-4`,
        pcFilterContainer: {
          root: `relative`,
        },
        pcFilter: {
          root: `w-full appearance-none rounded-md outline-hidden
            bg-surface-0 dark:bg-surface-950
            text-surface-700 dark:text-surface-0
            placeholder:text-surface-500 dark:placeholder:text-surface-400
            border border-surface-300 dark:border-surface-700
            enabled:hover:border-surface-400 dark:enabled:hover:border-surface-600
            enabled:focus:border-primary
            disabled:bg-surface-200 disabled:text-surface-500
            dark:disabled:bg-surface-700 dark:disabled:text-surface-400
            ps-3 pe-10 py-2 p-fluid:w-full
            transition-colors duration-200 shadow-[0_1px_2px_0_rgba(18,18,23,0.05)]`,
        },
        pcFilterIconContainer: {
          root: `absolute top-1/2 -mt-2 leading-none end-3 z-1`,
        },
        filterIcon: `text-surface-400`,
        listContainer: `overflow-auto`,
        virtualScroller: ``,
        list: `list-none m-0 p-1 outline-none flex flex-col gap-[2px]`,
        optionGroup: `m-0 px-3 py-2 text-surface-500 dark:text-surface-400 font-semibold`,
        option: `flex items-center cursor-pointer relative overflow-hidden px-3 py-2 border-none rounded-sm
        text-surface-700 dark:text-surface-0
        hover:not-p-selected:bg-surface-100 dark:hover:not-p-selected:bg-surface-800 hover:not-p-selected:text-surface-800 dark:hover:not-p-selected:text-surface-0
        p-focus:not-p-selected:bg-surface-100 dark:p-focus:not-p-selected:bg-surface-800 p-focus:not-p-selected:text-surface-800 dark:p-focus:not-p-selected:text-surface-0
        p-selected:bg-highlight p-selected:p-focus:bg-highlight-emphasis
        group-p-disabled:text-surface-500 dark:group-p-disabled:text-surface-400 group-p-disabled:pointer-events-none
        p-disabled:opacity-60 p-disabled:pointer-events-none
        transition-colors duration-200`,
        optionCheckIcon: `relative -ms-1.5 me-1.5 text-surface-700 dark:text-surface-0`,
        optionBlankIcon: ``,
        emptyMessage: `px-3 py-2`,
      },
      orderlist: {
        root: 'flex p-3 gap-3',
        controls: 'flex flex-col gap-2',
        pcMoveUpButton: secondaryIconOnlyBtnClasses,
        pcMoveDownButton: secondaryIconOnlyBtnClasses,
        pcMoveTopButton: secondaryIconOnlyBtnClasses,
        pcMoveBottomButton: secondaryIconOnlyBtnClasses,
      },
    },
  })
  nuxtApp.vueApp.directive('tooltip', Tooltip)
})
