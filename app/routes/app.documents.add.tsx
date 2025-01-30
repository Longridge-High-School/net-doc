import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
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
import {getDefaultACLID} from '~/lib/rbac.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'document:add', {})

  const prisma = getPrisma()

  const acls = await prisma.aCL.findMany({orderBy: {name: 'asc'}})

  const defaultAclId = await getDefaultACLID()

  return {user, acls, defaultAclId}
}

export const action = async ({request}: ActionFunctionArgs) => {
  await ensureUser(request, 'document:add', {})

  const formData = await request.formData()

  const prisma = getPrisma()

  const title = formData.get('title') as string | undefined
  const body = formData.get('body') as string | undefined
  const acl = formData.get('acl') as string | undefined

  invariant(title)
  invariant(body)
  invariant(acl)

  const document = await prisma.document.create({
    data: {title, body, aclId: acl}
  })

  return redirect(`/app/documents/${document.id}`)
}

export const meta: MetaFunction = ({matches}) => {
  return [{title: pageTitle(matches, 'Documents', 'Add')}]
}

const DocumentAdd = () => {
  const {acls, defaultAclId} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
      <h2>Add Document</h2>
      <form method="POST">
        <Label>
          Title
          <Input name="title" />
          <HelperText>The title of the Document.</HelperText>
        </Label>
        <Label>
          Body
          <TextArea name="body" className="min-h-[50vh]" />
          <HelperText>Document body in Markdown</HelperText>
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
        <Button className="bg-success">Add Document</Button>
      </form>
    </div>
  )
}

export default DocumentAdd
