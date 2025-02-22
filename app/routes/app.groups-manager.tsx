import {Outlet, useMatches} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {Header} from '~/lib/components/header'

const GroupsManager = () => {
  const matches = useMatches()

  const actions = () => {
    const {id, params} = matches.pop()!

    invariant(id)
    invariant(params)

    switch (id) {
      case 'routes/app.groups-manager._index':
        return [
          {
            link: '/app/groups-manager/add',
            label: 'Add Group',
            className: 'bg-success'
          }
        ]
      default:
        return []
    }
  }

  return (
    <div>
      <Header title="Groups Manager" actions={actions()} />
      <Outlet />
    </div>
  )
}

export default GroupsManager
