import {Outlet} from '@remix-run/react'

import {Header} from '~/lib/components/header'

const UserManager = () => {
  return (
    <div>
      <Header title="User Manager" />
      <Outlet />
    </div>
  )
}

export default UserManager
