import {Outlet} from '@remix-run/react'

import {Header} from '~/lib/components/header'

const Passwords = () => {
  return (
    <div>
      <Header title="Passwords" />
      <Outlet />
    </div>
  )
}

export default Passwords
