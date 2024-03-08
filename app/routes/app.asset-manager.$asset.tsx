import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {Outlet, useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset-manager:edit', {
    assetId: params.asset
  })

  const prisma = getPrisma()

  const asset = await prisma.asset.findFirstOrThrow({
    where: {id: params.asset},
    include: {assetFields: {include: {field: true}}}
  })

  const fieldIds = asset.assetFields.map(({fieldId}) => fieldId)

  const fields = await prisma.field.findMany({
    orderBy: {name: 'asc'},
    where: {id: {notIn: fieldIds}}
  })

  return json({user, asset, fields})
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
        </div>
        <h3 className="border-b border-gray-300 font-light mb-2">Fields</h3>
        <table className="entry-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Helper Text</th>
            </tr>
          </thead>
          <tbody>
            {asset.assetFields.map(({id, helperText, field}) => {
              return (
                <tr key={id}>
                  <td>{field.name}</td>
                  <td>{helperText}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <h3 className="border-b border-gray-300 font-light mt-4 mb-2">
          Add Field
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {fields.map(({id, name, description}) => {
            return (
              <a
                key={id}
                className="bg-white shadow p-2 cursor-pointer hover:shadow-none"
                href={`/app/asset-manager/${asset.id}/add/${id}`}
              >
                {name}
                <br />
                {description}
              </a>
            )
          })}
        </div>
      </div>
      <Outlet />
    </div>
  )
}

export default AssetManagerAsset
