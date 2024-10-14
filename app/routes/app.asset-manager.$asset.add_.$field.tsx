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
import {Label, Input, HelperText, Checkbox} from '~/lib/components/input'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset-manager:edit', {
    assetId: params.asset
  })

  const prisma = getPrisma()

  const field = await prisma.field.findFirstOrThrow({where: {id: params.field}})

  return json({user, field})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'asset-manager:add', {})

  const prisma = getPrisma()

  const formData = await request.formData()

  const helper = formData.get('helper') as string | undefined
  const order = formData.get('order') as string | undefined
  const displayOnTable = formData.get('displayontable') as null | 'on'

  invariant(helper)
  invariant(order)

  const fieldCount = await prisma.assetField.count({
    where: {assetId: params.asset!}
  })

  const uniqueCount = await prisma.assetField.count({
    where: {fieldId: params.field!, unique: 2}
  })

  const newField = await prisma.assetField.create({
    data: {
      assetId: params.asset!,
      fieldId: params.field!,
      helperText: helper,
      order: parseInt(order),
      displayOnTable: displayOnTable === 'on',
      unique: uniqueCount > 0 ? 2 : 0
    }
  })

  if (fieldCount === 0) {
    await prisma.asset.update({
      where: {id: params.asset!},
      data: {nameFieldId: newField.fieldId, sortFieldId: newField.fieldId}
    })
  }

  return redirect(`/app/asset-manager/${params.asset}`)
}

const AssetManagerAddFieldToAsset = () => {
  const {field} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
      <h2>Add Field</h2>
      <h4 className="font-bold">{field.name}</h4>
      <p className="mb-4">{field.description}</p>
      <form method="POST">
        <Label>
          Helper Text
          <Input name="helper" />
          <HelperText>
            The text displayed under the field in the entry form.
          </HelperText>
        </Label>
        <Label>
          Order
          <Input name="order" type="number" />
          <HelperText>
            The order to display the fields in (number, lowest first).
          </HelperText>
        </Label>
        <Label>
          Display on Tables?
          <Checkbox name="displayontable" defaultChecked={false} />
          <HelperText>
            Should this field be displayed on the table? (do not set to yes for
            the name field).
          </HelperText>
        </Label>
        <Button className="bg-success">Add Field</Button>
      </form>
    </div>
  )
}

export default AssetManagerAddFieldToAsset
