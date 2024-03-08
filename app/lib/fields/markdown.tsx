import {Label, TextArea, HelperText} from '../components/input'

import {type Field} from './field'

import {buildMDXBundle} from '../mdx.server'
import {MDXComponent} from '../mdx'

const editComponent = ({
  value,
  name,
  label,
  helperText
}: {
  value: string
  name: string
  label: string
  helperText: string
}) => {
  const {markdown} = JSON.parse(
    value === '' || value === undefined ? '{"markdown": ""}' : value
  )

  return (
    <Label>
      {label}
      <TextArea name={name} defaultValue={markdown} />
      <HelperText>{helperText}</HelperText>
    </Label>
  )
}

const viewComponent = ({value, title}: {value: string; title: string}) => {
  const {code} = JSON.parse(value)
  return (
    <p>
      <b>{title}</b>
      <br />
      <MDXComponent code={code} />
    </p>
  )
}

const metaComponent = () => <></>

const listComponent: Field<string>['listComponent'] = ({value}) => {
  const {code} = JSON.parse(value)

  return <MDXComponent code={code} />
}

export const markdownField: Field<string> = {
  editComponent,
  viewComponent,
  listComponent,
  valueSetter: async (formData, name) => {
    const markdown = formData.get(name) as string
    const code = await buildMDXBundle(markdown)

    return JSON.stringify({markdown, code})
  },
  valueGetter: value => value,
  metaComponent,
  metaSave: () => ''
}
