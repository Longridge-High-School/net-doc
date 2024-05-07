import {
  type LoaderFunctionArgs,
  type MetaFunction,
  type HeadersArgs,
  json
} from '@remix-run/node'
import {indexedBy} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Link, useLoaderData} from '@remix-run/react'
import {pageTitle} from '~/lib/utils/page-title'
import {FIELDS} from '~/lib/fields/field'
import {createTimings} from '~/lib/utils/timings.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  const user = await time('getUser', 'Get User', () =>
    ensureUser(request, 'asset:view', {
      assetSlug: params.assetslug
    })
  )

  const prisma = getPrisma()

  const asset = await time('getAsset', 'Get Asset', () =>
    prisma.asset.findFirstOrThrow({
      where: {slug: params.assetslug},
      include: {assetFields: {include: {field: true}, orderBy: {order: 'asc'}}}
    })
  )

  const entries = await time(
    'getEntries',
    'Get Entries',
    () => prisma.$queryRaw<Array<{id: string; name: string}>>`
    SELECT Entry.id, Value.value as name FROM Entry 
  INNER JOIN Value ON Value.fieldId = (SELECT nameFieldId from Asset WHERE id = Entry.assetId) AND entryId = entry.id
  WHERE 
	assetId = (SELECT id from Asset WHERE slug = ${params.assetslug}) 
	AND
	deleted = false
	AND
	aclId IN (SELECT aclId FROM ACLEntry 
		WHERE read = true AND (
			(type = "role" AND target = ${user.role}) 
			OR 
			(type = "user" AND target = ${user.id})
			)
		)
  ORDER BY lower(name) ASC`
  )

  const extraValues = await time(
    'getColumns',
    'Get Column Values',
    () => prisma.$queryRaw<
      Array<{
        valueId: string
        name: string
        value: string
        type: string
        lookup: string
      }>
    >`SELECT Value.id as valueId, Field.name, Value.value, Field.type, Value.entryId || '/' || Value.fieldId as lookup FROM AssetField 
  INNER JOIN Asset on Asset.id = AssetField.assetId
  INNER JOIN Field on Field.id = AssetField.fieldId
  INNER JOIN Value on Value.fieldId = AssetField.fieldId
  WHERE AssetField.displayOnTable = true AND AssetField.assetId = (SELECT id FROM Asset WHERE slug = ${params.assetslug})`
  )

  return json(
    {user, asset, entries, values: indexedBy('lookup', extraValues)},
    {headers: headers()}
  )
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: pageTitle(data!.asset.plural)}]
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}

const Asset = () => {
  const {asset, entries, values} = useLoaderData<typeof loader>()

  return (
    <div>
      <table className="entry-table">
        <thead>
          <tr>
            <th>{asset.singular}</th>
            {asset.assetFields
              .filter(({displayOnTable}) => displayOnTable)
              .map(({id, field}) => {
                return <th key={id}>{field.name}</th>
              })}
          </tr>
        </thead>
        <tbody>
          {entries.map(({id, name}) => {
            return (
              <tr key={id}>
                <td>
                  <Link to={`/app/${asset.slug}/${id}`}>{name}</Link>
                </td>
                {asset.assetFields
                  .filter(({displayOnTable}) => displayOnTable)
                  .map(({field}) => {
                    const lookup = `${id}/${field.id}`

                    const {value} = values[lookup]
                      ? values[lookup]
                      : {value: ''}

                    const Value = () => {
                      return FIELDS[field.type].listComponent({
                        value,
                        title: field.name,
                        meta: field.meta
                      })
                    }

                    return (
                      <td key={lookup}>
                        <Value />
                      </td>
                    )
                  })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Asset
