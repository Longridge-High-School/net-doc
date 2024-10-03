import {getPins} from '@prisma/client/sql'

import {type DashboardBoxFnHandlers} from './boxes.server'
import {type PinsData} from './pinned-items'

import {getPrisma} from '../prisma.server'

const loader: DashboardBoxFnHandlers<PinsData>['loader'] = async (
  meta,
  userId
) => {
  const prisma = getPrisma()

  const pins = await prisma.$queryRawTyped(getPins(userId))

  return {pins}
}

export const pinnedItemsBoxHandlers = {loader}
