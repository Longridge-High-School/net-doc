import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect
} from '@remix-run/node'
import {asyncForEach, indexedBy} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {useLoaderData} from '@remix-run/react'
import {FIELDS} from '~/lib/fields/field'
import {Button} from '~/lib/components/button'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'entry:edit', {
    entryId: params.entry
  })

  const prisma = getPrisma()

  const entry = await prisma.entry.findFirstOrThrow({
    where: {id: params.entry},
    include: {
      asset: {include: {assetFields: {include: {field: true}}}},
      values: {include: {field: true}}
    }
  })

  return json({user, entry})
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

  await prisma.entry.update({
    where: {id: params.entry!},
    data: {assetId: asset.id}
  })

  await asyncForEach(asset.assetFields, async ({fieldId, field, id}) => {
    const value = await FIELDS[field.type].valueSetter(formData, id)

    const entryValue = await prisma.value.findFirst({
      where: {entryId: params.entry!, fieldId}
    })

    if (entryValue) {
      if (value !== entryValue.value) {
        await prisma.valueHistory.create({
          data: {
            valueId: entryValue.id,
            valueAtPoint: entryValue.value,
            changeNote: '',
            editedById: user.id
          }
        })
      }

      await prisma.value.update({
        where: {id: entryValue.id},
        data: {value}
      })

      return
    }

    await prisma.value.create({
      data: {entryId: params.entry!, fieldId, value, lastEditedById: user.id}
    })
  })

  return redirect(`/app/${params.assetslug}/${params.entry}`)
}

const Asset = () => {
  const {entry} = useLoaderData<typeof loader>()

  const {asset} = entry

  const fieldValues = indexedBy('fieldId', entry.values)

  return (
    <div className="entry">
      <h2>Edit {asset.singular}</h2>
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
                value={fieldValues[field.id]?.value}
                helperText={helperText}
                name={id}
                meta={field.meta}
              />
            </div>
          )
        })}
        <Button className="bg-success">Update {asset.singular}</Button>
      </form>
    </div>
  )
}

export default Asset
