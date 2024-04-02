import {type LoaderFunctionArgs, type HeadersArgs, json} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {createTimings} from '~/lib/utils/timings.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  await time('getUser', 'Get User', () =>
    ensureUser(request, 'password:list', {})
  )

  const prisma = getPrisma()

  const asset = await time('getAsset', 'Get Asset', () =>
    prisma.asset.findFirstOrThrow({
      where: {id: params.asset},
      include: {assetFields: {include: {field: true}}}
    })
  )

  const passwords = await time('getPasswords', 'Get Passwords', () =>
    prisma.password.findMany({
      select: {id: true, title: true, username: true}
    })
  )

  return json({asset, passwords}, {headers: headers()})
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}
