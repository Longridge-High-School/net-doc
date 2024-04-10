import {type FieldHandlers} from './field.server'

export const textFieldHandlers: FieldHandlers = {
  valueSetter: (formData, name) => {
    return formData.get(name) as string
  },
  valueGetter: value => value,
  metaSave: () => ''
}
