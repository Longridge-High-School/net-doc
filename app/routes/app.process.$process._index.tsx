import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {buildMDXBundle} from '~/lib/mdx.server'
import {MDXComponent} from '~/lib/mdx'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'process:view', {
    processId: params.process
  })

  const prisma = getPrisma()

  const process = await prisma.process.findFirstOrThrow({
    where: {id: params.process}
  })

  const code = await buildMDXBundle(process.body)

  return json({user, process, code})
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: pageTitle('Process', data!.process.title)}]
}

const ProcessView = () => {
  const {process, code} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="entry col-span-3">
        <h2 className="text-xl">{process.title}</h2>
        <MDXComponent code={code} />
      </div>
    </div>
  )
}

export default ProcessView
