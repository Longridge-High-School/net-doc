import {type DashboardBoxFn, DashboardBox} from './boxes'

import {getPrisma} from '../prisma.server'
import {formatAsDate} from '../utils/format'
export const recentChangesBox: DashboardBoxFn<
  Array<{
    slug: string
    id: string
    name: string
    updatedAt: string
    icon: string
  }>
> = {
  loader: async () => {
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
  },
  render: documents => {
    return (
      <DashboardBox title="Recent Changes">
        {documents.map(({id, slug, name, updatedAt, icon}) => {
          return (
            <a key={id} className="mt-2 block" href={`/app/${slug}/${id}`}>
              {icon} {name}
              <br />
              <span className="text-sm text-gray-400">
                {formatAsDate(updatedAt)}
              </span>
            </a>
          )
        })}
      </DashboardBox>
    )
  },
  metaComponent: (meta, id) => (
    <div>
      <i>Recent changes has no options</i>
      <input type="hidden" name={id} value="{}" />
      <input type="hidden" name={`${id}-type`} value="recentChanges" />
    </div>
  )
}
