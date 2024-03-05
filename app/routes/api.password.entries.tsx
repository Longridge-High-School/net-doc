import {type LoaderFunctionArgs, json} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  await ensureUser(request, 'password:view', {})

  const prisma = getPrisma()

  const passwords = await prisma.password.findMany({orderBy: {title: 'asc'}})

  const entries = passwords.map(({id, title}) => {
    return {entryId: id, value: title}
  })

  return json({
    asset: {id: 'passwords', slug: 'passwords', icon: '🔒'},
    entries
  })
}
