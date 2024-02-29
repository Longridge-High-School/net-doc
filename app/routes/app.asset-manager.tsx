import {Outlet} from '@remix-run/react'

import {Header} from '~/lib/components/header'

const AssetManager = () => {
  return (
    <div>
      <Header title="Asset Manager" />
      <Outlet />
    </div>
  )
}

export default AssetManager
