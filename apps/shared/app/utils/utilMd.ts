import markdownIt from 'markdown-it'
import linkAttr from 'markdown-it-link-attributes'
import span from '#layers/shared/app/assets/external/markdown-it-span'
import taskLists from 'markdown-it-task-lists'
import ins from 'markdown-it-ins'
import multimdTable from 'markdown-it-multimd-table'
import blockEmbed from 'markdown-it-block-embed'
import attrs from 'markdown-it-attrs'

const md = markdownIt({
  breaks: true,
  linkify: true,
  typographer: true,
})

md.use(span)
md.use(linkAttr, {
  attrs: {
    target: '_blank',
    rel: 'noopener',
  },
})
md.use(taskLists, { label: true, labelAfter: true })
md.use(blockEmbed)
md.use(ins)
md.use(multimdTable)
md.use(attrs, {
  allowedAttributes: ['id', 'class', /^data-*$/],
})

export default () => {
  return md
}
