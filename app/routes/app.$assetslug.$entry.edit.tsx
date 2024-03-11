import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json,
  redirect,
  unstable_parseMultipartFormData
} from '@remix-run/node'
import {asyncForEach, indexedBy} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {useLoaderData} from '@remix-run/react'
import {FIELDS} from '~/lib/fields/field'
import {Button} from '~/lib/components/button'
import {pageTitle} from '~/lib/utils/page-title'
import {getUploadHandler} from '~/lib/utils/upload-handler.server'
import {HelperText, Label, TextArea} from '~/lib/components/input'

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

  const name = entry.values.reduce((n, v) => {
    if (n !== '') return n

    if (v.fieldId === entry.asset.nameFieldId) return v.value

    return ''
  }, '')

  return json({user, entry, name})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const user = await ensureUser(request, 'asset:add', {
    assetSlug: params.assetslug
  })

  const prisma = getPrisma()

  const uploadHandler = getUploadHandler()

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const changelog = formData.get('changelog') as string | undefined

  const asset = await prisma.asset.findFirstOrThrow({
    where: {slug: params.assetslug},
    include: {assetFields: {include: {field: true}, orderBy: {order: 'asc'}}}
  })

  await prisma.entry.update({
    where: {id: params.entry!},
    data: {assetId: asset.id}
  })

  await asyncForEach(
    asset.assetFields,
    async ({fieldId, field, id}): Promise<void> => {
      const entryValue = await prisma.value.findFirst({
        where: {entryId: params.entry!, fieldId}
      })

      const value = await FIELDS[field.type].valueSetter(
        formData,
        id,
        entryValue ? entryValue.value : ''
      )

      if (entryValue) {
        if (value !== entryValue.value) {
          await prisma.valueHistory.create({
            data: {
              valueId: entryValue.id,
              valueAtPoint: entryValue.value,
              changeNote: changelog ? changelog : '',
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
    }
  )

  return redirect(`/app/${params.assetslug}/${params.entry}`)
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: pageTitle(data!.entry.asset.singular, data!.name, 'Edit')}]
}

const Asset = () => {
  const {entry} = useLoaderData<typeof loader>()

  const {asset} = entry

  const fieldValues = indexedBy('fieldId', entry.values)

  return (
    <div className="entry">
      <h2>Edit {asset.singular}</h2>
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
                value={fieldValues[field.id]?.value}
                helperText={helperText}
                name={id}
                meta={field.meta}
              />
            </div>
          )
        })}
        <Label>
          Change Log
          <TextArea name="changelog" />
          <HelperText>Explain the reason for this change.</HelperText>
        </Label>
        <Button className="bg-success">Update {asset.singular}</Button>
      </form>
    </div>
  )
}

export default Asset
