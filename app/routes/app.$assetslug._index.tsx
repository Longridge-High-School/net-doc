import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {type Entry} from '@prisma/client'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {useLoaderData} from '@remix-run/react'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset:view', {
    assetSlug: params.assetslug
  })

  const prisma = getPrisma()

  const asset = await prisma.asset.findFirstOrThrow({
    where: {slug: params.assetslug},
    include: {assetFields: {include: {field: true}}}
  })

  const entries = await prisma.$queryRaw<
    Array<Entry & {value: string; entryId: string}>
  >`SELECT * FROM Entry INNER JOIN Value value ON fieldId = (SELECT nameFieldId from Asset WHERE slug = ${params.assetslug}) AND entryId = entry.id WHERE assetId = (SELECT id from Asset WHERE slug = ${params.assetslug}) AND deleted = false;`

  return json({user, asset, entries})
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: pageTitle(data?.asset.plural!)}]
}

const Asset = () => {
  const {asset, entries} = useLoaderData<typeof loader>()

  return (
    <div>
      <table className="entry-table">
        <thead>
          <tr>
            <th>{asset.singular}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(({entryId, value}) => {
            return (
              <tr key={entryId}>
                <td>
                  <a href={`/app/${asset.slug}/${entryId}`}>{value}</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Asset
