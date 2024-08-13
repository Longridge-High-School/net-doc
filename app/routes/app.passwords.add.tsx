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
import {
  Label,
  Input,
  HelperText,
  TextArea,
  Select
} from '~/lib/components/input'
import {pageTitle} from '~/lib/utils/page-title'

import {getCryptoSuite} from '~/lib/crypto.server'
import {getDefaultACLID} from '~/lib/rbac.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:add', {})

  const prisma = getPrisma()

  const acls = await prisma.aCL.findMany({orderBy: {name: 'asc'}})

  const defaultAclId = await getDefaultACLID()

  return json({user, acls, defaultAclId})
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
  const acl = formData.get('acl') as string | undefined

  invariant(title)
  invariant(password)
  invariant(acl)

  const newPassword = await prisma.password.create({
    data: {
      title,
      username: username ? username : '',
      password: encrypt(password),
      notes: notes ? notes : '',
      aclId: acl
    }
  })

  return redirect(`/app/passwords/${newPassword.id}`)
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Passwords', 'Add')}]
}

const PasswordAdd = () => {
  const {acls, defaultAclId} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
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
        <Label>
          ACL
          <Select name="acl" defaultValue={defaultAclId}>
            {acls.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </Select>
        </Label>
        <Button className="bg-success">Add Password</Button>
      </form>
    </div>
  )
}

export default PasswordAdd
