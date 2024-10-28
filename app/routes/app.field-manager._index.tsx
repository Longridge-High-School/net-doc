import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'field-manager:list', {})

  const prisma = getPrisma()

  const fields = await prisma.field.findMany({orderBy: {name: 'asc'}})

  return json({user, fields})
}

export const meta: MetaFunction = ({matches}) => {
  return [{title: pageTitle(matches, 'Field Manager')}]
}

const FieldManagerList = () => {
  const {fields} = useLoaderData<typeof loader>()

  return (
    <div>
      <table className="entry-table">
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
                  <Link to={`/app/field-manager/${id}`}>{name}</Link>
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
