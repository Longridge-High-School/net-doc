import {type DashboardBoxFn, DashboardBox} from './boxes'

import {getPrisma} from '../prisma.server'
import {formatAsDate} from '../utils/format'

export const recentDocumentsBox: DashboardBoxFn<
  Array<{id: string; title: string; updatedAt: Date}>
> = {
  loader: async meta => {
    const prisma = getPrisma()

    const recentDocuments = await prisma.document.findMany({
      orderBy: {updatedAt: 'desc'},
      take: 5
    })

    return recentDocuments
  },
  render: documents => {
    return (
      <DashboardBox title="Recent Documents">
        {documents.map(({id, title, updatedAt}) => {
          return (
            <a key={id} className="mt-2 block" href={`/app/documents/${id}`}>
              {title}
              <br />
              <span className="text-sm text-gray-400">
                {formatAsDate(updatedAt as unknown as string)}
              </span>
            </a>
          )
        })}
      </DashboardBox>
    )
  },
  metaComponent: (meta, id) => (
    <div>
      <i>Recent Documents has no options</i>
      <input type="hidden" name={id} value="{}" />
      <input type="hidden" name={`${id}-type`} value="recentDocuments" />
    </div>
  )
}
