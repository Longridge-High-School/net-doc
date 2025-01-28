import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {buildMDXBundle} from '~/lib/mdx.server'
import {MDXComponent} from '~/lib/mdx'
import {pageTitle} from '~/lib/utils/page-title'
import {formatAsDateTime} from '~/lib/utils/format'
import {trackRecentItem} from '~/lib/utils/recent-item'
import {LinkButton} from '~/lib/components/button'
import {can} from '~/lib/rbac.server'

import {type Attachment} from './app.documents.$document.attach'

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

  await trackRecentItem('documents', document.id, user.id)

  const code = await buildMDXBundle(document.body)

  const canWrite = await can(user.role, 'document:write', {
    user: {role: user.role, id: user.id},
    documentId: params.document
  })

  const attachments = JSON.parse(document.attachments) as Array<Attachment>

  return json({
    user,
    document,
    code,
    canWrite,
    attachments: attachments.filter(v => v !== null)
  })
}

export const meta: MetaFunction<typeof loader> = ({matches, data}) => {
  return [{title: pageTitle(matches, 'Document', data!.document.title)}]
}

const DocumentView = () => {
  const {document, code, canWrite, attachments} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="entry col-span-3 print:col-span-4">
        <h2 className="text-xl">{document.title}</h2>
        <MDXComponent code={code} />
      </div>
      <div className="print:hidden">
        <h3 className="border-b border-b-gray-200 text-xl font-light mb-4">
          Attachments
        </h3>
        <div className="flex flex-wrap gap-2">
          {attachments.map(({uri, originalFileName}) => {
            return (
              <a
                key={uri}
                href={uri}
                download={originalFileName}
                className="bg-gray-300 p-2 rounded inline-block"
              >
                💾 {originalFileName}
              </a>
            )
          })}
        </div>
        {canWrite ? (
          <LinkButton
            to={`/app/documents/${document.id}/attach`}
            className="bg-info text-sm mt-4"
          >
            Manage Attachments
          </LinkButton>
        ) : (
          ''
        )}
        <h3 className="border-b border-b-gray-200 text-xl font-light mb-4">
          Revision History
        </h3>
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

export default DocumentView
