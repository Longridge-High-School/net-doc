import {Label, Input, HelperText} from '../components/input'

import {type Field} from './field'

const editComponent: Field['editComponent'] = ({
  value,
  name,
  label,
  helperText,
  validation
}) => {
  return (
    <Label>
      {label}
      <Input name={name} defaultValue={value} required={validation.required} />
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

export const textField: Field = {
  editComponent,
  viewComponent,
  listComponent,
  metaComponent
}
