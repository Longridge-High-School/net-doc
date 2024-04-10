import {type FieldHandlers} from './field.server'

const metaSave = (formData: FormData) => {
  return JSON.stringify((formData.get('meta') as string).split('\r\n'))
}

export const selectFieldHandlers: FieldHandlers = {
  valueSetter: (formData, name) => {
    return formData.get(name) as string
  },
  valueGetter: value => value,
  metaSave
}
