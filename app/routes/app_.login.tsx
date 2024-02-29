import {
  type ActionFunctionArgs,
  type MetaFunction,
  json,
  redirect
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {Button, AButton} from '~/lib/components/button'
import {Label, Input} from '~/lib/components/input'

import {getPrisma} from '~/lib/prisma.server'

import {checkPassword} from '~/lib/user.server'

import {session} from '~/lib/cookies'

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData()

  const email = formData.get('email') as string | undefined
  const password = formData.get('password') as string | undefined

  invariant(email)
  invariant(password)

  const prisma = getPrisma()

  const user = await prisma.user.findFirst({where: {email}})

  if (!user) {
    return json({error: 'User not found.'})
  }

  if (!(await checkPassword(password, user.passwordHash))) {
    return json({error: 'Pasword does not match.'})
  }

  const newSession = await prisma.session.create({
    data: {userId: user.id, ip: '0.0.0.0'}
  })

  return redirect('/app', {
    headers: {'Set-Cookie': await session.serialize(newSession.id)}
  })
}

export const meta: MetaFunction = () => {
  return [{title: 'Login'}]
}

const DashboardLogin = () => {
  return (
    <div className="w-96 m-auto mt-32">
      <h1 className="text-4xl text-center mb-8">Login</h1>
      <div className="bg-white rounded-xl shadow-xl p-2">
        <form method="post">
          <Label>
            Email
            <Input name="email" type="email" />
          </Label>
          <Label>
            Password
            <Input name="password" type="password" />
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <AButton className="bg-gray-100 text-center" href="/">
              Back
            </AButton>
            <Button className="bg-success">Login</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DashboardLogin
