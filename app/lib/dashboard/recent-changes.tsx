import {type DashboardBoxFn, DashboardBox} from './boxes'

import {formatAsDate} from '../utils/format'

export type RecentChangesData = Array<{
  slug: string
  id: string
  name: string
  updatedAt: string
  icon: string
}>

export const recentChangesBox: DashboardBoxFn<RecentChangesData> = {
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
