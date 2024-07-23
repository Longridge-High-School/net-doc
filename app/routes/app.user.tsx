import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
  ActionFunction
} from '@remix-run/node'
import {useLoaderData, Outlet, useActionData} from '@remix-run/react'
import {useQueryClient} from '@tanstack/react-query'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {Header} from '~/lib/components/header'
import {pageTitle} from '~/lib/utils/page-title'
import {Button, LinkButton} from '~/lib/components/button'
import {useNotify} from '~/lib/hooks/use-notify'
import {Input, Label} from '~/lib/components/input'
import {getPrisma} from '~/lib/prisma.server'
import {hashPassword} from '~/lib/user.server'
import {FlashMessage} from '~/lib/components/flash'
import {formatAsDateTime} from '~/lib/utils/format'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const sessionUser = await ensureUser(request, 'user:self', {})

  const prisma = getPrisma()

  const user = await prisma.user.findFirstOrThrow({where: {id: sessionUser.id}})

  const sessions = await prisma.session.findMany({
    where: {userId: user.id},
    orderBy: {updatedAt: 'desc'}
  })

  return json({user, sessions, currentSession: sessionUser.sessionId})
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('User')}]
}

export const action: ActionFunction = async ({request}) => {
  const currentUser = await ensureUser(request, 'user:edit', {})

  const prisma = getPrisma()
  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const email = formData.get('email') as string | undefined

  invariant(name)
  invariant(email)

  await prisma.user.update({where: {id: currentUser.id}, data: {name, email}})

  const newPassword = formData.get('new-password') as string | undefined
  const confirmNewPassword = formData.get('confirm-new-password') as
    | string
    | undefined

  if (newPassword && newPassword !== '') {
    if (newPassword === confirmNewPassword) {
      const hashedPassword = await hashPassword(newPassword)

      await prisma.user.update({
        where: {id: currentUser.id},
        data: {passwordHash: hashedPassword}
      })
    } else {
      return json({
        message: 'New password and confirmation did not match',
        type: 'bg-danger'
      })
    }
  }

  return json({message: 'Account updated', type: 'bg-success'})
}

const User = () => {
  const {user, sessions, currentSession} = useLoaderData<typeof loader>()
  const queryClient = useQueryClient()
  const {notify} = useNotify()
  const data = useActionData<typeof action>()

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

          <div className="entry mt-4">
            <h2>User Settings</h2>
            {data && data.message ? (
              <FlashMessage message={data.message} className={data.type} />
            ) : (
              ''
            )}
            <form method="POST">
              <Label>
                Email
                <Input type="email" name="email" defaultValue={user.email} />
              </Label>
              <Label>
                Name
                <Input name="name" defaultValue={user.name} />
              </Label>
              <Label>
                New Password
                <Input name="new-password" type="password" />
              </Label>
              <Label>
                Confirm New Password
                <Input name="confirm-new-password" type="password" />
              </Label>
              <Button className="bg-success">Update Account</Button>
            </form>
          </div>
          <div className="entry mt-4">
            <h2>Sessions</h2>
            {sessions.map(({id, ip, updatedAt}) => {
              return (
                <div key={id} className="mt-2 block">
                  {ip}{' '}
                  {id === currentSession ? (
                    '(current)'
                  ) : (
                    <button
                      onClick={async () => {
                        await fetch(`/api/session/${id}/delete`, {
                          method: 'post'
                        })
                        notify({
                          title: 'Session Deleted',
                          type: 'success',
                          message:
                            'Session has been deleted, anyone using it will have been logged out.'
                        })
                      }}
                    >
                      🗑️
                    </button>
                  )}
                  <br />
                  <span className="text-sm text-gray-400">
                    {formatAsDateTime(updatedAt)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default User
