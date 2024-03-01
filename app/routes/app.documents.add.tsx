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

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'document:add', {})

  return json({user})
}

export const action = async ({request}: ActionFunctionArgs) => {
  await ensureUser(request, 'document:add', {})

  const formData = await request.formData()

  const prisma = getPrisma()

  const title = formData.get('title') as string | undefined
  const body = formData.get('body') as string | undefined

  invariant(title)
  invariant(body)

  const document = await prisma.document.create({data: {title, body}})

  return redirect(`/app/documents/${document.id}`)
}

const DocumentAdd = () => {
  return (
    <div>
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
        <Button className="bg-success">Add Document</Button>
      </form>
    </div>
  )
}

export default DocumentAdd
