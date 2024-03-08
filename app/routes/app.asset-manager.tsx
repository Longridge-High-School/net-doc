import {Outlet, useMatches} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {Header} from '~/lib/components/header'

const AssetManager = () => {
  const matches = useMatches()

  const actions = () => {
    const {id, params} = matches.pop()!

    invariant(id)
    invariant(params)

    switch (id) {
      case 'routes/app.asset-manager._index':
        return [
          {
            label: 'Add Asset',
            link: '/app/asset-manager/add',
            className: 'bg-success'
          }
        ]
      case 'routes/app.asset-manager.$asset':
        return [
          {
            label: 'Edit Asset',
            link: `/app/asset-manager/${params.asset}/edit`,
            className: 'bg-info'
          }
        ]
      default:
        return []
    }
  }
  return (
    <div>
      <Header title="Asset Manager" actions={actions()} />
      <Outlet />
    </div>
  )
}

export default AssetManager
