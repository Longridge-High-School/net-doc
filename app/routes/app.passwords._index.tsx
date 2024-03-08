import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:list', {})

  const prisma = getPrisma()

  const passwords = await prisma.password.findMany({
    select: {id: true, title: true, username: true},
    orderBy: {title: 'asc'}
  })

  return json({user, passwords})
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Password')}]
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
