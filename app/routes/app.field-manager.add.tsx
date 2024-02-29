import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect
} from '@remix-run/node'
import {invariant} from '@arcath/utils'
import {useState} from 'react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Label, Input, HelperText, Select} from '~/lib/components/input'
import {FIELDS} from '~/lib/fields/field'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'field-manager:add', {})

  return json({user})
}

export const action = async ({request}: ActionFunctionArgs) => {
  await ensureUser(request, 'field-manager:add', {})

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const description = formData.get('description') as string | undefined
  const type = formData.get('type') as string | undefined

  invariant(name)
  invariant(description)
  invariant(type)

  const meta = FIELDS[type].metaSave(formData)

  const field = await prisma.field.create({
    data: {name, description, type, icon: '', meta}
  })

  return redirect(`/app/field-manager/${field.id}`)
}

const FieldManagerAdd = () => {
  const [type, setType] = useState('text')

  const Meta = () => {
    return FIELDS[type].metaComponent({meta: ''})
  }

  return (
    <div>
      <form method="POST">
        <Label>
          Name
          <Input name="name" />
          <HelperText>The name of the field.</HelperText>
        </Label>
        <Label>
          Description
          <Input name="description" />
          <HelperText>The internal description of the field.</HelperText>
        </Label>
        <Label>
          Type
          <Select
            name="type"
            defaultValue="text"
            onChange={e => {
              setType(e.target.value)
            }}
          >
            <option value="markdown">Markdown</option>
            <option value="relation">Relation</option>
            <option value="select">Select</option>
            <option value="text">Text</option>
          </Select>
          <HelperText>The internal field type</HelperText>
        </Label>
        <Meta />
        <Button className="bg-success">Add Field</Button>
      </form>
    </div>
  )
}

export default FieldManagerAdd
