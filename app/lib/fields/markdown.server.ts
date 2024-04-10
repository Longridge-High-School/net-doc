import {type FieldHandlers} from './field.server'

import {buildMDXBundle} from '../mdx.server'

export const markdownFieldHandlers: FieldHandlers = {
  valueSetter: async (formData, name) => {
    const markdown = formData.get(name) as string
    const code = await buildMDXBundle(markdown)

    return JSON.stringify({markdown, code})
  },
  valueGetter: value => value,
  metaSave: () => ''
}
