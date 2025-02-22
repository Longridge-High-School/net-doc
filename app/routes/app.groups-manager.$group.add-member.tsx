import {type ActionFunctionArgs, redirect} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'group-manager:edit', {
    groupId: params.group
  })

  const prisma = getPrisma()

  const formData = await request.formData()

  const userId = formData.get('userId') as string | undefined

  invariant(userId)

  const group = await prisma.group.findFirstOrThrow({
    where: {id: params.group}
  })

  await prisma.groupMembership.create({data: {userId, groupId: group.id}})

  return redirect(`/app/groups-manager/${group.id}`)
}
