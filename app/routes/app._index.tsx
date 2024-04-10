/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  type LoaderFunctionArgs,
  type MetaFunction,
  type HeadersArgs,
  json
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {asyncMap} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {Header} from '~/lib/components/header'
import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils/page-title'
import {createTimings} from '~/lib/utils/timings.server'

import {BOXES} from '~/lib/dashboard/boxes'
import {BOXES_HANDLERS} from '~/lib/dashboard/boxes.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {time, headers} = createTimings()

  const user = await time('getUser', 'Get User', () =>
    ensureUser(request, 'dashboard', {
      assetSlug: params.assetslug
    })
  )

  const prisma = getPrisma()

  const boxes = await time('getBoxes', 'Get Boxes', () =>
    prisma.dashboardBox.findMany({orderBy: {order: 'asc'}})
  )

  const boxesWithData = await time('boxLoaders', 'Box Loaders', () =>
    asyncMap(boxes, async box => {
      const data = await BOXES_HANDLERS[
        box.boxType as keyof typeof BOXES
      ].loader(box.meta)

      return {...box, data}
    })
  )

  return json({user, boxes: boxesWithData}, {headers: headers()})
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Dashboard')}]
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}

const Dashboard = () => {
  const {boxes} = useLoaderData<typeof loader>()

  return (
    <div>
      <Header
        title="Dashboard"
        actions={[
          {
            link: '/app/dashboard',
            label: 'Edit Dashboard',
            className: 'bg-info'
          }
        ]}
      />
      <div className="grid grid-cols-3 gap-4">
        {boxes.map(({id, data, boxType, meta}) => {
          return (
            <div
              className="border-gray-300 border shadow-xl p-2 bg-white"
              key={id}
            >
              {BOXES[boxType as keyof typeof BOXES].render(data as any, meta)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard
