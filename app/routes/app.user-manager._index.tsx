import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'user-manager:list', {})

  const prisma = getPrisma()

  const users = await prisma.user.findMany({
    select: {id: true, name: true, email: true},
    orderBy: {name: 'asc'}
  })

  return json({user, users})
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('User Manager')}]
}

const UserManagerList = () => {
  const {users} = useLoaderData<typeof loader>()

  return (
    <div>
      <table className="entry-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map(({id, name, email}) => {
            return (
              <tr key={id}>
                <td>
                  <Link to={`/app/user-manager/${id}`}>{name}</Link>
                </td>
                <td>{email}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default UserManagerList
