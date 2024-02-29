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
    <p>
      <b>{title}</b>
      <br />
      {value}
    </p>
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

const metaSave = (formData: FormData) => {
  return JSON.stringify((formData.get('meta') as string).split('\r\n'))
}

export const selectField: Field<string> = {
  editComponent,
  viewComponent,
  valueSetter: (formData, name) => {
    return formData.get(name) as string
  },
  valueGetter: value => value,
  metaComponent,
  metaSave
}
