import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json,
  redirect
} from '@remix-run/node'
import {invariant} from '@arcath/utils'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Input, Label} from '~/lib/components/input'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'entry:delete', {
    entryId: params.entry
  })

  const prisma = getPrisma()

  const entry = await prisma.entry.findFirstOrThrow({
    where: {id: params.entry},
    include: {asset: true, values: {include: {field: true}}}
  })

  const name = entry.values.reduce((n, v) => {
    if (n !== '') return n

    if (v.fieldId === entry.asset.nameFieldId) return v.value

    return ''
  }, '')

  return json({user, entry, name})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'entry:delete', {
    entryId: params.entry
  })

  const prisma = getPrisma()
  const formData = await request.formData()

  const entry = await prisma.entry.findFirstOrThrow({
    where: {id: params.entry},
    include: {asset: true, values: {include: {field: true}}}
  })

  const name = entry.values.reduce((n, v) => {
    if (n !== '') return n

    if (v.fieldId === entry.asset.nameFieldId) return v.value

    return ''
  }, '')

  const submittedName = formData.get('name') as string | undefined

  invariant(submittedName)

  if (submittedName === name) {
    await prisma.entry.update({where: {id: entry.id}, data: {deleted: true}})

    return redirect(`/app/${entry.asset.slug}`)
  }

  return json({error: 'Name does not match'})
}

export const meta: MetaFunction<typeof loader> = ({matches, data}) => {
  return [
    {
      title: pageTitle(
        matches,
        data!.entry.asset.singular,
        data!.name,
        'Delete'
      )
    }
  ]
}

const AssetEntryDelete = () => {
  const {entry, name} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
      <h2>Delete {name}</h2>
      <p>Are you sure you want to delete this {entry.asset.singular}?</p>
      <form method="POST">
        <Label>
          Enter the name <b>{name}</b> below to confirm.
          <Input name="name" placeholder={name} />
        </Label>
        <Button className="bg-danger">Delete!</Button>
      </form>
    </div>
  )
}

export default AssetEntryDelete
