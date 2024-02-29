import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {Outlet, useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {AButton} from '~/lib/components/button'

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
        <h4 className="text-xl">{asset.name}</h4>
        <AButton
          href={`/app/asset-manager/${asset.id}/edit`}
          className="bg-info"
        >
          Edit
        </AButton>
        <h5>Fields</h5>
        <table>
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
        <h5>Add Field</h5>
        <div className="grid grid-cols-3 gap-2">
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
