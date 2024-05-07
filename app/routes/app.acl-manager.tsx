import {Outlet, useMatches} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {Header} from '~/lib/components/header'

const ACLManager = () => {
  const matches = useMatches()

  const actions = () => {
    const {id, params} = matches.pop()!

    invariant(id)
    invariant(params)

    switch (id) {
      case 'routes/app.acl-manager._index':
        return [
          {
            label: 'Add ACL',
            link: '/app/acl-manager/add',
            className: 'bg-success'
          }
        ]
      default:
        return []
    }
  }
  return (
    <div>
      <Header title="ACL Manager" actions={actions()} />
      <Outlet />
    </div>
  )
}

export default ACLManager
