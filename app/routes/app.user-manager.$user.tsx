import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Label, Input, Select} from '~/lib/components/input'
import {hashPassword} from '~/lib/user.server'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const currentUser = await ensureUser(request, 'user-manager:edit', {
    userId: params.user
  })

  const prisma = getPrisma()

  const user = await prisma.user.findFirstOrThrow({where: {id: params.user}})

  return json({currentUser, user})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'user-manager:edit', {
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
  invariant(role)

  let newPassword: string | undefined = undefined

  if (password) {
    newPassword = await hashPassword(password)
  }

  const user = await prisma.user.update({
    where: {id: params.user},
    data: {name, email, passwordHash: newPassword, role}
  })

  return redirect(`/app/user-manager/${user.id}`)
}

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  return [{title: pageTitle(matches, 'User Manager', data!.user.name)}]
}

const UserManagerUser = () => {
  const {user} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
      <h4 className="text-xl">{user.name}</h4>
      <form method="POST">
        <Label>
          Name
          <Input name="name" defaultValue={user.name} />
        </Label>
        <Label>
          Email
          <Input name="email" type="email" defaultValue={user.email} />
        </Label>
        <Label>
          Password
          <Input name="password" type="password" />
        </Label>
        <Label>
          Role
          <Select name="role" defaultValue={user.role}>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Select>
        </Label>
        <Button className="bg-success">Update User</Button>
      </form>
    </div>
  )
}

export default UserManagerUser
