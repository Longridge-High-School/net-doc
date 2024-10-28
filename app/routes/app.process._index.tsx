import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'
import {getProcesses} from '@prisma/client/sql'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {formatAsDate} from '~/lib/utils/format'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'process:list', {})

  const prisma = getPrisma()

  const processes = await prisma.$queryRawTyped(
    getProcesses(user.role, user.id)
  )

  return json({user, processes})
}

export const meta: MetaFunction = ({matches}) => {
  return [{title: pageTitle(matches, 'Processes')}]
}

const ProcessList = () => {
  const {processes} = useLoaderData<typeof loader>()

  return (
    <div>
      <table className="entry-table">
        <thead>
          <tr>
            <th>Process</th>
            <th>Last Updated</th>
            <th>Complete?</th>
          </tr>
        </thead>
        <tbody>
          {processes.map(({id, title, updatedAt, complete}) => {
            return (
              <tr key={id}>
                <td>
                  <Link to={`/app/process/${id}`} className="entry-link">
                    {title}
                  </Link>
                </td>
                <td>{formatAsDate(updatedAt)}</td>
                <td>{complete ? 'Yes' : 'No'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ProcessList
