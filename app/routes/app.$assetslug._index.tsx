import {
  type LoaderFunctionArgs,
  type MetaFunction,
  type HeadersArgs,
  json
} from '@remix-run/node'
import {indexedBy} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {useLoaderData} from '@remix-run/react'
import {pageTitle} from '~/lib/utils/page-title'
import {createTimings} from '~/lib/utils/timings.server'

import {SortableTable} from '~/lib/components/sortable-table'

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
		)`
  )

  const extraValues = await time(
    'getColumns',
    'Get Column Values',
    () => prisma.$queryRaw<
      Array<{
        id: string
        value: string
        type: string
        lookup: string
      }>
    >`SELECT Value.id, Value.value, Value.entryId || '/' || Value.fieldId as lookup, Field.type  FROM Value 
    INNER JOIN Entry ON Entry.id = Value.entryId
    INNER JOIN Asset ON Asset.id = Entry.assetId
    INNER JOIN AssetField ON AssetField.assetId = Asset.id AND AssetField.fieldId = Value.fieldId
    INNER JOIN Field ON Field.id = Value.fieldId
  WHERE 
    ((AssetField.displayOnTable = true) OR (Value.fieldId = Asset.nameFieldId))
    AND
    Value.entryId IN (SELECT Entry.id FROM Entry
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
    )`
  )

  return json(
    {user, asset, entries, values: indexedBy('lookup', extraValues)},
    {headers: headers({'Set-Cookie': user.setCookie})}
  )
}

export const meta: MetaFunction<typeof loader> = ({matches, data}) => {
  return [{title: pageTitle(matches, data!.asset.plural)}]
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}

const Asset = () => {
  const {asset, entries, values} = useLoaderData<typeof loader>()

  return (
    <div>
      <SortableTable
        asset={asset}
        entries={entries}
        values={values}
        key={asset.slug}
      />
    </div>
  )
}

export default Asset
