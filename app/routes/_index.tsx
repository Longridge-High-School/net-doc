import {type LoaderFunctionArgs, redirect} from '@remix-run/node'

import {getSession} from '~/lib/cookies'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'))

  if (!session) {
    return redirect('/app/login')
  }

  return redirect('/app')
}
