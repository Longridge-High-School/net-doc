import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {type Entry} from '@prisma/client'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {useLoaderData} from '@remix-run/react'
import {AButton} from '~/lib/components/button'
import {FIELDS} from '~/lib/fields/field'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'entry:view', {
    entryId: params.entry
  })

  const prisma = getPrisma()

  const entry = await prisma.entry.findFirstOrThrow({
    where: {id: params.entry},
    include: {
      asset: true,
      values: {include: {field: true}},
      passwords: {
        include: {password: {select: {id: true, title: true, username: true}}}
      }
    }
  })

  const relations = await prisma.$queryRaw<
    Array<Entry & {value: string; slug: string; entryId: string; icon: string}>
  >`SELECT * FROM Entry 
  INNER JOIN Value value ON fieldId = (SELECT nameFieldId FROM Asset WHERE Asset.id = entry.assetId) AND entryId = Entry.id 
  INNER JOIN Asset ON Entry.assetId = Asset.id
  WHERE Entry.id IN (SELECT entryId FROM Value WHERE value LIKE ${`%${entry.id}%`}) AND deleted = false`

  const documents = await prisma.document.findMany({
    where: {body: {contains: params.entry}}
  })

  return json({user, entry, relations, documents})
}

const AssetEntry = () => {
  const {entry, relations, documents} = useLoaderData<typeof loader>()

  const name = entry.values.reduce((n, v) => {
    if (n !== '') return n

    if (v.fieldId === entry.asset.nameFieldId) return v.value

    return ''
  }, '')

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3">
        <div className="border border-gray-300 shadow-xl bg-white p-2">
          <h2 className="border-b border-b-gray-200 text-xl font-light mb-4">
            {name}
          </h2>
          {entry.values.map(({id, value, field}) => {
            const Field = ({value}: {value: string}) => {
              return FIELDS[field.type].viewComponent({
                value,
                title: field.name,
                meta: field.meta
              })
            }

            return <Field value={value} key={id} />
          })}
        </div>
      </div>
      <div>
        <h3 className="border-b border-b-gray-200 text-xl font-light mb-4">
          Additional Details
        </h3>
        <h4 className="text-xl font-light mb-4">Linked Entries</h4>
        <div className="flex gap-2">
          {relations.length === 0
            ? 'No Linked Entries'
            : relations.map(({entryId, value, slug, icon}) => {
                return (
                  <a
                    key={entryId}
                    href={`/app/${slug}/${entryId}`}
                    className="bg-gray-300 p-2 rounded"
                  >
                    {icon} {value}
                  </a>
                )
              })}
        </div>
        <h4 className="text-xl font-light my-4">Linked Documents</h4>
        <div className="flex gap-2">
          {documents.length === 0
            ? 'No Linked Entries'
            : documents.map(({id, title}) => {
                return (
                  <a
                    key={id}
                    href={`/app/documents/${id}`}
                    className="bg-gray-300 p-2 rounded"
                  >
                    {title}
                  </a>
                )
              })}
        </div>
        <h4 className="text-xl font-light my-4">Linked Passwords</h4>
        <div className="flex gap-2">
          {entry.passwords.length === 0
            ? 'No Passwords'
            : entry.passwords.map(({id, password}) => {
                return (
                  <a
                    key={id}
                    href={`/app/passwords/${password.id}`}
                    className="bg-gray-300 p-2 rounded"
                  >
                    {password.title}
                  </a>
                )
              })}
        </div>
        <AButton
          href={`/app/${entry.asset.slug}/${entry.id}/link-password`}
          className="bg-info text-sm mt-4"
        >
          Link a Password
        </AButton>
      </div>
    </div>
  )
}

export default AssetEntry
