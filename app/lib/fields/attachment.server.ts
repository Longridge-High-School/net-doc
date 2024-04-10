import {basename} from 'path'

import {type FieldHandlers} from './field.server'

import {getUploadMetaData} from '../utils/upload-handler.server'

export const attachmentFieldHandlers: FieldHandlers = {
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
  metaSave: () => ''
}
