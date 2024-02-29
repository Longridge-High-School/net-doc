import {Outlet} from '@remix-run/react'

import {Header} from '~/lib/components/header'

const FieldManager = () => {
  return (
    <div>
      <Header title="Field Manager" />
      <Outlet />
    </div>
  )
}

export default FieldManager
