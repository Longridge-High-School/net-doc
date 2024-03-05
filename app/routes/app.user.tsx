import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect
} from '@remix-run/node'
import {useLoaderData, Outlet} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {Header} from '~/lib/components/header'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'user-manager:edit', {
    userId: params.user
  })

  return json({user})
}

const User = () => {
  const {user} = useLoaderData<typeof loader>()

  return (
    <div>
      <Header title={user.name} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <a href="/app/user/totp">2FA Setup</a>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default User
