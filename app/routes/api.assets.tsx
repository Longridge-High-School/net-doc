import {type LoaderFunctionArgs, json} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  await ensureUser(request, 'asset-manager:list', {})

  const prisma = getPrisma()

  const assets = await prisma.asset.findMany({orderBy: {name: 'asc'}})

  return json({assets})
}
