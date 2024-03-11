import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json
} from '@remix-run/node'
import {Link} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {useActionData} from '@remix-run/react'
import {Header} from '~/lib/components/header'
import {Input, Label} from '~/lib/components/input'
import {pageTitle} from '~/lib/utils/page-title'

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

  const entryResults = await prisma.$queryRaw<
    Array<{label: string; link: string}>
  >`SELECT Asset.icon || " " || NameValue.value as label, "/app/" || Asset.slug || "/" || Entry.id as link FROM Value 
  INNER JOIN Entry ON Entry.id = Value.entryId
  INNER JOIN Asset ON Asset.id = Entry.assetId
  INNER JOIN Value NameValue ON NameValue.entryId = Entry.id AND NameValue.fieldId = Asset.nameFieldId
  WHERE lower(Value.value) LIKE lower(${`%${query}%`})
  GROUP BY Value.entryId
  ORDER BY label ASC`

  const passwordResults = await prisma.$queryRaw<
    Array<{label: string; link: string}>
  >`SELECT "🔐" || " " || Password.title as label, "/app/passwords/" || Password.id as link FROM Password
  WHERE lower(Password.notes) LIKE lower(${`%${query}%`}) OR Password.title LIKE lower(${`%${query}%`})
  ORDER BY Password.title ASC`

  const documentResults = await prisma.$queryRaw<
    Array<{label: string; link: string}>
  >`SELECT "📰" || " " || Document.title as label, "/app/documents/" || Document.id as link FROM Document
  WHERE lower(Document.body) LIKE lower(${`%${query}%`}) OR lower(Document.title) LIKE lower(${`%${query}%`})
  ORDER BY Document.title ASC`

  const results = [
    ...entryResults,
    ...passwordResults,
    ...documentResults
  ].sort((a, b) => a.label.localeCompare(b.label))

  return json({results})
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
          <Input name="query" />
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
