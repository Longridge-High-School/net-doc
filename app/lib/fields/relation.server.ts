import {type FieldHandlers} from './field.server'

const metaSave: FieldHandlers['metaSave'] = formData => {
  return formData.get('meta') as string
}

export const relationFieldHandlers: FieldHandlers = {
  metaSave,
  valueSetter: (formData, name) => {
    return formData.get(name) as string
  },
  valueGetter: value => value
}
