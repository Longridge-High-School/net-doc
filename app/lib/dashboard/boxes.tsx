import React from 'react'

import {recentDocumentsBox} from './recent-documents'

export type DashboardBoxFn<Data> = {
  loader: (meta: string) => Promise<Data>
  render: (data: Data) => JSX.Element
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
  recentDocuments: recentDocumentsBox
}
