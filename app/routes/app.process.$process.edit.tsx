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
import {Label, Input, HelperText, TextArea} from '~/lib/components/input'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'process:write', {
    processId: params.process
  })

  const prisma = getPrisma()

  const process = await prisma.process.findFirstOrThrow({
    where: {id: params.process}
  })

  return json({user, process})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'process:write', {
    processId: params.process
  })

  const formData = await request.formData()

  const prisma = getPrisma()

  const title = formData.get('title') as string | undefined
  const body = formData.get('body') as string | undefined

  invariant(title)
  invariant(body)

  const process = await prisma.process.update({
    where: {id: params.process},
    data: {title, body}
  })

  return redirect(`/app/process/${process.id}`)
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: pageTitle('Process', data!.process.title, 'Edit')}]
}

const ProcessEdit = () => {
  const {process} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
      <h2>Edit Document</h2>
      <form method="POST">
        <Label>
          Title
          <Input name="title" defaultValue={process.title} />
          <HelperText>The title of the Document.</HelperText>
        </Label>
        <Label>
          Body
          <TextArea
            name="body"
            className="min-h-[50vh]"
            defaultValue={process.body}
          />
          <HelperText>Document body in Markdown</HelperText>
        </Label>
        <Button className="bg-success">Edit Process</Button>
      </form>
    </div>
  )
}

export default ProcessEdit
