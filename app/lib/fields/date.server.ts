import {type FieldHandlers} from './field.server'

export const dateFieldHandlers: FieldHandlers = {
  valueSetter: (formData, name) => {
    return formData.get(name) as string
  },
  valueGetter: value => value,
  metaSave: () => ''
}
