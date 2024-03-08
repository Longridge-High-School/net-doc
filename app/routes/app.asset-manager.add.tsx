import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json,
  redirect
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Label, Input, HelperText} from '~/lib/components/input'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset-manager:add', {})

  return json({user})
}

export const action = async ({request}: ActionFunctionArgs) => {
  await ensureUser(request, 'asset-manager:add', {})

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const slug = formData.get('slug') as string | undefined
  const singular = formData.get('singular') as string | undefined
  const plural = formData.get('plural') as string | undefined

  invariant(name)
  invariant(slug)
  invariant(singular)
  invariant(plural)

  const asset = await prisma.asset.create({
    data: {name, slug, singular, plural, icon: '', nameFieldId: ''}
  })

  return redirect(`/app/asset-manager/${asset.id}`)
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Asset Manager', 'Add')}]
}

const AssetManagerAdd = () => {
  return (
    <div className="entry">
      <form method="POST">
        <Label>
          Name
          <Input name="name" />
          <HelperText>The name of the asset type, used in the menu.</HelperText>
        </Label>
        <Label>
          Slug
          <Input name="slug" />
          <HelperText>The slug used in the URL.</HelperText>
        </Label>
        <Label>
          Singular
          <Input name="singular" />
          <HelperText>The singular name for an entry.</HelperText>
        </Label>
        <Label>
          Plural
          <Input name="plural" />
          <HelperText>The plural name for a list of entries.</HelperText>
        </Label>
        <Button className="bg-success">Add Asset</Button>
      </form>
    </div>
  )
}

export default AssetManagerAdd
