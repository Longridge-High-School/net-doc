import {type LoaderFunctionArgs, type HeadersArgs} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {getCryptoSuite} from '~/lib/crypto.server'
import {createTimings} from '~/lib/utils/timings.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  const user = await time('getUser', 'Get User', () =>
    ensureUser(request, 'password:view', {
      passwordId: params.password
    })
  )

  const prisma = getPrisma()

  const userTotp = await time('checkuserTOTP', 'Check User 2FA', () =>
    prisma.user.findFirstOrThrow({
      where: {id: user.id},
      select: {id: true, totpSecret: true}
    })
  )

  if (userTotp.totpSecret === '') {
    return Response.json(
      {password: "Can't fetch password without 2FA on your account"},
      {headers: headers()}
    )
  }

  const password = await time('getPassword', 'Get Password', async () => {
    return prisma.password.findFirstOrThrow({
      where: {id: params.password}
    })
  })

  await time('createPasswordView', 'Create Password View', () =>
    prisma.passwordView.create({
      data: {userId: user.id, passwordId: password.id}
    })
  )

  const {decrypt} = await time('getCrypto', 'Get Crypto Suite', () =>
    getCryptoSuite()
  )

  const decryptedPassword = await time(
    'decrypt',
    'Decrypt Passwprd',
    () => new Promise(resolve => resolve(decrypt(password.password)))
  )

  return Response.json({password: decryptedPassword})
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}
