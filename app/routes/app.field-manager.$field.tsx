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
import {Label, Input, HelperText} from '~/lib/components/input'
import {FIELDS} from '~/lib/fields/field'
import {pageTitle} from '~/lib/utils/page-title'
import {FIELD_HANDLERS} from '~/lib/fields/field.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'field-manager:edit', {
    fieldId: params.field
  })

  const prisma = getPrisma()

  const field = await prisma.field.findFirstOrThrow({
    where: {id: params.field}
  })

  return json({user, field})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'field-manager:edit', {})

  const prisma = getPrisma()

  const currentField = await prisma.field.findFirstOrThrow({
    where: {id: params.field}
  })

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const description = formData.get('description') as string | undefined

  invariant(name)
  invariant(description)

  const meta = FIELD_HANDLERS[currentField.type].metaSave(formData)

  const field = await prisma.field.update({
    where: {id: params.field},
    data: {name, description, icon: '', meta}
  })

  return redirect(`/app/field-manager/${field.id}`)
}

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  return [{title: pageTitle(matches, 'Field Manager', data!.field.name)}]
}

const FieldManagerField = () => {
  const {field} = useLoaderData<typeof loader>()

  const Meta = () => {
    return FIELDS[field.type].metaComponent({meta: field.meta})
  }

  return (
    <div className="entry">
      <form method="POST">
        <Label>
          Name
          <Input name="name" defaultValue={field.name} />
          <HelperText>The name of the field.</HelperText>
        </Label>
        <Label>
          Description
          <Input name="description" defaultValue={field.description} />
          <HelperText>The internal description of the field.</HelperText>
        </Label>
        <Label>
          Type
          <Input disabled value={field.type} />
          <HelperText>The internal field type</HelperText>
        </Label>
        <Meta />
        <Button className="bg-success">Update Field</Button>
      </form>
    </div>
  )
}

export default FieldManagerField
