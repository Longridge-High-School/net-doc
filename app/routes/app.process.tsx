import {Outlet, useMatches, useRouteLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {Header} from '~/lib/components/header'

const Process = () => {
  const matches = useMatches()
  const processData = useRouteLoaderData<
    {process: {complete: boolean}} | undefined
  >('routes/app.process.$process._index')

  const actions = () => {
    const {id, params} = matches.pop()!

    invariant(id)
    invariant(params)

    switch (id) {
      case 'routes/app.process.$process._index':
        const processActions: Array<{
          link: string
          label: string
          className: string
        }> = []

        if (!processData?.process.complete) {
          processActions.push({
            link: `/app/process/${params.process}/complete`,
            label: 'Complete',
            className: 'bg-warning'
          })
        }

        return [
          ...processActions,
          {
            link: `/app/process/${params.process}/edit`,
            label: 'Edit Process',
            className: 'bg-info'
          }
        ]
      default:
        return []
    }
  }

  return (
    <div>
      <Header title="Process" actions={actions()} />
      <Outlet />
    </div>
  )
}

export default Process
