import {attachmentFieldHandlers} from './attachment.server'
import {dateFieldHandlers} from './date.server'
import {imageFieldHandlers} from './image.server'
import {markdownFieldHandlers} from './markdown.server'
import {relationFieldHandlers} from './relation.server'
import {selectFieldHandlers} from './select.server'
import {textFieldHandlers} from './text.server'

export type FieldHandlers = {
  valueSetter: (
    data: FormData,
    name: string,
    currentValue: string
  ) => string | Promise<string>
  valueGetter: (data: string) => string | Promise<string>
  metaSave: (data: FormData) => string
}

export const FIELD_HANDLERS: {[type: string]: FieldHandlers} = {
  attachment: attachmentFieldHandlers,
  date: dateFieldHandlers,
  image: imageFieldHandlers,
  markdown: markdownFieldHandlers,
  relation: relationFieldHandlers,
  select: selectFieldHandlers,
  text: textFieldHandlers
}
