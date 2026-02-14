import DomPurify, { type DOMPurify } from 'dompurify'

type Cfg = Parameters<DOMPurify['sanitize']>['1']

const defaultCfg: Cfg = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['img', 'svg'],
}

export default (dirty: string, cfg?: Cfg) => {
  return DomPurify.sanitize(dirty, cfg ?? defaultCfg)
}
