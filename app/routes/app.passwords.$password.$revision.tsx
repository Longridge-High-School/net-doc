import {type LoaderFunctionArgs, type MetaFunction} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {buildMDXBundle} from '~/lib/mdx.server'
import {MDXComponent} from '~/lib/mdx'
import {formatAsDateTime} from '~/lib/utils/format'
import {pageTitle} from '~/lib/utils/page-title'
import {getCryptoSuite} from '~/lib/crypto.server'
import {reviveDate} from '~/lib/utils/serialize'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'password:view', {
    passwordId: params.password
  })

  const prisma = getPrisma()
  const {decrypt} = await getCryptoSuite()

  const password = await prisma.password.findFirstOrThrow({
    select: {
      views: {include: {user: true}, take: 10, orderBy: {createdAt: 'desc'}}
    },
    where: {id: params.password}
  })

  const revision = await prisma.passwordHistory.findFirstOrThrow({
    select: {
      id: true,
      previousTitle: true,
      previousNotes: true,
      previousUsername: true,
      previousPassword: true
    },
    where: {id: params.revision}
  })

  const code = await buildMDXBundle(revision.previousNotes)

  return {
    user,
    password,
    code,
    revision,
    previousPassword: decrypt(revision.previousPassword)
  }
}

export const meta: MetaFunction<typeof loader> = ({matches, data}) => {
  return [{title: pageTitle(matches, 'Password', data!.revision.previousTitle)}]
}

const AssetManagerAsset = () => {
  const {password, code, revision, previousPassword} =
    useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 entry">
        <h2>{revision.previousTitle}</h2>
        <p>
          <b>Username</b>
          <br />
          {revision.previousUsername}
        </p>
        <p>
          <b>Password</b>
          <br />
          {previousPassword}
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
                {formatAsDateTime(reviveDate(createdAt).toISOString())}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AssetManagerAsset
