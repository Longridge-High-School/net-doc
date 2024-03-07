import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {buildMDXBundle} from '~/lib/mdx.server'
import {MDXComponent} from '~/lib/mdx'

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
