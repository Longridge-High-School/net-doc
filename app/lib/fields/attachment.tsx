import {Label, Input, HelperText} from '../components/input'

import {type Field} from './field'

const editComponent: Field['editComponent'] = ({name, label, helperText}) => {
  return (
    <Label>
      {label}
      <Input name={name} type="file" />
      <HelperText>{helperText}</HelperText>
    </Label>
  )
}

const viewComponent = ({value, title}: {value: string; title: string}) => {
  const {uri, originalFileName} = JSON.parse(
    value !== '' ? value : '{"uri": "#", "originalFileName": ""}'
  )

  return (
    <div className="mb-4">
      <h5 className="mb-2 font-bold">{title}</h5>
      {uri !== '#' ? (
        <a
          href={uri}
          download={originalFileName}
          className="bg-gray-300 p-2 rounded inline-block"
        >
          💾 {originalFileName}
        </a>
      ) : (
        <i>No attached file.</i>
      )}
    </div>
  )
}

const metaComponent = () => <></>

const listComponent = ({value}: {value: string; title: string}) => {
  const {uri, originalFileName} = JSON.parse(
    value !== '' ? value : '{"uri": "#", "originalFileName": ""}'
  )

  if (uri === '') {
    return <></>
  }

  return (
    <a
      href={uri}
      download={originalFileName}
      className="bg-gray-300 p-2 rounded inline-block"
    >
      💾 {originalFileName}
    </a>
  )
}

export const attachmentField: Field = {
  editComponent,
  viewComponent,
  listComponent,
  metaComponent
}
