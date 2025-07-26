import type { ToasterProps } from 'vue-sonner'

export default () => useState<ToasterProps['position']>(
  'TOAST-POSITION',
  () => 'top-center' as const,
)
