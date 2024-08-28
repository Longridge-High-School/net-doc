import {type FieldHandlers} from './field.server'

export const linkFieldHandlers: FieldHandlers = {
  valueSetter: (formData, name) => {
    return JSON.stringify({
      title: formData.get(`${name}-title`) as string,
      target: formData.get(`${name}-target`) as string
    })
  },
  valueGetter: value => value,
  metaSave: () => ''
}
