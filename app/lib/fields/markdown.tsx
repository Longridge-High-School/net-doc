import {Label, TextArea, HelperText} from '../components/input'

import {type Field} from './field'

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
    <div className="mb-4">
      <h5 className="mb-2 font-bold">{title}</h5>
      <MDXComponent code={code} />
    </div>
  )
}

const metaComponent = () => <></>

const listComponent: Field['listComponent'] = ({value}) => {
  const {code} = JSON.parse(value)

  return <MDXComponent code={code} />
}

export const markdownField: Field = {
  editComponent,
  viewComponent,
  listComponent,
  metaComponent
}
