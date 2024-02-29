import {Label, Input, HelperText} from '../components/input'

import {type Field} from './field'

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
  return (
    <Label>
      {label}
      <Input name={name} defaultValue={value} />
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

const metaComponent = () => <></>

export const textField: Field<string> = {
  editComponent,
  viewComponent,
  valueSetter: (formData, name) => {
    return formData.get(name) as string
  },
  valueGetter: value => value,
  metaComponent,
  metaSave: () => ''
}
