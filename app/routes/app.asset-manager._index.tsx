import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {AButton} from '~/lib/components/button'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset-manager:list', {})

  const prisma = getPrisma()

  const assets = await prisma.asset.findMany({orderBy: {name: 'asc'}})

  return json({user, assets})
}

const AssetManagerList = () => {
  const {assets} = useLoaderData<typeof loader>()

  return (
    <div>
      <AButton className="bg-success" href="/app/asset-manager/add">
        Add Asset
      </AButton>
      <table>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(({id, name}) => {
            return (
              <tr key={id}>
                <td>
                  <a href={`/app/asset-manager/${id}`}>{name}</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AssetManagerList
