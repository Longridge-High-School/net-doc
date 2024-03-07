import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {AButton} from '~/lib/components/button'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'field-manager:list', {})

  const prisma = getPrisma()

  const fields = await prisma.field.findMany({orderBy: {name: 'asc'}})

  return json({user, fields})
}

const FieldManagerList = () => {
  const {fields} = useLoaderData<typeof loader>()

  return (
    <div>
      <AButton className="bg-success" href="/app/field-manager/add">
        Add Field
      </AButton>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {fields.map(({id, name, type}) => {
            return (
              <tr key={id}>
                <td>
                  <a href={`/app/field-manager/${id}`}>{name}</a>
                </td>
                <td>{type}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default FieldManagerList
