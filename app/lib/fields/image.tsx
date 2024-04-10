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
      <Input name={name} defaultValue={value} type="file" accept="image/*" />
      <HelperText>{helperText}</HelperText>
    </Label>
  )
}

const viewComponent = ({value, title}: {value: string; title: string}) => {
  return (
    <div className="mb-4">
      <h5 className="mb-2 font-bold">{title}</h5>
      <img src={value} alt={title} />
    </div>
  )
}

const metaComponent = () => <></>

const listComponent = ({value, title}: {value: string; title: string}) => {
  return <img src={value} alt={title} />
}

export const imageField: Field = {
  editComponent,
  viewComponent,
  listComponent,
  metaComponent
}
