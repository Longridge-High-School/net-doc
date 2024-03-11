import {format} from 'date-fns'

export const formatAsDateTime = (ts: string) => {
  return format(new Date(ts), 'HH:mm EEEE do MMMM yyyy')
}

export const formatAsDate = (ts: string) => {
  return format(new Date(ts), 'EEEE do MMMM yyyy')
}
