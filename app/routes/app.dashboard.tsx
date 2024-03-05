import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useState} from 'react'
import {asyncForEach, invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {Header} from '~/lib/components/header'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'

import {BOXES} from '~/lib/dashboard/boxes'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'dashboard:edit', {})

  const prisma = getPrisma()

  const boxes = await prisma.dashboardBox.findMany({
    select: {id: true, meta: true, boxType: true, order: true},
    orderBy: {order: 'asc'}
  })

  return json({user, boxes})
}

export const action = async ({request}: ActionFunctionArgs) => {
  const user = await ensureUser(request, 'dashboard:edit', {})

  const formData = await request.formData()

  const ids = formData.get('ids') as string | undefined

  invariant(ids)

  const prisma = getPrisma()

  const boxIds = JSON.parse(ids) as string[]

  await asyncForEach(boxIds, async (id, i) => {
    const meta = formData.get(id) as string | undefined
    const boxType = formData.get(`${id}-type`) as string | undefined

    invariant(meta)
    invariant(boxType)

    await prisma.dashboardBox.upsert({
      where: {id},
      create: {order: i, boxType, meta},
      update: {order: i, boxType, meta}
    })
  })

  return redirect('/app')
}

const DashboardEdit = () => {
  const {boxes} = useLoaderData<typeof loader>()
  const [dashBoxes, setDashBoxes] = useState(boxes)

  return (
    <div>
      <Header title="Dashboard" />
      <form method="POST">
        <div className="grid grid-cols-3 gap-4">
          {dashBoxes.map(({id, boxType, meta}) => {
            return (
              <div className="border border-gray-300" key={id}>
                <BoxEditor boxType={boxType} meta={meta} id={id} />
              </div>
            )
          })}
          <button
            type="button"
            className="text-center text-2xl cursor-pointer border border-gray-300"
            onClick={() => {
              setDashBoxes([
                ...dashBoxes,
                {
                  id: `new-${dashBoxes.length}`,
                  meta: '',
                  boxType: 'recentDocuments',
                  order: dashBoxes.length
                }
              ])
            }}
          >
            ➕<br />
            Add Box
          </button>
        </div>
        <input
          type="hidden"
          name="ids"
          value={JSON.stringify(dashBoxes.map(({id}) => id))}
        />
        <Button className="bg-success">Update Dashboard</Button>
      </form>
    </div>
  )
}

export const BoxEditor = ({
  boxType,
  meta,
  id
}: {
  boxType: string
  meta: string
  id: string
}) => {
  return BOXES[boxType as keyof typeof BOXES].metaComponent(meta, id)
}

export default DashboardEdit
