import {type LoaderFunctionArgs, type HeadersArgs, json} from '@remix-run/node'
import {type Entry} from '@prisma/client'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

import {createTimings} from '~/lib/utils/timings.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  await time('getUser', 'Get User', () =>
    ensureUser(request, 'asset:view', {
      asset: params.asset
    })
  )

  const prisma = getPrisma()

  const asset = await time('getAsset', 'Get Asset', () =>
    prisma.asset.findFirstOrThrow({
      where: {id: params.asset},
      include: {assetFields: {include: {field: true}}}
    })
  )

  const entries = await time(
    'getEntires',
    'Get Entries',
    () =>
      prisma.$queryRaw<
        Array<Entry & {value: string; entryId: string}>
      >`SELECT * FROM Entry INNER JOIN Value value ON fieldId = (SELECT nameFieldId from Asset WHERE id = ${params.asset}) AND entryId = entry.id WHERE assetId = (SELECT id from Asset WHERE id = ${params.asset}) AND deleted = false;`
  )

  return json({asset, entries}, {headers: headers()})
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}
