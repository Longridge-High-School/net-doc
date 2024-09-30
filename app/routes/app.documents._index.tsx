import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'
import {getDocuments} from '@prisma/client/sql'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {formatAsDate} from '~/lib/utils/format'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'document:list', {})

  const prisma = getPrisma()

  const documents = await prisma.$queryRawTyped(
    getDocuments(user.role, user.id)
  )

  return json({user, documents})
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Documents')}]
}

const DocumentsList = () => {
  const {documents} = useLoaderData<typeof loader>()

  return (
    <div>
      <table className="entry-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(({id, title, updatedAt}) => {
            return (
              <tr key={id}>
                <td>
                  <Link to={`/app/documents/${id}`} className="entry-link">
                    {title}
                  </Link>
                </td>
                <td>{formatAsDate(updatedAt)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DocumentsList
