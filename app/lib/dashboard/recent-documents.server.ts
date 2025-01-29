import {getRecentDocuments} from '@prisma/client/sql'

import {type DashboardBoxFnHandlers} from './boxes.server'
import {type RecentDocumentsData} from './recent-documents'

import {getPrisma} from '../prisma.server'

const loader: DashboardBoxFnHandlers<RecentDocumentsData>['loader'] = async (
  meta,
  userId,
  userRole
) => {
  const prisma = getPrisma()

  const recentDocuments = await prisma.$queryRawTyped(
    getRecentDocuments(userRole, userId)
  )

  return recentDocuments as unknown as Array<{
    id: string
    title: string
    updatedAt: string
  }>
}

export const recentDocumentsHandlers = {loader}
