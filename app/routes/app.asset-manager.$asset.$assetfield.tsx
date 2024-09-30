import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Label, Input, HelperText, Checkbox} from '~/lib/components/input'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset-manager:edit', {
    assetId: params.asset
  })

  const prisma = getPrisma()
  const assetField = await prisma.assetField.findFirstOrThrow({
    where: {id: params.assetfield!, assetId: params.asset!},
    include: {field: true}
  })

  return json({user, assetField})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'asset-manager:add', {})

  const prisma = getPrisma()

  const formData = await request.formData()

  const helper = formData.get('helper') as string | undefined
  const order = formData.get('order') as string | undefined
  const displayOnTable = formData.get('displayontable') as null | 'on'
  const hidden = formData.get('hidden') as null | 'on'

  invariant(helper)
  invariant(order)

  await prisma.assetField.update({
    where: {id: params.assetfield},
    data: {
      helperText: helper,
      order: parseInt(order),
      displayOnTable: displayOnTable === 'on',
      hidden: hidden === 'on'
    }
  })

  return redirect(`/app/asset-manager/${params.asset}`)
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {
      title: pageTitle(
        'Asset Manager',
        'Edit Field',
        data!.assetField.field.name
      )
    }
  ]
}

const AssetManagerAddFieldToAsset = () => {
  const {assetField} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
      <h2>Edit Field</h2>
      <h4 className="font-bold">{assetField.field.name}</h4>
      <p className="mb-4">{assetField.field.description}</p>
      <form method="POST">
        <Label>
          Helper Text
          <Input name="helper" defaultValue={assetField.helperText} />
          <HelperText>
            The text displayed under the field in the entry form.
          </HelperText>
        </Label>
        <Label>
          Order
          <Input name="order" type="number" defaultValue={assetField.order} />
          <HelperText>
            The order to display the fields in (number, lowest first).
          </HelperText>
        </Label>
        <Label>
          Display on Tables?
          <Checkbox
            name="displayontable"
            defaultChecked={assetField.displayOnTable}
          />
          <HelperText>
            Should this field be displayed on the table? (do not set to yes for
            the name field).
          </HelperText>
        </Label>
        <Label>
          Hidden?
          <Checkbox name="hidden" defaultChecked={assetField.hidden} />
          <HelperText>
            Hide this field from the display (not revisions) and forms.
          </HelperText>
        </Label>
        <Button className="bg-success">Update Field</Button>
      </form>
    </div>
  )
}

export default AssetManagerAddFieldToAsset
