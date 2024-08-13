import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:list', {})

  const prisma = getPrisma()

  const passwords = await prisma.$queryRaw<
    Array<{id: string; title: string; username: string}>
  >`SELECT 
	Password.id, Password.title, Password.username 
FROM
	Password
WHERE 
	aclId IN (SELECT aclId FROM ACLEntry 
		WHERE read = true AND (
			(type = "role" AND target = ${user.role}) 
			OR 
			(type = "user" AND target = ${user.id})
			)
		)
ORDER BY
	Password.title ASC`

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
