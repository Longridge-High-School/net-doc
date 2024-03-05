import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useState} from 'react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {AButton} from '~/lib/components/button'
import {buildMDXBundle} from '~/lib/mdx.server'
import {MDXComponent} from '~/lib/mdx'
import {useQuery} from '@tanstack/react-query'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:view', {
    passwordId: params.password
  })

  const prisma = getPrisma()

  const password = await prisma.password.findFirstOrThrow({
    select: {id: true, title: true, username: true, notes: true},
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
    <div>
      <h4 className="text-xl">{password.title}</h4>
      <AButton href={`/app/passwords/${password.id}/edit`} className="bg-info">
        Edit
      </AButton>
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
  )
}

export default AssetManagerAsset
