import {type DashboardBoxFnHandlers} from './boxes.server'
import {type RecentChangesData} from './recent-changes'

import {getPrisma} from '../prisma.server'

const loader: DashboardBoxFnHandlers<RecentChangesData>['loader'] =
  async meta => {
    const prisma = getPrisma()

    const recentChanges =
      (await prisma.$queryRaw`SELECT Entry.id, Entry.updatedAt, Value.value as name, Asset.slug, Asset.icon FROM Entry 
    INNER JOIN Value value ON fieldId = (SELECT nameFieldId from Asset WHERE Asset.id = Entry.assetId) AND entryId = Entry.id
    INNER JOIN Asset ON Asset.id = Entry.assetId
WHERE deleted = false 
ORDER BY Entry.updatedAt DESC
LIMIT 5`) as Array<{
        slug: string
        id: string
        name: string
        updatedAt: string
        icon: string
      }>

    return recentChanges
  }

export const recentChangesHandlers = {loader}
