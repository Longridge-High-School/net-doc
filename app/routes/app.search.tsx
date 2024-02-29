import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json
} from '@remix-run/node'
import {invariant} from '@arcath/utils'
import {type Entry} from '@prisma/client'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {useActionData} from '@remix-run/react'
import {Header} from '~/lib/components/header'
import {Input, Label} from '~/lib/components/input'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'search', {})

  return json({user})
}

export const action = async ({request}: ActionFunctionArgs) => {
  await ensureUser(request, 'search', {})

  const formData = await request.formData()

  const query = formData.get('query') as string | undefined

  invariant(query)

  const prisma = getPrisma()

  const results = await prisma.$queryRaw<
    Array<Entry & {entryId: string; value: string; icon: string; slug: string}>
  >`SELECT * FROM Entry 
  INNER JOIN Value value ON fieldId = (SELECT nameFieldId FROM Asset WHERE Asset.id = entry.assetId) AND entryId = Entry.id
  INNER JOIN Asset ON Entry.assetId = Asset.id
  WHERE Entry.id IN (SELECT entryId FROM Value WHERE value LIKE ${`%${query}%`} OR value = ${query}) AND deleted = false`

  return json({results})
}

const Search = () => {
  const data = useActionData<typeof action>()

  return (
    <div>
      <Header title="Search" />
      <form method="POST">
        <Label>
          Search
          <Input name="query" />
        </Label>
      </form>

      {data
        ? data.results.map(({entryId, value, icon, slug}) => {
            return (
              <a key={entryId} href={`/app/${slug}/${entryId}`}>
                {icon} {value}
              </a>
            )
          })
        : ''}
    </div>
  )
}

export default Search
