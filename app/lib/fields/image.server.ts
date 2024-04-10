import {basename} from 'path'

import {type FieldHandlers} from './field.server'

export const imageFieldHandlers: FieldHandlers = {
  valueSetter: (formData, name, currentValue) => {
    const file = formData.get(name) as unknown as {filepath: string} | undefined

    if (file) {
      return `/uploads/${basename(file.filepath)}`
    }

    return currentValue
  },
  valueGetter: value => value,
  metaSave: () => ''
}
