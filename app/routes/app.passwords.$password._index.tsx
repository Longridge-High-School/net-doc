import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'
import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {buildMDXBundle} from '~/lib/mdx.server'
import {MDXComponent} from '~/lib/mdx'
import {formatAsDateTime} from '~/lib/utils/format'
import {pageTitle} from '~/lib/utils/page-title'
import {useNotify} from '~/lib/hooks/use-notify'
import {trackRecentItem} from '~/lib/utils/recent-item'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:view', {
    passwordId: params.password
  })

  const prisma = getPrisma()

  const password = await prisma.password.findFirstOrThrow({
    select: {
      id: true,
      title: true,
      username: true,
      notes: true,
      views: {include: {user: true}, take: 10, orderBy: {createdAt: 'desc'}},
      history: {
        select: {id: true, editedBy: true, createdAt: true}
      }
    },
    where: {id: params.password}
  })

  await trackRecentItem('passwords', password.id, user.id)

  const code = await buildMDXBundle(password.notes)

  return json({user, password, code})
}

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  return [{title: pageTitle(matches, 'Password', data!.password.title)}]
}

const AssetManagerAsset = () => {
  const {password, code} = useLoaderData<typeof loader>()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const {notify} = useNotify()

  const {data, refetch, isPending} = useQuery({
    enabled: false,
    queryKey: ['password', 'show', password.id],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch(`/api/password/${password.id}/get`)

      const json = await response.json()

      return json.password
    }
  })

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 entry print:col-span-3">
        <h2>{password.title}</h2>
        <p>
          <b>Username</b>
          <br />
          {password.username}
        </p>
        <p>
          <b>Password</b>
          <br />
          {passwordOpen ? (
            <span>
              {isPending ? '⌛' : data}{' '}
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(data)
                  notify({
                    title: 'Copied',
                    message: 'Copied password to the clipboard',
                    type: 'success'
                  })
                }}
              >
                📋
              </button>
            </span>
          ) : (
            <button
              onClick={async () => {
                setPasswordOpen(true)
                await refetch()
              }}
            >
              🔒
            </button>
          )}
        </p>
        <p>
          <b>Notes</b>
        </p>
        <MDXComponent code={code} />
      </div>
      <div className="print:hidden">
        <h3 className="border-b border-b-gray-200 text-xl font-light mb-4">
          View History
        </h3>
        {password.views.map(({id, user, createdAt}) => {
          return (
            <div key={id}>
              {user.name}
              <br />
              <span className="text-gray-400">
                {formatAsDateTime(createdAt)}
              </span>
            </div>
          )
        })}
        <h3 className="border-b border-b-gray-200 text-xl font-light mb-4">
          Revision History
        </h3>
        {password.history.map(({id, createdAt, editedBy}) => {
          return (
            <div key={id} className="mb-2">
              <Link
                to={`/app/passwords/${password.id}/${id}`}
                className="text-sm text-gray-400"
              >
                {formatAsDateTime(createdAt)} - {editedBy.name}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AssetManagerAsset
