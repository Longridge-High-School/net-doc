import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {AButton} from '~/lib/components/button'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:list', {})

  const prisma = getPrisma()

  const passwords = await prisma.password.findMany({orderBy: {title: 'asc'}})

  return json({user, passwords})
}

const DocumentsList = () => {
  const {passwords} = useLoaderData<typeof loader>()

  return (
    <div>
      <AButton className="bg-success" href="/app/passwords/add">
        Add Password
      </AButton>
      <table>
        <thead>
          <tr>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {passwords.map(({id, title}) => {
            return (
              <tr key={id}>
                <td>
                  <a href={`/app/passwords/${id}`}>{title}</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DocumentsList
