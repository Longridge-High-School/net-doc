import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect
} from '@remix-run/node'
import {useLoaderData, useActionData} from '@remix-run/react'
import {invariant, omit} from '@arcath/utils'
import {generateTOTP, getTOTPAuthUri, verifyTOTP} from '@epic-web/totp'
import {toDataURL} from 'qrcode'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Label, Input, Select} from '~/lib/components/input'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const currentUser = await ensureUser(request, 'user:edit', {})

  const prisma = getPrisma()

  const totp = await prisma.user.findFirstOrThrow({
    select: {
      id: true,
      email: true,
      totpSecret: true,
      totpDigits: true,
      totpAlgorithm: true,
      totpPeriod: true
    },
    where: {id: currentUser.id}
  })

  const state = totp.totpSecret !== ''

  const genTotp = generateTOTP()
  const otpUri = getTOTPAuthUri({
    ...genTotp,
    accountName: totp.email,
    issuer: 'Net Doc'
  })
  const dataURL = await toDataURL(otpUri)

  return json({
    currentUser,
    totp,
    state,
    genTotp: omit(genTotp, ['otp']),
    otpUri,
    dataURL
  })
}

export const action = async ({request}: ActionFunctionArgs) => {
  const currentUser = await ensureUser(request, 'user:edit', {})

  const prisma = getPrisma()
  const formData = await request.formData()

  const verify = formData.get('verify') as string | undefined
  const totp = formData.get('totp') as string | undefined

  invariant(verify)
  invariant(totp)

  const totpSettings = JSON.parse(totp)

  const result = verifyTOTP({otp: verify, ...totpSettings}) !== null

  if (result) {
    await prisma.user.update({
      where: {id: currentUser.id},
      data: {
        totpAlgorithm: totpSettings.algorithm,
        totpDigits: totpSettings.digits,
        totpPeriod: totpSettings.period,
        totpSecret: totpSettings.secret
      }
    })
  }

  return json({result})
}

const UserTOTP = () => {
  const {state, dataURL, genTotp} = useLoaderData<typeof loader>()
  const data = useActionData<typeof action>()

  if (data) {
    if (data.result) {
      return <div>2FA Setup!</div>
    }

    return <div>2FA Setup Error</div>
  }

  if (state) {
    return <div>2FA is Setup, Remove?</div>
  }

  return (
    <div>
      <h3>2FA Setup</h3>
      <img src={dataURL} />
      <form method="POST">
        <Label>
          Verification Code
          <Input name="verify" />
        </Label>
        <input type="hidden" name="totp" value={JSON.stringify(genTotp)} />
        <Button className="bg-success">Add 2FA</Button>
      </form>
    </div>
  )
}

export default UserTOTP
