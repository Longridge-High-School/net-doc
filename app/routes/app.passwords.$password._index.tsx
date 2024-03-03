import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useState} from 'react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {AButton} from '~/lib/components/button'
import {buildMDXBundle} from '~/lib/mdx.server'
import {MDXComponent} from '~/lib/mdx'

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
          'OPEN'
        ) : (
          <button
            onClick={() => {
              setPasswordOpen(true)
            }}
          >
            🔐
          </button>
        )}
      </p>
      <MDXComponent code={code} />
    </div>
  )
}

export default AssetManagerAsset
