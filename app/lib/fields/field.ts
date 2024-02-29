import {markdownField} from './markdown'
import {relationField} from './relation'
import {selectField} from './select'
import {textField} from './text'

export type Field<ValueType> = {
  /** The Component rendered in the asset editor */
  editComponent: ({
    value,
    name,
    label,
    helperText,
    meta
  }: {
    /** The cureent value of the field from the database */
    value: string
    name: string
    label: string
    helperText: string
    meta: string
  }) => JSX.Element
  viewComponent: ({
    value,
    title,
    meta
  }: {
    value: string
    title: string
    meta: string
  }) => JSX.Element
  valueSetter: (data: FormData, name: string) => string | Promise<string>
  valueGetter: (data: string) => ValueType | Promise<ValueType>
  metaComponent: ({meta}: {meta: string}) => JSX.Element
  metaSave: (data: FormData) => string
}

export const FIELD_TYPES = ['text', 'select', 'relation', 'markdown'] as const

export const FIELDS: {[type: string]: Field<string>} = {
  markdown: markdownField,
  relation: relationField,
  select: selectField,
  text: textField
}
