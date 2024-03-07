import {Outlet, useMatches} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {Header} from '~/lib/components/header'

const Documents = () => {
  const matches = useMatches()

  const actions = () => {
    const {id, params} = matches.pop()!

    invariant(id)
    invariant(params)

    switch (id) {
      case 'routes/app.documents._index':
        return [
          {
            link: '/app/documents/add',
            label: 'Add Document',
            className: 'bg-success'
          }
        ]
      case 'routes/app.documents.$document._index':
        return [
          {
            link: `/app/documents/${params.document}/edit`,
            label: 'Edit Document',
            className: 'bg-info'
          }
        ]
      default:
        return []
    }
  }

  return (
    <div>
      <Header title="Documents" actions={actions()} />
      <Outlet />
    </div>
  )
}

export default Documents
