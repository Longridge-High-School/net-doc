import {type LoaderFunctionArgs, json} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  await ensureUser(request, 'field-manager:list', {})

  const prisma = getPrisma()

  const fields = await prisma.field.findMany({orderBy: {name: 'asc'}})

  return json({fields})
}
