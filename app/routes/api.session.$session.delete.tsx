import {type ActionFunction} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const action: ActionFunction = async ({request, params}) => {
  await ensureUser(request, 'session:delete', {sessionId: params.session})

  const prisma = getPrisma()

  await prisma.session.delete({where: {id: params.session}})

  return Response.json({})
}
