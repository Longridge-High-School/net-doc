import {Outlet, useMatches} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {Header} from '~/lib/components/header'

const FieldManager = () => {
  const matches = useMatches()

  const actions = () => {
    const {id, params} = matches.pop()!

    invariant(id)
    invariant(params)

    switch (id) {
      case 'routes/app.field-manager._index':
        return [
          {
            link: '/app/field-manager/add',
            label: 'Add Field',
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
      <Header title="Field Manager" actions={actions()} />
      <Outlet />
    </div>
  )
}

export default FieldManager
