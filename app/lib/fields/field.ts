import {type ReactElement} from 'react'

import {attachmentField} from './attachment'
import {dateField} from './date'
import {imageField} from './image'
import {linkField} from './link'
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
  }) => ReactElement
  viewComponent: ({
    value,
    title,
    meta
  }: {
    value: string
    title: string
    meta: string
  }) => ReactElement
  listComponent: ({
    value,
    title,
    meta
  }: {
    value: string
    title: string
    meta: string
  }) => ReactElement
  metaComponent: ({meta}: {meta: string}) => ReactElement
}

export const FIELD_TYPES = [
  'text',
  'select',
  'relation',
  'markdown',
  'date',
  'image',
  'link'
] as const

export const FIELDS: {[type: string]: Field} = {
  attachment: attachmentField,
  date: dateField,
  image: imageField,
  link: linkField,
  markdown: markdownField,
  relation: relationField,
  select: selectField,
  text: textField
}
