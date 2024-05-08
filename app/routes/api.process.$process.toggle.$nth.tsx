import {type LoaderFunctionArgs, type HeadersArgs, json} from '@remix-run/node'
import {type Entry} from '@prisma/client'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

import {createTimings} from '~/lib/utils/timings.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  await time('getUser', 'Get User', () =>
    ensureUser(request, 'process:write', {
      process: params.process
    })
  )

  const prisma = getPrisma()

  const process = await prisma.process.findFirstOrThrow({
    where: {id: params.process}
  })

  let nth = -1
  process.body = process.body.replace(/- \[.\]/g, match => {
    nth++

    if (nth === parseInt(params.nth!) && match === '- [ ]') {
      return '- [x]'
    }

    if (nth === parseInt(params.nth!) && match === '- [x]') {
      return '- [ ]'
    }

    return match
  })

  await prisma.process.update({
    where: {id: params.process},
    data: {body: process.body}
  })

  return json({body: process.body}, {headers: headers()})
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}
