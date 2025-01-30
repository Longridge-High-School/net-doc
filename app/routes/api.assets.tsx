import {type LoaderFunctionArgs, type HeadersArgs} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {createTimings} from '~/lib/utils/timings.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  await time('getUser', 'Get User', () =>
    ensureUser(request, 'asset-manager:list', {})
  )

  const prisma = getPrisma()

  const assets = await time('getAssets', 'Get Asset', () =>
    prisma.asset.findMany({orderBy: {name: 'asc'}})
  )

  return Response.json({assets}, {headers: headers()})
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}
