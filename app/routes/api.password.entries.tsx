import {type LoaderFunctionArgs, type HeadersArgs, json} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {createTimings} from '~/lib/utils/timings.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  await time('getuser', 'Get User', () =>
    ensureUser(request, 'password:view', {})
  )

  const prisma = getPrisma()

  const passwords = await time('getPasswords', 'Get Passwords', () =>
    prisma.password.findMany({orderBy: {title: 'asc'}})
  )

  const entries = passwords.map(({id, title}) => {
    return {entryId: id, value: title}
  })

  return json(
    {
      asset: {id: 'passwords', slug: 'passwords', icon: '🔒'},
      entries
    },
    {headers: headers()}
  )
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}
