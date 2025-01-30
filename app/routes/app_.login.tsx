import {
  type ActionFunctionArgs,
  type MetaFunction,
  type HeadersArgs,
  data,
  redirect
} from '@remix-run/node'
import {useActionData} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import {verifyTOTP} from '@epic-web/totp'

import {Button} from '~/lib/components/button'
import {Label, Input} from '~/lib/components/input'
import {FlashMessage} from '~/lib/components/flash'

import {getPrisma} from '~/lib/prisma.server'
import {checkPassword} from '~/lib/user.server'
import {createTimings} from '~/lib/utils/timings.server'

import {getSession, commitSession} from '~/lib/cookies'

export const action = async ({request}: ActionFunctionArgs) => {
  const {time, getHeader, headers} = createTimings()

  const formData = await request.formData()

  const email = formData.get('email') as string | undefined
  const password = formData.get('password') as string | undefined
  const otp = formData.get('otp') as string | null

  invariant(email)
  invariant(password)

  const prisma = getPrisma()

  const user = await time('getUser', 'Get user', () =>
    prisma.user.findFirst({
      select: {
        id: true,
        passwordHash: true,
        totpSecret: true,
        totpAlgorithm: true,
        totpDigits: true,
        totpPeriod: true
      },
      where: {email}
    })
  )

  if (!user) {
    return data(
      {
        error: 'User not found.',
        twoFactor: false,
        email: '',
        password: ''
      },
      {headers: headers()}
    )
  }

  if (!(await checkPassword(password, user.passwordHash))) {
    return data(
      {
        error: 'Pasword does not match.',
        twoFactor: false,
        email,
        password: ''
      },
      {headers: headers()}
    )
  }

  if (user.totpSecret !== '' && otp === null) {
    return data(
      {twoFactor: true, error: false, email, password},
      {headers: headers()}
    )
  }

  if (user.totpSecret !== '' && otp !== null) {
    const opts = {
      otp,
      secret: user.totpSecret,
      algorithm: user.totpAlgorithm === 'SHA1' ? 'SHA-1' : user.totpAlgorithm,
      digits: user.totpDigits,
      period: user.totpPeriod
    }

    const result = (await verifyTOTP(opts)) !== null

    if (!result) {
      return data(
        {
          twoFactor: true,
          error: '2FA verification failed.',
          email,
          password: ''
        },
        {headers: headers()}
      )
    }
  }

  const newSession = await time('createSession', 'Create Session', () =>
    prisma.session.create({
      data: {userId: user.id, ip: '0.0.0.0'}
    })
  )

  const session = await getSession(request.headers.get('Cookie'))

  session.set('sessionId', newSession.id)

  return redirect('/app', {
    headers: {
      'Set-Cookie': await commitSession(session),
      'Server-Timing': getHeader()
    }
  })
}

export const meta: MetaFunction = () => {
  return [{title: 'Login'}]
}

export const headers = ({actionHeaders}: HeadersArgs) => {
  return actionHeaders
}

const DashboardLogin = () => {
  const data = useActionData<typeof action>()

  return (
    <div className="w-96 m-auto mt-32">
      <h1 className="text-4xl text-center mb-8">Login</h1>
      <div className="bg-white rounded-xl shadow-xl p-2">
        {data && data.error ? (
          <FlashMessage className="bg-danger" message={data.error as string} />
        ) : (
          ''
        )}
        <form method="post">
          <Label>
            Email
            <Input name="email" type="email" defaultValue={data?.email} />
          </Label>
          <Label>
            Password
            <Input
              name="password"
              type="password"
              defaultValue={data?.password}
            />
          </Label>
          {data && data.twoFactor ? (
            <Label>
              2FA Code
              <Input name="otp" />
            </Label>
          ) : (
            ''
          )}
          <div className="grid grid-cols-2 gap-4">
            <Button className="bg-success">Login</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DashboardLogin
