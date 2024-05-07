import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {groupedBy} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {LinkButton} from '~/lib/components/button'
import {FIELDS} from '~/lib/fields/field'
import {pageTitle} from '~/lib/utils/page-title'
import {formatAsDateTime} from '~/lib/utils/format'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'entry:read', {
    entryId: params.entry
  })

  const prisma = getPrisma()

  const entry = await prisma.entry.findFirstOrThrow({
    where: {id: params.entry},
    include: {
      asset: true,
      passwords: {
        include: {password: {select: {id: true, title: true, username: true}}}
      }
    }
  })

  const values = await prisma.$queryRaw<
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

  const revisions = await prisma.$queryRaw<
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

  const pastValues = await prisma.$queryRaw<
    Array<{valueAtPoint: string; valueId: string}>
  >`SELECT ValueHistory.valueAtPoint, ValueHistory.valueId FROM ValueHistory
  INNER JOIN ValueHistory Revision ON Revision.id = ${params.revision}
  INNER JOIN Value RevisionValue ON RevisionValue.id = Revision.valueId
  INNER JOIN Value ON Value.id = ValueHistory.valueId
  WHERE ValueHistory.createdAt >= Revision.createdAt AND ValueHistory.valueId IN (SELECT id FROM Value WHERE entryId = RevisionValue.entryId)
  ORDER BY ValueHistory.createdAt DESC`

  const name = values.reduce((n, v) => {
    if (n !== '') return n

    if (v.fieldId === entry.asset.nameFieldId) return v.value

    return ''
  }, '')

  return json({user, entry, name, values, revisions, pastValues})
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: pageTitle(data!.entry.asset.singular, data!.name)}]
}

const AssetEntry = () => {
  const {entry, name, values, revisions, pastValues} =
    useLoaderData<typeof loader>()

  const pastValuesById = groupedBy('valueId', pastValues)

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3">
        <div className="border border-gray-300 shadow-xl bg-white p-2">
          <h2 className="border-b border-b-gray-200 text-xl font-light mb-4">
            {name}
          </h2>
          {values.map(({id, value, type, meta, fieldName}) => {
            const v = pastValuesById[id]
              ? pastValuesById[id].pop()!.valueAtPoint
              : value

            const Field = ({value}: {value: string}) => {
              return FIELDS[type].viewComponent({
                value,
                title: fieldName,
                meta: meta
              })
            }

            return <Field value={v} key={id} />
          })}
        </div>
      </div>
      <div>
        <h4 className="text-xl font-light my-4">Revision History</h4>
        <LinkButton
          className="bg-info mb-4"
          to={`/app/${entry.asset.slug}/${entry.id}`}
        >
          Current
        </LinkButton>
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
