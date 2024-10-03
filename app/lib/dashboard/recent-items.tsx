import {type DashboardBoxFn, DashboardBox} from './boxes'

export type RecentItemsData = {
  recentItems: Array<{
    target: string
    targetId: string
    icon: string | null
    name: string | null
    RecentItemId: string
  }>
}

export const recentItemsBox: DashboardBoxFn<RecentItemsData> = {
  render: ({recentItems}) => {
    return (
      <DashboardBox title="Recent Items">
        {recentItems.map(({RecentItemId, targetId, target, name, icon}) => {
          return (
            <a
              key={RecentItemId}
              className="mt-2 block"
              href={`/app/${target}/${targetId}`}
            >
              {icon} {name}
              <br />
              <span className="text-sm text-gray-400"></span>
            </a>
          )
        })}
      </DashboardBox>
    )
  },
  metaComponent: (meta, id) => (
    <div>
      <i>Recent Items has no options</i>
      <input type="hidden" name={id} value="{}" />
      <input type="hidden" name={`${id}-type`} value="recentItems" />
    </div>
  )
}
