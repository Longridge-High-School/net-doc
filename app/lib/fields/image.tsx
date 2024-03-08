import {Label, Input, HelperText} from '../components/input'
import {basename} from 'path'

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
      <Input name={name} defaultValue={value} type="file" />
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

export const imageField: Field<string> = {
  editComponent,
  viewComponent,
  valueSetter: (formData, name, currentValue) => {
    const file = formData.get(name) as unknown as {filepath: string} | undefined

    if (file) {
      return `/uploads/${basename(file.filepath)}`
    }

    return currentValue
  },
  valueGetter: value => value,
  metaComponent,
  metaSave: () => ''
}
