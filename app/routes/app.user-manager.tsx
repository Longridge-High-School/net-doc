import {Outlet, useMatches} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {Header} from '~/lib/components/header'

const UserManager = () => {
  const matches = useMatches()

  const actions = () => {
    const {id, params} = matches.pop()!

    invariant(id)
    invariant(params)

    switch (id) {
      case 'routes/app.user-manager._index':
        return [
          {
            link: '/app/user-manager/add',
            label: 'Add User',
            className: 'bg-success'
          }
        ]
      default:
        return []
    }
  }

  return (
    <div>
      <Header title="User Manager" actions={actions()} />
      <Outlet />
    </div>
  )
}

export default UserManager
