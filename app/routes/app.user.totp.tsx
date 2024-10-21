import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json
} from '@remix-run/node'
import {useLoaderData, useActionData} from '@remix-run/react'
import {invariant, omit} from '@arcath/utils'
import {generateTOTP, getTOTPAuthUri, verifyTOTP} from '@epic-web/totp'
import {toDataURL} from 'qrcode'
import {useState} from 'react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Label, Input} from '~/lib/components/input'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
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

  const genTotp = await generateTOTP()
  const otpUri = getTOTPAuthUri({
    ...genTotp,
    algorithm: 'SHA1',
    accountName: totp.email,
    issuer: 'Net-Doc'
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

export const meta: MetaFunction = () => {
  return [{title: pageTitle('User', '2FA Setup')}]
}

const UserTOTP = () => {
  const {state, dataURL, genTotp} = useLoaderData<typeof loader>()
  const data = useActionData<typeof action>()
  const [open, setOpen] = useState(false)

  if (data) {
    if (data.result) {
      return <div className="entry">2FA Setup!</div>
    }

    return <div className="entry">2FA Setup Error</div>
  }

  if (state) {
    return (
      <div className="entry">
        <h2>2FA</h2>
        <p>2FA is Setup on your account.</p>
        {open ? (
          <div>
            <img src={dataURL} alt="2FA QR Code" />
            <form method="POST">
              <Label>
                Verification Code
                <Input name="verify" />
              </Label>
              <input
                type="hidden"
                name="totp"
                value={JSON.stringify(genTotp)}
              />
              <Button className="bg-success">Replace 2FA</Button>
              <Button
                onClick={() => setOpen(false)}
                type="button"
                className="bg-danger"
              >
                Cancel
              </Button>
            </form>
          </div>
        ) : (
          <div>
            <Button
              onClick={() => {
                setOpen(true)
              }}
              className="bg-info"
            >
              Replace Authenticator
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="entry">
      <h2>2FA Setup</h2>
      <img src={dataURL} alt="2FA QR Code" />
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
