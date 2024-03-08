import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {buildMDXBundle} from '~/lib/mdx.server'
import {MDXComponent} from '~/lib/mdx'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'document:view', {
    documentId: params.document
  })

  const prisma = getPrisma()

  const document = await prisma.document.findFirstOrThrow({
    where: {id: params.document}
  })

  const code = await buildMDXBundle(document.body)

  return json({user, document, code})
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: pageTitle('Document', data!.document.title)}]
}

const DocumentView = () => {
  const {document, code} = useLoaderData<typeof loader>()

  return (
    <div className="entry">
      <h2 className="text-xl">{document.title}</h2>
      <MDXComponent code={code} />
    </div>
  )
}

export default DocumentView
