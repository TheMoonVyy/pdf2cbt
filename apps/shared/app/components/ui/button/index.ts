import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive disabled:opacity-60 text-destructive-foreground shadow-xs hover:bg-destructive/90 dark:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        warn: 'bg-warn text-warn-foreground shadow-xs hover:bg-warn/90 disabled:opacity-60',
        info: 'bg-info text-info-foreground shadow-xs hover:bg-info/90 disabled:opacity-60',
        help: 'bg-help text-help-foreground shadow-xs hover:bg-help/90 disabled:opacity-60',
        success: 'bg-success text-success-foreground shadow-xs hover:bg-success/90 disabled:opacity-60',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        iconMd: 'size-8',
        iconSm: 'size-7',
        iconXs: 'size-6',
        iconXxs: 'size-5.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
