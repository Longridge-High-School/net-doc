import {Outlet, useMatches} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {Header} from '~/lib/components/header'

import {useNotify} from '~/lib/hooks/use-notify'

const Passwords = () => {
  const matches = useMatches()
  const {notify} = useNotify()

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
          },
          {
            link: '#',
            label: '📌',
            className: 'bg-info',
            action: async () => {
              const response = await fetch('/api/pin', {
                method: 'POST',
                body: JSON.stringify({
                  target: 'passwords',
                  targetId: params.password
                })
              })

              const {result} = await response.json()

              if (!result) {
                notify({
                  title: 'Error',
                  type: 'danger',
                  message: 'Unable to pin/unpin'
                })

                return
              }

              if (result === 'remove') {
                notify({
                  title: 'Pin Removed',
                  type: 'info',
                  message: 'Password un pinned.'
                })

                return
              }

              notify({
                title: 'Pin Added',
                type: 'success',
                message: 'Password pinned.'
              })
            }
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
