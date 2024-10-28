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

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'document:write', {
    documentId: params.document
  })

  const prisma = getPrisma()

  const document = await prisma.document.findFirstOrThrow({
    where: {id: params.document}
  })

  const acls = await prisma.aCL.findMany({orderBy: {name: 'asc'}})

  return json({user, document, acls})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const user = await ensureUser(request, 'document:write', {
    documentId: params.document
  })

  const formData = await request.formData()

  const prisma = getPrisma()

  const title = formData.get('title') as string | undefined
  const body = formData.get('body') as string | undefined
  const acl = formData.get('acl') as string | undefined

  invariant(title)
  invariant(body)
  invariant(acl)

  const document = await prisma.document.findFirstOrThrow({
    where: {id: params.document}
  })

  await prisma.documentHistory.create({
    data: {
      previousTitle: document.title,
      previousBody: document.body,
      editedById: user.id,
      documentId: document.id
    }
  })

  const updatedDocument = await prisma.document.update({
    where: {id: params.document},
    data: {title, body, aclId: acl}
  })

  return redirect(`/app/documents/${updatedDocument.id}`)
}

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  return [{title: pageTitle(matches, 'Document', data!.document.title, 'Edit')}]
}

const DocumentEdit = () => {
  const {document, acls} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
      <h2>Edit Document</h2>
      <form method="POST">
        <Label>
          Title
          <Input name="title" defaultValue={document.title} />
          <HelperText>The title of the Document.</HelperText>
        </Label>
        <Label>
          Body
          <TextArea
            name="body"
            className="min-h-[50vh]"
            defaultValue={document.body}
          />
          <HelperText>Document body in Markdown</HelperText>
        </Label>
        <Label>
          ACL
          <Select name="acl" defaultValue={document.aclId}>
            {acls.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </Select>
        </Label>
        <Button className="bg-success">Edit Document</Button>
      </form>
    </div>
  )
}

export default DocumentEdit
