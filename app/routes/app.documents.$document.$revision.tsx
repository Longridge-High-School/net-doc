import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {buildMDXBundle} from '~/lib/mdx.server'
import {MDXComponent} from '~/lib/mdx'
import {pageTitle} from '~/lib/utils/page-title'
import {formatAsDateTime} from '~/lib/utils/format'
import {LinkButton} from '~/lib/components/button'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'document:view', {
    documentId: params.document
  })

  const prisma = getPrisma()

  const document = await prisma.document.findFirstOrThrow({
    where: {id: params.document},
    include: {
      history: {orderBy: {createdAt: 'desc'}, include: {editedBy: true}}
    }
  })

  const revision = await prisma.documentHistory.findFirstOrThrow({
    where: {id: params.revision}
  })

  const code = await buildMDXBundle(revision.previousBody)

  return json({user, document, code, title: revision.previousTitle})
}

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  return [{title: pageTitle(matches, 'Document', data!.document.title)}]
}

const DocumentViewRevision = () => {
  const {document, code, title} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="entry col-span-3">
        <h2 className="text-xl">
          {document.title} {title !== document.title ? `(${title})` : ''}
        </h2>
        <MDXComponent code={code} />
      </div>
      <div>
        <h3 className="border-b border-b-gray-200 text-xl font-light mb-4">
          Revision History
        </h3>
        <LinkButton
          to={`/app/documents/${document.id}`}
          className="mb-4 bg-info"
        >
          Current
        </LinkButton>
        {document.history.map(({id, createdAt, editedBy}) => {
          return (
            <div key={id} className="mb-2">
              <Link
                to={`/app/documents/${document.id}/${id}`}
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

export default DocumentViewRevision
