import {type LoaderFunctionArgs, redirect} from '@remix-run/node'

import {session} from '~/lib/cookies'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get('Cookie')
  const cookie = await session.parse(cookieHeader)

  if (!cookie) {
    return redirect('/app/login')
  }

  return redirect('/app')
}
