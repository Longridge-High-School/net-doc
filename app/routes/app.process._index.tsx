import {type LoaderFunctionArgs, type MetaFunction} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'
import {getProcesses, getProcessesFromDocuments} from '@prisma/client/sql'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {formatAsDate} from '~/lib/utils/format'
import {pageTitle} from '~/lib/utils/page-title'
import {AButton} from '~/lib/components/button'
import {reviveDate} from '~/lib/utils/serialize'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'process:list', {})

  const prisma = getPrisma()

  const processes = await prisma.$queryRawTyped(
    getProcesses(user.role, user.id)
  )

  const documents = await prisma.$queryRawTyped(
    getProcessesFromDocuments(user.role, user.id)
  )

  return {user, processes, documents}
}

export const meta: MetaFunction = ({matches}) => {
  return [{title: pageTitle(matches, 'Processes')}]
}

const ProcessList = () => {
  const {processes, documents} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 print:grid-cols-1 gap-4">
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
                <td>{formatAsDate(reviveDate(updatedAt).toISOString())}</td>
                <td>{complete ? 'Yes' : 'No'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div>
        <table className="entry-table print:hidden w-full">
          <thead>
            <tr>
              <th>Document</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {documents.map(({id, title}) => {
              return (
                <tr key={id}>
                  <td>{title}</td>
                  <td>
                    <AButton
                      href={`/app/process/add/${id}`}
                      className="bg-warning"
                    >
                      New Process Run
                    </AButton>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProcessList
