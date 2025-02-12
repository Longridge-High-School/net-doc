import {
  type LoaderFunctionArgs,
  type MetaFunction,
  type HeadersArgs,
  data
} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {
  getEntryValues,
  getEntryRevisions,
  getEntryRelations,
  getEntryPasswords
} from '@prisma/client/sql'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {LinkButton} from '~/lib/components/button'
import {FIELDS} from '~/lib/fields/field'
import {pageTitle} from '~/lib/utils/page-title'
import {formatAsDateTime} from '~/lib/utils/format'
import {can} from '~/lib/rbac.server'
import {createTimings} from '~/lib/utils/timings.server'
import {trackRecentItem} from '~/lib/utils/recent-item'
import {reviveDate} from '~/lib/utils/serialize'

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
        asset: true
      }
    })
  )

  await time('setRecents', 'Set Recent Entries', () =>
    trackRecentItem(entry.asset.slug, entry.id, user.id)
  )

  const passwords = await time('getPasswords', 'Get Passwords', () =>
    prisma.$queryRawTyped(getEntryPasswords(entry.id, user.id))
  )

  const values = await time('getValues', 'Get Values', () =>
    prisma.$queryRawTyped(getEntryValues(entry.id))
  )

  const relations = await time('getRelations', 'Get Relations', () =>
    prisma.$queryRawTyped(getEntryRelations(`%${entry.id}%`, user.id))
  )

  const documents = await time('getDocuments', 'Get Documents', () =>
    prisma.document.findMany({
      where: {body: {contains: params.entry}}
    })
  )

  const revisions = await time('getRevisions', 'Get Revisions', () =>
    prisma.$queryRawTyped(getEntryRevisions(entry.id))
  )

  const name = values.reduce((n, v) => {
    if (n !== '') return n

    if (v.fieldId === entry.asset.nameFieldId) return v.value

    return ''
  }, '')

  const canEdit = await can(user.role, 'entry:edit', {user, entryId: entry.id})

  return data(
    {
      user,
      entry,
      relations,
      documents,
      name,
      values,
      revisions,
      canEdit,
      passwords
    },
    {headers: headers({'Set-Cookie': user.setCookie})}
  )
}

export const meta: MetaFunction<typeof loader> = ({matches, data}) => {
  return [{title: pageTitle(matches, data!.entry.asset.singular, data!.name)}]
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}

const AssetEntry = () => {
  const {entry, relations, documents, name, values, revisions, passwords} =
    useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3 print:col-span-4">
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
      <div className="print:hidden">
        <h3 className="border-b border-b-gray-200 text-xl font-light mb-4">
          Additional Details
        </h3>
        <h4 className="text-xl font-light mb-4">Linked Entries</h4>
        <div className="flex flex-wrap gap-2">
          {relations.length === 0
            ? 'No Linked Entries'
            : relations.map(({id, value, slug, icon}) => {
                return (
                  <Link
                    key={id}
                    to={`/app/${slug}/${id}`}
                    className="bg-gray-300 p-2 rounded-sm"
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
                    className="bg-gray-300 p-2 rounded-sm"
                  >
                    📰 {title}
                  </Link>
                )
              })}
        </div>
        <h4 className="text-xl font-light my-4">Linked Passwords</h4>
        <div className="flex flex-wrap gap-2">
          {passwords.length === 0
            ? 'No Passwords'
            : passwords.map(({id, title}) => {
                return (
                  <Link
                    key={id}
                    to={`/app/passwords/${id}`}
                    className="bg-gray-300 p-2 rounded-sm"
                  >
                    🔒 {title}
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
                {formatAsDateTime(reviveDate(createdAt).toISOString())} -{' '}
                {userName}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AssetEntry
