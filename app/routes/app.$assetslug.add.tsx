import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {asyncForEach} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {FIELDS} from '~/lib/fields/field'
import {Button} from '~/lib/components/button'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset:view', {
    assetSlug: params.assetslug
  })

  const prisma = getPrisma()

  const asset = await prisma.asset.findFirstOrThrow({
    where: {slug: params.assetslug},
    include: {assetFields: {include: {field: true}, orderBy: {order: 'asc'}}}
  })

  return json({user, asset})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const user = await ensureUser(request, 'asset:add', {
    assetSlug: params.assetslug
  })

  const prisma = getPrisma()

  const formData = await request.formData()

  const asset = await prisma.asset.findFirstOrThrow({
    where: {slug: params.assetslug},
    include: {assetFields: {include: {field: true}, orderBy: {order: 'asc'}}}
  })

  const entry = await prisma.entry.create({data: {assetId: asset.id}})

  await asyncForEach(asset.assetFields, async ({fieldId, field, id}) => {
    const value = await FIELDS[field.type].valueSetter(formData, id)

    await prisma.value.create({
      data: {entryId: entry.id, fieldId, value, lastEditedById: user.id}
    })
  })

  return redirect(`/app/${params.assetslug}/${entry.id}`)
}

const Asset = () => {
  const {asset} = useLoaderData<typeof loader>()

  return (
    <div>
      <h2>Add {asset.singular}</h2>
      <form method="POST">
        {asset.assetFields.map(({id, helperText, field}) => {
          const FieldComponent = (params: {
            label: string
            value: string
            helperText: string
            name: string
            meta: string
          }) => {
            return FIELDS[field.type].editComponent(params)
          }

          return (
            <div key={id}>
              <FieldComponent
                label={field.name}
                value={''}
                helperText={helperText}
                name={id}
                meta={field.meta}
              />
            </div>
          )
        })}
        <Button className="bg-success">Add {asset.singular}</Button>
      </form>
    </div>
  )
}

export default Asset
