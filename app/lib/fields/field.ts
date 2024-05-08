import {attachmentField} from './attachment'
import {dateField} from './date'
import {imageField} from './image'
import {markdownField} from './markdown'
import {relationField} from './relation'
import {selectField} from './select'
import {textField} from './text'

export type Field = {
  /** The Component rendered in the asset editor */
  editComponent: ({
    value,
    name,
    label,
    helperText,
    meta,
    validation
  }: {
    /** The curent value of the field from the database */
    value: string
    name: string
    label: string
    helperText: string
    meta: string
    validation: {required: boolean}
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
  listComponent: ({
    value,
    title,
    meta
  }: {
    value: string
    title: string
    meta: string
  }) => JSX.Element
  metaComponent: ({meta}: {meta: string}) => JSX.Element
}

export const FIELD_TYPES = [
  'text',
  'select',
  'relation',
  'markdown',
  'date',
  'image'
] as const

export const FIELDS: {[type: string]: Field} = {
  attachment: attachmentField,
  date: dateField,
  image: imageField,
  markdown: markdownField,
  relation: relationField,
  select: selectField,
  text: textField
}
