import {approachingDatesHandlers} from './approaching-dates.server'
import {incompleteProcessesHandlers} from './incomplete-processes.server'
import {pinnedItemsBoxHandlers} from './pinned-items.server'
import {recentChangesHandlers} from './recent-changes.sever'
import {recentDocumentsHandlers} from './recent-documents.server'
import {recentItemsBoxHandlers} from './recent-items.server'
import {statsHandlers} from './stats.server'

export type DashboardBoxFnHandlers<Data> = {
  loader: (meta: string, userId: string, userRole: string) => Promise<Data>
}

export const BOXES_HANDLERS = {
  approachingDates: approachingDatesHandlers,
  incompleteProcesses: incompleteProcessesHandlers,
  pinnedItems: pinnedItemsBoxHandlers,
  recentChanges: recentChangesHandlers,
  recentDocuments: recentDocumentsHandlers,
  recentItems: recentItemsBoxHandlers,
  stats: statsHandlers
}
