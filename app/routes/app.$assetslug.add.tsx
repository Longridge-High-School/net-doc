import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  redirect,
  unstable_parseMultipartFormData
} from '@remix-run/node'
import {useLoaderData, useActionData} from '@remix-run/react'
import {asyncMap, indexedBy} from '@arcath/utils'
import {getUniqueCountForAssetField} from '@prisma/client/sql'

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

  return {user, asset}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const user = await ensureUser(request, 'asset:write', {
    assetSlug: params.assetslug
  })

  const prisma = getPrisma()

  const uploadHandler = getUploadHandler()

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const asset = await prisma.asset.findFirstOrThrow({
    where: {slug: params.assetslug},
    include: {assetFields: {include: {field: true}, orderBy: {order: 'asc'}}}
  })

  const entry = await prisma.entry.create({
    data: {assetId: asset.id, aclId: asset.aclId}
  })

  const results = await asyncMap(
    asset.assetFields,
    async ({
      fieldId,
      field,
      id,
      unique
    }): Promise<{error: string; field: string} | boolean> => {
      const value = await FIELD_HANDLERS[field.type].valueSetter(
        formData,
        id,
        ''
      )

      switch (unique) {
        case 1: {
          const [withinAssetCount] = await prisma.$queryRawTyped(
            getUniqueCountForAssetField(params.entry!, fieldId, value)
          )
          if (withinAssetCount['COUNT(*)'] > 0) {
            return {
              error: `Value is not unique across all ${asset.name}`,
              field: fieldId
            }
          }
          break
        }
        case 2: {
          const withinFieldCount = await prisma.value.count({
            where: {fieldId, value}
          })
          if (withinFieldCount > 0) {
            return {
              error: 'Value is not unique across all of the documentation',
              field: fieldId
            }
          }
          break
        }
        case 0:
        default:
          break
      }

      await prisma.value.create({
        data: {entryId: entry.id, fieldId, value, lastEditedById: user.id}
      })

      return true
    }
  )

  // If validation fails, need to delete the new entry.
  const flags = results.filter(v => v !== true)

  if (flags.length > 0) {
    await prisma.value.deleteMany({where: {entryId: entry.id}})
    await prisma.entry.delete({where: {id: entry.id}})

    return {errors: flags}
  }

  return redirect(`/app/${params.assetslug}/${entry.id}`)
}

export const meta: MetaFunction<typeof loader> = ({matches, data}) => {
  return [
    {
      title: pageTitle(matches, data!.asset.singular, 'New')
    }
  ]
}

const Asset = () => {
  const {asset} = useLoaderData<typeof loader>()

  const actionData = useActionData<typeof action>()

  const fields = indexedBy('fieldId', asset.assetFields)

  return (
    <div className="entry">
      <h2>Add {asset.singular}</h2>
      {actionData && actionData.errors ? (
        <div className="bg-red-200 border-red-300 border p-2 mb-8">
          <h3 className="text-lg">Save Errors</h3>
          <ul>
            {actionData.errors
              .filter(v => v !== false)
              .map(({field, error}) => {
                return (
                  <li key={field}>
                    {fields[field].field.name}: {error}
                  </li>
                )
              })}
          </ul>
        </div>
      ) : (
        ''
      )}
      <form method="POST" encType="multipart/form-data">
        {asset.assetFields.map(({id, helperText, field}) => {
          const FieldComponent = (params: {
            label: string
            value: string
            helperText: string
            name: string
            meta: string
            validation: {required: boolean}
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
                validation={{required: field.id === asset.nameFieldId}}
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
