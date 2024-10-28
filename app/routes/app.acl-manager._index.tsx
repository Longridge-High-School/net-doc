import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'
import {pageTitle} from '~/lib/utils/page-title'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset-manager:list', {})

  const prisma = getPrisma()

  const acls = await prisma.aCL.findMany({orderBy: {name: 'asc'}})

  return json({user, acls})
}

export const meta: MetaFunction = ({matches}) => {
  return [
    {
      title: pageTitle(matches, 'ACL Manager')
    }
  ]
}

const ACLManagerList = () => {
  const {acls} = useLoaderData<typeof loader>()

  return (
    <div>
      <table className="entry-table">
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {acls.map(({id, name}) => {
            return (
              <tr key={id}>
                <td>
                  <Link to={`/app/acl-manager/${id}`}>{name}</Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ACLManagerList
