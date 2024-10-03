import React from 'react'

import {approachingDatesBox} from './approaching-dates'
import {pinnedItemsBox} from './pinned-items'
import {recentChangesBox} from './recent-changes'
import {recentDocumentsBox} from './recent-documents'
import {recentItemsBox} from './recent-items'
import {statsBox} from './stats'

export type DashboardBoxFn<Data> = {
  render: (data: Data, meta: string) => JSX.Element
  metaComponent: (meta: string, id: string) => JSX.Element
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
  pinnedItems: pinnedItemsBox,
  recentChanges: recentChangesBox,
  recentDocuments: recentDocumentsBox,
  recentItems: recentItemsBox,
  stats: statsBox
}
