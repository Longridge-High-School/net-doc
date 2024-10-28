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
import {getCryptoSuite} from '~/lib/crypto.server'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:write', {
    passwordId: params.password
  })

  const prisma = getPrisma()

  const password = await prisma.password.findFirstOrThrow({
    where: {id: params.password}
  })

  const {decrypt} = await getCryptoSuite()

  const acls = await prisma.aCL.findMany({orderBy: {name: 'asc'}})

  return json({user, password, decrypted: decrypt(password.password), acls})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const user = await ensureUser(request, 'password:write', {
    passwordId: params.password
  })

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

  const dbPassword = await prisma.password.findFirstOrThrow({
    where: {id: params.password}
  })

  await prisma.passwordHistory.create({
    data: {
      previousTitle: dbPassword.title,
      previousUsername: dbPassword.username,
      previousPassword: dbPassword.password,
      previousNotes: dbPassword.notes,
      editedById: user.id,
      passwordId: dbPassword.id
    }
  })

  const updatedPassword = await prisma.password.update({
    where: {id: params.password},
    data: {
      title,
      username: username ? username : '',
      notes: notes ? notes : '',
      password: encrypt(password),
      aclId: acl
    }
  })

  return redirect(`/app/passwords/${updatedPassword.id}`)
}

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  return [{title: pageTitle(matches, 'Password', data!.password.title, 'Edit')}]
}

const PasswordEdit = () => {
  const {password, decrypted, acls} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
      <h2>Edit Password</h2>
      <form method="POST">
        <Label>
          Title
          <Input name="title" defaultValue={password.title} />
          <HelperText>The title of the Password.</HelperText>
        </Label>
        <Label>
          Username
          <Input name="username" defaultValue={password.username} />
          <HelperText>The username (can be blank).</HelperText>
        </Label>
        <Label>
          Password
          <Input name="password" defaultValue={decrypted} />
          <HelperText>The password.</HelperText>
        </Label>
        <Label>
          Notes
          <TextArea
            name="notes"
            className="min-h-[25vh]"
            defaultValue={password.notes}
          />
          <HelperText>Any notes for the password.</HelperText>
        </Label>
        <Label>
          ACL
          <Select name="acl" defaultValue={password.aclId}>
            {acls.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </Select>
        </Label>
        <Button className="bg-success">Edit Password</Button>
      </form>
    </div>
  )
}

export default PasswordEdit
