import {type LoaderFunctionArgs, json} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'dashboard', {})

  console.log('HIYA')

  return json({user})
}
