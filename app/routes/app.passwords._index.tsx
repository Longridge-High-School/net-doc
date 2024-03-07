import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:list', {})

  const prisma = getPrisma()

  const passwords = await prisma.password.findMany({
    select: {id: true, title: true, username: true},
    orderBy: {title: 'asc'}
  })

  return json({user, passwords})
}

const DocumentsList = () => {
  const {passwords} = useLoaderData<typeof loader>()

  return (
    <div>
      <table className="entry-table">
        <thead>
          <tr>
            <th>Password</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          {passwords.map(({id, title, username}) => {
            return (
              <tr key={id}>
                <td>
                  <a href={`/app/passwords/${id}`}>{title}</a>
                </td>
                <td>{username}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DocumentsList
