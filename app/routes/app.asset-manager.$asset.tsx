import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {Outlet, useLoaderData, Link} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset-manager:edit', {
    assetId: params.asset
  })

  const prisma = getPrisma()

  const asset = await prisma.asset.findFirstOrThrow({
    where: {id: params.asset},
    include: {
      assetFields: {include: {field: true}, orderBy: {order: 'asc'}},
      acl: true
    }
  })

  const fieldIds = asset.assetFields.map(({fieldId}) => fieldId)

  const fields = await prisma.field.findMany({
    orderBy: {name: 'asc'},
    where: {id: {notIn: fieldIds}}
  })

  return json({user, asset, fields})
}

export const meta: MetaFunction<typeof loader> = ({matches, data}) => {
  return [
    {
      title: pageTitle(matches, 'Asset Manager', data!.asset.name)
    }
  ]
}

const AssetManagerAsset = () => {
  const {asset, fields} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="entry">
          <h2>{asset.name}</h2>
          <div className="mb-4">
            <h5 className="mb-2 font-bold">Singular</h5>
            {asset.singular}
          </div>
          <div className="mb-4">
            <h5 className="mb-2 font-bold">Plural</h5>
            {asset.plural}
          </div>
          <div className="mb-4">
            <h5 className="mb-2 font-bold">ACL</h5>
            <Link to={`/app/acl-manager/${asset.aclId}`}>{asset.acl.name}</Link>
          </div>
        </div>
        <h3 className="border-b border-gray-300 font-light mb-2">Fields</h3>
        <table className="entry-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Helper Text</th>
              <th>Display on Table?</th>
              <th>Order</th>
            </tr>
          </thead>
          <tbody>
            {asset.assetFields.map(
              ({id, helperText, field, displayOnTable, order}) => {
                return (
                  <tr key={id}>
                    <td>
                      <Link to={`/app/asset-manager/${asset.id}/${id}`}>
                        {field.name}
                      </Link>
                    </td>
                    <td>{helperText}</td>
                    <td>{displayOnTable ? 'Yes' : 'No'}</td>
                    <td>{order}</td>
                  </tr>
                )
              }
            )}
          </tbody>
        </table>
        <h3 className="border-b border-gray-300 font-light mt-4 mb-2">
          Add Field
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {fields.map(({id, name, description}) => {
            return (
              <Link
                key={id}
                className="bg-white shadow-sm p-2 cursor-pointer hover:shadow-none"
                to={`/app/asset-manager/${asset.id}/add/${id}`}
              >
                {name}
                <br />
                {description}
              </Link>
            )
          })}
        </div>
      </div>
      <Outlet />
    </div>
  )
}

export default AssetManagerAsset
