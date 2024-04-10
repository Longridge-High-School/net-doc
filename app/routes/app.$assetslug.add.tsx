import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json,
  redirect,
  unstable_parseMultipartFormData
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {asyncForEach} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {FIELDS} from '~/lib/fields/field'
import {Button} from '~/lib/components/button'
import {pageTitle} from '~/lib/utils/page-title'
import {getUploadHandler} from '~/lib/utils/upload-handler.server'
import {FIELD_HANDLERS} from '~/lib/fields/field.server'

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

  const uploadHandler = getUploadHandler()

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const asset = await prisma.asset.findFirstOrThrow({
    where: {slug: params.assetslug},
    include: {assetFields: {include: {field: true}, orderBy: {order: 'asc'}}}
  })

  const entry = await prisma.entry.create({data: {assetId: asset.id}})

  await asyncForEach(
    asset.assetFields,
    async ({fieldId, field, id}): Promise<void> => {
      const value = await FIELD_HANDLERS[field.type].valueSetter(
        formData,
        id,
        ''
      )

      await prisma.value.create({
        data: {entryId: entry.id, fieldId, value, lastEditedById: user.id}
      })
    }
  )

  return redirect(`/app/${params.assetslug}/${entry.id}`)
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {
      title: pageTitle(data!.asset.singular, 'New')
    }
  ]
}

const Asset = () => {
  const {asset} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
      <h2>Add {asset.singular}</h2>
      <form method="POST" encType="multipart/form-data">
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
