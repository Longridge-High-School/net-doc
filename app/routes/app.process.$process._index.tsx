import {type LoaderFunctionArgs, type MetaFunction, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useEffect} from 'react'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {buildMDXBundle} from '~/lib/mdx.server'
import {MDXComponent} from '~/lib/mdx'
import {pageTitle} from '~/lib/utils/page-title'
import {trackRecentItem} from '~/lib/utils/recent-item'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'process:view', {
    processId: params.process
  })

  const prisma = getPrisma()

  const process = await prisma.process.findFirstOrThrow({
    where: {id: params.process}
  })

  await trackRecentItem('process', process.id, user.id)

  const code = await buildMDXBundle(process.body)

  return json({user, process, code})
}

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  return [{title: pageTitle(matches, 'Process', data!.process.title)}]
}

const ProcessView = () => {
  const {process, code} = useLoaderData<typeof loader>()

  const handleCheckbox: EventListener = async ({target}) => {
    const index = (target! as HTMLInputElement).dataset.index

    await fetch(`/api/process/${process.id}/toggle/${index}`).then(() => {
      location.reload()
    })
  }

  useEffect(() => {
    document.querySelectorAll('input[type=checkbox]').forEach((box, i) => {
      box.removeAttribute('disabled')

      box.setAttribute('data-index', i.toString())

      box.addEventListener('change', handleCheckbox)
    })

    return () => {
      document.querySelectorAll('input[type=checkbox]').forEach(box => {
        box.removeEventListener('change', handleCheckbox)
      })
    }
  })

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="entry col-span-3 print:col-span-4">
        <h2 className="text-xl">{process.title}</h2>
        <MDXComponent code={code} />
      </div>
    </div>
  )
}

export default ProcessView
