import React from 'react'

import {approachingDatesBox} from './approaching-dates'
import {incompleteProcessesBox} from './incomplete-processes'
import {pinnedItemsBox} from './pinned-items'
import {recentChangesBox} from './recent-changes'
import {recentDocumentsBox} from './recent-documents'
import {recentItemsBox} from './recent-items'
import {statsBox} from './stats'

export type DashboardBoxFn<Data> = {
  render: (data: Data, meta: string) => React.ReactElement
  metaComponent: (meta: string, id: string) => React.ReactElement
}

export const DashboardBox = ({
  children,
  title
}: React.PropsWithChildren<{title: string}>) => {
  return (
    <div>
      <h3 className="border-b border-b-gray-300">{title}</h3>
      {children}
    </div>
  )
}

export const BOXES = {
  approachingDates: approachingDatesBox,
  incompleteProcesses: incompleteProcessesBox,
  pinnedItems: pinnedItemsBox,
  recentChanges: recentChangesBox,
  recentDocuments: recentDocumentsBox,
  recentItems: recentItemsBox,
  stats: statsBox
}
