import {type DashboardBoxFn, DashboardBox} from './boxes'

export type PinsData = {
  pins: Array<{
    target: string
    targetId: string
    icon: string
    name: string
    pinId: string
  }>
}

export const pinnedItemsBox: DashboardBoxFn<PinsData> = {
  render: ({pins}) => {
    return (
      <DashboardBox title="Pinned Items">
        {pins.map(({pinId, targetId, target, name, icon}) => {
          return (
            <a
              key={pinId}
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
      <i>Pins has no options</i>
      <input type="hidden" name={id} value="{}" />
      <input type="hidden" name={`${id}-type`} value="pinnedItems" />
    </div>
  )
}
