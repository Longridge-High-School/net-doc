import {approachingDatesHandlers} from './approaching-dates.server'
import {pinnedItemsBoxHandlers} from './pinned-items.server'
import {recentChangesHandlers} from './recent-changes.sever'
import {recentDocumentsHandlers} from './recent-documents.server'
import {statsHandlers} from './stats.server'

export type DashboardBoxFnHandlers<Data> = {
  loader: (meta: string, userId: string) => Promise<Data>
}

export const BOXES_HANDLERS = {
  approachingDates: approachingDatesHandlers,
  pinnedItems: pinnedItemsBoxHandlers,
  recentChanges: recentChangesHandlers,
  recentDocuments: recentDocumentsHandlers,
  stats: statsHandlers
}
