import {Label, Input, HelperText} from '../components/input'
import {basename} from 'path'

import {type Field} from './field'
import {getUploadMetaData} from '../utils/upload-handler.server'

const editComponent: Field<string>['editComponent'] = ({
  name,
  label,
  helperText
}) => {
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

  console.dir({uri})

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

export const attachmentField: Field<string> = {
  editComponent,
  viewComponent,
  listComponent,
  valueSetter: (formData, name, currentValue) => {
    const file = formData.get(name) as unknown as
      | {filepath: string; type: string}
      | undefined

    if (file && file.filepath) {
      const fileName = basename(file.filepath)

      const metaData = getUploadMetaData(fileName)

      return JSON.stringify({
        uri: `/uploads/${fileName}`,
        originalFileName: metaData ? metaData.originalFileName : fileName,
        type: file.type
      })
    }

    return currentValue
  },
  valueGetter: value => value,
  metaComponent,
  metaSave: () => ''
}
