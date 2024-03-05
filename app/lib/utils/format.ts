import {format} from 'date-fns'

export const formatAsDateTime = (ts: string) => {
  return format(new Date(ts), 'KK:mm EEEE do yyyy')
}
