import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {Outlet, useLoaderData, useMatches} from '@remix-run/react'
import {invariant} from '@arcath/utils'

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
  const matches = useMatches()

  const actions = () => {
    const match = matches.pop()

    if (!match) {
      return []
    }

    const {id, params} = match

    invariant(id)
    invariant(params)

    switch (id) {
      case 'routes/app.$assetslug._index':
        return [
          {
            link: `/app/${asset.slug}/add`,
            label: `Add ${asset.singular}`,
            className: 'bg-success'
          }
        ]
      case 'routes/app.$assetslug.$entry._index':
        return [
          {
            link: `/app/${asset.slug}/${params.entry}/edit`,
            label: `Edit ${asset.singular}`,
            className: 'bg-info'
          },
          {
            link: `/app/${asset.slug}/${params.entry}/delete`,
            label: `Delete ${asset.singular}`,
            className: 'bg-danger'
          }
        ]
      default:
        return []
    }
  }

  return (
    <div>
      <Header title={asset.name} actions={actions()} />
      <Outlet />
    </div>
  )
}

export default Asset
