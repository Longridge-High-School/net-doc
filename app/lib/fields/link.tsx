import {Label, Input, HelperText} from '../components/input'

import {type Field} from './field'

const editComponent: Field['editComponent'] = ({
  value,
  name,
  label,
  helperText,
  validation
}) => {
  const {title: linkTitle, target} =
    value === '' ? {title: '', target: ''} : JSON.parse(value)

  return (
    <Label>
      {label}
      <Input
        name={`${name}-title`}
        defaultValue={linkTitle}
        required={validation.required}
        placeholder="Link Text"
      />
      <Input
        name={`${name}-target`}
        defaultValue={target}
        required={validation.required}
        placeholder="https://..."
      />
      <HelperText>{helperText}</HelperText>
    </Label>
  )
}

const viewComponent = ({value, title}: {value: string; title: string}) => {
  const {title: linkTitle, target} = JSON.parse(value)

  return (
    <div className="mb-4">
      <div className="mb-4 font-bold block">{title}</div>
      <a
        href={target}
        className="bg-gray-300 p-2 rounded"
        target="_blank"
        rel="noreferrer"
      >
        {linkTitle} 📤
      </a>
    </div>
  )
}

const metaComponent = () => <></>

const listComponent = ({value}: {value: string; title: string}) => {
  const {title: linkTitle, target} = JSON.parse(value)

  return (
    <a
      href={target}
      className="bg-gray-300 p-2 rounded"
      target="_blank"
      rel="noreferrer"
    >
      {linkTitle} 📤
    </a>
  )
}

export const linkField: Field = {
  editComponent,
  viewComponent,
  listComponent,
  metaComponent
}
