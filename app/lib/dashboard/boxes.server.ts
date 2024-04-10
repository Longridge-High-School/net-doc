import {approachingDatesHandlers} from './approaching-dates.server'
import {recentChangesHandlers} from './recent-changes.sever'
import {recentDocumentsHandlers} from './recent-documents.server'
import {statsHandlers} from './stats.server'

export type DashboardBoxFnHandlers<Data> = {
  loader: (meta: string) => Promise<Data>
}

export const BOXES_HANDLERS = {
  approachingDates: approachingDatesHandlers,
  recentChanges: recentChangesHandlers,
  recentDocuments: recentDocumentsHandlers,
  stats: statsHandlers
}
