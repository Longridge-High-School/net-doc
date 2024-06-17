import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Label, Input, HelperText, Select} from '~/lib/components/input'
export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset-manager:edit', {
    assetId: params.asset
  })

  const prisma = getPrisma()

  const asset = await prisma.asset.findFirstOrThrow({
    where: {id: params.asset},
    include: {assetFields: {include: {field: true}}, acl: true}
  })

  const acls = await prisma.aCL.findMany({orderBy: {name: 'asc'}})

  return json({user, asset, acls})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'asset-manager:add', {})

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const slug = formData.get('slug') as string | undefined
  const singular = formData.get('singular') as string | undefined
  const plural = formData.get('plural') as string | undefined
  const nameFieldId = formData.get('namefield') as string | undefined
  const sortFieldId = formData.get('sortfield') as string | undefined
  const sortOrder = formData.get('sortorder') as ('ASC' | 'DESC') | undefined
  const icon = formData.get('icon') as string | undefined
  const acl = formData.get('acl') as string | undefined

  invariant(name)
  invariant(slug)
  invariant(singular)
  invariant(plural)
  invariant(nameFieldId)
  invariant(sortFieldId)
  invariant(sortOrder)
  invariant(icon)
  invariant(acl)

  const oldAclId = (
    await prisma.asset.findFirstOrThrow({
      where: {id: params.asset},
      select: {aclId: true}
    })
  ).aclId

  if (oldAclId !== acl) {
    await prisma.entry.updateMany({
      where: {assetId: params.asset, aclId: oldAclId},
      data: {aclId: acl}
    })
  }

  const asset = await prisma.asset.update({
    where: {id: params.asset},
    data: {
      name,
      slug,
      singular,
      plural,
      icon,
      nameFieldId,
      aclId: acl,
      sortFieldId,
      sortOrder
    }
  })

  return redirect(`/app/asset-manager/${asset.id}`)
}

const AssetManagerAsset = () => {
  const {asset, acls} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
      <h2>Edit</h2>
      <form method="POST">
        <Label>
          Name
          <Input name="name" defaultValue={asset.name} />
          <HelperText>The name of the asset type, used in the menu.</HelperText>
        </Label>
        <Label>
          Slug
          <Input name="slug" defaultValue={asset.slug} />
          <HelperText>The slug used in the URL.</HelperText>
        </Label>
        <Label>
          Icon
          <Input name="icon" defaultValue={asset.icon} />
          <HelperText>
            An Emoji to use as an icon (Win+. on Windows).
          </HelperText>
        </Label>
        <Label>
          Singular
          <Input name="singular" defaultValue={asset.singular} />
          <HelperText>The singular name for an entry.</HelperText>
        </Label>
        <Label>
          Plural
          <Input name="plural" defaultValue={asset.plural} />
          <HelperText>The plural name for a list of entries.</HelperText>
        </Label>
        <Label>
          Name Field
          <Select name="namefield" defaultValue={asset.nameFieldId}>
            {asset.assetFields.map(({id, field}) => {
              return (
                <option key={id} value={field.id}>
                  {field.name}
                </option>
              )
            })}
          </Select>
          <HelperText>Which field provides the name for an entry</HelperText>
        </Label>
        <Label>
          Sort Field
          <Select name="sortfield" defaultValue={asset.sortFieldId}>
            {asset.assetFields
              .filter(
                ({displayOnTable, fieldId}) =>
                  displayOnTable || fieldId === asset.nameFieldId
              )
              .map(({id, field}) => {
                return (
                  <option key={id} value={field.id}>
                    {field.name}
                  </option>
                )
              })}
          </Select>
          <HelperText>Which field should be used to sort the table</HelperText>
        </Label>
        <Label>
          Sort Order
          <Select name="sortorder" defaultValue={asset.sortOrder}>
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </Select>
          <HelperText>Which order should the table be displayed in</HelperText>
        </Label>
        <Label>
          ACL
          <Select name="acl" defaultValue={asset.aclId}>
            {acls.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </Select>
          <HelperText>
            Change the ACL for this asset, new entries under this asset, and any
            entries using the current ACL.
          </HelperText>
        </Label>
        <Button className="bg-success">Update Asset</Button>
      </form>
    </div>
  )
}

export default AssetManagerAsset
