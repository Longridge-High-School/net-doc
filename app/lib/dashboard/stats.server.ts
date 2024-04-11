import {type DashboardBoxFnHandlers} from './boxes.server'
import {type StatsData} from './stats'

import {getPrisma} from '../prisma.server'

const loader: DashboardBoxFnHandlers<StatsData>['loader'] = async () => {
  const prisma = getPrisma()

  const counts = await prisma.$queryRaw<
    Array<{
      fields: bigint
      assets: bigint
      entries: bigint
      values: bigint
      documents: bigint
      passwords: bigint
    }>
  >`SELECT (SELECT count(*) FROM Field) as fields, (SELECT count(*) FROM Asset) as assets, (SELECT count(*) FROM Entry) as entries, (SELECT count(*) FROM Value) as "values", (SELECT count(*) from Document) as documents, (SELECT count(*) FROM Password) as passwords`

  // Prisma returns counts as BigInts which the JSON serialiser doesn't work with.
  return {
    fields: parseInt(counts[0].fields.toString()),
    assets: parseInt(counts[0].assets.toString()),
    entries: parseInt(counts[0].entries.toString()),
    values: parseInt(counts[0].values.toString()),
    documents: parseInt(counts[0].documents.toString()),
    passwords: parseInt(counts[0].passwords.toString())
  }
}

export const statsHandlers = {loader}
