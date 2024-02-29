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
import {Label, Input, Select} from '~/lib/components/input'
import {hashPassword} from '~/lib/user.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const currentUser = await ensureUser(request, 'user-manager:edit', {
    userId: params.user
  })

  return json({currentUser})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'user-manager:add', {
    userId: params.user
  })

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const email = formData.get('email') as string | undefined
  const password = formData.get('password') as string | undefined
  const role = formData.get('role') as string | undefined

  invariant(name)
  invariant(email)
  invariant(password)
  invariant(role)

  const user = await prisma.user.create({
    data: {name, email, passwordHash: await hashPassword(password), role}
  })

  return redirect(`/app/user-manager/${user.id}`)
}

const UserManagerAdd = () => {
  return (
    <div>
      <h4 className="text-xl">Add User</h4>
      <form method="POST">
        <Label>
          Name
          <Input name="name" />
        </Label>
        <Label>
          Email
          <Input name="email" type="email" />
        </Label>
        <Label>
          Password
          <Input name="password" type="password" />
        </Label>
        <Label>
          Role
          <Select name="role">
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Select>
        </Label>
        <Button className="bg-success">Add User</Button>
      </form>
    </div>
  )
}

export default UserManagerAdd
