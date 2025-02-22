import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Label, Input, Select} from '~/lib/components/input'
import {hashPassword} from '~/lib/user.server'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const currentUser = await ensureUser(request, 'group-manager:edit', {
    userId: params.user
  })

  return {currentUser}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'group-manager:add', {
    userId: params.user
  })

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined

  invariant(name)

  const group = await prisma.group.create({
    data: {name}
  })

  return redirect(`/app/groups-manager/${group.id}`)
}

export const meta: MetaFunction = ({matches}) => {
  return [{title: pageTitle(matches, 'Group Manager', 'Add')}]
}

const UserManagerAdd = () => {
  return (
    <div className="entry">
      <h4 className="text-xl">Add Group</h4>
      <form method="POST">
        <Label>
          Name
          <Input name="name" />
        </Label>
        <Button className="bg-success">Add Group</Button>
      </form>
    </div>
  )
}

export default UserManagerAdd
