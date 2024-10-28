import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json,
  redirect
} from '@remix-run/node'
import {asyncForEach, diffArray, invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {useLoaderData} from '@remix-run/react'
import {Button} from '~/lib/components/button'
import {relationField} from '~/lib/fields/relation'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'entry:write', {
    entryId: params.entry
  })

  const prisma = getPrisma()

  const entry = await prisma.entry.findFirstOrThrow({
    where: {id: params.entry},
    include: {
      passwords: {include: {password: {select: {id: true, title: true}}}},
      asset: true
    }
  })

  return json({user, entry})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'entry:write', {
    entryId: params.entry
  })

  const entryId = params.entry

  invariant(entryId)

  const formData = await request.formData()

  const passwordsString = formData.get('passwords') as string | undefined

  invariant(passwordsString)

  const newPasswordIds = JSON.parse(passwordsString) as string[]

  const prisma = getPrisma()

  const links = await prisma.entryPassword.findMany({where: {entryId}})

  const currentPasswordIds = links.map(({passwordId}) => passwordId)

  const {additional, missing} = diffArray(currentPasswordIds, newPasswordIds)

  console.dir([
    passwordsString,
    newPasswordIds,
    currentPasswordIds,
    additional,
    missing
  ])

  await asyncForEach(additional, async passwordId => {
    await prisma.entryPassword.create({data: {passwordId, entryId}})
  })

  await prisma.entryPassword.deleteMany({
    where: {entryId, passwordId: {in: missing}}
  })

  return redirect(`/app/${params.assetslug}/${params.entry}`)
}

export const meta: MetaFunction<typeof loader> = ({matches, data}) => {
  return [
    {
      title: pageTitle(matches, data!.entry.asset.singular, 'Link a Password')
    }
  ]
}

const LinkPasswordToEntry = () => {
  const {entry} = useLoaderData<typeof loader>()

  const {asset} = entry

  const initialValue = entry.passwords.map(({password}) => {
    return password.id
  })

  const Selector = () => {
    return relationField.editComponent({
      name: 'passwords',
      label: 'Passwords',
      meta: 'password',
      value: JSON.stringify(initialValue),
      helperText: 'Select any linked passwords here.',
      validation: {required: false}
    })
  }

  return (
    <div className="entry">
      <h2>Link Password to {asset.singular}</h2>
      <form method="POST">
        <Selector />
        <Button className="bg-success">
          Link Password to {asset.singular}
        </Button>
      </form>
    </div>
  )
}

export default LinkPasswordToEntry
