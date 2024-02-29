import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {AButton} from '~/lib/components/button'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'user-manager:list', {})

  const prisma = getPrisma()

  const users = await prisma.user.findMany({
    select: {id: true, name: true, email: true},
    orderBy: {name: 'asc'}
  })

  return json({user, users})
}

const UserManagerList = () => {
  const {users} = useLoaderData<typeof loader>()

  return (
    <div>
      <AButton className="bg-success" href="/app/user-manager/add">
        Add User
      </AButton>
      <table className="">
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
                  <a href={`/app/user-manager/${id}`}>{name}</a>
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
