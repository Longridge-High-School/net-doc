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
    <div className="mb-4">
      <h5 className="mb-2 font-bold">{title}</h5>
      {value}
    </div>
  )
}

const metaComponent = () => <></>

const listComponent = ({value}: {value: string; title: string}) => {
  return <>{value}</>
}

export const textField: Field<string> = {
  editComponent,
  viewComponent,
  listComponent,
  valueSetter: (formData, name) => {
    return formData.get(name) as string
  },
  valueGetter: value => value,
  metaComponent,
  metaSave: () => ''
}
