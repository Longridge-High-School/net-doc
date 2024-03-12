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
  const {uri, originalFileName} = JSON.parse(value)

  return (
    <div className="mb-4">
      <h5 className="mb-2 font-bold">{title}</h5>
      <a href={uri} download={originalFileName}>
        {originalFileName}
      </a>
    </div>
  )
}

const metaComponent = () => <></>

const listComponent = ({value, title}: {value: string; title: string}) => {
  return <img src={value} alt={title} />
}

export const attachmentField: Field<string> = {
  editComponent,
  viewComponent,
  listComponent,
  valueSetter: (formData, name, currentValue) => {
    const file = formData.get(name) as unknown as
      | {filepath: string; type: string}
      | undefined

    const fileName = basename(file!.filepath)

    const metaData = getUploadMetaData(fileName)

    if (file) {
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
