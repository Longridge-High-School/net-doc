import {type LoaderFunctionArgs, redirect} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  await ensureUser(request, 'process:view', {
    processId: params.process
  })

  const prisma = getPrisma()

  const process = await prisma.process.update({
    where: {id: params.process},
    data: {complete: true}
  })

  return redirect(`/app/process/${process.id}`)
}
