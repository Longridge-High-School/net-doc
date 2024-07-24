import {
  type LoaderFunctionArgs,
  type MetaFunction,
  type HeadersArgs,
  json
} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {type Entry} from '@prisma/client'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {LinkButton} from '~/lib/components/button'
import {FIELDS} from '~/lib/fields/field'
import {pageTitle} from '~/lib/utils/page-title'
import {formatAsDateTime} from '~/lib/utils/format'
import {can} from '~/lib/rbac.server'
import {createTimings} from '~/lib/utils/timings.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  const user = await time('getUser', 'Get User', () =>
    ensureUser(request, 'entry:read', {
      entryId: params.entry
    })
  )

  const prisma = getPrisma()

  const entry = await time('getEntry', 'Get Entry', () =>
    prisma.entry.findFirstOrThrow({
      where: {id: params.entry},
      include: {
        asset: true,
        passwords: {
          include: {password: {select: {id: true, title: true, username: true}}}
        }
      }
    })
  )

  const values = await time(
    'getValues',
    'Get Values',
    () => prisma.$queryRaw<
      Array<{
        id: string
        value: string
        order: number
        type: string
        meta: string
        fieldId: string
        fieldName: string
      }>
    >`SELECT Value.id, Value.value, AssetField."order", Field.type, Field.meta, Value.fieldId, Field.name as fieldName FROM Value
  INNER JOIN Entry ON Entry.Id = Value.entryId
  INNER JOIN Asset on Asset.Id = Entry.assetId
  INNER JOIN AssetField on AssetField.assetId = Asset.id AND AssetField.fieldId = Value.fieldId
  INNER JOIN Field on Field.id = Value.fieldId
  WHERE entryId = ${entry.id}
  ORDER BY AssetField."order" ASC`
  )

  const relations = await time(
    'getRelations',
    'Get Relations',
    () => prisma.$queryRaw<
      Array<
        Entry & {value: string; slug: string; entryId: string; icon: string}
      >
    >`SELECT * FROM Entry 
  INNER JOIN Value value ON fieldId = (SELECT nameFieldId FROM Asset WHERE Asset.id = entry.assetId) AND entryId = Entry.id 
  INNER JOIN Asset ON Entry.assetId = Asset.id
  WHERE Entry.id IN (SELECT entryId FROM Value WHERE value LIKE ${`%${entry.id}%`}) AND deleted = false`
  )

  const documents = await time('getDocuments', 'Get Documents', () =>
    prisma.document.findMany({
      where: {body: {contains: params.entry}}
    })
  )

  const revisions = await time(
    'getRevisions',
    'Get Revisions',
    () => prisma.$queryRaw<
      Array<{
        id: string
        createdAt: string
        changeNote: string
        fieldName: string
        userName: string
      }>
    >`SELECT ValueHistory.id, ValueHistory.createdAt, ValueHistory.changeNote, Field.name as fieldName, User.name as userName FROM ValueHistory
  INNER JOIN Value on Value.id = ValueHistory.valueId
  INNER JOIN Field on Field.id = Value.fieldId
  INNER JOIN User on User.id = ValueHistory.editedById
  WHERE Value.entryId = ${params.entry}
  ORDER BY ValueHistory.createdAt DESC`
  )

  const name = values.reduce((n, v) => {
    if (n !== '') return n

    if (v.fieldId === entry.asset.nameFieldId) return v.value

    return ''
  }, '')

  const canEdit = await can(user.role, 'entry:edit', {user, entryId: entry.id})

  return json(
    {
      user,
      entry,
      relations,
      documents,
      name,
      values,
      revisions,
      canEdit
    },
    {headers: headers({'Set-Cookie': user.setCookie})}
  )
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: pageTitle(data!.entry.asset.singular, data!.name)}]
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}

const AssetEntry = () => {
  const {entry, relations, documents, name, values, revisions} =
    useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3">
        <div className="border border-gray-300 shadow-xl bg-white p-2">
          <h2 className="border-b border-b-gray-200 text-xl font-light mb-4">
            {name}
          </h2>
          {values.map(({id, value, type, meta, fieldName}) => {
            const Field = ({value}: {value: string}) => {
              return FIELDS[type].viewComponent({
                value,
                title: fieldName,
                meta: meta
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
        <div className="flex flex-wrap gap-2">
          {relations.length === 0
            ? 'No Linked Entries'
            : relations.map(({entryId, value, slug, icon}) => {
                return (
                  <Link
                    key={entryId}
                    to={`/app/${slug}/${entryId}`}
                    className="bg-gray-300 p-2 rounded"
                  >
                    {icon} {value}
                  </Link>
                )
              })}
        </div>
        <h4 className="text-xl font-light my-4">Linked Documents</h4>
        <div className="flex flex-wrap gap-2">
          {documents.length === 0
            ? 'No Linked Entries'
            : documents.map(({id, title}) => {
                return (
                  <Link
                    key={id}
                    to={`/app/documents/${id}`}
                    className="bg-gray-300 p-2 rounded"
                  >
                    📰 {title}
                  </Link>
                )
              })}
        </div>
        <h4 className="text-xl font-light my-4">Linked Passwords</h4>
        <div className="flex flex-wrap gap-2">
          {entry.passwords.length === 0
            ? 'No Passwords'
            : entry.passwords.map(({id, password}) => {
                return (
                  <Link
                    key={id}
                    to={`/app/passwords/${password.id}`}
                    className="bg-gray-300 p-2 rounded"
                  >
                    🔒 {password.title}
                  </Link>
                )
              })}
        </div>
        <LinkButton
          to={`/app/${entry.asset.slug}/${entry.id}/link-password`}
          className="bg-info text-sm mt-4"
        >
          Link a Password
        </LinkButton>
        <h4 className="text-xl font-light my-4">Revision History</h4>
        {revisions.map(({id, changeNote, createdAt, userName, fieldName}) => {
          return (
            <div key={id}>
              {changeNote} ({fieldName})
              <br />
              <Link
                to={`/app/${entry.asset.slug}/${entry.id}/${id}`}
                className="text-sm text-gray-400"
              >
                {formatAsDateTime(createdAt)} - {userName}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AssetEntry
