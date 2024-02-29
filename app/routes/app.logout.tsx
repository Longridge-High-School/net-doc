import {redirect, type LoaderFunctionArgs} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {session} from '~/lib/cookies'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {sessionId} = await ensureUser(request, 'logout', {})

  const prisma = getPrisma()

  await prisma.session.delete({where: {id: sessionId}})

  return redirect(`/app/login`, {
    headers: {
      'Set-Cookie': await session.serialize('', {
        maxAge: 1
      })
    }
  })
}
