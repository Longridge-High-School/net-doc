import {type LoaderFunctionArgs, type HeadersArgs, json} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {createTimings} from '~/lib/utils/timings.server'

import {addJob} from '~/lib/queues.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  const user = await time('getUser', 'Get User', () =>
    ensureUser(request, 'system', {})
  )

  addJob('createBackup', {})

  return json({user}, {headers: headers()})
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}
