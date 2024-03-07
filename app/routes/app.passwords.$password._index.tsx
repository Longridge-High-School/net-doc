import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {buildMDXBundle} from '~/lib/mdx.server'
import {MDXComponent} from '~/lib/mdx'
import {formatAsDateTime} from '~/lib/utils/format'

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
      views: {include: {user: true}, take: 10, orderBy: {createdAt: 'desc'}}
    },
    where: {id: params.password}
  })

  const code = await buildMDXBundle(password.notes)

  return json({user, password, code})
}

const AssetManagerAsset = () => {
  const {password, code} = useLoaderData<typeof loader>()
  const [passwordOpen, setPasswordOpen] = useState(false)

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
      <div className="col-span-2 entry">
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
            <span>{isPending ? '⌛' : data}</span>
          ) : (
            <button
              onClick={() => {
                setPasswordOpen(true)
                refetch()
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
      <div>
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
      </div>
    </div>
  )
}

export default AssetManagerAsset
