import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json
} from '@remix-run/node'
import {Link, useActionData} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import {
  searchEntries,
  searchDocuments,
  searchPasswords
} from '@prisma/client/sql'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Header} from '~/lib/components/header'
import {Input, Label} from '~/lib/components/input'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'search', {})

  return json({user})
}

export const action = async ({request}: ActionFunctionArgs) => {
  const user = await ensureUser(request, 'search', {})

  const formData = await request.formData()

  const query = formData.get('query') as string | undefined

  invariant(query)

  const prisma = getPrisma()

  const entryResults = await prisma.$queryRawTyped(
    searchEntries(`%${query}%`, user.role, user.id)
  )

  const passwordResults = await prisma.$queryRawTyped(
    searchPasswords(`%${query}%`, user.role, user.id)
  )

  const documentResults = await prisma.$queryRawTyped(
    searchDocuments(`%${query}%`, user.role, user.id)
  )

  const results = [
    ...entryResults,
    ...passwordResults,
    ...documentResults
  ].sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''))

  return json({results, query})
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Search')}]
}

const Search = () => {
  const data = useActionData<typeof action>()

  return (
    <div>
      <Header title="Search" />
      <form method="POST">
        <Label>
          Search
          <Input name="query" defaultValue={data ? data.query : ''} />
        </Label>
      </form>

      <div className="flex gap-4 flex-wrap">
        {data
          ? data.results.map(({label, link}) => {
              return (
                <Link key={link} to={link} className="bg-gray-300 p-2 rounded">
                  {label}
                </Link>
              )
            })
          : ''}
      </div>
    </div>
  )
}

export default Search
