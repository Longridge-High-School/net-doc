import {type LoaderFunctionArgs, type HeadersArgs} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {createTimings} from '~/lib/utils/timings.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  await time('getUser', 'Get User', () =>
    ensureUser(request, 'field-manager:list', {})
  )

  const prisma = getPrisma()

  const fields = await time('getFields', 'Get Fields', () =>
    prisma.field.findMany({orderBy: {name: 'asc'}})
  )

  return Response.json({fields}, {headers: headers()})
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}
