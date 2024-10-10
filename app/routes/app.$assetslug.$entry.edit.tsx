import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json,
  redirect,
  unstable_parseMultipartFormData
} from '@remix-run/node'
import {asyncMap, indexedBy, invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {useLoaderData} from '@remix-run/react'
import {FIELDS} from '~/lib/fields/field'
import {Button} from '~/lib/components/button'
import {pageTitle} from '~/lib/utils/page-title'
import {getUploadHandler} from '~/lib/utils/upload-handler.server'
import {HelperText, Label, Select, TextArea} from '~/lib/components/input'
import {FIELD_HANDLERS} from '~/lib/fields/field.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'entry:write', {
    entryId: params.entry
  })

  const prisma = getPrisma()

  const entry = await prisma.entry.findFirstOrThrow({
    where: {id: params.entry},
    include: {
      asset: {
        include: {
          assetFields: {
            where: {hidden: false},
            include: {field: true},
            orderBy: {order: 'asc'}
          }
        }
      },
      values: {include: {field: true}}
    }
  })

  const name = entry.values.reduce((n, v) => {
    if (n !== '') return n

    if (v.fieldId === entry.asset.nameFieldId) return v.value

    return ''
  }, '')

  const acls = await prisma.aCL.findMany({orderBy: {name: 'asc'}})

  return json({user, entry, name, acls})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const user = await ensureUser(request, 'entry:write', {
    entryId: params.entry
  })

  const prisma = getPrisma()

  const uploadHandler = getUploadHandler()

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const changelog = formData.get('changelog') as string | undefined
  const acl = formData.get('acl') as string | undefined

  invariant(acl)

  const asset = await prisma.asset.findFirstOrThrow({
    where: {slug: params.assetslug},
    include: {assetFields: {include: {field: true}, orderBy: {order: 'asc'}}}
  })

  await prisma.entry.update({
    where: {id: params.entry!},
    data: {aclId: acl}
  })

  const results = await asyncMap(
    asset.assetFields,
    async ({
      fieldId,
      field,
      id,
      unique
    }): Promise<{error: string} | boolean> => {
      const entryValue = await prisma.value.findFirst({
        where: {entryId: params.entry!, fieldId}
      })

      const value = await FIELD_HANDLERS[field.type].valueSetter(
        formData,
        id,
        entryValue ? entryValue.value : ''
      )

      switch (unique) {
        case 2:
          const withinFieldCount = await prisma.value.count({
            where: {fieldId, value}
          })
          if (withinFieldCount > 0) {
            return {error: 'Value is not unique'}
          }
        case 0:
        default:
          break
      }

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

        return true
      }

      await prisma.value.create({
        data: {entryId: params.entry!, fieldId, value, lastEditedById: user.id}
      })

      return true
    }
  )

  return redirect(`/app/${params.assetslug}/${params.entry}`)
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: pageTitle(data!.entry.asset.singular, data!.name, 'Edit')}]
}

const Asset = () => {
  const {entry, acls} = useLoaderData<typeof loader>()

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
            validation: {required: boolean}
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
                validation={{required: field.id === asset.nameFieldId}}
              />
            </div>
          )
        })}
        <Label>
          Change Log
          <TextArea name="changelog" />
          <HelperText>Explain the reason for this change.</HelperText>
        </Label>
        <Label>
          ACL
          <Select name="acl" defaultValue={entry.aclId}>
            {acls.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </Select>
        </Label>
        <Button className="bg-success">Update {asset.singular}</Button>
      </form>
    </div>
  )
}

export default Asset
