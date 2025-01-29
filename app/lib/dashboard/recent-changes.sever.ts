import {getRecentChanges} from '@prisma/client/sql'

import {type DashboardBoxFnHandlers} from './boxes.server'
import {type RecentChangesData} from './recent-changes'

import {getPrisma} from '../prisma.server'

const loader: DashboardBoxFnHandlers<RecentChangesData>['loader'] = async (
  meta,
  userId,
  userRole
) => {
  const prisma = getPrisma()

  const recentChanges = (await prisma.$queryRawTyped(
    getRecentChanges(userRole, userId)
  )) as unknown as Array<{
    slug: string
    id: string
    name: string
    updatedAt: string
    icon: string
  }>

  return recentChanges
}

export const recentChangesHandlers = {loader}
