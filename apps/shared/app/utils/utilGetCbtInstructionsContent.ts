import { Liquid } from 'liquidjs'

const engine = new Liquid({
  ownPropertyOnly: true,
  jsTruthy: true,
})

const md = utilMd()
export default async (raw: string, templateData: CbtInstructionsTemplateData) => {
  return engine.parseAndRender(raw, templateData)
    .then(s => md.render(s))
}
