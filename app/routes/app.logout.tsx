import {
  redirect,
  type LoaderFunctionArgs,
  type HeadersArgs
} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {session} from '~/lib/cookies'
import {getPrisma} from '~/lib/prisma.server'
import {createTimings} from '~/lib/utils/timings.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {time, getHeader} = createTimings()

  const {sessionId} = await time('getSession', 'Get Session', () =>
    ensureUser(request, 'logout', {})
  )

  const prisma = getPrisma()

  await time('deleteSession', 'Delete Session', () =>
    prisma.session.delete({where: {id: sessionId}})
  )

  return redirect(`/app/login`, {
    headers: {
      'Set-Cookie': await session.serialize('', {
        maxAge: 1
      }),
      'Server-Timing': getHeader()
    }
  })
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}
