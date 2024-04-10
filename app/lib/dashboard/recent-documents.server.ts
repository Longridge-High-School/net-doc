import {type DashboardBoxFnHandlers} from './boxes.server'
import {type RecentDocumentsData} from './recent-documents'

import {getPrisma} from '../prisma.server'

const loader: DashboardBoxFnHandlers<RecentDocumentsData>['loader'] =
  async meta => {
    const prisma = getPrisma()

    const recentDocuments = await prisma.document.findMany({
      orderBy: {updatedAt: 'desc'},
      take: 5
    })

    return recentDocuments as unknown as Array<{
      id: string
      title: string
      updatedAt: string
    }>
  }

export const recentDocumentsHandlers = {loader}
