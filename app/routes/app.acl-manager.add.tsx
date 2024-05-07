import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json,
  redirect
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Label, Input, HelperText} from '~/lib/components/input'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset-manager:add', {})

  return json({user})
}

export const action = async ({request}: ActionFunctionArgs) => {
  await ensureUser(request, 'asset-manager:add', {})

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined

  invariant(name)

  const acl = await prisma.aCL.create({
    data: {name}
  })

  return redirect(`/app/acl-manager/${acl.id}`)
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('ACL Manager', 'Add')}]
}

const ACLManagerAdd = () => {
  return (
    <div className="entry">
      <form method="POST">
        <Label>
          Name
          <Input name="name" />
          <HelperText>The name of the ACL</HelperText>
        </Label>
        <Button className="bg-success">Add ACL</Button>
      </form>
    </div>
  )
}

export default ACLManagerAdd
