import {type LoaderFunctionArgs, redirect} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  await ensureUser(request, 'document:view', {
    documentId: params.document
  })

  const prisma = getPrisma()

  const document = await prisma.document.findFirstOrThrow({
    where: {id: params.document}
  })
  const process = await prisma.process.create({
    data: {title: document.title, body: document.body, aclId: document.aclId}
  })

  return redirect(`/app/process/${process.id}`)
}
