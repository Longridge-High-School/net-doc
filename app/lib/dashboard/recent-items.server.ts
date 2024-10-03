import {getRecentItems} from '@prisma/client/sql'

import {type DashboardBoxFnHandlers} from './boxes.server'
import {type RecentItemsData} from './recent-items'

import {getPrisma} from '../prisma.server'

const loader: DashboardBoxFnHandlers<RecentItemsData>['loader'] = async (
  meta,
  userId
) => {
  const prisma = getPrisma()

  const recentItems = await prisma.$queryRawTyped(getRecentItems(userId))

  return {recentItems}
}

export const recentItemsBoxHandlers = {loader}
