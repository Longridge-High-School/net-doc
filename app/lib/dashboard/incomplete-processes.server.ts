import {getIncompleteProcesses} from '@prisma/client/sql'

import {type DashboardBoxFnHandlers} from './boxes.server'
import {type IncompleteProcessesData} from './incomplete-processes'

import {getPrisma} from '../prisma.server'

const loader: DashboardBoxFnHandlers<IncompleteProcessesData>['loader'] =
  async (meta, userId, userRole) => {
    const prisma = getPrisma()

    const incompleteProcesses = await prisma.$queryRawTyped(
      getIncompleteProcesses(userRole, userId)
    )

    return incompleteProcesses as unknown as Array<{
      id: string
      title: string
      updatedAt: string
    }>
  }

export const incompleteProcessesHandlers = {loader}
