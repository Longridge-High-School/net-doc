import {Outlet, useMatches} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {Header} from '~/lib/components/header'

const Passwords = () => {
  const matches = useMatches()

  const actions = () => {
    const {id, params} = matches.pop()!

    invariant(id)
    invariant(params)

    switch (id) {
      case 'routes/app.passwords._index':
        return [
          {
            link: '/app/passwords/add',
            label: 'Add Password',
            className: 'bg-success'
          }
        ]
      case 'routes/app.passwords.$password._index':
        return [
          {
            link: `/app/passwords/${params.password}/edit`,
            label: 'Edit Password',
            className: 'bg-info'
          }
        ]
      default:
        return []
    }
  }

  return (
    <div>
      <Header title="Passwords" actions={actions()} />
      <Outlet />
    </div>
  )
}

export default Passwords
