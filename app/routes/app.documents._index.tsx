import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {AButton} from '~/lib/components/button'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'document:list', {})

  const prisma = getPrisma()

  const documents = await prisma.document.findMany({orderBy: {title: 'asc'}})

  return json({user, documents})
}

const DocumentsList = () => {
  const {documents} = useLoaderData<typeof loader>()

  return (
    <div>
      <AButton className="bg-success" href="/app/documents/add">
        Add Document
      </AButton>
      <table>
        <thead>
          <tr>
            <th>Document</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(({id, title}) => {
            return (
              <tr key={id}>
                <td>
                  <a href={`/app/documents/${id}`}>{title}</a>
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
