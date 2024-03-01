import {Outlet} from '@remix-run/react'

import {Header} from '~/lib/components/header'

const Documents = () => {
  return (
    <div>
      <Header title="Documents" />
      <Outlet />
    </div>
  )
}

export default Documents
