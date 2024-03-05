import {type LoaderFunctionArgs, json} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {getCryptoSuite} from '~/lib/crypto.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:get', {
    passwordId: params.password
  })

  const prisma = getPrisma()

  const password = await prisma.password.findFirstOrThrow({
    where: {id: params.password}
  })

  await prisma.passwordView.create({
    data: {userId: user.id, passwordId: password.id}
  })

  const {decrypt} = await getCryptoSuite()

  return json({password: decrypt(password.password)})
}
