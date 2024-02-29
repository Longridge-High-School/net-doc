import {session} from '~/lib/cookies'

import {getPrisma} from '../prisma.server'
import {can} from '../rbac'

export const ensureUser = async (
  request: Request,
  canStr: string,
  meta: object | undefined
) => {
  const cookieHeader = request.headers.get('Cookie')
  const cookie = await session.parse(cookieHeader)

  if (!cookie) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const cookieSession = await prisma.session.findFirst({
    where: {id: cookie},
    include: {user: true}
  })

  if (!cookieSession) {
    throw new Response('Access Denied', {
      status: 403
    })
  }

  const result = await can(cookieSession.user.role, canStr, {
    ...meta,
    user: cookieSession.user
  })

  if (!result) {
    throw new Response('Access Denied', {
      status: 403
    })
  }

  return cookieSession.user
}
