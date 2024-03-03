import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Label, Input, HelperText, TextArea} from '~/lib/components/input'

import {getCryptoSuite} from '~/lib/crypto.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:add', {})

  return json({user})
}

export const action = async ({request}: ActionFunctionArgs) => {
  await ensureUser(request, 'password:add', {})

  const formData = await request.formData()

  const prisma = getPrisma()
  const {encrypt} = await getCryptoSuite()

  const title = formData.get('title') as string | undefined
  const username = formData.get('username') as string | undefined
  const password = formData.get('password') as string | undefined
  const notes = formData.get('notes') as string | undefined

  invariant(title)
  invariant(password)

  const newPassword = await prisma.password.create({
    data: {
      title,
      username: username ? username : '',
      password: encrypt(password),
      notes: notes ? notes : ''
    }
  })

  return redirect(`/app/passwords/${newPassword.id}`)
}

const PasswordAdd = () => {
  return (
    <div>
      <h2>Add Password</h2>
      <form method="POST">
        <Label>
          Title
          <Input name="title" />
          <HelperText>The title of the Password.</HelperText>
        </Label>
        <Label>
          Username
          <Input name="username" />
          <HelperText>The username (can be blank).</HelperText>
        </Label>
        <Label>
          Password
          <Input name="password" />
          <HelperText>The password.</HelperText>
        </Label>
        <Label>
          Notes
          <TextArea name="notes" className="min-h-[25vh]" />
          <HelperText>Any notes for the password.</HelperText>
        </Label>
        <Button className="bg-success">Add Password</Button>
      </form>
    </div>
  )
}

export default PasswordAdd
