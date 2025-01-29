import {getApproachingDates} from '@prisma/client/sql'
import {Prisma} from '@prisma/client'

import {type DashboardBoxFnHandlers} from './boxes.server'
import {type ApproachingDatesData} from './approaching-dates'

import {getPrisma} from '../prisma.server'

const loader: DashboardBoxFnHandlers<ApproachingDatesData>['loader'] = async (
  meta,
  userId,
  userRole
) => {
  const {fieldId} = JSON.parse(meta)
  const prisma = getPrisma()

  const values = await prisma.$queryRawTyped(
    getApproachingDates(fieldId, userRole, userId)
  )

  return values as unknown as Array<{
    id: string
    value: string
    slug: string
    name: string
    icon: string
  }>
}

export const approachingDatesHandlers = {loader}
