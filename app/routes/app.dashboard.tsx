import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  type HeadersArgs,
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
import {Label, Select} from '~/lib/components/input'
import {pageTitle} from '~/lib/utils/page-title'
import {createTimings} from '~/lib/utils/timings.server'

import {BOXES} from '~/lib/dashboard/boxes'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  const user = await time('getUser', '', () =>
    ensureUser(request, 'dashboard:edit', {})
  )

  const prisma = getPrisma()

  const boxes = await time('getBoxes', '', () =>
    prisma.dashboardBox.findMany({
      select: {id: true, meta: true, boxType: true, order: true},
      orderBy: {order: 'asc'}
    })
  )

  return json({user, boxes}, {headers: headers()})
}

export const action = async ({request}: ActionFunctionArgs) => {
  await ensureUser(request, 'dashboard:edit', {})

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

    if (id.substring(0, 3) === 'new') {
      await prisma.dashboardBox.create({data: {order: i, boxType, meta}})
    } else {
      await prisma.dashboardBox.update({
        where: {id},
        data: {order: i, boxType, meta}
      })
    }

    /*
    There is a prisma error that prevents this from working
    https://github.com/prisma/prisma/issues/22947
    await prisma.dashboardBox.upsert({
      where: {id},
      create: {order: i, boxType, meta},
      update: {order: i, boxType, meta}
    })*/
  })

  return redirect('/app')
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Dashboard')}]
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}

const DashboardEdit = () => {
  const {boxes} = useLoaderData<typeof loader>()
  const [dashBoxes, setDashBoxes] = useState(boxes)

  return (
    <div>
      <Header title="Dashboard" />
      <form method="POST">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {dashBoxes.map(({id, boxType, meta}) => {
            return (
              <div className="border border-gray-300 p-2" key={id}>
                <BoxEditor boxType={boxType} meta={meta} id={id} />
                <Label>
                  Type
                  <Select
                    value={boxType}
                    onChange={e => {
                      setDashBoxes(
                        dashBoxes.map(box => {
                          if (box.id === id) {
                            box.boxType = e.target.value
                          }

                          return box
                        })
                      )
                    }}
                  >
                    <option value="approachingDates">Approaching Dates</option>
                    <option value="pinnedItems">Pinned Items</option>
                    <option value="recentChanges">Recent Changes</option>
                    <option value="recentDocuments">Recent Documents</option>
                    <option value="stats">Stats</option>
                  </Select>
                </Label>
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
