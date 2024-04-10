import {Label, HelperText, TextArea, Select} from '../components/input'

import {type Field} from './field'

const editComponent = ({
  value,
  name,
  label,
  helperText,
  meta
}: {
  value: string
  name: string
  label: string
  helperText: string
  meta: string
}) => {
  const values = JSON.parse(meta === '' ? '[]' : meta) as string[]

  return (
    <Label>
      {label}
      <Select name={name} defaultValue={value}>
        {values.map((value, i) => {
          return (
            <option key={i} value={value}>
              {value}
            </option>
          )
        })}
      </Select>
      <HelperText>{helperText}</HelperText>
    </Label>
  )
}

const viewComponent = ({value, title}: {value: string; title: string}) => {
  return (
    <div className="mb-4">
      <h5 className="mb-2 font-bold">{title}</h5>
      {value}
    </div>
  )
}

const metaComponent = ({meta}: {meta: string}) => {
  const values = JSON.parse(meta === '' ? '[]' : meta)

  return (
    <Label>
      Options
      <TextArea name="meta" defaultValue={values.join('\r\n')} />
      <HelperText>One option per line</HelperText>
    </Label>
  )
}

const listComponent = ({value}: {value: string; title: string}) => {
  return <>{value}</>
}

export const selectField: Field = {
  editComponent,
  viewComponent,
  listComponent,
  metaComponent
}
