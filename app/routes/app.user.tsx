import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData, Outlet} from '@remix-run/react'
import {useQueryClient} from '@tanstack/react-query'

import {ensureUser} from '~/lib/utils/ensure-user'
import {Header} from '~/lib/components/header'
import {pageTitle} from '~/lib/utils/page-title'
import {Button, LinkButton} from '~/lib/components/button'
import {useNotify} from '~/lib/hooks/use-notify'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'user-manager:edit', {
    userId: params.user
  })

  return json({user})
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('User')}]
}

const User = () => {
  const {user} = useLoaderData<typeof loader>()
  const queryClient = useQueryClient()
  const {notify} = useNotify()

  return (
    <div>
      <Header title={user.name} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <LinkButton
            to="/app/user/totp"
            className="bg-white p-2 border border-gray-300 hover:shadow-none shadow-xl"
          >
            2FA Setup
          </LinkButton>
          <Button
            className="bg-danger"
            onClick={() => {
              queryClient.removeQueries()
              notify({
                title: 'Cache Cleared',
                message: 'Your React-Query cache has been cleared',
                type: 'danger'
              })
            }}
          >
            Clear React-Query Cache
          </Button>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default User
