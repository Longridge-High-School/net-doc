import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {Outlet, useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Header} from '~/lib/components/header'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset:view', {
    assetSlug: params.assetslug
  })

  const prisma = getPrisma()

  const asset = await prisma.asset.findFirstOrThrow({
    where: {slug: params.assetslug},
    include: {assetFields: {include: {field: true}}}
  })

  return json({user, asset})
}
const Asset = () => {
  const {asset} = useLoaderData<typeof loader>()

  return (
    <div>
      <Header title={asset.name} />
      <Outlet />
    </div>
  )
}

export default Asset
