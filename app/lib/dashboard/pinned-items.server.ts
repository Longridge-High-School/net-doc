import {type DashboardBoxFnHandlers} from './boxes.server'
import {type PinsData} from './pinned-items'

import {getPrisma} from '../prisma.server'

const loader: DashboardBoxFnHandlers<PinsData>['loader'] = async (
  meta,
  userId
) => {
  const prisma = getPrisma()

  const pins: Array<{
    pinId: string
    target: string
    targetId: string
    name: string
    icon: string
  }> = await prisma.$queryRaw`SELECT Pin.id as pinId, Pin.target, Pin.targetId,
    CASE Pin.target
      WHEN "documents" THEN (SELECT Document.title FROM Document WHERE Document.id = Pin.targetId)
      WHEN "passwords" THEN (SELECT Password.title FROM Password WHERE Password.id = Pin.targetId)
      ELSE (SELECT Value.value FROM Value WHERE Value.fieldId = (SELECT Asset.nameFieldId FROM Asset WHERE Asset.slug = Pin.target) AND Value.entryId = Pin.targetId)
    END AS name,
    CASE Pin.target
      WHEN "documents" THEN "📰"
      WHEN "passwords" THEN "🔐"
      ELSE (SELECT Asset.icon FROM Asset WHERE Asset.slug = Pin.target)
    END AS icon
  FROM Pin WHERE Pin.userId = ${userId} ORDER BY name ASC`

  return {pins}
}

export const pinnedItemsBoxHandlers = {loader}
