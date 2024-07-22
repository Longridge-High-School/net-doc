import {type ActionFunctionArgs, type HeadersArgs, json} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {createTimings} from '~/lib/utils/timings.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {time, headers} = createTimings()

  const user = await time(
    'getUser',
    'Get User',
    async () => await ensureUser(request, 'pin:create', {targetId: ''})
  )

  const prisma = getPrisma()

  const {target, targetId} = await request.json()

  invariant(target)
  invariant(targetId)

  const existing = await time('getPin', 'Check for exisiting pin', async () =>
    prisma.pin.findFirst({
      where: {userId: user.id, target, targetId}
    })
  )

  if (existing) {
    await time('deletePin', 'Delete existing pin', async () =>
      prisma.pin.deleteMany({where: {userId: user.id, target, targetId}})
    )

    return json({pinId: '', result: 'remove'}, {headers: headers()})
  }

  const pin = await time('createPin', 'Create new pin', async () =>
    prisma.pin.create({
      data: {userId: user.id, target, targetId}
    })
  )

  return json({pinId: pin.id, result: 'add'}, {headers: headers()})
}

export const headers = ({actionHeaders}: HeadersArgs) => {
  return actionHeaders
}
