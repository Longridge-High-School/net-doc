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
import {Label, Input, HelperText} from '~/lib/components/input'

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

  invariant(helper)
  invariant(order)

  await prisma.assetField.create({
    data: {
      assetId: params.asset!,
      fieldId: params.field!,
      helperText: helper,
      order: parseInt(order)
    }
  })

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
        <Button className="bg-success">Add Field</Button>
      </form>
    </div>
  )
}

export default AssetManagerAddFieldToAsset
