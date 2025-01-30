import {type LoaderFunctionArgs, type MetaFunction} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'
import {pageTitle} from '~/lib/utils/page-title'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset-manager:list', {})

  const prisma = getPrisma()

  const assets = await prisma.asset.findMany({orderBy: {name: 'asc'}})

  return {user, assets}
}

export const meta: MetaFunction = ({matches}) => {
  return [
    {
      title: pageTitle(matches, 'Asset Manager')
    }
  ]
}

const AssetManagerList = () => {
  const {assets} = useLoaderData<typeof loader>()

  return (
    <div>
      <table className="entry-table">
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
                  <Link to={`/app/asset-manager/${id}`}>{name}</Link>
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
