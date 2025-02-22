import {type LoaderFunctionArgs, redirect} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  await ensureUser(request, 'group-manager:edit', {
    userId: params.user
  })

  const prisma = getPrisma()

  const group = await prisma.group.findFirstOrThrow({
    where: {id: params.group}
  })

  const user = await prisma.user.findFirstOrThrow({
    where: {id: params.user},
    include: {groups: true}
  })

  if (user.groups.length > 1) {
    await prisma.groupMembership.deleteMany({
      where: {groupId: group.id, userId: user.id}
    })
  }

  return redirect(`/app/groups-manager/${group.id}`)
}
