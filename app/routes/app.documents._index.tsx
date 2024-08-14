import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {formatAsDate} from '~/lib/utils/format'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'document:list', {})

  const prisma = getPrisma()

  //const documents = await prisma.document.findMany({orderBy: {title: 'asc'}})
  const documents = await prisma.$queryRaw<
    Array<{id: string; title: string; updatedAt: string}>
  >`SELECT 
Document.id, Document.title, Document.updatedAt
FROM
Document
WHERE 
aclId IN (SELECT aclId FROM ACLEntry 
  WHERE read = true AND (
    (type = "role" AND target = ${user.role}) 
    OR 
    (type = "user" AND target = ${user.id})
    )
  )
ORDER BY
Document.title ASC`

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
