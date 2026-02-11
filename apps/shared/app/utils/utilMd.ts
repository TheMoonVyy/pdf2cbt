import markdownIt from 'markdown-it'
import linkAttr from 'markdown-it-link-attributes'
import span from '#layers/shared/app/assets/external/markdown-it-span'
import multimdTable from 'markdown-it-multimd-table'
import blockEmbed from 'markdown-it-block-embed'
import underline from 'markdown-it-underline'
import attrs from 'markdown-it-attrs'
import { imgSize } from '@mdit/plugin-img-size'
import { tasklist } from '@mdit/plugin-tasklist'

const md = markdownIt({
  breaks: true,
  linkify: true,
  typographer: false,
})

md.use(span)
md.use(linkAttr, {
  attrs: {
    target: '_blank',
    rel: 'noopener',
  },
})
md.use(tasklist, { label: true })
md.use(blockEmbed)
md.use(multimdTable, {
  multiline: true,
  rowspan: true,
  headerless: true,
})
md.use(underline)
md.use(imgSize)
md.use(attrs, {
  allowedAttributes: ['id', 'class', 'style', 'width', 'height', 'loading', /^data-*$/],
})

export default () => md
