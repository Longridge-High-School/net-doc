import {type LoaderFunctionArgs, type MetaFunction} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'group-manager:list', {})

  const prisma = getPrisma()

  const groups = await prisma.group.findMany({
    orderBy: {name: 'asc'},
    include: {users: true}
  })

  return {user, groups}
}

export const meta: MetaFunction = ({matches}) => {
  return [{title: pageTitle(matches, 'Group Manager')}]
}

const Groups = () => {
  const {groups} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 print:grid-cols-1 gap-4">
      <table className="entry-table">
        <thead>
          <tr>
            <th>Group</th>
            <th>Members</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(({id, name, users}) => {
            return (
              <tr key={id}>
                <td>
                  <Link to={`/app/groups-manager/${id}`}>{name}</Link>
                </td>
                <td>{users.length}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Groups
