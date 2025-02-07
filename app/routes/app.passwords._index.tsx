import {type LoaderFunctionArgs, type MetaFunction} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'
import {getPasswords} from '@prisma/client/sql'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:list', {})

  const prisma = getPrisma()

  const passwords = await prisma.$queryRawTyped(getPasswords(user.id))

  return {user, passwords}
}

export const meta: MetaFunction = ({matches}) => {
  return [{title: pageTitle(matches, 'Password')}]
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
                  <Link to={`/app/passwords/${id}`}>{title}</Link>
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
