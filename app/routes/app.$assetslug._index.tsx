import {
  type LoaderFunctionArgs,
  type MetaFunction,
  type HeadersArgs,
  data
} from '@remix-run/node'
import {indexedBy} from '@arcath/utils'
import {getEntries, getExtraValues} from '@prisma/client/sql'

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

  const entries = await time('getEntries', 'Get Entries', () =>
    prisma.$queryRawTyped(getEntries(params.assetslug!, user.id))
  )

  const extraValues = await time('getColumns', 'Get Column Values', () =>
    prisma.$queryRawTyped(getExtraValues(params.assetslug!, user.id))
  )

  return data(
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
