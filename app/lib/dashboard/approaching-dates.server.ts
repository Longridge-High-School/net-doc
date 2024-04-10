import {type DashboardBoxFnHandlers} from './boxes.server'
import {type ApproachingDatesData} from './approaching-dates'

import {getPrisma} from '../prisma.server'

const loader: DashboardBoxFnHandlers<ApproachingDatesData>['loader'] =
  async meta => {
    const {fieldId} = JSON.parse(meta)
    const prisma = getPrisma()

    const values =
      await prisma.$queryRaw<ApproachingDatesData>`SELECT Entry.id, Value.value, Asset.slug, Asset.icon, NameValue.value as name FROM Value 
      INNER JOIN Entry ON Entry.id = Value.entryId
      INNER JOIN Asset ON Asset.id = Entry.assetId
      INNER JOIN Value NameValue ON NameValue.entryId = Entry.id AND NameValue.fieldId = Asset.nameFieldId
      WHERE Value.fieldId = ${fieldId} AND date(Value.value) > date('now')
      ORDER BY Value.value ASC
      LIMIT 5`

    return values
  }

export const approachingDatesHandlers = {loader}
