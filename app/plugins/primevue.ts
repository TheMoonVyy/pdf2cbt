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
      inputnumber: {
        root: `[&>input]:text-center [&>input]:pr-8! [&>input]:p-horizontal:pr-2.5!
          [&>input]:dark:disabled:bg-surface-800! [&>input]:dark:disabled:text-surface-300!
        `,
      },
      select: {
        root: 'p-disabled:text-surface-300! p-disabled:bg-surface-800!',
        label: 'text-center',
        optionlabel: 'mx-auto',
      },
      inputtext: {
        root: 'dark:disabled:bg-surface-800! dark:disabled:text-surface-300!',
      },
      message: {
        root: `rounded-md outline outline-1
          p-outlined:bg-transparent p-outlined:outline p-outlined:outline-1
          p-simple:bg-transparent p-simple:outline-none
          p-info:bg-blue-50/95 p-info:outline-blue-200 p-info:text-blue-600 dark:p-info:bg-blue-500/15 dark:p-info:outline-blue-700/35 dark:p-info:text-blue-500
          p-info:p-outlined:text-blue-500 p-info:p-outlined:outline-blue-500 dark:p-info:p-outlined:text-blue-600 dark:p-info:p-outlined:outline-blue-600
          p-info:p-simple:text-blue-500 dark:p-info:p-simple:text-blue-600
          p-success:bg-green-50/95 p-success:outline-green-200 p-success:text-green-600 dark:p-success:bg-green-500/15 dark:p-success:outline-green-700/35 dark:p-success:text-green-500
          p-success:p-outlined:text-green-500 p-success:p-outlined:outline-green-500 dark:p-success:p-outlined:text-green-600 dark:p-success:p-outlined:outline-green-600
          p-success:p-simple:text-green-500 dark:p-success:p-simple:text-green-600
          p-warn:bg-yellow-50/95 p-warn:outline-yellow-200 p-warn:text-yellow-600 dark:p-warn:bg-yellow-500/15 dark:p-warn:outline-yellow-700/35 dark:p-warn:text-yellow-500
          p-warn:p-outlined:text-yellow-500 p-warn:p-outlined:outline-yellow-500 dark: p-warn:p-outlined:text-yellow-600 dark:p-warn:p-outlined:outline-yellow-600
          p-warn:p-simple:text-yellow-500 dark:p-warn:p-simple:text-yellow-600
          p-error:bg-red-50/95 p-error:outline-red-200 p-error:text-red-600 dark:p-error:bg-red-500/15 dark:p-error:outline-red-700/35 dark:p-error:text-red-500
          p-error:p-outlined:text-red-500 p-error:p-outlined:outline-red-500 dark:p-error:p-outlined:text-red-600 dark:p-error:p-outlined:outline-red-600
          p-error:p-simple:text-red-500 dark:p-error:p-simple:text-red-600
          p-secondary:bg-surface-100 p-secondary:outline-surface-200 p-secondary:text-surface-600 dark:p-secondary:bg-surface-800 dark:p-secondary:outline-surface-700 dark:p-secondary:text-surface-300
          p-secondary:p-outlined:text-surface-500 p-secondary:p-outlined:outline-surface-500 dark:p-secondary:p-outlined:text-surface-400 dark:p-secondary:p-outlined:outline-surface-400
          p-secondary:p-simple:text-surface-500 dark:p-secondary:p-simple:text-surface-400
          p-contrast:bg-surface-900 p-contrast:outline-surface-950 p-contrast:text-surface-50 dark:p-contrast:bg-surface-0 dark:p-contrast:outline-surface-100 dark:p-contrast:text-surface-950
          p-contrast:p-outlined:text-surface-950 p-contrast:p-outlined:outline-surface-950 dark:p-contrast:p-outlined:text-surface-0 dark:p-contrast:p-outlined:outline-surface-0
          p-contrast:p-simple:text-surface-950 dark:p-contrast:p-simple:text-surface-0
        `,
        content: `flex items-center p-simple:p-0 px-3 py-2 gap-2 h-full
          p-small:px-2.5 p-small:py-1.5 p-large:px-3.5 p-large:py-2.5
        `,
        icon: `shrink-0 text-lg w-4.5 h-4.5
          p-small:w-3.5 p-small:h-3.5 p-small:text-sm
          p-large:w-5 p-large:h-5 p-large:text-xl
        `,
        text: `mx-auto text-base font-medium p-small:text-sm p-large:text-xl`,
        closeButton: `flex items-center justify-center shrink-0 ms-auto overflow-hidden relative cursor-pointer select-none
          w-7 h-7 rounded-full bg-transparent transition-colors duration-200 text-inherit p-0 border-none
          focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2
          p-info:hover:bg-blue-100 p-info:focus-visible:outline-blue-600 dark:p-info:hover:bg-white/5 dark:p-info:focus-visible:outline-blue-500
          p-success:hover:bg-green-100 p-success:focus-visible:outline-green-600 dark:p-success:hover:bg-white/5 dark:p-success:focus-visible:outline-green-500
          p:warn:hover:bg-yellow-100 p:warn:focus-visible:outline-yellow-600 dark:p:warn:hover:bg-white/5 dark:p:warn:focus-visible:outline-yellow-500
          p-error:hover:bg-red-100 p-error:focus-visible:outline-red-600 dark:p-error:hover:bg-white/5 dark:p-error:focus-visible:outline-red-500
          p-secondary:hover:bg-surface-200 p-secondary:focus-visible:outline-surface-600 dark:p-secondary:hover:bg-surface-700 dark:p-secondary:focus-visible:outline-surface-300
          p-contrast:hover:bg-surface-800 p-contrast:focus-visible:outline-surface-50 dark:p-contrast:hover:bg-surface-100 dark:p-contrast:focus-visible:outline-surface-950
          p-outlined:hover:bg-transparent p-simple:hover:bg-transparent
        `,
        closeIcon: `w-4 h-4 text-base
          p-small:w-3.5 p-small:h-3.5 p-small:text-sm 
          p-large:w-4.5 p-large:h-4.5 p-large:text-xl
        `,
        transition: {
          enterFromClass: 'opacity-0',
          enterActiveClass: 'transition-opacity duration-300',
          leaveFromClass: 'max-h-40',
          leaveActiveClass: 'overflow-hidden transition-all duration-300 ease-in',
          leaveToClass: 'max-h-0 opacity-0 m-0!',
        },
      },
      fileUpload: {
        root: 'flex flex-col [&>input[type=file]]:hidden',
        header: 'p-0',
        file: 'flex gap-3 px-4 py-3 border-b border-slate-600',
        fileThumbnail: 'hidden',
        fileInfo: 'flex gap-5 mx-4',
        pcFileBadge: { root: 'hidden' },
        pcProgressBar: { root: 'hidden' },
        fileactions: 'ml-auto mr-4',
        content: `flex flex-col`,
        empty: 'flex grow',
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
      colorpicker: {
        root: 'inline-block relative',
        preview: 'w-6 h-6 p-0 border-none rounded-md transition-colors duration-200 cursor-pointer disabled:cursor-auto focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-primary',
        overlay: 'bg-surface-800 dark:bg-surface-900 border border-surface-900 dark:border-surface-700 rounded-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] w-[193px] h-[166px] absolute top-0 start-0',
        content: 'relative',
        colorSelector: 'w-[150px] h-[150px] top-[8px] start-[8px] absolute',
        colorBackground: 'w-full h-full bg-[linear-gradient(to_top,#000_0%,rgba(0,0,0,0)_100%),linear-gradient(to_right,#fff_0%,rgba(255,255,255,0)_100%)]',
        colorHandle: 'absolute top-0 start-[150px] rounded-full w-[10px] h-[10px] border border-surface-0 -mt-[5px] me-0 mb-0 -ms-[5px] cursor-pointer opacity-85',
        hue: 'w-[17px] h-[150px] top-[8px] start-[167px] absolute opacity-85 bg-[linear-gradient(0deg,red_0,#ff0_17%,#0f0_33%,#0ff_50%,#00f_67%,#f0f_83%,red)]',
        hueHandle: 'absolute top-[150px] start-0 w-[21px] -ms-[2px] -mt-[5px] h-[10px] border-2 opacity-85 border-surface-0 cursor-pointer',
      },
      tab: {
        root: 'p-active:dark:text-white! p-active:font-bold!',
      },
      popover: {
        root: 'p-popover',
      },
      contextmenu: {
        root: {
          class: [
            'bg-surface-0 dark:bg-surface-900',
            'text-surface-700 dark:text-surface-0',
            'border border-surface-200 dark:border-surface-700',
            'rounded-md min-w-52',
            'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]',
          ],
        },
        rootList: {
          class: 'm-0 p-1 list-none outline-none flex flex-col gap-[2px]',
        },
        item: {
          class: [
            'relative font-normal',
            'hover:bg-surface-100 hover:text-surface-800',
            'hover:dark:bg-surface-800 hover:dark:text-surface-0 hover:dark:font-semibold',
            'focus:bg-surface-100 focus:text-surface-800',
            'focus:dark:bg-surface-800 focus:dark:text-surface-0 focus:dark:font-semibold',
            'data-[p-active=true]:bg-surface-100 data-[p-active=true]:text-surface-800',
            'data-[p-active=true]:dark:bg-surface-800 data-[p-active=true]:dark:text-surface-0 data-[p-active=true]:dark:font-semibold',
          ],
        },
        itemContent: {
          class: [
            'transition-colors duration-200 rounded-sm',
            'text-surface-700 dark:text-surface-0',
          ],
        },
        itemLink: {
          class: [
            'cursor-pointer flex items-center no-underline overflow-hidden relative text-inherit',
            'px-3 py-2 gap-2 select-none outline-none',
          ],
        },
        itemIcon: {
          class: [
            'text-surface-400 dark:text-surface-500',
            'group-hover:text-surface-500 group-hover:dark:text-surface-400',
          ],
        },
        submenuIcon: {
          class: [
            'text-surface-400 dark:text-surface-500',
            'ms-auto text-sm w-3.5 h-3.5',
            'group-hover:text-surface-500 group-hover:dark:text-surface-400',
          ],
        },
        separator: {
          class: 'border-t border-surface-200 dark:border-surface-700 my-1',
        },
        submenu: {
          class: [
            'absolute min-w-full z-10 rounded-md',
            'bg-surface-0 dark:bg-surface-900',
            'text-surface-700 dark:text-surface-0',
            'border border-surface-200 dark:border-surface-700',
            'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]',
          ],
        },
      },
    },
  })
  nuxtApp.vueApp.directive('tooltip', Tooltip)
})
